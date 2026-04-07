import axios from "@/config/http.config"
import type {
  MenuEditParms,
  AuthEditParms,
  RoleEditParms,
  RoleQueryParms,
  setRoleMenuParams,
  setRoleAuthParams,
  EditUserParams,
  UserQueryParms,
  EditPasswordParams,
  userLaboratoryAuthParams
} from "@/type/api/system.api"
import qs from "qs"

//新增菜单
export function addMenuAPI(params: MenuEditParms): Promise<any> {
  return axios({
    url: "/sys/menu",
    method: "post",
    data: qs.stringify(params)
  })
}
//更新菜单
export function updateMenuAPI(params: MenuEditParms): Promise<any> {
  return axios({
    url: "/sys/menu",
    method: "put",
    data: qs.stringify(params)
  })
}

//删除菜单
export function deleteMenuAPI(id: string): Promise<any> {
  return axios({
    url: `/sys/menu/${id}`,
    method: "delete"
  })
}
//获取所有菜单
export function getMenuAPI(): Promise<any> {
  return axios({
    url: `/sys/menus`,
    method: "get"
  })
}
// 根据用户获取菜单
export function getMenuForUserIdAPI(): Promise<any> {
  return axios({
    url: `/sys/user/menus`,
    method: "get"
  })
}

//新增权限
export function addAuthAPI(params: AuthEditParms): Promise<any> {
  return axios({
    url: "/sys/auth",
    method: "post",
    data: qs.stringify(params)
  })
}
//更新权限
export function updateAuthAPI(params: AuthEditParms): Promise<any> {
  return axios({
    url: "/sys/auth",
    method: "put",
    data: qs.stringify(params)
  })
}

//删除权限
export function deleteAuthAPI(id: string): Promise<any> {
  return axios({
    url: `/sys/auth/${id}`,
    method: "delete"
  })
}
//获取权限
export function getAuthAPI(id: string): Promise<any> {
  return axios({
    url: `/sys/menu/${id}/auths`,
    method: "get"
  })
}

//新增系统角色
export function addRoleAPI(params: RoleEditParms): Promise<any> {
  return axios({
    url: "/sys/role",
    method: "post",
    data: qs.stringify(params)
  })
}
//新增机构角色
export function addOrgRoleAPI(params: RoleEditParms): Promise<any> {
  return axios({
    url: "/sys/org-role",
    method: "post",
    data: qs.stringify(params)
  })
}

//编辑系统角色
export function editRoleAPI(params: RoleEditParms): Promise<any> {
  return axios({
    url: "/sys/role",
    method: "put",
    data: qs.stringify(params)
  })
}
//编辑机构角色
export function editOrgRoleAPI(params: RoleEditParms): Promise<any> {
  return axios({
    url: "/sys/org-role",
    method: "put",
    data: qs.stringify(params)
  })
}

//获取角色列表
export function getRolesAPI(params: RoleQueryParms): Promise<any> {
  return axios({
    url: `/sys/roles`,
    method: "get",
    params: params
  })
}
//获取用户可以添加的角色列表
export function getUserRolesAPI(params): Promise<any> {
  return axios({
    url: `/sys/use-roles`,
    method: "get",
    params
  })
}

//删除系统角色
export function deleteSysRoleAPI(id: string): Promise<any> {
  return axios({
    url: `/sys/role/${id}`,
    method: "delete"
  })
}
//删除机构角色
export function deleteOrgRoleAPI(id: string): Promise<any> {
  return axios({
    url: `/sys/org-role/${id}`,
    method: "delete"
  })
}
//按角色获取菜单
export function getRoleMenuAPI(id: string): Promise<any> {
  return axios({
    url: `/sys/role/${id}/menus`,
    method: "get"
  })
}
// 按角色获取菜单权限
export function getRoleMenuAuthAPI(roleId: string, menuId: string): Promise<any> {
  return axios({
    url: `/sys/role/${roleId}/menu/${menuId}/auths`,
    method: "get"
  })
}

//设置角色关联菜单
export function setRoleMenuAPI(params: setRoleMenuParams): Promise<any> {
  return axios({
    url: "/sys/role/menus",
    method: "post",
    data: params
  })
}
//设置角色关联权限
export function setRoleAuthAPI(params: setRoleAuthParams): Promise<any> {
  return axios({
    url: "/sys/role/auths",
    method: "post",
    data: params
  })
}

