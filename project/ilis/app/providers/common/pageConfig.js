const pageConfig = {
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '40', '50'],
  showTotal(total, range) {
    let html = ''
    html += range[0]
    html += ' - '
    html += range[1]
    html += ` 共 ${total} 条`
    return html
  },
}

export default pageConfig
