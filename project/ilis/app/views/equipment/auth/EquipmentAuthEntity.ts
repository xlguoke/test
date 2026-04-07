import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { AnyDictionaryHelper } from '~/utils/AnyDictionaryHelper'
import { EDateFormatType } from '~/utils/EDateFormatType'

const { getOrgToDict, getLocationToDict } = useCommonDataDict()

export class EquipmentAuthQuery {
  onlyAuthEquipment = true
  quickQryParam?: string

  eqType?: string
  factorySn?: string
  eqStatus?: string
  eqName?: string
  equipmentSn?: string
  eqStandard?: string
  supplier?: string
  eqLaboratoryName?: string
  eqUnitName?: string
  eqDepartId?: string
  transferStatus?: string
  storageSite?: string
  location?: string
  keeperName?: string
  buyDateBegin?: string
  buyDateEnd?: string
}

/** 调拨状态 */
const transferStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { label: '闲置中', key: '10' },
  { label: '调拨中', key: '20' },
  { label: '使用中', key: '30' },
  { label: '已安装', key: '40' },
  { label: '已移交', key: '50' },
])

/**
 * 高级查询
 */
export class AdvancedQueryEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入设备名称、编号、规格型号后回车即可查询',
  })
  @SearchField({
    width: '300px',
  })
  @CustomField('模糊查询')
  quickQryParam?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('设备类别', 'eq_type')
  eqType?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('出厂编号')
  factorySn?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('设备状态', 'eq_status', 'typeName')
  eqStatus?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('设备名称')
  eqName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '支持设备编号/档案编号/资产编号模糊查询',
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('设备编号')
  equipmentSn?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('规格型号')
  eqStandard?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('供应商')
  supplier?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('所属功能室')
  eqLaboratoryName?: string

  @FormField({
    formType: EFormItemType.TREE_SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('所属部门', getOrgToDict)
  eqDepartId?: string

  @FormField({
    formType: EFormItemType.SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('调拨状态', transferStatusDict)
  transferStatus?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('存放位置')
  storageSite?: string

  @FormField({
    formType: EFormItemType.TREE_SELECT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('所在位置', getLocationToDict)
  location?: string

  @FormField({
    formType: EFormItemType.INPUT,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('部门保管人')
  keeperName?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @SearchField({
    isAdvanced: true,
  })
  @CustomField('购置日期')
  buyDate?: string
}

/**
 * # 设备授权entity
 */
export class EquipmentAuthEntity extends AnyDataBaseEntity {
  @TableField({
    width: 150,
  })
  @CustomField('设备编号')
  equipmentSn?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField({
    width: 150,
  })
  @CustomField('设备名称')
  name?: string

  @TableField({
    width: 150,
  })
  @CustomField('设备类别')
  type?: string

  @TableField({
    width: 150,
  })
  @CustomField('规格型号')
  standard?: string

  @TableField({
    width: 220,
  })
  @CustomField('所属部门')
  departName?: string

  @TableField({
    width: 150,
  })
  @CustomField('所属功能室')
  laboratoryName?: string

  @TableField({
    width: 150,
  })
  @CustomField('档案编号')
  archiveSn?: string

  @TableField({
    width: 150,
  })
  @CustomField('出厂编号')
  factorySn?: string

  @TableField({
    width: 150,
  })
  @CustomField('资产编号')
  assetSn?: string

  @TableField({
    width: 150,
  })
  @CustomField('设备状态')
  status?: string

  @TableField({
    width: 150,
  })
  @CustomField('存放位置')
  storageSite?: string

  @TableField({
    width: 180,
  })
  @CustomField('所在位置')
  serveLocation?: string

  @TableField({
    width: 150,
  })
  @CustomField('部门保管人')
  keeperName?: string

  @TableField({
    width: 150,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('购置日期')
  buyDate?: string

  @TableField({
    width: 150,
  })
  @CustomField('数量')
  quantity?: string

  @TableField({
    width: 150,
  })
  @CustomField('检验类型')
  checkType?: string

  @TableField({
    width: 150,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('前次检校')
  preCheckDate?: string

  @TableField({
    width: 150,
    dateFormat: EDateFormatType.YYYY_MM_DD,
  })
  @CustomField('下次检校')
  nextCheckDate?: string

  @TableField({
    width: 150,
  })
  @CustomField('供应商')
  supplierName?: string

  @TableField({
    width: 150,
  })
  @CustomField('检校单位')
  checkUnit?: string

  @TableField({
    width: 150,
  })
  @CustomField('备注')
  remark?: string

  @TableField({
    width: 140,
    align: 'center',
  })
  @CustomField('授权操作人员')
  authUser?: number

  @TableField({
    isAlways: true,
    fixed: 'right',
    width: 140,
  })
  @CustomField('操作')
  operation?: any
}
