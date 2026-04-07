import type {
  ChemicalListQueryParams,
  ChemicalListResponse,
  SolutionListQueryParams,
  SolutionListResponse,
} from '../../types/chemical/common-selector'
import type {
  InventoryItem,
  InventoryQueryParams,
  LogItem,
  LogQueryParams,
} from '../../types/chemical/inventory'
import type {
  PurchaseDetail,
  PurchaseForm,
  PurchaseListItem,
  PurchaseListQueryParams,
  PurchaseRevokeParams,
  PurchaseSubmitForm,
  PurchaseVerifyForm,
} from '../../types/chemical/purchase'
import type {
  ChemicalStockItem,
  ChemicalStockQueryParams,
} from '../../types/chemical/stock'
import type {
  BatchSaveByApplyForm,
  PersonOption,
  PurchaseApplyDetailItem,
  PurchaseApplyListItem,
  PurchaseApplyListQueryParams,
  StorageInDetail,
  StorageInListItem,
  StorageInListQueryParams,
  StorageInSaveForm,
} from '../../types/chemical/storage-in'
import type {
  StorageOutAddForm,
  StorageOutDetail,
  StorageOutListItem,
  StorageOutListQueryParams,
} from '../../types/chemical/storage-out'

/**
 * 化学品出库登记模块 API
 */

/**
 * 9. 使用登记列表
 */
import type {
  StorageRecordItem,
  UseRecordResponse,
  UseRegistrationForm,
  UseRegistrationItem,
  UseRegistrationQueryParams,
} from '~/views/mobileApp/types/chemical/use-registration'

import { request } from '~/views/mobileApp/provides/utils/mRequest'

/**
 * 分页响应类型
 */
export interface PageResponse<T> {
  /** 总数 */
  total: number
  /** 当前页数量 */
  count: number
  /** 数据列表 */
  rows: T[]
}

/**
 * 化学品入库登记模块 API
 */

/**
 * 1. 入库登记列表（包含搜索、排序）
 */
export function getStorageInList(params: StorageInListQueryParams) {
  return request.get<PageResponse<StorageInListItem>>(
    '/rest/chemical/inventory/in/pagination',
    { params },
  )
}

/**
 * 2. 删除入库登记
 */
export function deleteStorageIn(id: string) {
  return request.delete<void>(
    `/rest/chemical/inventory/in/${id}`,
  )
}

/**
 * 3. 入库登记详情
 */
export function getStorageInDetail(id: string) {
  return request.get<StorageInDetail>(
    `/rest/chemical/inventory/in/${id}`,
  )
}

/**
 * 4. 新增入库登记（保存未入库）
 */
