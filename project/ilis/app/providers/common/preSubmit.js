import { message } from 'ant-design-vue'
import ajax from '~/providers/common/ajax'

/**
 * 提交时检查是否设置了流程模型，未设置后端直接完成该流程
 * @param processType string 审核流程类型
 * @param processId string 审核流程id
 * @param callback function 检查完成的回调
 */
export function checkProcessModel(processType, processId, callback) {
  if (!processType) {
    message.error('流程类型不能为空')
    return
  }
  else if (!processId) {
    message.error('流程id不能为空')
    return
  }
  ajax({
    url: `/rest/auditProcessRelation/preSubmit/${processType}/${processId}`,
    method: 'get',
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
  })
    .then((res) => {
      if (res.code === 20000) {
        callback && callback(res.data.haveProcess)
        if (!res.data.haveProcess) {
          message.success('提交成功!')
        }
      }
      else {
        message.error(res.message || '提交失败，请联系管理员')
      }
    })
    .catch((err) => {
      message.error(err.message || '请求异常，请稍后重试')
    })
}
