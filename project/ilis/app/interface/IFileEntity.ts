/**
 * # 文件entity接口（暂未实现）
 */
export interface IFileEntity {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: number
  updateName: null
  updateBy: null
  updateDate: null
  folderId: string
  mainEntityId: string
  name: string
  attachmentId: string
  url: string
  isDelete: string
  relationFunction: string
  relationFunctionFileType: string
  sequence: number
}
