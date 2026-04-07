import type { ParamPackItem } from '~/views/consign/component/selectSample/modules/UseParamPack.ts'
import { getParamPacks } from '~/views/consign/component/selectSample/api.ts'

/** 盲样控制 */
export function useParamPackHook() {
  // 使用的打包参数
  const useParamPackId = ref<string>()

  // 打包参数下拉
  const paramPackList = ref<ParamPackItem[]>([])

  // 获取打包参数
  const getParamPackList = function (bigCategoryId: string, testUnitTestSampleId: string) {
    useParamPackId.value = undefined

    getParamPacks({
      pagination: false,
      sampleId: testUnitTestSampleId,
      categoryId: bigCategoryId,
    }).then((res) => {
      paramPackList.value = res.data
    })
  }

  return {
    useParamPackId,
    paramPackList,
    getParamPackList,
  }
}