export function addStorageIn(data: StorageInSaveForm) {
  return request.post<string>(
    '/rest/chemical/inventory/in/save',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 5. 编辑入库登记
 */
export function updateStorageIn(id: string, data: StorageInSaveForm) {
  return request.put<void>(
    `/rest/chemical/inventory/in/${id}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 5.1 入库确认（确认入库）
 */
export function confirmStorageIn(id: string) {
  return request.get<void>(
    `/rest/chemical/inventory/in/putaway/${id}`,
  )
}

/**
 * 6. 下拉选择数据
 */

/**
 * 6.1 获取入库类型列表
 */
export function getInventoryTypeOptions() {
  return Promise.resolve([
    { label: '采购', value: '采购' },
    { label: '自配', value: '自配' },
    { label: '自配直接使用', value: '自配直接使用' },
    { label: '领用返还', value: '领用返还' },
  ])
}

/**
 * 6.2 获取管理级别列表
 */
export function getManageLevelOptions() {
  return request.get<Array<{ id: string, name: string, enabled?: boolean, displayName: string }>>(
    '/rest/chemical/level/all',
  )
}

/**
 * 6.3 获取化学品分页列表（用于选择器）
 */
export function getChemicalList(params: ChemicalListQueryParams) {
  return request.get<ChemicalListResponse>(
    '/rest/chemical/category/pagination',
    { params },
  )
}

/**
 * 6.4 验证化学品编号是否重复
 */
export function checkChemicalSnRepeat(params: { sn: string, id?: string }) {
  return request.get<boolean>(
    '/rest/chemical/category/snRepeat',
    { params },
  )
}

/**
 * 6.5 获取化学品库存分页列表（用于选择器）
 */
export function getInventoryList(params: StorageInListQueryParams) {
  return request.get<PageResponse<StorageInListItem>>(
    '/rest/chemical/inventory/pagination',
    { params },
  )
}

/**
 * 7. 选择人员
 */
export function getPersonOptions(params?: { keyword?: string, page?: number, size?: number }) {
  return request.get<PageResponse<PersonOption>>(
    '/rest/user/getUserList',
    { params },
  )
}

/**
 * 8. 采购申请单列表
 */
export function getPurchaseApplyList(params: PurchaseApplyListQueryParams) {
  return request.get<PurchaseApplyListItem>(
    '/rest/purchase/pagination',
    { params },
  )
}

/**
 * 8.1 采购申请单详情
 */
export function getPurchaseApplyDetail(id: string) {
  return request.get<PurchaseApplyDetailItem>(
    `/rest/purchase/${id}`,
  )
}

/**
 * 8.1 按采购申请批量保存
 */
export function batchSaveByApply(data: BatchSaveByApplyForm) {
  return request.post<string[]>(
    '/rest/chemical/inventory/in/batch-save',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 8.2 按采购申请批量入库确认
 */
export function batchConfirmByApply(data: { ids: string[] }) {
  return request.put<void>(
    '/rest/chemical/inventory/in/batch-put-away',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 9. 导出入库登记
 */
export function exportStorageIn(params: StorageInListQueryParams) {
  return request.get<Blob>(
    '/rest/chemical/inventory/in/export',
    {
      params,
      responseType: 'blob',
    },
  )
}

/**
 * 10. 下载导入模板
 */
export function downloadStorageInTemplate() {
  return request.get<Blob>(
    '/rest/chemical/inventory/in/downloadExcelTemplate',
    { responseType: 'blob' },
  )
}

/**
 * 11. 获取自定义字段配置
 * @param customizeType 自定义类型，如 'chemicalInventoryIn'
 */
export function getCustomProperties(customizeType: string) {
  return request.get<Array<{
    id: string
    columnName: string
    columnType: string
    columnValue?: string
  }>>(
    '/rest/common/custom-properties',
    { params: { customizeType } },
  )
}

/**
 * 12. 导入入库登记
 */
export function importStorageIn(data: FormData) {
  return request.post<{
    succeed: boolean
    failRows: Array<{ failReason: string }>
  }>('/rest/chemical/inventory/in/purchase/import', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 1. 出库登记列表（包含搜索、排序）
 */
export function getStorageOutList(params: StorageOutListQueryParams) {
  return request.get<PageResponse<StorageOutListItem>>(
    '/rest/chemical/inventory/out/pagination',
    { params },
  )
}

/**
 * 2. 删除出库登记
 */
export function deleteStorageOut(id: string) {
  return request.delete<void>(
    `/rest/chemical/inventory/out/${id}`,
  )
}

/**
 * 3. 出库登记详情
 */
export function getStorageOutDetail(id: string) {
  return request.get<StorageOutDetail>(
    `/rest/chemical/inventory/out/${id}`,
  )
}

/**
 * 4. 新增出库登记（保存未出库）
 */
export function addStorageOut(data: StorageOutAddForm) {
  return request.post<string[]>(
    '/rest/chemical/inventory/out/save',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 5. 编辑出库登记
 */
export function updateStorageOut(id: string, data: StorageOutAddForm) {
  return request.put<void>(
    `/rest/chemical/inventory/out/${id}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 6. 出库确认（确认出库）
 */
export function confirmStorageOut(ids: string[]) {
  return request.post<void>(
    '/rest/chemical/inventory/out/outbound',
    ids,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 7. 返还入库
 */
export function returnStorageOut(data: {
  amount: number
  putawayDate: string
  remark?: string
  chemicalInventoryOutId: string
}) {
  return request.post<void>(
    '/rest/chemical/inventory/out/returnInventory',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 8. 获取部门列表
 */
export interface DepartmentOption {
  id: string
  text: string
  children?: Array<DepartmentOption>
}
export function getDepartmentOptions() {
  return request.get<DepartmentOption[]>(
    '/orgController.do?getOrgComboTree',
  )
}

export function getUseRegistrationList(params: UseRegistrationQueryParams) {
  return request.get<{
    rows: UseRegistrationItem[]
    count: number
  }>('/rest/chemical/inventoryOutRecord/pagination', { params })
}

/**
 * 10. 保存使用登记
 */
export function saveUseRegistration(data: UseRegistrationForm) {
  return request.post<void>(
    '/rest/chemical/inventoryOutRecord/save',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 11. 获取使用记录
 */
export function getUseRecordDetail(id: string) {
  return request.get<UseRecordResponse>(
    `/rest/chemical/inventoryOutRecord/detail/${id}`,
  )
}

/**
 * 12. 删除使用记录
 */
export function deleteUseRecord(id: string) {
  return request.delete<void>(
    `/rest/chemical/inventoryOutRecord/${id}`,
  )
}

/**
 * 13. 获取出入库记录
 */
export function getStorageRecordList(inventoryId: string) {
  return request.get<StorageRecordItem[]>(
    `/rest/chemical/inventory/${inventoryId}`,
  )
}

/**
 * 14. 获取关联任务列表
 */
export interface TaskItem {
  id: string
  testTaskCode: string
  testTaskName: string
}

export function getTaskList(params: {
  page: number
  rows: number
  testTaskStatus: string
  quickQryParam?: string
}) {
  return request.get<{
    rows: TaskItem[]
    total: number
  }>('/reportCreateController.do?getTaskWithUnitAndProject', { params })
}

/**
 * 15. 获取溶液列表
 */
export function getSolutionList(params: SolutionListQueryParams) {
  return request.get<SolutionListResponse>('/rest/chemical/solution/pagination', { params })
}

/**
 * 16. 获取实时库存列表（按类别分页）
 */
export function getInventoryListByCategory(params: InventoryQueryParams) {
  return request.get<{
    rows: InventoryItem[]
    count: number
  }>('/rest/chemical/inventory/paginationByCategory', { params })
}

/**
 * 17. 获取日志列表
 */
export function getLogList(params: LogQueryParams) {
  return request.get<LogItem[]>('/rest/synthesis/log', { params })
}

/**
 * 18. 获取化学品存量列表
 */
export function getChemicalStockList(params: ChemicalStockQueryParams) {
  return request.get<{
    rows: ChemicalStockItem[]
    count: number
  }>('/rest/chemical/inventory/pagination', { params })
}

/**
 * 化学品采购登记模块 API
 */

/**
 * 19. 分页查询采购登记列表
 */
export function getPurchaseRegisterList(params: PurchaseListQueryParams) {
  return request.get<PurchaseListItem>(
    '/rest/chemical/purchase/register/pagination',
    { params },
  )
}

/**
 * 20. 通过ID获取采购登记详情
 */
export function getPurchaseRegisterDetail(id: string) {
  return request.get<PurchaseDetail>(
    `/rest/chemical/purchase/register/${id}`,
  )
}

/**
 * 21. 新增采购登记
 */
export function createPurchaseRegister(data: PurchaseForm) {
  return request.post<void>(
    '/rest/chemical/purchase/register',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 22. 更新采购登记
 */
export function updatePurchaseRegister(data: PurchaseForm & { id: string }) {
  return request.put<void>(
    '/rest/chemical/purchase/register',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 23. 删除采购登记
 */
export function deletePurchaseRegister(id: string) {
  return request.delete<void>(
    `/rest/chemical/purchase/register/${id}`,
  )
}

/**
 * 24. 验收采购登记
 */
export function verifyPurchaseRegister(data: PurchaseVerifyForm) {
  return request.put<void>(
    '/rest/chemical/purchase/register/verify',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 25. 提交审核采购登记
 */
export function submitPurchaseRegister(data: PurchaseSubmitForm) {
  return request.post<void>(
    '/rest/chemical/purchase/register/submit',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 26. 撤回采购登记申请
 */
export function revokePurchaseRegister(params: PurchaseRevokeParams) {
  return request.get<void>(
    '/rest/chemical/purchase/register/revoke',
    { params },
  )
}

/**
 * 27. 批量删除采购登记明细
 */
export function batchDeletePurchaseItems(ids: string[]) {
  return request.delete<void>(
    '/rest/chemical/purchase/register/items/batch',
    {
      data: ids,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * 28. 删除单条采购登记明细
 */
export function deletePurchaseItem(itemId: string) {
  return request.delete<void>(
    `/rest/chemical/purchase/register/items/${itemId}`,
  )
}
