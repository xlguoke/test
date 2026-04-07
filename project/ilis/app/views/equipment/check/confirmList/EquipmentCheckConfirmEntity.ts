import type { IFileEntity } from '~/interface/IFileEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
/**
 * # 检校状态枚举 （填写中、审批中、审批拒绝、审批通过）
 */
export enum CheckStatus {
  /** # 填写中 */
  WAIT_APPROVE = '10',
  /** # 审核中 */
  APPROVE_ING = '20',
  /** # 未通过 */
  APPROVE_REJECT = '30',
  /** # 已通过 */
  APPROVE_SUCCESS = '40',
  /** # 审核驳回 */
  APPROVE_REJECTED = '50',
}

/**
 * # 检校状态字典
 */
export const CheckStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: CheckStatus.WAIT_APPROVE, label: '填写中', color: '#0066ec' },
  { key: CheckStatus.APPROVE_ING, label: '审核中', color: '#f59a23' },
  { key: CheckStatus.APPROVE_REJECT, label: '未通过', color: '#d9001b' },
  { key: CheckStatus.APPROVE_SUCCESS, label: '已通过', color: '#4b7902' },
  { key: CheckStatus.APPROVE_REJECTED, label: '审核驳回', color: '#d9001b' },
])

/**
 * # 检校确认entity(有列筛选功能，故非特殊字段，entity中暂无配置)
 */
export class EquipmentCheckConfirmEntity extends AnyDataBaseEntity {
  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField()
  @CustomField('检校确认人')
  // 搜索用
  confirmerName?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField()
  @TableField({ width: 100 })
  @CustomField('确认状态', CheckStatusDict)
  // 搜索用
  eqStatus?: string

  @FormField({ formType: EFormItemType.DATE_RANGE, isOnlySearch: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @SearchField()
  @CustomField('检校日期')
  // 搜索用
  checkDateSearch?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入设备编号/设备名称/证书编号',
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQryParam?: string

  @FormField({ formType: EFormItemType.SELECT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('计划名称')
  checkPlanName?: string

  @FormField({ formType: EFormItemType.DATE_RANGE, isOnlySearch: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @SearchField({ isAdvanced: true })
  @CustomField('计划检校日期')
  // 搜索用
  planCheckDateSearch?: string

  @FormField({ formType: EFormItemType.DATE_RANGE, isOnlySearch: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @SearchField({ isAdvanced: true })
  @CustomField('检校确认日期')
  // 搜索用
  confirmTimeSearch?: string

  @FormField({ formType: EFormItemType.INPUT, required: true })
  @SearchField({ isAdvanced: true })
  @CustomField('证书编号')
  // 搜索用
  certificateSn?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField({
    width: 120,
    customRender: ({ text, record }: { text: string, record: EquipmentCheckConfirmEntity }) => {
      const fileNames = text?.split(',')?.filter(Boolean)
      if (!fileNames?.length) {
        return ''
      }
      const renderArr = fileNames.map((fileName) => {
        const matchedFile = record.file?.find((file) => {
          return file.name.includes(fileName)
        })
        if (matchedFile) {
          return h('div', {}, [
            h('a', { href: matchedFile.url, target: '_blank', style: 'color:var(--colorPrimary)' }, fileName),
          ])
        }
        else {
          return h('div', fileName)
        }
      })
      return h('div', renderArr)
    },
  })
  @CustomField('检校证书名称')
  certificateName?: string

  file?: IFileEntity[]

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备编号')
  // 搜索用
  eqSn?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备名称')
  // 搜索用
  eqName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备科室')
  // 搜索用
  eqDepartName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('设备使用人')
  // 搜索用
  userName?: string

  @FormField({ formType: EFormItemType.INPUT, required: true })
  @SearchField({ isAdvanced: true })
  @CustomField('检校单位')
  // 搜索用
  checkUnit?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('适用参数')
  // 搜索用
  applyParam?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @CustomField('适用规程')
  // 搜索用
  applyRegulations?: string

  equipmentId?: string

  @TableField({ width: 120 })
  @CustomField('确认状态', CheckStatusDict)
  status?: string

  @FormField({ formType: EFormItemType.SELECT, required: true })
  @TableField({ width: 100 })

  @CustomField('检校类型', 'eq_ck_type')
  checkType?: string

  @FormField({ formType: EFormItemType.INPUT })
  @CustomField('检校周期')
  checkPeriod?: string

  checkPeriodUnit?: string

  @FormField({ formType: EFormItemType.DATE, required: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @TableField({
    width: 100,
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('检校日期')
  checkTime?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('审批时间')
  confirmTime?: string

  @FormField({ formType: EFormItemType.DATE, required: true, dateFormat: EDateFormatType.YYYY_MM_DD })
  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('有效期')
  validityDate?: string

  @FormField({ formType: EFormItemType.INPUT, required: true, maxLength: 250 })
  @CustomField('检校依据')
  gist?: string

  @FormField({
    formType: EFormItemType.INPUT,
    maxLength: 9999,
  })
  @CustomField('检校结论')
  verdict?: string

  @FormField({
    formType: EFormItemType.INPUT,
    maxLength: 255,
  })
  @CustomField('检校备注')
  remark?: string

  @FormField()
  @CustomField('证书文件')
  certFile?: string

  @FormField()
  @CustomField('其他附件')
  otherFile?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('前次检校时间')
  preCheckDate?: string

  @TableField({
    width: 100,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('下次检校时间')
  nextCheckDate?: string

  @TableField({
    width: 150,
    sorter: true,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('创建时间')
  declare createDate: Date

  @TableField({
    width: 100,
    customRender: ({ text }) => {
      if (!text) {
        return ''
      }
      return h('a', { href: text, target: '_blank', style: 'color:var(--colorPrimary)' }, '检校确认表')
    },
  })
  @CustomField('直接确认文件')
  confirmFile?: any

  @TableField({
    isAlways: true,
    width: 160,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}
