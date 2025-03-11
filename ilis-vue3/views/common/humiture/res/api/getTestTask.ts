export interface TestTaskDataItem {
  standard: 'head-body'
  processStatus: '试验检测中'
  agePeriod: '2'
  workflowStatus: '1'
  consignId: '402882c19319b0cc019319d74afe0626'
  departmentId: '8a8ab0b246dc81120146dc8180ba0017'
  signDate: '2024-11-12'
  rid: '402882c1931dfae701931e5615a3255b'
  reportReviseStatus: 0
  testObjectId: '402882c19319b0cc019319d80431065b'
  projectPartAndUse: '测试工程部位/用途'
  id: '402882c1931a604601931a6639aa0142'
  departName: '蜀道投资集团有限责任公司'
  requireReportDate: '2024-11-06'
  consignType: '0'
  testRecordCode: 'JL-20241111-LJFB-1'
  projectNames: '特殊项目'
  testObjectParam: '密度,成圆率显示名称,磁性颗粒含量显示名称,粒径分布,耐水性,防水涂层要求'
  currentUserSign: '0'
  recentModifyDate: '2024-11-12 10:35'
  consignDate: '2024-11-11'
  contractNo: ''
  urgentStatus: '00'
  submitDate: '2024-11-12'
  autoIsQualified: 2
  projectCreator: '管理员'
  consignUnitName: '特殊单位'
  hasAppTemp: '0'
  reportBpmStatus: '0'
  normFinishTime: null
  testTimeStart: 1731081600000
  projectCode: ''
  buildProjectName: ''
  reportCode: 'BG-20241111-LJFB-1'
  testTime: '2024-11-09 ~ 2024-11-09'
  testUser: '管理员'
  constructionUnit: ''
  testTaskCode: 'ZJZ10001LJFB'
  internalReportDate: null
  createDate: 1731314727000
  overdueMemo: null
  markObjectColorTextIds: null
  reportEditor: null
  mistakeMemo: null
  reportReconfirm: '管理员'
  bigType: '1'
  consignCode: 'WT-BLZ-1-300'
  testSampleDisplayName: '路面标线用玻璃珠'
  testObjectCode: 'YP--1-278 ~ YP--1-280'
  buildUnitName: ''
}

/** 试验任务列表 */
export function getTestTask(queryParams: any, data: any) {
  let url = 'testTaskController.do?datagrid'

  for (const key in queryParams) {
    if (queryParams[key]) {
      url += `&${key}=${queryParams[key]}`
    }
  }

  return ilisAxios.post(url, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}
