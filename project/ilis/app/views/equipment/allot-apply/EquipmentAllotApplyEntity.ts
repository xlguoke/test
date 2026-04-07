import type { ICustomProperties } from '../check/checkSend/component/customRecord'
import type { DeviceEntity } from '../DeviceEntity'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { ProcessType } from '~/components/commonProcess'
import { BUSINES_TYPE } from '~/components/htUploadFile'
import VMCallPersonSelector from '~/components/selectorViaMethodCall/VMCallPersonSelector.vue'
import { AllotType } from '~/enum/AllotType'
import { EDateFormatType } from '~/utils/EDateFormatType'

const { getOrgToDict } = useCommonDataDict()
/**
 * # 设备调拨申请状态枚举
 */
export enum EquipmentAllotStatus {
  /** # 填写中 */
  WAIT_APPROVE = '10',
  /** # 审批中 */
  APPROVE_ING = '20',
  /** # 审批拒绝 */
  APPROVE_REJECT = '30',
  /** # 审批通过 */
  APPROVE_SUCCESS = '40',
}

/**
 * # 设备调拨申请状态字典
 */
export const EquipmentAllotStatusDict = AnyDictionaryHelper.createDictionaryArray([
  { key: EquipmentAllotStatus.WAIT_APPROVE, label: '填写中', color: '#0066ec' },
  { key: EquipmentAllotStatus.APPROVE_ING, label: '审核中', color: '#f59a23' },
  { key: EquipmentAllotStatus.APPROVE_REJECT, label: '未通过', color: '#d9001b' },
  { key: EquipmentAllotStatus.APPROVE_SUCCESS, label: '已通过', color: '#4b7902' },
])

/**
 * # 不同类型调拨申请配置
 */
export const allotConfig = {
  /** # 设备调拨申请 */
  [AllotType.EQUIPMENT]: {
    /** # 模块名称 */
    moduleName: '设备',
    /** # 模块挂载节点id */
    moduleMountId: 'common_eq_allot_apply',
    /** # 自定义列 */
    customColumnKey: 'eqAllotApplyList',
    /** # 自定义属性 */
    customPropertiesKey: 'eqAllotApplyList',
    /** # 附件 */
    attachmentKey: BUSINES_TYPE.EQ_ALLOT_APPLY,
    /** # 打印 */
    printKey: 'EquipmentAllotApply',
    /** # 审核流程 */
    processKey: ProcessType.EQ_ALLOT_APPLY_APPROVE,
    /** # 权限 */
    permissions: {
      add: 'eqAllotApplyAdd',
      edit: 'eqAllotApplyEdit',
      detail: 'eqAllotApplyDetail',
      delete: 'eqAllotApplyDelete',
      process: 'eqAllotApplyApprove',
      revoke: 'eqAllotApplyRevoke',
      print: 'eqAllotApplyPrint',
      export: 'eqAllotApplyExport',
      customColumns: 'eqAllotApplyCustomColumns',
      customProperties: 'eqAllotApplyCustomProperties',
    },
  },
  /** # 固定资产调拨申请 */
  [AllotType.ASSETS]: {
    /** # 模块名称 */
    moduleName: '资产',
    /** # 模块挂载节点id */
    moduleMountId: 'common_assets_allot_apply',
    /** # 自定义列 */
    customColumnKey: 'assetAllotApplyList',
    /** # 自定义属性 */
    customPropertiesKey: 'assetAllotApplyList',
    /** # 附件 */
    attachmentKey: BUSINES_TYPE.EQ_ALLOT_APPLY,
    /** # 打印 */
    printKey: 'AssetAllotApply',
    /** # 审核流程 */
    processKey: ProcessType.ASSET_ALLOT_APPLY_APPROVE,
    /** # 权限 */
    permissions: {
      add: 'assetAllotApplyAdd',
      edit: 'assetAllotApplyEdit',
      detail: 'assetAllotApplyDetail',
      delete: 'assetAllotApplyDelete',
      process: 'assetAllotApplyApprove',
      revoke: 'assetAllotApplyRevoke',
      print: 'assetAllotApplyPrint',
      export: 'assetAllotApplyExport',
      customColumns: 'assetAllotApplyCustomColumns',
      customProperties: 'assetAllotApplyCustomProperties',
    },
  },
}

export class EquipmentAllotApplyEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @TableField()
  @CustomField('调拨标题')
  name?: string

  @FormField({
    formType: EFormItemType.TREE_SELECT,
    required: true,
  })
  @SearchField()
  @CustomField('调出部门/项目', () => getOrgToDict({ all: true }))
  outDepartId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      allowInput: true,
      onSelect(value: IUserSelectVoEntity[], formData: EquipmentAllotApplyEntity) {
        formData.outHandUserId = value?.[0]?.id || null
        formData.outHandUserName = value?.[0]?.name
      },
    },
  })
  @CustomField('调出经办人')
  outHandUserName?: string

  outHandUserId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      allowInput: true,
      onSelect(value: IUserSelectVoEntity[], formData: EquipmentAllotApplyEntity) {
        formData.outLeaderUserId = value?.[0]?.id || null
        formData.outLeaderUserName = value?.[0]?.name
      },
    },
  })
  @CustomField('调出负责人')
  outLeaderUserName?: string

  outLeaderUserId?: string

  @FormField({
    formType: EFormItemType.TREE_SELECT,
    required: true,
  })
  @SearchField()
  @CustomField('调入部门/项目', () => getOrgToDict({ all: true }))
  inDepartId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      allowInput: true,

      onSelect(value: IUserSelectVoEntity[], formData: EquipmentAllotApplyEntity) {
        formData.inHandUserId = value?.[0]?.id || null
        formData.inHandUserName = value?.[0]?.name
      },
    },
  })
  @CustomField('调入经办人')
  inHandUserName?: string

  inHandUserId?: string

  @FormField({
    formType: EFormItemType.INPUT_SELECTOR,
    selectorConfig: {
      selectorView: VMCallPersonSelector,
      allowInput: true,
      onSelect(value: IUserSelectVoEntity[], formData: EquipmentAllotApplyEntity) {
        formData.inLeaderUserId = value?.[0]?.id || null
        formData.inLeaderUserName = value?.[0]?.name
      },
    },
  })
  @CustomField('调入负责人')
  inLeaderUserName?: string

  inLeaderUserId?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('调拨日期')
  allotDate?: string

  @FormField({
    formType: EFormItemType.DATE_RANGE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    rangeMap: ['allotDateStart', 'allotDateEnd'],
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('调拨日期')
  allotDateSearch?: string // 搜索用

  @FormField({
    formType: EFormItemType.TEXTAREA,
  })
  @CustomField('调拨说明')
  allotExplain?: string

  @FormField({
    formType: EFormItemType.TEXTAREA,
  })
  @CustomField('备注')
  remark?: string

  @TableField()
  @CustomField('设备数量')
  eqNum?: string

  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @TableField()
  @CustomField('状态', EquipmentAllotStatusDict)
  status!: EquipmentAllotStatus

  eqList: DeviceEntity[] = []

  customizeValues: ICustomProperties[] = []

  @FormField()
  @CustomField('附件')
  uploadQR?: string

  @FormField({
    formType: EFormItemType.INPUT,
    placeholder: '请输入调拨标题/设备编号',
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('查询内容')
  quickQry?: string

  @TableField({
    isAlways: true,
    width: 200,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any
}
