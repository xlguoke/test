import type { ViewSampleTreeNode } from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type { BigCategoryInfoItem } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

export { default as SelectSampleParam } from './SelectSampleParam.vue'
export { default as SelectSampleParamModal } from './SelectSampleParamModal.vue'

/**
 * 自定义样品信息数据
 */
export interface SelectSampleEntity extends ViewSampleTreeNode {
  SampleLevelStr: string
  SampleLevelArr: string
  SystemId?: string
  testUnitTestSampleId: string
}

/**
 * 选择样品参数返回的数据结构
 */
export interface SelectSampleParamEntity {
  bigCategoryId: string
  bigCategoryNames: string
  bigCategoryInfo: {
    id: string
    level: number
    title: string
  }[]
  systemTestSampleId?: string
  testUnitTestSampleId: string
  Sample: SelectSampleEntity
  nodes: string[]
  selectedParamIds: string[]
  testItemIds: string[]
  rootNode: {
    systemId?: string
    id?: string
    name?: string
  }
  sampleLevelNameArr: Array<{ name: string, value: string }>
  /** 选择的参数列表 */
  testParams: ViewTestParamsItem[]
  isNeedConclusion: boolean
}

export interface DefaultDataEntity {
  /** 大类节点信息 */
  bigCategoryInfo: BigCategoryInfoItem[]
  /** 样品节点信息 */
  nodes: string[]
  /** 选中的参数 */
  testParams: ViewTestParamsItem[]
}
