import request from "@/utils/request"

export function getStatistic(data: any) {
  return request({
    url: "/api/services/app/Dashboard/GetStatistic",
    method: "get",
    data
  })
}
