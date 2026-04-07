import request from "@/utils/request.js"

/**
 * 获取查询机平台宣传视频
 */
export function getPublicityVideo(unitCode: string) {
  return request({
    method: "get",
    url: "https://pro.ilis.cn/cabinet-server/publicity-video/search/unit",
    params: {
      page: 0,
      size: 10,
      sort: "sequence",
      unit: unitCode
    }
  })
}
