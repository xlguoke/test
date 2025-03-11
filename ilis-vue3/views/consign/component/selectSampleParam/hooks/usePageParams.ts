/** 盲样控制 */
export function usePageParams() {
  // 开启推荐规程逻辑
  const USING_RECOMMENDED_PARAMETER_STANDARD = ref(false)

  getBusinessParam('USING_RECOMMENDED_PARAMETER_STANDARD').then((val) => {
    USING_RECOMMENDED_PARAMETER_STANDARD.value = val
  })

  return {
    USING_RECOMMENDED_PARAMETER_STANDARD,
  }
}
