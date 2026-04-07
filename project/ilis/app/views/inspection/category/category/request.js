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
  category: {
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
  codeGeneration: {
    category(id) {
      return func.get(`/rest/inspectionSnFactor/byInspectionCategory/${id}`)
    },
    type() {
      return ajax.get(
        `/systemController.do?typeGrid&typegroupid=inspection_sn_factor_type&field=id,typename,typecode,sourceFrom`,
      )
    },
    customProperties(customizeType) {
      return axios.get(
        `/rest/common/custom-properties?customizeType=${customizeType}`,
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

export { request }
