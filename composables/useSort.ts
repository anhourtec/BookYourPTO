export const useSort = <T>(items: Ref<T[]>) => {
  const sortBy = ref<string>('')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const sortedItems = computed(() => {
    if (!sortBy.value) return items.value

    return [...items.value].sort((a, b) => {
      const aVal = (a as any)[sortBy.value]
      const bVal = (b as any)[sortBy.value]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal)
        return sortDirection.value === 'asc' ? comparison : -comparison
      }

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  })

  const toggleSort = (field: string) => {
    if (sortBy.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortDirection.value = 'asc'
    }
  }

  return {
    sortBy,
    sortDirection,
    sortedItems,
    toggleSort
  }
}
