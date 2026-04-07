import type { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import type { BUSINES_TYPE } from '~/components/htUploadFile'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

export interface FolderTree {
  id: string
  pid?: string
  name: string
  children?: FolderTree[]
}

export interface AddFolderRequest {
  folderName: string
  parentFolderId?: string
}

export interface UpdateFolderRequest {
  id: string
  folderName?: string
  parentFolderId?: string
}

export interface MoveFolderRequest {
  /** # 需要移动的文件夹 */
  id: string
  /** # 目标文件夹ID */
  parentId: string
}

export interface MoveFileRequest {
  /** # 需要移动的文件 */
  docId: string
  /** # 目标文件夹ID */
  folderId: string
}

/** 文件管理文件数据Interface */
export interface IFileEntity extends AnyDataBaseEntity {
  businessId: string
  businessAttachmentId: string
  attachmentId: string
  uploadQrKey?: string
  name: string
  format: string
  size: string
  uploader: string
  uploadWay: string
  uploadTime: string
  url: string
  businessObj: string
  historical: boolean
  hide: boolean
}

/** # 获取文件夹（树） */
export function getFolderTree() {
  return IlisApiHelper.get<FolderTree[]>('rest/folder/tree')
}

/** # 获取文件夹（列表） */
export function getFolderListApi() {
  return IlisApiHelper.get<FolderTree[]>('rest/folder/list')
}

/** # 新增文件夹 */
export function addFolder(folder: AddFolderRequest) {
  return IlisApiHelper.post<string>('rest/folder', folder)
}

/** # 更新文件夹 */
export function updateFolder(folder: UpdateFolderRequest) {
  return IlisApiHelper.put('rest/folder', folder)
}

/** # 删除文件夹 */
export function deleteFolder(folderId: string) {
  return IlisApiHelper.delete(`rest/folder/${folderId}`)
}

/** # 移动文件夹 */
export function moveFolder(folder: MoveFolderRequest) {
  return IlisApiHelper.get('rest/folder/folder-move', folder)
}

/** # 移动文件 */
export function moveFile(file: MoveFileRequest) {
  return IlisApiHelper.get('rest/folder/doc-move', file)
}

/** # 获取当前文件夹下所有的文件数量 */
export function getFileCount(folderId: string) {
  return IlisApiHelper.get<number>(`rest/folder/doc-count`, { folderId })
}

/** # 文件隐藏/显示 */
export function hideFile(params: { docIds: string[], hide: boolean }) {
  return IlisApiHelper.put('rest/folder/doc-switch', params)
}

/** # 给文件夹生成共享二维码 */
export function generateShareQrcode(folderId: string) {
  return IlisApiHelper.get<string>(`rest/ds/share`, { folderId })
}

/** # 根据业务id,业务类型，父级key获取关联二维码 */
export async function getQrKey(params: { businessId: string, businessType: BUSINES_TYPE, parentKey?: string }) {
  const { businessId, businessType, parentKey } = params
  const { data } = await IlisApiHelper.get<string>(`rest/attachmentQR/getQrCode/${businessType}`, { businessId, parentKey })
  const url = new URL(data)
  return url.searchParams.get('key') || ''
}

/** # 排序字段 */
export enum EOrderByField {
  /** # 按文件名排序 */
  FILE_NAME = 'fileName',
  /** # 按文件类型排序 */
  FILE_TYPE = 'fileType',
  /** # 按日期排序 */
  CREATE_DATE = 'createDate',
}

/** # 排序方式 */
export enum EOrderDirection {
  /** # 升序 */
  ASC = 'ASC',
  /** # 降序 */
  DESC = 'DESC',
}

/** # 根据二维码获取文件列表 */
export function getAttachments(params: { qrKey: string, recursion?: boolean, orderBy?: EOrderByField, order?: EOrderDirection }) {
  const { qrKey, recursion, orderBy, order } = params
  return IlisApiHelper.get<IFileEntity[]>(`rest/attachmentQR/attachments/${qrKey}`, { recursion, orderBy, order })
}

/** # 删除文件 */
export function deleteFile(params: { key: string, attachmentId: string }) {
  return IlisApiHelper.delete('rest/attachmentQR/fileDel', params)
}

/** # 批量删除文件 */
export function deleteFileBatch(ids: string[]) {
  return IlisApiHelper.delete('/rest/attachmentQR/fileDelBatch', {}, {
    data: ids,
  })
}
