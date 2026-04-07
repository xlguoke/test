window.$vueApp.directive('drag', {
  beforeMount(el) {
    el.style.position = 'absolute'
    el.onmousedown = function (e) {
      e.stopPropagation()
      e.preventDefault()
      const startX = e.clientX - el.offsetLeft
      const startY = e.clientY - el.offsetTop
      document.onmousemove = function (e) {
        const endX = e.clientX - startX
        const endY = e.clientY - startY
        el.style.left = `${endX}px`
        el.style.top = `${endY}px`
        // binding({
        //     left: endX,
        //     top: endY
        // })
      }
      el.onmouseup = function () {
        el.onmouseup = null
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
  unMounted(el) {
    el.onmousedown = null
  },
})
