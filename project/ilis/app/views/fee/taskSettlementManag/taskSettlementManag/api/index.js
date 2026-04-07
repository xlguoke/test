import ajax from '~/providers/common/ajax'

async function createFinalStatement(data) {
  const res = await ajax.post(
    '/rest/fee/settlement/sporadic/build',
    JSON.stringify(data),
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  )
  return res
}
// 获取列表
async function getList(params) {
  const res = await ajax.get('/rest/fee/settlement/sporadic/page', {
    params,
  })

  return res
}
export { createFinalStatement, getList }
