/**
 * 新版本中，该功能还未迁移过来，类型暂未完善
 */

/** ## 离线数据 */
export interface IOfflineData {
  projectId: string
  projectName: string
  unitProjectId: string
  unitProjectName: string
  params: Params[]
}

/** ## 离线数据参数 */
interface Params {
  testParamName: string
  testParamId: string
  standards: any[]
}
