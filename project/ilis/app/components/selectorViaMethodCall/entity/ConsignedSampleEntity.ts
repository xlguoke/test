import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'

function getOtherInfoValue(row: ConsignedSampleEntity, fieldName: string) {
  let res = ''
  if (!row.meta) {
    return res
  }
  const meta = JSON.parse(row.meta || '{}')
  const arr = meta?.otherInfos
  if (Array.isArray(arr) && arr?.length) {
    arr.forEach((item) => {
      if (item.systemFieldName === fieldName) {
        res = item.value || ''
      }
      else if (fieldName === '代表数量') {
        res = meta.delegatesNum
      }
    })
  }
  return res
}

/** # 已委托原材料entity */
export class ConsignedSampleEntity extends AnyDataBaseEntity {
  /** # 样品名称 (搜索用) */
  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField()
  @CustomField('样品名称')
  sampleName?: string

  @TableField()
  @CustomField('样品名称')
  testSampleDisplayName?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField()
  @TableField()
  @CustomField('规格型号')
  standard?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField()
  @TableField()
  @CustomField('样品编号')
  testObjectCode?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField()
  @TableField()
  @CustomField('来样编号')
  provideToCustomerSampleCode?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '试样数量')
    },
  })
  @CustomField('试样数量')
  quantity?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '代表数量')
    },
  })
  @CustomField('代表数量')
  representNum?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '生产厂家')
    },
  })
  @CustomField('生产厂家')
  manufacturer?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '产地')
    },
  })
  @CustomField('生产产地')
  manufactureLocation?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '生产日期')
    },
  })
  @CustomField('生产日期')
  manufactureDate?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '出厂日期')
    },
  })
  @CustomField('出厂日期')
  ccrq?: string

  @TableField({
    customRender: ({ record }) => {
      return getOtherInfoValue(record, '批号')
    },
  })
  @CustomField('批号')
  batchNumber?: string

  @FormField({ formType: EFormItemType.INPUT, isOnlySearch: true })
  @SearchField({ isAdvanced: true })
  @TableField()
  @CustomField('委托编号')
  consignCode?: string

  @TableField()
  @CustomField('报告编号')
  reportCodes?: string

  @TableField({
    customRender: ({ record }) => {
      if (!record.meta) {
        return ''
      }
      const meta = JSON.parse(record.meta || '{}')
      return meta?.samplingPlace || ''
    },
  })
  @CustomField('取样地点')
  samplingPlace?: string

  @CustomField('推荐掺量')
  recommendedDosage?: string

  @CustomField('用量kg/m³')
  dosage?: string

  @CustomField('单位比')
  unitRatio?: string

  @TableField({
    customRender: ({ record }) => {
      if (!record.meta) {
        return ''
      }
      const meta = JSON.parse(record.meta || '{}')
      return meta?.description || ''
    },
  })
  @CustomField('样品描述')
  description?: string

  @CustomField('备注')
  remark?: string

  @CustomField('样品ID')
  testObjectId?: string

  @CustomField('委托ID')
  consignId?: string

  @CustomField('检测参数')
  testObjectParams?: string

  @CustomField('类型')
  type?: string

  @CustomField('对象类型')
  objectType?: string

  @CustomField('元数据')
  meta?: string
}
