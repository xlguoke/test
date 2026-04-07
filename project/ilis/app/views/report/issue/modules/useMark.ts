import type { ReportData, TabType } from '../listEntity'

/** 标记 */
const reportMark = [
  { key: 'temporary', label: '临', color: 'red', description: '临时报告' },
  { key: 'formal', label: '正', color: 'green', description: '正式报告' },
  { key: 'sign', label: '签', color: 'red', description: '已签名未发放' },
  { key: 'synthesis', label: '综', color: '#f75d00', description: '综合报告' },
  { key: 'kpiDisqualification', label: '指标不合格', color: '#f1891a', description: '有指标不合格' },
  { key: 'disqualification', label: '不合格', color: 'red', description: '不合格' },
]

export function UseMark(rows: ReportData[], tableType: TabType) {
  const markObj = ref({} as any)

  function initMark(rows: ReportData[]) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.reportType === 'temporary' || row.reportType === 'synthesis') {
        const item = reportMark.find(item => item.key === row.reportType)
        markObj.value[row.reportId] = item
      }
      else if (row.issueSignPicUrl && tableType === '0') {
        const item = reportMark.find(item => item.key === 'sign')
        markObj.value[row.reportId] = item
      }
      else if ((row.autoIsQualified === 0 && row.isQualified && row.isQualified === '1') || row.autoIsQualified === 3) {
        const item = reportMark.find(item => item.key === 'kpiDisqualification')
        markObj.value[row.reportId] = item
      }
      else if (row.autoIsQualified === 0) {
        const item = reportMark.find(item => item.key === 'disqualification')
        markObj.value[row.reportId] = item
      }
    }
  }

  initMark(rows)

  return {
    initMark,
    markObj,
  }
}
