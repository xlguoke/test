import type { DictDetailEntity } from './DataDictEntity'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 字典列表 */
export function dictListApi(data: any) {
  return IlisApiHelper.get('systemController.do?typeGroupGrid', data, {
    headers: {
      'Industry-Id': '',
    },
  })
}

/** 字典数据 */
export function dictDataListApi(param: any) {
  const typegroupid = param.typegroupid
  delete param.typegroupid
  return IlisApiHelper.postForm(`systemController.do?typeGrid&typegroupid=${typegroupid}`, param, {
    headers: {
      'Industry-Id': '',
    },
  })
}

export interface SaveDict {
  id?: string
  typeGroupId: string
  typename: string
  typecode: string
  orderNumber: number
  industryDicts: { industryId: string }[]
}
/** 编辑字典数据 */
export function editDictDataApi(data: SaveDict) {
  return IlisApiHelper.post('rest/systemController/saveType', data, {
    headers: {
      'Industry-Id': '',
    },
  })
}

/** 删除字典数据 */
export function deleteDictDataApi(rows: DictDetailEntity[]) {
  return IlisApiHelper.postForm('systemController.do?delType', { id: rows[0].id }, {
    headers: {
      'Industry-Id': '',
    },
  })
}
