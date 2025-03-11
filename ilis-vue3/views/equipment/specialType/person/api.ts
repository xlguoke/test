import { Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import type { IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import { ILISHTTPError } from '~/types'

/** 特种设备人员数据项 */
interface PeopleItem {
  personName: '李铁军'
  gender: '男'
  dateOfBirth: 286819200000
  education: ''
  identityNumber: '511028197902030815'
  certificateNumber: '123456789'
  issueUnit: null
  scopeExpertise: null
  firstCollectionDate: null
  expirationDate: null
  reviewDate: null
}

export interface GetPeopleListParams {
  page?: number
  size?: number
  q?: string
}

/** 特种设备人员 */
export function getPeopleList(data: GetPeopleListParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<PeopleItem>>('rest/special/equipment/people-pagination', data)
}

/** 导出特种设备人员 */
export function exportPeople(data: GetPeopleListParams) {
  return ilisAxios.get<any>('rest/special/equipment/people-export', {
    params: data,
    responseType: 'blob',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      Modal.error({
        title: '提示',
        content: err.message,
        centered: true,
        okText: '确定',
      })
    }
    throw err
  })
}
