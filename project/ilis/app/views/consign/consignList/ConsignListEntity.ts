import type { CONSIGN_STATUS } from './dict'
import type { IlisMark } from '~/components/ilisComponent/marks/IlisMarks.vue'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import { consignOriginDict, consignStatusDict, consignTypeDict, feeStatusDict, projectNatureDict } from './dict'
import { getCheckType, getQualificationType, getSnType } from './dictApi'

/** ## 列表entity */
export class ConsignListEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '输入委托编号/委托单位/工程项目/样品名称/样品编号后回车即可查询',
  })
  @SearchField({
    width: '480px',
  })
  @CustomField('模糊查询')
  quickQuery?: string

  @TableField({
    width: 80,
    fixed: 'left',
    isAlways: true,
  })
  @CustomField('标记')
  mark?: IlisMark[]

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 240,
    fixed: 'left',
    sorter: true,
  })
  @CustomField('委托编号')
  consignCode?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    // rangeMap: ['consignDateStart', 'consignDateEnd'],
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('委托日期')
  consignDate?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 180,
  })
  @CustomField('委托单位')
  consignUnitName?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('委托人')
  sampleSenderName?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 180,
  })
  @CustomField('工程项目')
  projectTenderName?: string

  @FormField({
    formType: EFormItemType.CHECKBOX,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('委托状态', consignStatusDict)
  status?: CONSIGN_STATUS[]

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('样品名称')
  consignObjectName?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 260,
  })
  @CustomField('样品编号')
  testObjectCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('来样编号')
  provideToCustomerSampleCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('批号')
  batchNum?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('项目性质', projectNatureDict)
  projectNature?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('协作单位')
  cooperativeUnit?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('资质类型', getQualificationType)
  qualificationTypeId?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('检测类型', consignTypeDict)
  consignType?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('数据来源', consignOriginDict)
  consignOrigin?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('缴费状态', feeStatusDict)
  feeStatus?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('检测类别', getCheckType)
  checkTypeId?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('编号类别', getSnType)
  snTypeId?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('收样人员')
  sampleAcceptorName?: string

  @FormField({
    formType: EFormItemType.INPUT_RANGE,
    placeholder: ['请输入完整的开始编号', '请输入完整的结束编号'],
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('委托编号范围')
  consignCodeRange?: string

  @FormField({
    formType: EFormItemType.INPUT_RANGE,
    placeholder: ['请输入完整的开始编号', '请输入完整的结束编号'],
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('样品编号范围')
  testObjectCodeRange?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('约定关联合同编号')
  contractCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('预委托编号')
  preConsignCode?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('检测参数')
  paramName?: string

  @TableField({
    width: 100,
    sorter: true,
  })
  @CustomField('委托费用')
  manualFeeTotal?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('预计试验日期')
  plannedTestDate?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('送样日期')
  sampleSendDate?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('收费日期')
  chargeDate?: string

  @TableField({
    width: 120,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('要求报告日期(用户)')
  requireReportDate?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('样品接收日期')
  sampleReceivedDate?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('样品实际接收日期')
  sampleActualReceivedDate?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('预约时间')
  appointmentDate?: string

  consignUnitId?: string
  consignProjectId?: string
  consignStatus!: CONSIGN_STATUS
  taskSource?: string

  remark?: string
  isDelete!: 0 | 1
  isPreconsign?: number
  urgentStatus?: string
  releaseSn?: string
  sampleNum?: string
  testObjectStandards?: string
  objectFee?: string
  minimumProgressStatus?: string

  @TableField({
    width: 160,
    fixed: 'right',
    isAlways: true,
  })
  @CustomField('操作')
  operation?: string
}

/** ## 选择检测部门 */
export class TestDepartmentEntity extends AnyDataBaseEntity {
  @TableField()
  @CustomField('委托编号')
  consignCode?: string

  @TableField()
  @CustomField('样品编号')
  testObjectCode?: string

  @TableField()
  @CustomField('样品名称')
  sampleName?: string

  @TableField()
  @CustomField('规格型号')
  standard?: string

  @TableField()
  @CustomField('检测参数')
  testParams?: string

  @TableField({
    width: 260,
  })
  @CustomField('检测部门')
  department?: string

  @CustomField('检测部门id')
  departmentId?: string
}
