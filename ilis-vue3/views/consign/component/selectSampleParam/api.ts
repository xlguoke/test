import { Modal } from 'ant-design-vue'
import { ILISHTTPError } from '~/types'
import type { TestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type {
  BigCategoryTreeNode,
  SampleTreeNode,
} from '~/views/consign/component/selectSampleParam/modules/UseTestSample.ts'

// 错误提示
function modalError(msg: string, title?: string) {
  Modal.error({
    title: title || '提示',
    content: msg,
    centered: true,
    okText: '确定',
  })
}

/** 大类、样品接口 ------------------------------------- */
/** 查询大类 */
export interface QueryBigCategory {
  /** 查询类型 */
  queryType?: string
  /** 模糊查询 */
  queryParam?: string
  name?: string
  isSimplePattern?: boolean
}

/** 查询样品 */
export interface QuerySample extends QueryBigCategory {
  /** 大类id */
  bigCategoryId: string
  /** 样品id */
  sampleId?: string
  queryName?: string
  /** 是否综合试验 */
  queryScope?: number
}

/**
 * ## 查询大类
 * @param params
 * {@link QueryBigCategory}
 */
export function bigCategoryApi(params: QueryBigCategory) {
  const api = `bigCategoryController.do?${params.queryParam ? 'comboTreeSyncByName' : 'comboTreeSync'}`
  if (params.queryParam) {
    params.name = encodeURI(params.queryParam)
  }
  return ilisAxios.get<BigCategoryTreeNode[]>(api, {
    params: {
      page: 1,
      size: 99999,
      ...params,
    },
  }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 查询样品
 * @param params
 * {@link QuerySample}
 */
export function sampleApi(params: QuerySample) {
  return ilisAxios.get<SampleTreeNode[]>('testSampleController.do?getSampleComboTreeByBigCategory', { params }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 添加样品附注
 */
export interface AddSampleNote {
  /** 样品id */
  id: string
  /** 样品附注 */
  sampleNote: string
}
export function addSampleNoteApi(data: AddSampleNote) {
  return ilisAxios.post('rest/testSampleController/add-note', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/** 大类、样品接口 ------------------------------------- */

/** 检测参数接口 ------------------------------------- */
export interface QueryParams {
  /** 大类id */
  bigCategoryId?: string
  /** 样品id */
  sampleId?: string
  testParamIds?: string[]
}

/**
 * ## 查询检测参数
 */
export function paramsApi(params: QueryParams) {
  let url = 'rest/test/param/choose-or-default'
  if (params.testParamIds) {
    params.testParamIds.forEach((item, index) => {
      url += `${index === 0 ? '?' : '&'}testParamIds=${item}`
    })
    delete params.testParamIds
  }

  return ilisAxios.get<TestParamsItem[]>(url, { params }).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}

/**
 * ## 添加参数附注
 */
export interface AddParamNote {
  /** 参数id */
  id: string
  /** 参数附注 */
  paramNote: string
}
export function addParamNoteApi(data: AddParamNote) {
  return ilisAxios.post('rest/testParamController/add-note', data).catch((err) => {
    if (err instanceof ILISHTTPError) {
      modalError(err.message)
    }
    throw err
  })
}
