/** 系统参数 */
export function usePageParams() {
  /** 【系统参数】按样品设置资质 */
  const SET_QUA_WITH_OBJECT = ref(false)

  /** 【系统参数】展示条款号 */
  const OTHER_9 = ref(false)

  getBusinessParam('SET_QUA_WITH_OBJECT').then((val) => {
    SET_QUA_WITH_OBJECT.value = val
  })

  getBusinessParam('OTHER_9').then((val) => {
    OTHER_9.value = val
  })

  return {
    SET_QUA_WITH_OBJECT,
    OTHER_9,
  }
}
