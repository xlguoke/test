import type { ICustomProperties } from '../check/checkSend/component/customRecord'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import OrgSelector from '~/components/selectorViaMethodCall/OrgSelector.vue'
import PersonSelector from '~/components/selectorViaMethodCall/PersonSelector.vue'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'

/**
 * # 固定资产entity
 */
export class EquipmentAssetEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入设备编号/资产编号/设备名称/资产品牌/规格型号',
  })
  @SearchField({ width: '360px' })
  @CustomField('快捷查询')
  quickQry?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('资产编号')
  assetSn?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('设备编号')
  equipmentSn?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @SearchField()
  @TableField({
    width: 120,
  })
  @CustomField('资产类别', 'eqAssets')
  type?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('设备名称')
  name?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField({
    width: 120,
  })
  @CustomField('资产品牌')
  factory?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @TableField({
    width: 120,
  })
  @CustomField('规格型号')
  standard?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('数量')
  quantity?: number

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    width: 120,
  })
  @CustomField('购置日期')
  buyDate?: Date

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    isOnlySearch: true,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('购置日期')
  buyDateSearch?: Date // 搜索用字段

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('所属单位')
  unitName?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: OrgSelector,
      onSelect: (val: IDepartmentEntity[], formData) => {
        formData.departId = val[0]?.id
        formData.departName = val[0]?.text
      },
    },
  })
  @TableField({
    width: 120,
  })
  @CustomField('所属部门')
  departName?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('所属部门')
  departId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: OrgSelector,
      onSelect: (val: IDepartmentEntity[], formData) => {
        formData.serveLocationId = val[0]?.id
        formData.serveLocation = val[0]?.text
      },
    },
  })
  @TableField({
    width: 120,
  })
  @CustomField('使用地点')
  serveLocation?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isAdvanced: true })
  @CustomField('使用地点')
  serveLocationId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: PersonSelector,
      multiple: true,
      onSelect: (val: IUserSelectVoEntity[], formData) => {
        formData.userId = val?.map(i => i.id)?.join(',')
        formData.userName = val?.map(i => i.name)?.join(',')
      },
    },
  })
  @SearchField({
    isAdvanced: true,
    selectorConfigMixin: {
      multiple: false,
    },
  })
  @TableField({
    width: 120,
  })
  @CustomField('使用人')
  userName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
  })
  @SearchField({ isHidden: true })
  userId?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @SearchField({
    isAdvanced: true,
  })
  @TableField({
    width: 120,
  })
  @CustomField('使用状态', 'eqAssetsStatus')
  status?: string

  @CustomField('设备二维码')
  eqQrKey?: string

  @CustomField('关联设备id')
  eqId?: string

  @CustomField('自定义属性（列表、详情返回）')
  customizeValues?: ICustomProperties[]

  @CustomField('自定义属性（提交）')
  customizeValueList?: ICustomProperties[]

  @CustomField('检测设备是否删除')
  eqDeleted?: string

  @TableField({
    isAlways: true,
    width: 160,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}
