import type { IResponseCommonEntity, IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import type { PageStatusEnum } from '~/views/chemical/waste/reg/index.ts'
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { ILISHTTPError } from '~/types'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 特种设备检查列表参数 */
export interface GetChemicalWastePageParams {
  endDate?: string
  exportType?: string
  isPager?: boolean
  order?: string
  orderBy?: string
  page?: number
  quickQry?: string
  size?: number
  startDate?: string
  status?: string
  type?: string
  handleStatus?: string
}

/** 分页查询 */
export function getChemicalWastePage(data: GetChemicalWastePageParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<ChemicalWasteDTO>>('rest/chemical/waste/page', data)
}

// 新增记录
export class CreateChemicalWasteEntity {
  id?: string
  /** 是否液体 */
  fluid = false
  /** 功能室ID */
  laboratoryId?: string
  /** PH值 */
  phValue?: number
  /** 登记记录 */
  registrationList: ChemicalWasteMaterialRegistrationVO[] = []
  /** 废物类型 */
  type?: string
  /** 计量单位 */
  unit?: string
  /** * 附件二维码 */
  uploadQR?: string
}

export interface ChemicalWasteMaterialRegistrationVO {
  id: string
  /** 自定义列信息 json字符串 */
  customizeValueStr?: string
  /** 有害成分 */
  hazardousIngredients?: string
  /** 投放时间 */
  launchDate?: string
  /** 投放人ID */
  launchUserId?: string
  /** 投放人 */
  launchUserName?: string
  /** 数量 */
  quantity?: number
}

export interface ChemicalWasteDTO {
  id: '4028b2f496f0801c0196f0c266520013'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: 1747795994000
  laboratoryId: '2c9120818ab58877018ab5b5825f0028'
  laboratoryName: '功能室'
  type: '2'
  unit: 'g'
  status: 'CREATE'
  fluid: boolean
  phValue: 10
  launchNum: 0
  handleStatus: '待处理'
  submitUserId: null
  submitUserName: null
  submitDate: null
  totalValue: '0.0g'
  uploadQR: null
  registrationList: ChemicalWasteMaterialRegistrationVO[]
}

/** 新增记录 */
export function createChemicalWaste(data: CreateChemicalWasteEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/chemical/waste', data)
}

/** 编辑记录 */
export function updateChemicalWaste(data: CreateChemicalWasteEntity) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>(`rest/chemical/waste/${data.id}`, data)
}

/** 详情 */
export function getChemicalWasteDetail(id: string) {
  return IlisApiHelper.get<any>(`rest/chemical/waste/${id}`)
}

/** 删除 */
export function delDetail(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/chemical/waste/${id}`)
}

/** 批量删除 */
export function batchDelDetail(ids: string[]) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/chemical/waste`, {}, {
    data: ids,
  })
}

/** 提交 */
export function chemicalWasteSubmit(id: string, status: PageStatusEnum) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>(`rest/chemical/waste/${id}/${status}`)
}

/** 导出 */
export function exportChemicalWaste(data: GetChemicalWastePageParams) {
  return ilisAxios.get<any>('rest/chemical/waste/export', {
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

const user = getLocalUserInfo()

export class CreateChemicalWasteRegEntity {
  id?: string
  /** 自定义列信息 json字符串 */
  customizeValueStr?: string
  customizeValues?: any[]
  /** 有害成分 */
  hazardousIngredients?: string
  /** 投放时间 */
  launchDate = dayjs().format('YYYY-MM-DD')
  /** 投放人ID */
  launchUserId = user ? user.userId : null
  /** 投放人 */
  launchUserName = user ? user.realName : null
  /** 数量 */
  quantity?: number
}

/** 新增登记 */
export function createChemicalWasteReg(recordId: string, data: CreateChemicalWasteRegEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/chemical/waste/reg/${recordId}`, data)
}

/** 编辑登记 */
export function updateChemicalWasteReg(id: string, data: CreateChemicalWasteRegEntity) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>(`rest/chemical/waste/reg/${id}`, data)
}

/** 登记详情 */
export function getChemicalWasteReg(id: string) {
  return IlisApiHelper.get<IResponseCommonEntity<any>>(`rest/chemical/waste/reg/${id}`)
}

/** 删除登记 */
export function delChemicalWasteReg(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/chemical/waste/reg/${id}`)
}

export class SaveChemicalWasteBarcode {
  laboratoryId?: string
  laboratoryName?: string
  type?: string
  typeName?: string
  hazardousIngredients?: string
  hazardousIngredientsName?: string
}

/** 保存二维码信息 */
export function saveChemicalWasteBarcode(key: string | number, value: SaveChemicalWasteBarcode) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/chemical/waste/barcode`, {
    key,
    value: JSON.stringify(value),
  })
}
