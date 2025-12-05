export const useFilters = <T>(items: Ref<T[]>, initialFilters: any = {}) => {
  const filters = ref({ ...initialFilters })
  
  const filteredItems = computed(() => {
    let result = [...items.value]
    
    Object.keys(filters.value).forEach(key => {
      const filterValue = filters.value[key]
      if (!filterValue || filterValue === 'all') return
      
      result = result.filter(item => {
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          return filterValue.includes((item as any)[key])
        }
        return (item as any)[key] === filterValue
      })
    })
    
    return result
  })

  const clearFilters = () => {
    filters.value = { ...initialFilters }
  }

  return {
    filters,
    filteredItems,
    clearFilters
  }
}
