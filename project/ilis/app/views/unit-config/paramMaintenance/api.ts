import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'

/**
 * ## 大类树
 */
export function getBigCategoryTree() {
  return IlisApiHelper.post<any>('bigCategoryController.do?datagrid&showDelete=false')
}
