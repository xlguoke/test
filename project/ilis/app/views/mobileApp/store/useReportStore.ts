import { defineStore } from 'pinia'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { URLHelper } from '~/views/mobileApp/provides/utils/URLHelper'

export const useReportStore = defineStore('appReport', {
  state: () => {
    return {
      approvalOpinions: [],
    }
  },
  actions: {
    // 获取用户基本信息
    async getOpinions(params: any) {
      const unitCode = URLHelper.getUrlParam('unitCode')

      let res

      if (unitCode) {
        res = await mRequest.get('/api/reportQuestion/list', {
          params: {
            page: -1,
            size: -1,
            ...params,
          },
          headers: {
            unitCode,
          },
        })
      }
      else {
        res = await mRequest.get('/rest/reportQuestion/list', {
          params: {
            page: -1,
            size: -1,
            ...params,
          },
        })
      }

      if (res.code === 20000) {
        this.approvalOpinions = res.data.rows
      }
    },
  },
})
