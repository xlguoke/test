export interface IComparisonFile {
  /** 文件唯一标识 */
  id: string
  /** 报告文件唯一标识 */
  reportFileId: string
  /** 图标 */
  icon?: (() => VNode)
  /** 文件标题/名称 */
  title: string
  /** 文件子标题 */
  subTitle?: string
  /** 文件URL */
  url: string
  /** 报告转换状态 */
  convertStatus?: string
}
