import type { IFileEntity } from '~/views/common/file-manage/api'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** # 共享文件列表 */
export function getSharedFileListApi(shareId: string, unitCode: string) {
  return IlisApiHelper.get<IFileEntity[]>(`api/ds/${shareId}`, {}, {
    headers: {
      'unit-code': unitCode,
    },
  })
}
