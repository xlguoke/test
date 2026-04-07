import ajax from '~/providers/common/ajax'

// 格式化部门数据
function formatDepartmentData(data) {
  if (!(data && Array.isArray(data))) {
    return []
  }
  const arr = []
  // eslint-disable-next-line array-callback-return
  data.map((item) => {
    let children = []
    if (item.children && item.children.length > 0) {
      children = formatDepartmentData(item.children)
    }
    arr.push({
      title: item.text,
      value: item.id,
      key: item.id,
      children,
    })
  })

  return arr
}

// 获取部门
async function getDepartment() {
  const res = await ajax.get('/orgController.do?getOrgComboTree')
  if (res && res.length > 0) {
    res.shift()
    return formatDepartmentData(res)
  }
  return []
}

export default getDepartment
