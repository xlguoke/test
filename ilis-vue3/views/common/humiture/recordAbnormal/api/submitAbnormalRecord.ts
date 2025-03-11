export class SubmitAbnormalRecordEntity {
  formPropertyJson?: string
  /** 处理内容 */
  handleContent?: string
  id?: string
  presetAuditers?: string
}

/** 提交异常记录 */
export function submitAbnormalRecord(data: SubmitAbnormalRecordEntity) {
  return ilisAxios.post('rest/humiture/record?submit', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}
