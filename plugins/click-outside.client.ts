interface ClickOutsideElement extends HTMLElement {
  clickOutsideEvent?: (event: MouseEvent) => void
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el: HTMLElement, binding: any) {
      const element = el as ClickOutsideElement
      
      element.clickOutsideEvent = (event: MouseEvent) => {
        // Check if the click was outside the element
        if (!(el === event.target || el.contains(event.target as Node))) {
          // Call the provided method
          binding.value(event)
        }
      }
      // Add the event listener
      document.addEventListener('click', element.clickOutsideEvent)
    },
    unmounted(el: HTMLElement) {
      const element = el as ClickOutsideElement
      // Clean up the event listener
      if (element.clickOutsideEvent) {
        document.removeEventListener('click', element.clickOutsideEvent)
      }
    }
  })
})