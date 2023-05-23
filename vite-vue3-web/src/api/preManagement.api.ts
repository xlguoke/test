import { ObjectAny } from "@/type/common"
import request from "@/utils/request"

// 状态
interface enumPar {
  enumTypeName: string
}
export function enumValues(params: enumPar): Promise<any> {
  return request({
    url: "/api/services/app/EunmValue/GetEnumValues",
    method: "get",
    params
  })
}

// 预委托列表
interface consignPar {
  keyword: string
  consignStatuses: Array<string | number>
  skipCount: number
  maxResultCount: number
}
export function consignInfoPageList(params: consignPar): Promise<any> {
  let par = ``
  for (const parKey in params) {
    if (parKey === "consignStatuses") {
      for (let i = 0; i < params.consignStatuses.length; i++) {
        const item = params.consignStatuses[i]
        par += `consignStatuses=${item}&`
      }
    } else {
      const query = (params as ObjectAny)[parKey] as string
      par += `${parKey}=${query}&`
    }
  }
  return request({
    url:
      "/api/services/app/BuConsignInfo/GetRawMateriaConsignInfoList?" +
      par.substring(0, par.length - 1),
    method: "get"
  })
}

// 复制
export function copyConsignInfo(data: string[]): Promise<any> {
  return request({
    url: "api/services/app/BuConsignInfo/CopyConsignInfo",
    method: "post",
    data
  })
}
