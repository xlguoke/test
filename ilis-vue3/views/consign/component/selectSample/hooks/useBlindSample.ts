import { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'

/** 盲样控制 */
export function useBlindSample() {
  // 开启盲样
  const enableBlindSample = ref(false)

  // 开启工程部位/用途盲样
  const enableProjectPartBlindSample = ref(false)

  if (MainController.consignWindow.GetQueryString('isTaskRedirect') === 'true' || MainController.consignWindow.GetQueryString('isTaskassigned') === 'true') {
    // 开启盲样系统参数
    getBusinessParam('TEST_DETECTION_39').then((val) => {
      enableBlindSample.value = val

      if (val) {
        // 工程部位/用途不盲样
        getBusinessParam('TEST_DETECTION_BUT_PARTANDUSE').then((val) => {
          enableProjectPartBlindSample.value = !val
        })
      }
    })
  }

  return {
    enableBlindSample,
    enableProjectPartBlindSample,
  }
}
