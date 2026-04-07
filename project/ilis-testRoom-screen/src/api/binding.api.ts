import request from "@/utils/request.js"
/**
 * 查询大屏信息
 * @param sn 屏幕编码
 * @returns
 */
export function getScreenConfig(sn: string) {
  return request({
    url: `/api/smart-screen/config/sn/${sn}`,
    method: "get"
  })
}
