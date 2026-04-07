export interface equipmentCapacityAddParms {
  threshold: number //极限量能
  standard: number //  标准量能
  item: string | undefined //试验项目
  grade: string | undefined //等级
  version: string | undefined //版本号
  id: string | undefined //设备id
  name: string | undefined //设备名称
  speciality: string | undefined //专业类型
}
export interface EditStaffCharactersConfig {
  threshold: number //极限量能
  standard: number //  标准量能
  character: string | undefined //角色类型
  id?: string
}
export interface equipmentCapacityEditParms {
  threshold: number //极限量能
  standard: number //  标准量能
  id: string //设备id
  name?: string //设备名称
}

export interface getGradesParms {
  specId: string //	专业类型ID
  versionId: string //  版本ID
}

export interface getTestProjectParms {
  specId: string //	专业类型ID
  versionId: string //  版本ID
  gradeId: string //等级id
}

export interface getEquipmentsParms {
  itemId: string //	试验项目ID
  gradeId: string //等级id
}

export interface ListQueryParams {
  current: number | undefined //当前页
  size: number | undefined //页大小
  q?: string
}
