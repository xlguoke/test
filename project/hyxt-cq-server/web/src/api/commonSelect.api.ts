// 用户管理的工地试验室对应的工程项目列表
export function projectPages() {
  return "/project/user/list"
}

// 用户已授权的工地试验室
export function userAuthLab(projectId?: string) {
  return `/labs?user-labs&projectId=${projectId || ""}`
}
// export function userAuthLab(projectId?: string) {
//   return `/laboratory/user/list?projectId=${projectId || ""}`
// }

// 获取工地试验室
export function getLabDatas() {
  return "/laboratory/pages"
}
// 获取工地试验室- 改
export function getUserLabDatas() {
  return "/labs?user-labs"
}

// 获取机构列表
export function orgDatas() {
  return `/org`
}

// 获取机构列表 - 行管、审核机构
export function admList() {
  return `/org/by-type/adm`
}

// 获取机构列表 - 机构
export function orgList() {
  return `/org/by-type/org`
}
