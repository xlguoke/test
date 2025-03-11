/**
 * # 是否具备权限枚举
 */
export enum PermisssionFunctiontype {
  /** 具备该权限 */
  YES = 1,
  /** 不具备该权限 */
  NO = 0,
}

/**
 * # 权限类型枚举
 */
export enum FunctionType {
  /** # 菜单 */
  MENU = 0,
  /** # 执行权限 */
  EXECUTE = 1,
}

/**
 * # 权限接口(通过权限编码获取)
 */
export interface IPermissionEntity {
  ID: '4028b2438552b705018553613a390002'
  functionlevel: 2
  functionname: '变更合同'
  functionExplain: '变更合同执行权限'
  functionorder: '2'
  functioncode: 'changeContract'
  functionurl: ''
  parentfunctionid: '402882d35f0f3e58015f0f4281a80004'
  functiontype: PermisssionFunctiontype
}

/**
 * # 权限接口(通过获取用户所有权限获取)
 */
export interface IPermissionAllEntity {
  id: 'b071f72a763d4033a7ea7c0e4b119d2a'
  name: '台账导出'
  functionExplain: '[导出台账]的功能权限'
  url: 'rest/equipmentNewController/exportXlsForSpecialUse'
  code: 'exportEquipmentLedger'
}
