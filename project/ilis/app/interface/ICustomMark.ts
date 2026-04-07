import type { CustomMarkManagePage } from '~/components/ilisComponent'

export interface ICustomMark {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  unitCode: string
  textType: string
  explainText?: string | null
  text: string
  markColor: string
  markRange: string
  orderNum?: number | null
  isEnable: '1' | '0'
  isDeleted: '0' | '1'
  managePage: CustomMarkManagePage
}
