export { default as ScanCodeQuery } from './ScanCodeQuery.vue'

export enum SCAN_TYPE {
  /** 样品流转 */
  SAMPLE_FLOW = 'sampleFlow',
  /** 标样出入库 */
  EXAMPLE = 'example',
  /** 设备外出 */
  EQUIPMENT = 'equipment',
  /** 报告发放 */
  REPORT_ISSUE = 'reportIssue',
  /** 扫码管理-用印登记 */
  SEAL_REGISTER = 'sealRegister',
}

export const apis = {
  /** 样品流转 */
  [SCAN_TYPE.SAMPLE_FLOW]: 'rest/allObjectController/getProcessInfoByMixCode?mixCode=',
  /** 标样出入库 */
  [SCAN_TYPE.EXAMPLE]: 'rest/periodStorage/getPeriodsByMixCode?mixCode=',
  /** 设备外出 */
  [SCAN_TYPE.EQUIPMENT]: 'rest/equipment/getEquipmentByMixCode?mixCode=',
  /** 报告发放 */
  [SCAN_TYPE.REPORT_ISSUE]: 'rest/reportIssueController/issue/report/info?param=',
  /** 扫码管理-用印登记 */
  [SCAN_TYPE.SEAL_REGISTER]: 'rest/report/stamp/register?reportQrCodeUrl=',
}