//新增用户
export function addUserAPI(params: EditUserParams): Promise<any> {
  return axios({
    url: "/sys/user",
    method: "post",
    data: qs.stringify(params)
  })
}
//新增机构用户
export function addOrgUserAPI(params: EditUserParams): Promise<any> {
  return axios({
    url: "/sys/org-user",
    method: "post",
    data: qs.stringify(params)
  })
}
//更新用户
export function editUserAPI(params: EditUserParams): Promise<any> {
  return axios({
    url: "/sys/user",
    method: "put",
    data: qs.stringify(params)
  })
}

//更新机构用户
export function editOrgUserAPI(params: EditUserParams): Promise<any> {
  return axios({
    url: "/sys/org-user",
    method: "put",
    data: qs.stringify(params)
  })
}

//获取用户列表
export function getUsersAPI(params: UserQueryParms): Promise<any> {
  return axios({
    url: `/sys/users`,
    method: "get",
    params: params
  })
}

//查询指定机构的全部用户
export function getOrgUsersAPI(params: { orgId: string }): Promise<any> {
  return axios({
    url: `/sys/org-users`,
    method: "get",
    params: params
  })
}

//获取用户信息详情
export function getUsersInfoAPI(id = ""): Promise<any> {
  return axios({
    url: `/sys/user/info/${id}`,
    method: "get"
  })
}

//禁用账户
export function disableUsersAPI(id): Promise<any> {
  return axios({
    url: `/sys/user/${id}/ban`,
    method: "post"
  })
}
//启用
export function enableUsersAPI(id): Promise<any> {
  return axios({
    url: `/sys/user/${id}/status/ACTIVE`,
    method: "put"
  })
}

//用户试验室授权
export function setUserLaboratoryAuth(params: userLaboratoryAuthParams): Promise<any> {
  return axios({
    url: "/user/lab/auth",
    method: "post",
    data: params
  })
}
//获取用户可授权的试验室
export function getUserLaboratoryAuthCan(id): Promise<any> {
  return axios({
    url: `/laboratory/org/list?orgId=${id}`,
    method: "get"
  })
}

//获取用户已授权的试验室
export function getUserLaboratoryAuth(id): Promise<any> {
  return axios({
    url: `/user/lab/${id}`,
    method: "get"
  })
}

//根据类型获取行管、机构（不分页）
export function getOrgByTypeAPI(type): Promise<any> {
  return axios({
    url: `/org/by-type/${type}`,
    method: "get"
  })
}

// 根据机构id获取角色
export function getRoleByOrgIdAPI(orgId: string) {
  return axios({
    url: `/sys/use-roles?orgId=${orgId}`,
    method: "get"
  })
}

//重置密码
export function resetPasswordAPI(id): Promise<any> {
  return axios({
    url: `/sys/user/${id}/password`,
    method: "patch"
  })
}
// 修改密码
export function editPasswordAPI(data: EditPasswordParams): Promise<any> {
  return axios({
    url: `/sys/user/password`,
    method: "post",
    data: qs.stringify(data)
  })
}

//  日志
export function logListApi(id: string) {
  return axios({
    url: `/sys/bp-log/${id}`,
    method: "get"
  })
}

// 获取管理员电话
export function getAdminInfo() {
  return axios({
    url: "/dash/idaas/sys/user",
    method: "get"
  })
}

/** 查询指定用户拥有的菜单 */
export function getUserMenus(userId: string) {
  return axios({
    url: `/sys/user/${userId}/menus`,
    method: "get"
  })
}
/** 查询指定用户的用户权限 */
export function getUserMenuAuths(userId: string, menuId: string) {
  return axios({
    url: `/sys/user/${userId}/menu/${menuId}/auths`,
    method: "get"
  })
}
/** 添加用户菜单 */
export function addUserMenus(data: { userId: string; menuIds: string[] }) {
  return axios({
    url: `/sys/user/menus`,
    method: "post",
    data
  })
}
/** 添加用户权限 */
export function addUserMenuAuths(data: { userId: string; menuId: string; authIds: string[] }) {
  return axios({
    url: `/sys/user/auths`,
    method: "post",
    data
  })
}
