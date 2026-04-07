/**
* 部平台接口
**/
import request from "@/config/request.js"
const baseUrl = import.meta.env.VITE_USER_NODE_ENV == 'development' ? "" : import.meta.env.VITE_BASE_API;

interface unitParam {
  orgNameKey?: string;
  AreaKey?: string;
  zzKey?: string;
  page: number;
  pageSize: number;
}


//获取机构列表
export function getOrgListQuery(params: unitParam): Promise<any> {
  return request({
    url: baseUrl + '/PCweb/OrgQuery/GetOrgListQuery',
    method: 'post',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: params
  })
}
