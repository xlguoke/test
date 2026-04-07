import { ref } from 'vue'

export function useTouchSwipe({
  handleLeftSwipe,
  handleRightSwipe,
}: {
  handleLeftSwipe?: () => void
  handleRightSwipe?: () => void
}) {
  const startX = ref(0)
  const endX = ref(0)

  // 触摸开始
  function handleTouchStart(event: any) {
    startX.value = event.touches[0].clientX
  }

  // 触摸结束
  function handleTouchEnd(event: any) {
    endX.value = event.changedTouches[0].clientX
    handleSwipe()
  }

  // 判断滑动方向
  function handleSwipe() {
    // 设置一个阈值，例如50像素，避免误触
    if (startX.value - endX.value > 50)
      handleLeftSwipe && handleLeftSwipe()

    if (endX.value - startX.value > 50)
      handleRightSwipe && handleRightSwipe()
  }

  return {
    handleTouchStart,
    handleTouchEnd,
  }
}
