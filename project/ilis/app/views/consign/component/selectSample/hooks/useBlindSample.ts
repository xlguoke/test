import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'

/** 盲样控制 */
export function useBlindSample(consginPageParam: IConsginPageParam) {
  const { pageState, SYSTEM_PARAM } = consginPageParam

  // 开启盲样
  const enableBlindSample = ref(false)

  // 开启工程部位/用途盲样
  const enableProjectPartBlindSample = ref(false)

  if (pageState.isTaskRedirect) {
    // 开启盲样系统参数
    enableBlindSample.value = SYSTEM_PARAM.TEST_DETECTION_39 || false

    // 工程部位/用途不盲样
    if (enableBlindSample.value)
      enableProjectPartBlindSample.value = !SYSTEM_PARAM.TEST_DETECTION_BUT_PARTANDUSE
  }

  return {
    enableBlindSample,
    enableProjectPartBlindSample,
  }
}
