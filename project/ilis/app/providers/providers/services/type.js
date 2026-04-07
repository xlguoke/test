import ajax from '~/providers/common/ajax'

export class TypeService {
  async getTypesByGroupCode(groupCode) {
    const res = await ajax.get('/rest/type/getTypesByGroupCode', {
      params: { groupCode },
    })
    return res.data
  }
}
