import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth

    if (!auth) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    // Query params
    const query = getQuery(event)
    const userId = (query.userId as string) || auth.userId
    const year = query.year != null ? parseInt(query.year as string, 10) : new Date().getFullYear()

    // Current user
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true, departmentId: true },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found',
      })
    }

    // Permissions
    if (userId !== auth.userId) {
      const isAdmin = ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)
      if (!isAdmin && currentUser.role !== 'DEPARTMENT_HEAD') {
        throw createError({
          statusCode: 403,
          message: 'Insufficient permissions',
        })
      }
      
      // If department head, verify they can view this user
      if (currentUser.role === 'DEPARTMENT_HEAD') {
        const targetUser = await prisma.user.findFirst({
          where: {
            id: userId,
            departmentId: currentUser.departmentId,
            organizationId: auth.organizationId
          }
        })
        
        if (!targetUser) {
          throw createError({
            statusCode: 403,
            message: 'Insufficient permissions to view this user'
          })
        }
      }
    }

    // Org settings
    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        leaveYearStartMonth: true,
        defaultLeaveAllowance: true,
        defaultSickLeaveAllowance: true,
        carryForwardDays: true,
        carryForwardExpires: true,
        carryForwardExpiryMonths: true,
        carryForwardEligibilityYears: true,
      },
    })

    if (!organization) {
      throw createError({
        statusCode: 404,
        message: 'Organization not found',
      })
    }

    // Get user-specific settings (custom allowances and carry-over)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        customLeaveAllowance: true,
        allowCarryForward: true,
        maxCarryForwardDays: true,
        carryOverBalance: true,
        employmentStartDate: true,
      },
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Fiscal period
    const fiscalStartMonth = organization.leaveYearStartMonth
    const fiscalPeriodStart = new Date(year, fiscalStartMonth - 1, 1)
    const fiscalPeriodEnd = new Date(year + 1, fiscalStartMonth - 1, 0)

    console.log(`Calculating balance for fiscal period:`, {
      year,
      fiscalStartMonth,
      start: fiscalPeriodStart.toISOString(),
      end: fiscalPeriodEnd.toISOString(),
      userId,
      employmentStartDate: targetUser.employmentStartDate,
      customAllowance: targetUser.customLeaveAllowance,
      carryOverBalance: targetUser.carryOverBalance,
      allowCarryForward: targetUser.allowCarryForward,
    })

    // Leave types
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
      },
    })

    // Used leaves in fiscal period - ONLY APPROVED and PENDING
    // Cancelled, rejected, and withdrawn leaves do NOT count toward usage
    const usedLeaves = await prisma.leave.findMany({
      where: {
        userId,
        organizationId: auth.organizationId,
        startDate: {
          gte: fiscalPeriodStart,
          lte: fiscalPeriodEnd,
        },
        status: {
          in: ['APPROVED', 'PENDING'],
        },
      },
      include: {
        leaveType: true,
      },
    })

    console.log(`Found ${usedLeaves.length} used leaves (APPROVED/PENDING only)`)

    // Separate leaves by deduction bucket
    const annualBucketLeaves = usedLeaves.filter(
      (l) => l.leaveType && (l.leaveType.deductionBucket === 'ANNUAL' ||
        // Backward compatibility: if no deductionBucket but has annualAllowance and not SICK_PAID
        (!l.leaveType.deductionBucket && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0 && l.leaveType.code !== 'SICK_PAID'))
    )
    const sickBucketLeaves = usedLeaves.filter(
      (l) => l.leaveType && (l.leaveType.deductionBucket === 'SICK' ||
        // Backward compatibility: SICK_PAID with annualAllowance set
        (!l.leaveType.deductionBucket && l.leaveType.code === 'SICK_PAID' && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0))
    )
    const nonDeductibleLeaves = usedLeaves.filter(
      (l) => l.leaveType && (l.leaveType.deductionBucket === 'NONE' ||
        // Backward compatibility: no deductionBucket and no annualAllowance
        (!l.leaveType.deductionBucket && (l.leaveType.annualAllowance == null || l.leaveType.annualAllowance === 0)))
    )

    // AUTOMATED CARRY FORWARD: Calculate carry forward from previous fiscal year
    let annualCarriedOver = 0

    if (targetUser.allowCarryForward !== false && organization.carryForwardDays > 0) {
      // Check if employee is eligible for carry forward based on years of employment
      // Eligibility is configurable: 1 (immediate), 2 (2nd year), or 3 (3rd year)
      let skipCarryForward = false

      if (targetUser.employmentStartDate) {
        const employmentDate = new Date(targetUser.employmentStartDate)
        const employmentMonth = employmentDate.getMonth() + 1 // 1-12

        // Determine the first fiscal year of employment
        const firstFiscalYear = employmentMonth >= fiscalStartMonth
          ? employmentDate.getFullYear()
          : employmentDate.getFullYear() - 1

        // Current fiscal year being viewed
        const currentFiscalYear = year

        // Calculate which year of employment this is (1, 2, 3, etc.)
        const yearsOfEmployment = currentFiscalYear - firstFiscalYear + 1

        // Get eligibility threshold from organization settings (default to 2 if not set)
        const eligibilityYears = organization.carryForwardEligibilityYears ?? 2

        // Skip carry forward if employee hasn't reached eligibility year yet
        skipCarryForward = yearsOfEmployment < eligibilityYears

        console.log('Employment year check:', {
          employmentDate: employmentDate.toISOString(),
          employmentMonth,
          fiscalStartMonth,
          firstFiscalYear,
          currentFiscalYear,
          yearsOfEmployment,
          eligibilityYears,
          skipCarryForward,
        })
      }

      // Only calculate carry forward if employee has reached eligibility year
      if (!skipCarryForward) {
        // Calculate previous fiscal year period
        const prevFiscalPeriodStart = new Date(year - 1, fiscalStartMonth - 1, 1)
        const prevFiscalPeriodEnd = new Date(year, fiscalStartMonth - 1, 0)

        console.log('Calculating carry forward from previous year:', {
          prevPeriodStart: prevFiscalPeriodStart.toISOString(),
          prevPeriodEnd: prevFiscalPeriodEnd.toISOString(),
          orgCarryForwardDays: organization.carryForwardDays,
        })

        // Fetch previous year's leaves
        const prevYearLeaves = await prisma.leave.findMany({
          where: {
            userId,
            organizationId: auth.organizationId,
            startDate: {
              gte: prevFiscalPeriodStart,
              lte: prevFiscalPeriodEnd,
            },
            status: {
              in: ['APPROVED', 'PENDING'],
            },
          },
          include: {
            leaveType: true,
          },
        })

        console.log(`Fetched ${prevYearLeaves.length} leaves from previous year (${year - 1})`)

        // Calculate previous year's annual bucket usage
        const prevAnnualBucketLeaves = prevYearLeaves.filter(
          (l) => l.leaveType && (l.leaveType.deductionBucket === 'ANNUAL' ||
            (!l.leaveType.deductionBucket && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0 && l.leaveType.code !== 'SICK_PAID'))
        )
        const prevAnnualUsed = prevAnnualBucketLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)

        // Previous year's base allowance (user's custom or org default at that time)
        const prevAnnualBaseAllowance = targetUser.customLeaveAllowance ?? organization.defaultLeaveAllowance

        // RECURSIVELY calculate previous year's carry forward to get accurate total
        // We need to check if previous year (year-1) had carry forward from (year-2)
        const prevPrevFiscalPeriodStart = new Date(year - 2, fiscalStartMonth - 1, 1)
        const prevPrevFiscalPeriodEnd = new Date(year - 1, fiscalStartMonth - 1, 0)

        let prevYearCarriedForward = 0

        // Check if prev year was eligible for carry forward
        if (targetUser.employmentStartDate) {
          const employmentDate = new Date(targetUser.employmentStartDate)
          const employmentMonth = employmentDate.getMonth() + 1
          const firstFiscalYear = employmentMonth >= fiscalStartMonth
            ? employmentDate.getFullYear()
            : employmentDate.getFullYear() - 1
          const prevYearNumber = year - 1
          const prevYearsOfEmployment = prevYearNumber - firstFiscalYear + 1
          const prevYearWasEligible = prevYearsOfEmployment >= (organization.carryForwardEligibilityYears ?? 2)

          console.log(`Checking if year ${prevYearNumber} was eligible for carry forward:`, {
            prevYearNumber,
            firstFiscalYear,
            prevYearsOfEmployment,
            eligibilityYears: organization.carryForwardEligibilityYears ?? 2,
            prevYearWasEligible,
          })

          if (prevYearWasEligible) {
            // Fetch leaves from year-2 to calculate what was carried to year-1
            const prevPrevLeaves = await prisma.leave.findMany({
              where: {
                userId,
                organizationId: auth.organizationId,
                startDate: {
                  gte: prevPrevFiscalPeriodStart,
                  lte: prevPrevFiscalPeriodEnd,
                },
                status: {
                  in: ['APPROVED', 'PENDING'],
                },
              },
              include: {
                leaveType: true,
              },
            })

            const prevPrevAnnualLeaves = prevPrevLeaves.filter(
              (l) => l.leaveType && (l.leaveType.deductionBucket === 'ANNUAL' ||
                (!l.leaveType.deductionBucket && l.leaveType.annualAllowance != null && l.leaveType.annualAllowance > 0 && l.leaveType.code !== 'SICK_PAID'))
            )
            const prevPrevUsed = prevPrevAnnualLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)
            const prevPrevRemaining = prevAnnualBaseAllowance - prevPrevUsed

            console.log(`Calculating what was carried from year ${year - 2} to year ${year - 1}:`, {
              yearMinus2: year - 2,
              yearMinus1: year - 1,
              prevPrevLeaves: prevPrevLeaves.length,
              prevPrevUsed,
              prevAnnualBaseAllowance, // This is year-1's base, used to calculate year-2's remaining
              prevPrevRemaining,
              orgCarryForwardDays: organization.carryForwardDays,
              userMaxCarryForward: targetUser.maxCarryForwardDays,
            })

            if (prevPrevRemaining > 0) {
              prevYearCarriedForward = Math.min(prevPrevRemaining, organization.carryForwardDays)
              if (targetUser.maxCarryForwardDays != null && targetUser.maxCarryForwardDays > 0) {
                prevYearCarriedForward = Math.min(prevPrevRemaining, targetUser.maxCarryForwardDays)
              }
              console.log(`✅ Year ${year - 1} had ${prevYearCarriedForward} days carried from year ${year - 2}`)
            } else {
              console.log(`❌ No carry forward from year ${year - 2} to year ${year - 1}: remaining was ${prevPrevRemaining}`)
            }
          } else {
            console.log(`Year ${prevYearNumber} was NOT eligible for carry forward (year ${prevYearsOfEmployment} of employment)`)
          }
        }

        // Calculate total remaining from previous year (including what they carried forward)
        const prevYearTotalAllowance = prevAnnualBaseAllowance + prevYearCarriedForward
        const prevYearRemaining = prevYearTotalAllowance - prevAnnualUsed

        console.log('Previous year calculation:', {
          totalLeaves: prevYearLeaves.length,
          annualBucketLeaves: prevAnnualBucketLeaves.length,
          prevAnnualUsed,
          prevAnnualBaseAllowance,
          prevYearCarriedForward,
          prevYearTotalAllowance,
          prevYearRemaining,
        })

        if (prevYearRemaining > 0) {
          // Apply carry forward cap: min(remaining, organization.carryForwardDays)
          let carriedAmount = Math.min(prevYearRemaining, organization.carryForwardDays)

          // User-specific max carry forward override
          if (targetUser.maxCarryForwardDays != null && targetUser.maxCarryForwardDays > 0) {
            carriedAmount = Math.min(prevYearRemaining, targetUser.maxCarryForwardDays)
          }

          // Check if carry forward has expired
          if (organization.carryForwardExpires && organization.carryForwardExpiryMonths) {
            const expiryDate = new Date(fiscalPeriodStart)
            expiryDate.setMonth(expiryDate.getMonth() + organization.carryForwardExpiryMonths)

            const today = new Date()
            if (today > expiryDate) {
              console.log('Carry forward has expired:', {
                expiryDate: expiryDate.toISOString(),
                today: today.toISOString(),
              })
              carriedAmount = 0
            }
          }

          annualCarriedOver = carriedAmount

          console.log('Automated carry forward calculated:', {
            prevYearBaseAllowance: prevAnnualBaseAllowance,
            prevYearUsed: prevAnnualUsed,
            prevYearRemaining,
            orgCarryForwardDays: organization.carryForwardDays,
            userMaxCarryForward: targetUser.maxCarryForwardDays,
            carriedForward: annualCarriedOver,
          })
        } else {
          console.log('❌ No carry forward: prevYearRemaining <= 0', { prevYearRemaining })
        }
      } // end if (!skipCarryForward) - employee reached eligibility year
    }

    // Calculate Annual bucket totals
    const annualBaseAllowance = targetUser.customLeaveAllowance ?? organization.defaultLeaveAllowance
    const annualUsed = annualBucketLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)
    const annualTotalAllowance = annualBaseAllowance + annualCarriedOver
    const annualRemaining = annualTotalAllowance - annualUsed

    // Calculate Sick bucket totals (using organization sick leave allowance)
    const sickUsed = sickBucketLeaves.reduce((sum, leave) => sum + (leave.totalDays || 0), 0)
    const sickBaseAllowance = organization.defaultSickLeaveAllowance ?? 0
    const sickRemaining = sickBaseAllowance - sickUsed

    // Legacy total (for backward compatibility - combines annual + sick)
    const totalAllowance = annualTotalAllowance
    const totalUsed = annualUsed
    const totalRemaining = annualRemaining

    console.log(`Balance summary:`, {
      annual: {
        baseAllowance: annualBaseAllowance,
        carriedOver: annualCarriedOver,
        totalAllowance: annualTotalAllowance,
        used: annualUsed,
        remaining: annualRemaining,
      },
      sick: {
        baseAllowance: sickBaseAllowance,
        used: sickUsed,
        remaining: sickRemaining,
      },
      annualBucketCount: annualBucketLeaves.length,
      sickBucketCount: sickBucketLeaves.length,
      nonDeductibleCount: nonDeductibleLeaves.length
    })

    // Deductible breakdown by bucket (annual + sick combined for now)
    const allDeductibleLeaves = [...annualBucketLeaves, ...sickBucketLeaves]
    const deductibleMap: Record<string, { leaveType: any; days: number; bucket: string }> = {}

    for (const l of allDeductibleLeaves) {
      const lt = l.leaveType
      if (!lt) continue
      if (!deductibleMap[lt.id]) {
        const bucket = lt.deductionBucket || (lt.code === 'SICK_PAID' ? 'SICK' : 'ANNUAL')
        deductibleMap[lt.id] = { leaveType: lt, days: 0, bucket }
      }
      deductibleMap[lt.id].days += l.totalDays || 0
    }

    const deductible = Object.values(deductibleMap)

    // Balance breakdown (allowance/used/remaining per leave type with bucket info)
    const balanceBreakdown = leaveTypes
      .filter((lt) => {
        // Include if deductionBucket is set to ANNUAL or SICK
        if (lt.deductionBucket && lt.deductionBucket !== 'NONE') return true
        // Backward compatibility: include if annualAllowance is set
        return lt.annualAllowance != null && lt.annualAllowance > 0
      })
      .map((leaveType) => {
        const used = allDeductibleLeaves
          .filter((l) => l.leaveTypeId === leaveType.id)
          .reduce((sum, l) => sum + (l.totalDays || 0), 0)

        const allowance = leaveType.annualAllowance || 0
        const bucket = leaveType.deductionBucket || (leaveType.code === 'SICK_PAID' ? 'SICK' : 'ANNUAL')
        const remaining = allowance - used

        return {
          leaveType,
          allowance,
          used,
          remaining,
          bucket, // Add bucket info
        }
      })

    // Non-deductible breakdown
    const nonDeductibleBreakdown = leaveTypes
      .filter((lt) => {
        // Check if leave type uses a deduction bucket
        if (lt.deductionBucket && lt.deductionBucket !== 'NONE') return false
        // Backward compatibility: check annualAllowance
        if (lt.annualAllowance != null && lt.annualAllowance > 0) return false
        return true
      })
      .map((leaveType) => {
        const leaves = nonDeductibleLeaves.filter((l) => l.leaveTypeId === leaveType.id)
        const days = leaves.reduce((sum, l) => sum + (l.totalDays || 0), 0)
        return {
          leaveType,
          count: leaves.length,
          days,
        }
      })
      .filter((item) => item.count > 0)

    return {
      year,
      fiscalPeriodStart: fiscalPeriodStart.toISOString(),
      fiscalPeriodEnd: fiscalPeriodEnd.toISOString(),
      // Legacy fields (annual bucket only for backward compatibility)
      totalAllowance,
      totalUsed,
      totalRemaining,
      carriedOver: annualCarriedOver,
      // New bucket-specific fields
      annual: {
        allowance: annualTotalAllowance,
        used: annualUsed,
        remaining: annualRemaining,
        carriedOver: annualCarriedOver,
      },
      sick: {
        allowance: sickBaseAllowance,
        used: sickUsed,
        remaining: sickRemaining,
      },
      balances: balanceBreakdown,
      deductible,
      nonDeductible: nonDeductibleBreakdown,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Error fetching leave balance:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch leave balance',
    })
  }
})