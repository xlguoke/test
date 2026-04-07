import request from "@/utils/request.js"
import { DataPlatConfig } from "./smartCockpit.test.api"

export interface CompanyHistoryDto {
  remark: string
  theme: string
  year: number
}

// 公司发展历程
export function getCompanyHistory() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/company/history`,
    method: "get"
  })
}

export enum CompanyInfoType {
  "简介" = "1",
  "资质" = "2",
  "荣誉奖励" = "3",
  "设备" = "4"
}

export interface CompanyInfoDto {
  sortKey: number
  name: string
  fileUrl: string
  type: CompanyInfoType
}

// 公司概况
export function getCompanyInfo() {
  return request({
    url: `${DataPlatConfig.api}/service/publish/${DataPlatConfig.applicationId}/company/info`,
    method: "get"
  })
}
