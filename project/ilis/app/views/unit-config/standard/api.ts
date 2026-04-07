import type { BOOLEAN_OPT } from '.'
import type { STANDARD_TYPE } from '~/types/standard'
import type {
  BasicSampleParamStandardParam,
  SampleParamStandardEntity,
  SaveSampleParamStandardEntity,
  SaveVerificationUser,
  VerificationFunctionData,
  VerificationFunctionSet,
} from '~/views/unit-config/standard/interface/SampleParamStandard.ts'
import { Modal } from 'ant-design-vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

/** 规程类型 */
export type StandardType = STANDARD_TYPE.BASIS | STANDARD_TYPE.STANDARD | STANDARD_TYPE.ALL

// 错误提示
export function modalError(msg: string, title?: string) {
  let formatted = [msg]
  if (msg.includes('\n') || msg.includes('<br')) {
    formatted = msg.split(/\n|<br\s*\/?>/i).filter(line => line.trim() !== '')
  }
  Modal.error({
    title: title || '提示',
    content: h('ul', {}, formatted.map((line) => { return h('li', {}, line) })),
    centered: true,
    okText: '确定',
    zIndex: 10000,
  })
}

/** 列表查询 */
export interface Query {
  /** 排序字段 */
  orderBy?: string
  /** 排序规则 */
  order?: string
  /** 规程类型 */
  standardTypeId: string
  /** 模糊查询 */
  quickQryParam?: string
  /** 规程名称 */
  standardName?: string
  /** 颁布号 */
  publishCode?: string
  /** 是否系统规程 */
  sourceType?: string
  /** 是否本单位规程 */
  whetherThisUnit?: BOOLEAN_OPT
  /** 是否上传文件 */
  isUploadFile?: string
  /** 是否只查看待验证规程 */
  onlyViewPendingVerifyStandard?: boolean
}

/** 新增规程 */
export interface SaveStandardParam {
  id?: string
  /** 规程名称 */
  standardName: string
  /** 颁布号 */
  publishCode?: string
  /** 是否本单位规程 */
  whetherThisUnit?: BOOLEAN_OPT
  /** 规程分组 */
  standardTypeId: string
  /** 规程使用类型：检测依据、评定标准 */
  type?: StandardType
  /** 规程文件 */
  fileId?: string
  fileName?: string
  fileUrl?: string
  /** 发布时间 */
  publishDate?: string
  /** 过期时间 */
  expireDate?: string
  /** 执行时间 */
  executeDate?: string
  /** 被替换规程 */
  replaceStandards?: string[]
  /** 验证人 */
  verificationUserId?: string
  verificationUserName?: string
  /** 验证材料 */
  verificationAttachmentId?: string[]
}

/** 规程列表 */
export type DataSource = Required<Omit<SaveStandardParam, 'standardTypeId' | 'replaceStandards'>> & {
  distinctId: string
  mark: boolean
  /** 是否强改推规程 */
  toReferral: string
  /** 是否系统规程 */
  sourceType: string
  /** 唯一key */
  uniqueKey: string
  standardId: string
}

/** 规程类型 */
export interface StandardGroupType {
  id: string
  name: string
  sourceType: string
  parentId: string
  isDeleted: string
  key: string
  children: StandardGroupType[]
}

/** 新增/编辑规程分组 */
export interface SaveParam {
  /** 分组id，编辑时传入 */
  'id'?: string
  /** 分组名称 */
  'name': string
  /** 父级id，不传时创建顶级分组 */
  'parent.id'?: string
}
/** 颁布号、规程名称（此处不实现）唯一性检查 */
export interface CheckOnlyParam {
  /** 颁布号 */
  publishCode: string
  /** 规程名称 */
  standardName: string
}

/** 变更规程分组 */
export interface ChangeStandardTypeParams {
  /** 规程分组ID */
  standardTypeId: string | undefined
  /** 规程ID */
  standardId: string
}

export interface MergeStandard {
  id: string
  standardId: string
  uniqueKey: string
  standardName: string
  publishCode: string
}

/** 合并规程 - 同步时规程冲突合并 */
export interface MergeStandardParam {
  /** 被合并规程ID */
  mergeTo: MergeStandard
  /** 被替换规程ID */
  mergedStandards: MergeStandard[]
  /** 将被合并的规程从规程库中删除 */
  deleteInBaseStandard?: boolean
}

/**
 * 规程溯源
 */
interface Hyperlink {
  id: string
  text: string
  describe: string
}
export interface StandardTrace {
  id: string | number
  standardName: string
  publishCode: string
  content: string
  updater: string
  updateTime: Date
  hyperlinks: Hyperlink[]
}

/** 合并规程 - 手动合并 */
export interface HandMergeStandardParam {
  /** 需要保留的规程ID */
  reservedStandardId: string
  /** 已经舍弃的规程ID集合 */
  abandonedStandardIds: string[]
  /** 委托起始日期 */
  consignStartDate?: string
  /** 委托截止日期 */
  consignEndDate?: string
}

/**
 * ## 规程分页列表
 */
