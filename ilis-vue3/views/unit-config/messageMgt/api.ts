import { Modal } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'
import type { STANDARD_TYPE } from '~/types/standard'

/** 规程类型 */
export type StandardType = STANDARD_TYPE.BASIS | STANDARD_TYPE.STANDARD | STANDARD_TYPE.ALL

// 错误提示
export function modalError(msg: string, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
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
  whetherThisUnit?: string
  /** 是否上传文件 */
  isUploadFile?: string
}

/** 新增规程 */
export interface SaveStandardParam {
  id?: string
  /** 规程名称 */
  standardName: string
  /** 颁布号 */
  publishCode?: string
  /** 是否本单位规程 */
  whetherThisUnit?: string
  /** 规程类型 */
  standardTypeId: string
  /** 规程使用类型：检测依据、评定标准 */
  type?: StandardType
  /** 规程文件 */
  fileId?: string
  fileName?: string
  fileUrl?: string
  /** 过期时间 */
  expireDate?: string
  /** 执行时间 */
  executeDate: string
  /** 被替换规程 */
  replaceStandards?: string[]
}

/** 规程列表 */
export type DataSource = Required<Omit<SaveStandardParam, 'standardTypeId' | 'replaceStandards'>> & {
  distinctId: string
  /** 是否强改推规程 */
  toReferral: string
  /** 是否系统规程 */
  sourceType: string
  /** 唯一key */
  uniqueKey: string
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

/** 新增/编辑规程类型 */
export interface SaveParam {
  /** 类型id，编辑时传入 */
  'id'?: string
  /** 类型名称 */
  'name': string
  /** 父级id，不传时创建顶级类型 */
  'parent.id'?: string
}

/** 变更规程类型 */
export interface ChangeStandardTypeParams {
  /** 规程类型ID */
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

/** 合并规程 */
export interface MergeStandardParam {
  /** 被合并规程ID */
  mergeTo: MergeStandard
  /** 被替换规程ID */
  mergedStandards: MergeStandard[]
  /** 将被合并的规程从规程库中删除 */
  deleteInBaseStandard?: boolean
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
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 新增/编辑规程
 */
export function saveStandardApi(data: SaveStandardParam) {
  return ilisAxios.postForm<any>('baseStandardManageController.do?save', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 规程详情
 */
export function standardDetailApi(id: string) {
  return ilisAxios.get<any>(`baseStandardManageController.do?getById`, {
    params: { id },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 变更规程类型
 */
export function changeStandardTypeApi(data: ChangeStandardTypeParams) {
  return ilisAxios.postForm<any>('baseStandardManageController.do?changeStandardType', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 同步系统规程
 */
export function syncSystemStandardApi() {
  return ilisAxios.get<any>('rest/data-repair/duplicated-norms').catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 同步规程
 */
export function syncBaseStandardApi() {
  return ilisAxios.get<any>('baseStandardNewController.do?doSyncTestParamStandardsFromHitekDataCenter').catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 合并规程
 */
export function mergeStandardApi(data: MergeStandardParam) {
  return ilisAxios.post<any>('baseStandardNewController.do?duplicateMerge', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 导入
 */
export function importStandardApi(data: { file: File }) {
  return ilisAxios.postForm<any>('/baseStandardManageController/import.do', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 删除规程
 */
export function deleteStandardApi(id: string) {
  return ilisAxios.postForm<any>('baseStandardManageController.do?delete', { id }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 切换是否为本单位规程
 */
export function whetherThisUnitChangeApi(data: { id: string, checked: boolean }) {
  return ilisAxios.post<any>(`baseStandardManageController.do?whetherThisUnitChange&${new URLSearchParams(data as any)}`).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 获取规程文件
 */
export function getStandardFileApi(fileId: string) {
  return ilisAxios.get<any>(`uploadController.do?download&accessoryId=${fileId}`, {
    responseType: 'arraybuffer',
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 规程类型树
 */
export function treeListApi() {
  return ilisAxios.get<any>('baseStandardTypeController.do?datagrid', {
    params: {
      page: 1,
      rows: 9999,
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 新增/编辑规程类型
 */
export function saveStandardTypeApi(data: SaveParam) {
  return ilisAxios.postForm<any>('baseStandardTypeController.do?save', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 删除规程类型
 */
export function deleteStandardTypeApi(id: string) {
  return ilisAxios.postForm<any>('baseStandardTypeController.do?delete', { id }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 上传文件
 */
export function uploadFileApi(file: File) {
  return ilisAxios.postForm<any>('uploadController.do?upload', { file }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
