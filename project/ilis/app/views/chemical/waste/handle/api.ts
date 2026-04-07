import type { IResponseCommonEntity, IResponseNewRowsEntity } from '~/interface/IResponseEntity.ts'
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { ILISHTTPError } from '~/types'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 特种设备检查列表参数 */
export interface GetChemicalWasteHandlePageParams {
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
}

export interface ChemicalWasteHandleDTO {
  id: '4028b24296ec33290196ec3ece350005'
  createName: '管理员'
  hazardousIngredients: '1'
  name: '333'
  type: '1'
  quantity: 10
  unit: 'kg'
  departId: '8a8ab0b246dc81120146dc8180ba0017'
  departName: '蜀道投资集团有限责任公司'
  launchDate: 1747699200000
  status: '50'
  remark: '333'
  chemicalWasteMaterialList: [
    {
      id: '4028b24296ae93ce0196ae9df3050002'
      sysCompanyCode: 'A03'
      createName: '管理员'
      createBy: 'admin'
      createDate: 1746686309000
      laboratoryId: '2c9120818ab58877018ab5b5825f0028'
      laboratoryName: '功能室'
      type: '2'
      unit: 'kg'
      status: 'SUBMIT'
      fluid: null
      phValue: 5.7
      launchNum: 1
      handleStatus: '处理中'
      submitUserId: '8a8ab0b246dc81120146dc8181950052'
      submitUserName: '管理员'
      submitDate: null
      totalValue: '20.0kg'
      uploadQR: null
      registrationList: [
        {
          id: '4028b24296aed9df0196aee2e1d30000'
          hazardousIngredients: '1'
          launchUserId: '2c9120818653b8db018653caaaf40003'
          launchUserName: 'yanqing'
          launchDate: 1743552000000
          quantity: 20
          customizeValues: null
          customizeValueStr: null
        },
      ]
    },
  ]
  customizeValues: []
}

/** 分页查询 */
export function getChemicalWasteHandlePage(data: GetChemicalWasteHandlePageParams) {
  return IlisApiHelper.get<IResponseNewRowsEntity<ChemicalWasteDTO>>('rest/chemical/waste/handle/page', data)
}

export class CreateChemicalWasteHandleEntity {
  id?: string
  /** 投放记录,多个用逗号隔开 */
  chemicalWasteMaterialIds?: string
  /** 自定义列信息 json字符串 */
  customizeValueStr?: string
  /** 处理部门ID */
  departId?: string
  /** 处理部门 */
  departName?: string
  /** 有害成分 */
  hazardousIngredients: string[] | string = []
  /** 处理日期 */
  launchDate = dayjs().format(EDateFormatType.YYYY_MM_DD)
  /** 废物名称 */
  name?: string
  /** 数量 */
  quantity?: number
  /** 备注 */
  remark?: string
  /** 废物类型 */
  type?: string
  /** 计量单位 */
  unit?: string
  /** 附件二维码 */
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
export function createChemicalWasteHandle(data: CreateChemicalWasteHandleEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>('rest/chemical/waste/handle', data)
}

/** 编辑记录 */
export function updateChemicalWasteHandle(data: CreateChemicalWasteHandleEntity) {
  return IlisApiHelper.put<IResponseCommonEntity<any>>(`rest/chemical/waste/handle/${data.id}`, data)
}

/** 详情 */
export function getChemicalWasteHandleDetail(id: string) {
  return IlisApiHelper.get<any>(`rest/chemical/waste/handle/${id}`)
}

/** 删除 */
export function delDetail(id: string) {
  return IlisApiHelper.delete<IResponseCommonEntity<any>>(`rest/chemical/waste/handle/${id}`)
}

/** 提交 */
export function chemicalWasteHandleSubmit(id: string, data: any) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/chemical/waste/handle/submit/${id}`, data)
}

/** 撤回 */
export function chemicalWasteHandleRecall(id: string, data: any) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/chemical/waste/handle/recall/${id}`, data)
}

/** 导出 */
export function exportChemicalWasteHandle(data: GetChemicalWasteHandlePageParams) {
  return ilisAxios.get<any>('rest/chemical/waste/handle/export', {
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