export function pageListApi(params: Query) {
  return ilisAxios.get<any>('baseStandardManageController.do?datagrid', {
    params,
    headers: {
      paramsIsTrim: true,
    },
  })
}

/**
 * ## 新增/编辑规程
 */
export function saveStandardApi(data: SaveStandardParam) {
  return IlisApiHelper.postForm<any>('baseStandardManageController.do?save', data)
}

/**
 * ## 更新规程文件
 */
export function updateStandardFileApi(data: { id: string, fileId: string }) {
  return IlisApiHelper.post<any>('rest/baseStandardManageController/upload-file.do', data)
}

/**
 * ## 规程详情
 */
export function standardDetailApi(id: string) {
  return IlisApiHelper.get<any>(`baseStandardManageController.do?getById`, { id })
}

/**
 * ## 变更规程分组
 */
export function changeStandardTypeApi(data: ChangeStandardTypeParams) {
  return IlisApiHelper.postForm<any>('baseStandardManageController.do?changeStandardType', data)
}

/**
 * ## 同步系统规程
 */
export function syncSystemStandardApi() {
  return IlisApiHelper.get<any>('rest/data-repair/duplicated-norms')
}

/**
 * ## 同步规程
 */
export function syncBaseStandardApi() {
  return IlisApiHelper.get<any>('baseStandardNewController.do?doSyncTestParamStandardsFromHitekDataCenter')
}

/**
 * ## 合并规程 - 同步冲突合并
 */
export function mergeStandardApi(data: MergeStandardParam) {
  return IlisApiHelper.post<any>('baseStandardNewController.do?duplicateMerge', data)
}

/**
 * ## 导入
 */
export function importStandardApi(data: { file: File }) {
  return IlisApiHelper.postForm<any>('/baseStandardManageController/import.do', data)
}

/**
 * ## 删除规程
 */
export function deleteStandardApi(id: string) {
  return IlisApiHelper.postForm<any>('baseStandardManageController.do?delete', { id })
}

/**
 * ## 切换是否为本单位规程
 */
export function whetherThisUnitChangeApi(data: { id: string, checked: boolean }) {
  return IlisApiHelper.post<any>(`baseStandardManageController.do?whetherThisUnitChange&${new URLSearchParams(data as any)}`)
}

/**
 * ## 规程溯源
 */
interface SourceQuery {
  id: string
}
export function standardSourceApi(params: SourceQuery) {
  return IlisApiHelper.get<any>(`rest/standard/trace/${params.id}`)
}

/**
 * ## 获取规程文件
 */
export function getStandardFileApi(fileId: string) {
  return IlisApiHelper.get<any>(`uploadController.do?download&accessoryId=${fileId}`, {}, {
    responseType: 'arraybuffer',
  })
}

/**
 * ## 规程分组
 */
export function treeListApi() {
  return IlisApiHelper.get<any>('baseStandardTypeController.do?datagrid', {
    page: 1,
    rows: 9999,
  })
}

/**
 * ## 新增/编辑规程分组
 */
export function saveStandardTypeApi(data: SaveParam) {
  return IlisApiHelper.postForm<any>('baseStandardTypeController.do?save', data)
}

/**
 * ## 删除规程分组
 */
export function deleteStandardTypeApi(id: string) {
  return IlisApiHelper.postForm<any>('baseStandardTypeController.do?delete', { id })
}

/**
 * ## 上传文件
 */
export function uploadFileApi(file: File) {
  return IlisApiHelper.postForm<any>('uploadController.do?upload', { file })
}

/**
 * ## 获取样品参数规程
 */
export function getSampleParamStandard(data: BasicSampleParamStandardParam) {
  let url = 'rest/sample/param/standard'
  url += `?sampleId=${data.sampleId}`;

  (data.paramIds || []).forEach((item) => {
    url += `&paramIds=${item}`
  })

  return IlisApiHelper.get<SampleParamStandardEntity>(url)
}

/**
 * ## 获取样品参数规程
 */
export function saveSampleParamStandard(data: SaveSampleParamStandardEntity) {
  return IlisApiHelper.post<any>('rest/sample/param/standard/save', data)
}

/**
 * ## 批量配置验证人员
 */
export function saveVerificationUser(data: SaveVerificationUser) {
  return IlisApiHelper.post<any>('rest/standard/bulk-verification-assignment', data)
}

/**
 * 获取检测方法验证配置
 */
export function getVerificationFunction(standardId: string) {
  return IlisApiHelper.get<VerificationFunctionData>('rest/standard/verification-function', { standardId })
}

/**
 * 保存检测方法验证配置
 */
export function verificationFunctionSet(data: VerificationFunctionSet) {
  return IlisApiHelper.post<any>('rest/standard/verification-function-setting', data)
}
/**
 * ## 检查颁布号是否唯一
 */
export function checkPublishCodeOnlyApi(data: CheckOnlyParam) {
  return IlisApiHelper.postForm<any>('baseStandardNewController.do?checkSimilarStandard', data)
}

/**
 * 合并规程 - 手动合并
 */
export function handMergeStandardApi(data: HandMergeStandardParam) {
  return IlisApiHelper.post<any>('standard/merge-standards', data)
}
