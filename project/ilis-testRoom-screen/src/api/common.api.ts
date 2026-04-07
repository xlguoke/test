import request from "@/utils/request.js"

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
