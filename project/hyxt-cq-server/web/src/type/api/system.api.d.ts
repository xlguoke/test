export interface MenuEditParms {
  name: string // 系统菜单名称
  seq: number //系统菜单序号
  path: string // 跳转路径
  icon?: string //系统菜单图标
  disableClose: boolean //是否允许关闭
  description?: string //系统菜单说明
  id?: string | null //菜单id
  pid?: string | null //父级id
  type: number //层级类型  1:层级菜单  2:跳转菜单
  component?: string //组件地址
}

export interface AuthEditParms {
  name: string // 权限名称
  code: string //菜单code
  menuId: string // 所属菜单
  description?: string //备注说明
  id?: string
}

export interface RoleEditParms {
  name: string //系统角色
  description?: string //系统描述
  id?: string //id
  orgId?: string //机构id
  orgName?: string //机构名称
}

export interface RoleQueryParms {
  current?: number | undefined
  size?: number
  q?: string //角色名查询
}

export interface setRoleMenuParams {
  roleId: string //角色id
  menuIds: Array //菜单id集合
}

export interface setRoleAuthParams {
  roleId: string //角色id
  menuId: string //菜单id
  authIds: Array //权限id集合
}

export interface EditUserParams {
  username: string //用户名
  name: string //名称
  avatar: string | null //头像地址
  activated: boolean //启用状态
  type: string | null // 账户类型
  role: string | null //选择的角色
  roleId: string | null //选择的角色ID
  roleDesc: string | null //	选择的角色描述
  orgId: string | null //所属机构id
  orgName: string | null //机构名称
  custodian?: string | null //保管人
  custodianPhone?: string | null //保管人手机
  custodianAddr?: string | null //保管人地址
  id: string | null
  [name: string]: any
}

export interface UserQueryParms {
  current: number | undefined
  size?: number
  sort?: string
  orgId?: string
  q?: string //角色名查询
}

export interface EditPasswordParams {
  id: string
  password: string
  anew: string
}
export interface userLaboratoryAuthParams {
  userId: string
  labIds: Array
}
