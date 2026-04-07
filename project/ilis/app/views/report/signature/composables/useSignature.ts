import type { IReportSignature } from '..'
import { Modal } from 'ant-design-vue'

/** # 设置报告印章（使用的jsp中的方法） */
export function selectQualification(rows: IReportSignature[]): Promise<void> {
  return new Promise((resolve) => {
    window.InitObj.selectQualification(rows, () => {
      resolve()
      Modal.info({
        title: '提示',
        content: '设置报告印章后，需要点击重新盖章，报告文件中盖章方可更新',
        okText: '确认',
        centered: true,
      })
    }, '2')
  })
}

/** # 设置签章页码（使用的jsp中的方法） */
export function setBatchQualificationData(rows: IReportSignature[]): Promise<void> {
  return new Promise((resolve) => {
    window.InitObj.setBatchQualificationData(rows, resolve)
  })
}
