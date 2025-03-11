import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'
import type { IlisAdvancedQueryConfigItem } from '~/components/IlisAdvancedQuery/index.ts'
import { QueryConfigType } from '~/components/IlisAdvancedQuery/index.ts'
import { getListByGroupId, getOrgComboTree, getProjectOrg } from '~/api/common.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'

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

// 高级查询配置
export const AdvancedQueryConfigs: IlisAdvancedQueryConfigItem<EquipmentAuthQuery>[] = [
  {
    label: '设备类别',
    name: 'eqType',
    type: QueryConfigType.选择框,
    apiOptions: async () => {
      const res = await getListByGroupId('402882206b72e01e016b72f8bfd80001')
      return res.data.obj.map(i => ({ label: i.typename, value: i.typename }))
    },
  },
  { label: '出厂编号', name: 'factorySn' },
  {
    label: '设备状态',
    name: 'eqStatus',
    type: QueryConfigType.选择框,
    apiOptions: async () => {
      const res = await getListByGroupId('402882cd5f998a58015f9998ff71001b')
      return res.data.obj.map(i => ({ label: i.typename, value: i.typename }))
    },
  },
  { label: '设备名称', name: 'eqName' },
  {
    label: '设备编号',
    name: 'equipmentSn',
    props: {
      placeholder: '支持设备编号/档案编号/资产编号模糊查询',
    },
  },
  { label: '规格型号', name: 'eqStandard' },
  { label: '供应商', name: 'supplier' },
  { label: '所属功能室', name: 'eqLaboratoryName' },
  {
    type: QueryConfigType.树选择框,
    label: '所属部门',
    name: 'eqDepartId',
    apiOptions: async () => {
      const res = await getOrgComboTree()
      const data = res.data as IDepartmentEntity[]
      data.shift()
      return data
    },
    props: {
      fieldNames: {
        label: 'text',
        value: 'id',
      },
      treeDefaultExpandAll: true,
    },
  },
  {
    label: '调拨状态',
    type: QueryConfigType.选择框,
    name: 'transferStatus',
    props: {
      options: [
        { label: '闲置中', value: '10' },
        { label: '调拨中', value: '20' },
        { label: '使用中', value: '30' },
        { label: '已安装', value: '40' },
        { label: '已移交', value: '50' },
      ],
    },
  },
  { label: '存放位置', name: 'storageSite' },
  {
    type: QueryConfigType.树选择框,
    label: '所在位置',
    name: 'location',
    apiOptions: async () => {
      const res = await getProjectOrg()
      return res.data
    },
    props: {
      fieldNames: {
        label: 'name',
        value: 'name',
      },
      treeDefaultExpandAll: true,
    },
  },
  { label: '保管人', name: 'keeperName' },
  {
    type: QueryConfigType.日期范围框,
    label: '购置日期',
    name: ['buyDateBegin', 'buyDateEnd'],
    props: {
      'value-format': EDateFormatType.YYYY_MM_DD,
    },
  },
]

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
