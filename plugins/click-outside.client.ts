interface ClickOutsideElement extends HTMLElement {
  clickOutsideEvent?: (event: MouseEvent) => void
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('click-outside', {
    mounted(el: HTMLElement, binding: any) {
      const element = el as ClickOutsideElement
      
      element.clickOutsideEvent = (event: MouseEvent) => {
        if (!(el === event.target || el.contains(event.target as Node))) {
          binding.value(event)
        }
      }
      
      setTimeout(() => {
        document.addEventListener('mousedown', element.clickOutsideEvent!)
      }, 0)
    },
    unmounted(el: HTMLElement) {
      const element = el as ClickOutsideElement
      if (element.clickOutsideEvent) {
        document.removeEventListener('mousedown', element.clickOutsideEvent)
      }
    }
  })
})