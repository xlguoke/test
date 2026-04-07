import request from "@/utils/request.js"

interface GetComboTreeSyncEntity {
  page: number
  size: number
  queryType?: "sample" | "param"
  queryParam?: string
  isSimplePattern: boolean
}

// 获取大类树 - 大类
export function getComboTreeSync(query: GetComboTreeSyncEntity) {
  return request({
    url: `/api/bigCategoryController.do?comboTreeSync`,
    method: "get",
    params: query
  })
}

interface GetSampleComboTreeByBigCategoryEntity {
  isSimplePattern: boolean
  queryType?: "sample" | "param"
  queryParam?: string
  bigCategoryId: string
}

// 获取大类树 - 样品
export function getSampleComboTreeByBigCategory(query: GetSampleComboTreeByBigCategoryEntity) {
  return request({
    url: `/api/testSampleController.do?getSampleComboTreeByBigCategory`,
    method: "get",
    params: query
  })
}

interface GetChooseTestParamsEntity {
  sampleId: string
  bigCategoryId: string
}

// 获取参数
export function getChooseTestParams(query: GetChooseTestParamsEntity) {
  return request({
    url: `/api/testParamController/getChooseTestParams.do`,
    method: "get",
    params: query
  })
}

export interface PublicityVideoDTO {
  unit: string
  url: string
  name: string
  sequence: number
}

/**
 * 获取查询机平台宣传视频
 */
export async function getPublicityVideo(unitCode: string): Promise<PublicityVideoDTO[]> {
  const urlMap = {
    whld: "https://www.whldjcgl.com/cabinet-server/publicity-video/search/unit",
    sgjc: "https://jc.scsgjc.com/cabinet-server/publicity-video/search/unit",
    pro: "https://pro.ilis.cn/cabinet-server/publicity-video/search/unit"
  }

  const res = await request({
    method: "get",
    url: urlMap[unitCode] || urlMap.pro,
    params: {
      page: 0,
      size: 10,
      sort: "sequence",
      unit: unitCode
    }
  })

  return res._embedded["publicity-video"]
}

// 获取百度天气
export function getBaiduWeather(ak: string, latitude: string, longitude: string, dataType = "now") {
  return request({
    url: `/api/weather/${ak}/${dataType}`,
    params: {
      latitude,
      longitude
    },
    method: "get"
  })
}
