import { prisma } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const auth = event.context.auth
    
    if (!auth) {
      throw createError({ 
        statusCode: 401, 
        message: 'Unauthorized' 
      })
    }

    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({ 
        statusCode: 400, 
        message: 'User ID is required' 
      })
    }

    // Get current user to check permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true },
    })

    if (!currentUser) {
      throw createError({
        statusCode: 404,
        message: 'Current user not found',
      })
    }

    // Get the user being updated
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        organizationId: true,
        role: true,
        isActive: true,
      },
    })

    if (!userToUpdate) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    // Verify user belongs to same organization
    if (userToUpdate.organizationId !== auth.organizationId) {
      throw createError({
        statusCode: 403,
        message: 'Cannot update users from other organizations',
      })
    }

    const body = await readBody(event)
    const isEditingSelf = userId === auth.userId

    // ============================================
    // PERMISSION CHECKS
    // ============================================

    // ✅ Users can always edit their own profile data
    // (We'll allow this once you create the profile page)
    // For now, we restrict admin-level edits
    
    // ✅ BUSINESS RULE 1: Only EXECUTIVES can edit other EXECUTIVES
    if (!isEditingSelf && userToUpdate.role === 'EXECUTIVE' && currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 403,
        message: 'Only executives can edit executive accounts',
      })
    }

    // ✅ BUSINESS RULE 2: Only EXECUTIVES and ADMINISTRATORS can edit ADMINISTRATORS
    if (!isEditingSelf && userToUpdate.role === 'ADMINISTRATOR' && !['EXECUTIVE', 'ADMINISTRATOR'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only executives and administrators can edit administrator accounts',
      })
    }

    // ✅ BUSINESS RULE 3: Check if user is trying to change role
    if (body.role && body.role !== userToUpdate.role) {
      // Only EXECUTIVES can promote to EXECUTIVE
      if (body.role === 'EXECUTIVE' && currentUser.role !== 'EXECUTIVE') {
        throw createError({
          statusCode: 403,
          message: 'Only executives can promote users to executive role',
        })
      }

      // Only EXECUTIVES and ADMINISTRATORS can promote to ADMINISTRATOR
      if (body.role === 'ADMINISTRATOR' && !['EXECUTIVE', 'ADMINISTRATOR'].includes(currentUser.role)) {
        throw createError({
          statusCode: 403,
          message: 'Only executives and administrators can promote users to administrator role',
        })
      }

      // Users cannot change their own role
      if (isEditingSelf) {
        throw createError({
          statusCode: 403,
          message: 'You cannot change your own role',
        })
      }
    }

    // ✅ BUSINESS RULE 4: Cannot deactivate yourself
    if (body.isActive === false && isEditingSelf) {
      throw createError({
        statusCode: 400,
        message: 'You cannot deactivate your own account',
      })
    }

    // ✅ BUSINESS RULE 5: Cannot deactivate executives (unless you're an executive)
    if (body.isActive === false && userToUpdate.role === 'EXECUTIVE' && currentUser.role !== 'EXECUTIVE') {
      throw createError({
        statusCode: 400,
        message: 'Only executives can deactivate executive accounts',
      })
    }

    // ✅ BUSINESS RULE 6: Check minimum permissions to edit users
    if (!isEditingSelf && !['ADMINISTRATOR', 'EXECUTIVE', 'DEPARTMENT_HEAD'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions to edit users',
      })
    }

    // ✅ BUSINESS RULE 7: Employment fields can only be modified by ADMINISTRATOR and EXECUTIVE
    const employmentFields = [
      'jobTitle',
      'employeeId',
      'departmentId',
      'reportsToId',
      'employmentType',
      'role',
      'payrollId',
      'isActive',
      'employmentStartDate'
    ]

    const isModifyingEmploymentFields = employmentFields.some(field => body[field] !== undefined)

    if (isModifyingEmploymentFields && !['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only administrators and executives can modify employment details',
      })
    }

    // ============================================
    // DATE PARSING
    // ============================================

    const parseDate = (dateStr: any) => {
      if (!dateStr || dateStr === '' || dateStr === null) {
        return undefined
      }
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return undefined
        }
        return date
      } catch {
        return undefined
      }
    }

    // ============================================
    // PREPARE UPDATE DATA
    // ============================================

    const updateData: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName || null,
      preferredName: body.preferredName || null,
      gender: body.gender || null,
      jobTitle: body.jobTitle || null,
      employeeId: body.employeeId || null,
      departmentId: body.departmentId || null,
      reportsToId: body.reportsToId || null,
      employmentType: body.employmentType,
      role: body.role,
      payrollId: body.payrollId || null,
      isActive: body.isActive,
      phoneMobile: body.phoneMobile || null,
      phoneLandline: body.phoneLandline || null,
      addressLine1: body.addressLine1 || null,
      addressLine2: body.addressLine2 || null,
      city: body.city || null,
      state: body.state || null,
      postalCode: body.postalCode || null,
      country: body.country || null,
      holidayCountry: body.holidayCountry || null,
      holidayRegion: body.holidayRegion || null,
      carryOverBalance: body.carryOverBalance ?? 0,
      customLeaveAllowance: body.customLeaveAllowance || null,
      emergencyContact: body.emergencyContact || null,
    }

    // ✅ NEW: Add carry forward settings if provided
    if (body.allowCarryForward !== undefined) {
      updateData.allowCarryForward = body.allowCarryForward
    }
    if (body.maxCarryForwardDays !== undefined) {
      updateData.maxCarryForwardDays = body.maxCarryForwardDays
    }

    // ✅ NEW: Add work schedule if provided and user has permission
    if (body.workSchedule !== undefined && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      updateData.workSchedule = body.workSchedule
    }
    if (body.scheduleRepeatsWeekly !== undefined && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      updateData.scheduleRepeatsWeekly = body.scheduleRepeatsWeekly
    }
    if (body.hoursPerWeek !== undefined && ['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      updateData.hoursPerWeek = body.hoursPerWeek
    }

    // Only add dates if they're valid
    const parsedDateOfBirth = parseDate(body.dateOfBirth)
    if (parsedDateOfBirth !== undefined) {
      updateData.dateOfBirth = parsedDateOfBirth
    }

    const parsedEmploymentStartDate = parseDate(body.employmentStartDate)
    if (parsedEmploymentStartDate !== undefined) {
      updateData.employmentStartDate = parsedEmploymentStartDate
    }

    // Parse work schedule dates if provided and user has permission
    if (['ADMINISTRATOR', 'EXECUTIVE'].includes(currentUser.role)) {
      const parsedScheduleEffectiveFrom = parseDate(body.scheduleEffectiveFrom)
      if (parsedScheduleEffectiveFrom !== undefined) {
        updateData.scheduleEffectiveFrom = parsedScheduleEffectiveFrom
      }

      const parsedScheduleEffectiveTo = parseDate(body.scheduleEffectiveTo)
      if (parsedScheduleEffectiveTo !== undefined) {
        updateData.scheduleEffectiveTo = parsedScheduleEffectiveTo
      }
    }

    // ============================================
    // UPDATE USER
    // ============================================

    const updatedUser = await prisma.user.update({
      where: { 
        id: userId,
        organizationId: auth.organizationId
      },
      data: updateData,
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        userId: auth.userId,
        action: 'UPDATE',
        entityType: 'USER',
        entityId: userId,
        changes: body,
        ipAddress: getHeader(event, 'x-forwarded-for') || 'unknown',
        userAgent: getHeader(event, 'user-agent') || 'unknown',
      },
    })

    // Remove password from response if present
    const { password, ...userWithoutPassword } = updatedUser as any

    return userWithoutPassword
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('❌ Error updating user:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update user',
    })
  }
})