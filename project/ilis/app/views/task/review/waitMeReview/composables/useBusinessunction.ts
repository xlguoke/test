import type { TaskReviewEntity } from '../../TaskReviewEntity'
import { message, Modal } from 'ant-design-vue'
import { rootUrl } from '~/providers/configs/rootUrl'

/** # 复核同意/不同意 */
export function goReviewComment(isAgree: string, rows: TaskReviewEntity[], activeKey: string, successCallback?: () => void) {
  if (rows.length === 0) {
    message.warning('请选择一条记录')
    return
  }
  const waitSignCode = []
  for (let i = 0; i < rows.length; i++) {
    if (activeKey === '2' && rows[i].currentUserSign === '1') {
      waitSignCode.push(rows[i].reportCode)
    }
  }
  if (waitSignCode.length && waitSignCode.length !== rows.length) {
    message.error(`选择的数据中包含补签报告，不允许混合复核，请重新选择，其中补签报告为：${waitSignCode}`)
    return
  }
  else if (waitSignCode.length && isAgree === '0') {
    message.error('您选择的为补签报告，不能进行复核不同意操作！')
    return
  }

  const reportIds = rows.map((row: any) => row.rid).join(',') // 报告ids
  const isWaitSignReport = waitSignCode.length ? 1 : 0 // 是否补签报告
  let url = 'testTaskReviewController.do?goReviewComment'
  url += `&reportIds=${reportIds}`
  url += `&isAgree=${isAgree}`
  url += `&isWaitSignReport=${isWaitSignReport}`

  const title = isAgree === '1' ? '复核确认【同意】' : '复核确认【不同意】'
  let layerIndex = 9999
  // const firstConfirm = true // 解决复核失败后无法继续操作问题
  const callBack = (res: any) => { // vue中自定义回调函数，用于刷新表格关闭弹窗
    if (res.success) {
      successCallback?.()
      window.top?.layer.close(layerIndex)
      // message.success(res.msg || res.message || '操作成功')
    }
  }
  window.top?.layer.open({ // 顶层打开试验复核弹窗
    skin: 'mylayui-layer-molv',
    maxmin: false,
    type: 2,
    title,
    content: url,
    btn: ['确定', '取消'],
    area: ['80%', '80%'],
    yes(index: number) {
      layerIndex = index
      const iframeWin = window?.top?.window[`layui-layer-iframe${index}`]
      // iframeWin.doTaskReview(layerIndex, false, callBack, firstConfirm)
      iframeWin.doTaskReview(layerIndex, false, callBack)
    },
  })
}

/** # 是否为补签报告 */
function isWaitSignReportFun(record: TaskReviewEntity, activeKey: string) {
  return activeKey === '2' && record.currentUserSign === '1' ? 1 : 0
}
/** # 详情跳转前的验证 */
export function detailsVerify(record: TaskReviewEntity, activeKey: string) {
  let selected = 0
  const isWaitSignReport = isWaitSignReportFun(record, activeKey)
  if (record.id) {
    const idArr = record.id.split(',')
    const snArr = record.testTaskCode?.split(',') || []
    if (snArr.length > 1) {
      Modal.confirm({
        title: '提示',
        content: h('div', null, [
          h('p', null, '当前报告存在多份任务，请选择一个任务进行查看'),
          ...snArr.map((sn, index) =>
            h('div', { style: 'margin: 8px 0; display: flex; align-items: center;' }, [
              h('input', {
                type: 'radio',
                id: `sn-${index}`,
                name: 'sn-select',
                value: sn,
                checked: index === 0,
                onInput: () => {
                  selected = index
                },
              }),
              h('label', {
                htmlFor: `sn-${index}`,
                style: 'margin-left: 8px',
              }, sn),
            ]),
          ),
        ]),
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          goDetail(idArr[selected], record.rid, activeKey, isWaitSignReport)
        },
      })
    }
    else {
      goDetail(idArr[selected], record.rid, activeKey, isWaitSignReport)
    }
  }
  else {
    // 准备好参数，直接跳转
    goDetail(record.id, record.rid, activeKey, isWaitSignReport)
  }
}
/** # 详情跳转 */
export function goDetail(id: string, reportId: string, readType: string, isWaitSignReport: any) {
  let url = `/testTaskController.do?goTestTaskDetail&id=${id}`
  url += `&readType=${readType}`
  url += '&udrReadOnly=1'
  url += `&reportId=${reportId}`
  url += `&rid=${reportId}`
  url += '&sourceModule=1'
  url += `&isWaitSignReport=${isWaitSignReport}`
  if (readType === '5' || readType === '2') {
    url += '&reviewPageType=reviewConfirm'
  }
  else if (readType === '3') {
    url += '&reviewPageType=reviewApproval'
  }
  else if (readType === '4') {
    url += '&reviewPageType=reviewApproved'
  }
  url += '&page=review'
  window.open(`${rootUrl}${url}`, '任务详情')
}
