export enum EquipmentBuyPlanStatus {
  填写中 = '10',
  审批中 = '20',
  审批拒绝 = '30',
  审批通过 = '40',
  申请被驳回 = '50',
}

export interface EquipmentBuyPlanDTO {
  id: string
  createDate: number
  applicant: string
  budget: number
  applyExplain: string | null
  status: EquipmentBuyPlanStatus
}

export interface EquimentBuPlanDetailDTO {
  standard: string
  reason: string
  amount: number
  updateDate: number | null
  customizeValues: Array<{
    id: string
    sysCompanyCode: string
    createName: string
    createBy: string
    createDate: string
    updateName: string
    updateBy: string
    updateDate: string
    unitCode: string
    isDelete: boolean
    columnId: string
    columnIndex: number
    columnName: string
    visible: boolean
    disabled: boolean
    columnType: string
    columnValue: string
    objectId: string
  }>
  totalPrice: number
  sysCompanyCode: string
  updateName: string | null
  manufacturer: string
  usefulLife: string | null
  useRule: string
  unit: string | null
  createBy: string
  updateBy: string | null
  price: number
  unitCode: string
  name: string
  departId: string
  sysOrgCode: string | null
  id: string
  buyPlanId: string
  depart: string
  createName: string
  createDate: number
}
