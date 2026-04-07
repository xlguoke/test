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

const request = {
  inspection: {
    list(params) {
      return axios.post(`/rest/inspection/pageList`, params)
    },
    entry(id) {
      return func.get(`/rest/inspection/${id}`)
    },
    edit(entry) {
      return axios.post(
        `/rest/inspection/saveOrUpdate`,
        entry,
        null,
        null,
        false,
      )
    },
    copy(id) {
      return func.get(`/rest/inspection/copy?id=${id}`)
    },
    delete(ids) {
      const requestConfig = {
        headers: {
          'Content-Type': 'application/json;',
        },
      }
      return axios.post(
        `/rest/inspection/batchDel`,
        JSON.stringify(ids),
        requestConfig,
        true,
      )
    },
    customProperties(customizeType) {
      return axios.get(
        `/rest/common/custom-properties?customizeType=${customizeType}`,
      )
    },
    persons() {
      return axios.get(`/rest/inspection/persons`)
    },
    generateSn(id) {
      return axios.get(`/rest/inspection/generateSn?id=${id}`)
    },
    problemLevel() {
      return ajax.get(
        `/systemController.do?typeGrid&typegroupid=inspection_problem_level&field=id,typename,typecode,sourceFrom`,
      )
    },
  },
  advancedQuery: {
    testStatus() {
      return ajax.get(
        `/systemController.do?typeGrid&typegroupid=inspection_test_status&field=id,typename,typecode,sourceFrom`,
      )
    },
    reformStatus() {
      return ajax.get(
        `/systemController.do?typeGrid&typegroupid=inspection_reform_status&field=id,typename,typecode,sourceFrom`,
      )
    },
  },
  category: {
    tree(params) {
      return func.get(`/rest/inspectionKeypointCategory/getTrees`, params)
    },
    list(params) {
      return func.get(`/rest/inspectionCategory/pageList`, params)
    },
    edit(entry) {
      return axios.post(`/rest/inspectionCategory/saveOrUpdate`, entry)
    },
    delete(id) {
      return axios.delete(`/rest/inspectionCategory/${id}`, null, true)
    },
    refreshCodePreview(entry) {
      return axios.post(`/rest/inspectionCategory/updateSnPreview`, entry)
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
  },
  codeGeneration: {
    category(id) {
      return func.get(`/rest/inspectionSnFactor/byInspectionCategory/${id}`)
    },
    type() {
      return ajax.get(
        `/systemController.do?typeGrid&typegroupid=inspection_sn_factor_type&field=id,typename,typecode,sourceFrom`,
      )
    },

    edit(entry) {
      return axios.post(`/rest/inspectionSnFactor/saveOrUpdate`, entry)
    },
    delete(id) {
      return axios.delete(`/rest/inspectionSnFactor/${id}`)
    },
  },
}

export default request
