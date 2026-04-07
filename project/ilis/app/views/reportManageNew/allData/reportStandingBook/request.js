import ajax from '~/providers/common/ajax'
import axios from '~/providers/common/axios'

// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
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
  advanced: {
    snType() {
      return ajax.get(
        `/tSnCategoryController.do?datagrid&field=id,createName,createBy,createDate,updateName,updateBy,updateDate,sysOrgCode,sysCompanyCode,bpmStatus,name,remarks,pid,isDefault,orgNames,`,
      )
    },
    checkType() {
      return ajax.get(`/checkTypeController.do?getAll`)
    },
  },
}

module.exports = request
