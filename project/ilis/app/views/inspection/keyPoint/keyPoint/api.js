import ajax from '~/providers/common/ajax'
import axios from '~/providers/common/axios'

const func = {
  get(url, pathParams) {
    let pathParameter = '?'
    for (const key in pathParams) {
      // eslint-disable-next-line no-prototype-builtins
      if (pathParams.hasOwnProperty(key)) {
        pathParameter += `${key}=${pathParams[key]}&`
      }
    }
    pathParameter = pathParameter.substring(0, pathParameter.length - 1)

    return axios.get(`${url}${encodeURI(pathParameter)}`)
  },
}

const api = {
  category: {
    list(params) {
      return func.get(`/rest/inspectionCategory/pageList`, params)
    },
  },
  keyPoint: {
    list(params) {
      return func.get('/rest/inspectionKeypoint/pageList', params)
    },
    entry(id) {
      return func.get(`/rest/inspectionKeypoint/${id}`)
    },
    edit(entry) {
      return axios.post(`/rest/inspectionKeypoint/saveOrUpdate`, entry)
    },
    delete(ids) {
      const requestConfig = {
        headers: {
          'Content-Type': 'application/json;',
        },
      }
      return axios.post(
        `/rest/inspectionKeypoint/batchDel`,
        JSON.stringify(ids),
        requestConfig,
        true,
      )
    },
    problemLevel() {
      return ajax.get(
        `/systemController.do?typeGrid&typegroupid=inspection_problem_level&field=id,typename,typecode,sourceFrom`,
      )
    },
  },
  keyPointCategory: {
    tree(params) {
      return func.get(`/rest/inspectionKeypointCategory/getTrees`, params)
    },
    edit(entry) {
      return axios.post(
        `/rest/inspectionKeypointCategory/saveOrUpdate`,
        entry,
        null,
        null,
        true,
      )
    },
    delete(id) {
      return axios.delete(`/rest/inspectionKeypointCategory/${id}`, null, true)
    },
    cascadeDelete(id) {
      return axios.delete(
        `/rest/inspectionKeypointCategory/delAll/${id}`,
        null,
        true,
      )
    },
  },
}

export default api
