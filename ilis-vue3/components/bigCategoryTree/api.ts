import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseOldEntity } from '~/interface/IResponseEntity.ts'

export interface QueryParams {
  /** 版本 */
  paramVersionId?: string
}

/** 功能室数据 */
export interface BigCategoryTreeEntity {
  code?: string
  isDeleted: '0' | '1'
  level: string
  name: string
  testType?: string
  orderNum: number
  pid?: string
  remark?: string
  id: string
  paramVersionId: string
  children?: BigCategoryTreeEntity[]
}

/** 版本树节点数据 */
export interface ParamVersionEntity {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  unitCode?: string
  isDelete: '0' | '1'
  isEnable: '0' | '1'
  versionName: string
  copyParamVersionId?: string
}

/** 获取大类树 */
export function getBigCategory(queryParams?: QueryParams, showDelete = false) {
  return IlisApiHelper.postForm<BigCategoryTreeEntity[]>(`bigCategoryController.do?datagrid&showDelete=${String(showDelete)}`, queryParams)
}

/** 获取大类树版本 */
export function getParamVersionList() {
  return IlisApiHelper.post<IResponseOldEntity<ParamVersionEntity[]>>(`paramVersionManagementController/list.do`)
}
