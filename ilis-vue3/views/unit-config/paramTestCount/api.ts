import { Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper.ts'
import type { TestParamCategoryEntity } from '~/views/unit-config/paramTestCount/interface/TestParamCategory.ts'
import type { TestParamEntity, TestParamQuery } from '~/views/unit-config/paramTestCount/interface/TestParam.ts'
import type {
  SetShareTestQuantityEntity,
  SetTestQuantityEntity,
  SetUnitMeasureEntity,
} from '~/views/unit-config/paramTestCount/interface/TestQuantity.ts'
import type { IResponseCommonEntity, IResponsePageEntity } from '~/interface/IResponseEntity.ts'
import { ILISHTTPError } from '~/types'

/**
 * ## 获取检测参数类别
 */
export function getTestParamCategory() {
  return IlisApiHelper.get<TestParamCategoryEntity[]>('rest/testParamCategory/all')
}

/**
 * ## 获取参数列表
 */
export function getTestParamList(query: TestParamQuery) {
  return IlisApiHelper.get<IResponsePageEntity<TestParamEntity>>(`testParamController.do?datagrid`, query)
}

/**
 * ## 获取参数列表
 */
export function setTestQuantity(data: SetTestQuantityEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/test/quantity`, data)
}

/**
 * ## 获取计量单位
 */
export function getUnitMeasure(categoryId: string) {
  return IlisApiHelper.get<string>(`rest/test/quantity/unit-measure/${categoryId}`)
}

/**
 * ## 设置计量单位
 */
export function setUnitMeasure(data: SetUnitMeasureEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/test/quantity/unit-measure`, data)
}

/**
 * ## 设置共享试验数量
 */
export function setShareTestQuantity(data: SetShareTestQuantityEntity) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/test/quantity/share`, data)
}

/**
 * ## 撤销共享试验数量
 */
export function revokeShareTestQuantity(paramIds: string[]) {
  return IlisApiHelper.post<IResponseCommonEntity<any>>(`rest/test/quantity/share/revoke`, { paramIds })
}

/**
 * ## 导入
 */
export function quantityImport(data: { file: File }) {
  return IlisApiHelper.postForm<IResponseCommonEntity<any>>(`rest/test/quantity/import`, data)
}

/**
 * ## 导出试验数量
 */
export function quantityExport(params: TestParamQuery) {
  return ilisAxios.get<any>('rest/test/quantity/export', {
    params,
    responseType: 'blob',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      Modal.error({
        title: '提示',
        content: err.message,
        centered: true,
        okText: '确定',
      })
    }
    throw err
  })
}
