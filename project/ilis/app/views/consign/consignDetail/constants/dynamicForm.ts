import { INDUSTRY_COMPONENT } from '~/enum/EDynamicForm'
import { ConsignCode, ConsignUnitProjectModal, MailingInfo, PaymentUnit, QualificationType, UnitProjectModal } from '../components'

/** ## 表单组件映射 */
export const INPUT_TEMPLATE_MAP: any = {
  /** 资质类型 */
  [INDUSTRY_COMPONENT.QualificationType]: QualificationType,
  /** 选择委托单位、工程项目 */
  [INDUSTRY_COMPONENT.ConsignUnitAndProject]: ConsignUnitProjectModal,
  /** 委托编号 */
  [INDUSTRY_COMPONENT.ConsignCode]: ConsignCode,
  /** 单位工程 */
  [INDUSTRY_COMPONENT.UnitProject]: UnitProjectModal,
  /** 邮寄信息 */
  [INDUSTRY_COMPONENT.MailingInfo]: MailingInfo,
  /** 缴费单位 */
  [INDUSTRY_COMPONENT.PaymentUnit]: PaymentUnit,
}
