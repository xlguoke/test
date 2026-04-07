import { IlisApiHelper } from '~/utils/IlisApiHelper'

// 样品树
export interface SampleTree {
  text: string
  id: string
  chkDisabled: boolean
  children?: SampleTree[]
  attributes: {
    description: string
    displayName: string
    sampleLevelName: string
    systemId: string
  }
}

/**
 * 获取任务检测对象
 * @param testTaskId 任务id
 */
export function getTaskTestObject(testTaskId: string) {
  return IlisApiHelper.get<any>(`testTaskController/getTestObject.do?testTaskId=${testTaskId}`)
}

/**
 * 获取辅助信息
 */
interface OtherInfoParams {
  /** 任务检测对象id */
  testObjectId: string
  /** 样品id */
  sampleId: string
}
export function getTestOtherInfo(params: OtherInfoParams) {
  return IlisApiHelper.get<any>(`testObjectOtherInfoController.do?getTestObjectOtherInfo`, params)
}

/**
 * 获取当任务样品的样品层级信息
 */
export function getSampleComboTree(unitSampleId: string) {
  return IlisApiHelper.get<any>(`testSampleController.do?getSampleComboTreeByTestParams&unitSampleId=${unitSampleId}`)
}

/**
 * 获取委托元数据中的属性
 * 不传 attributeName 时，获取当前样品的元数据
 */
interface MetaDataParams {
  /** 委托id */
  consignId: string
  /** 样品id */
  objectId: string
  /** 属性名称 */
  attributeName: string
}
export function getConsignMetaDataAttribuite<T>(params: MetaDataParams) {
  const { consignId, objectId, attributeName } = params
  return IlisApiHelper.get<T>(`rest/consignController/meta/${consignId}/${objectId}?attributeName=${attributeName}`)
}
