// 接口地址
const api = {
  common: {
    // 获取页面权限
    getUserFunctionTreeJson: '/functionController.do?getUserFunctionTreeJson',
    // 获取页面功能权限
    getUserFunctionByCode: '/functionController.do?getUserFunctionByCode',
    // 获取选择人员
    getPersonsForChoose: '/reportCreateController.do?getPersonsForChoose',
    // 上传文件
    upload: '/uploadController.do?upload',
  },
  objectProcessAddPeriod: {
    // 列表
    list: '/testObjectPeriodController.do?datagridByObjectProcess',
    // 添加任务龄期
    add: '/testObjectPeriodController.do?addProcessObjectPeriod',
    // 删除任务龄期
    delete: '/testObjectPeriodController.do?delPeriod',
    // 查询流转样品关联的检测参数集合
    paramsList:
      '/testObjectPeriodController.do?getTestObjectParamByProcessObject',
  },
  sampleManageApp: {
    // 审核人员
    person: '/reportCreateController.do?getPersonsForChoose',
    // 样品基本信息
    baseInfo: '/rest/app/processObject/getById',
    // 流转数据信息
    processInfo: '/rest/app/processObject/getProcessRecord',
    // 检测结果信息
    testResultInfo: '/rest/app/processObject/getTestResult',
    // 样品制件信息
    periodInfo: '/rest/app/processObject/getPeriodList',
    // 领取样品
    getSample: '/objectDisposeController.do?objectGet',
    // 收样处留样
    sampleRoomSave: '/objectDisposeController.do?sampleRoomSave',
    // 废弃样品
    dispose: '/objectDisposeController.do?dispose',
    // 发期审批
    addAudit: '/objectAuditController.do?addAudit',
  },
  applogin: {
    checkUserOnlineStatus: '/loginController.do?checkUserOnlineStatus',
    checkUser: '/loginController.do?checkuser',
    login: '/loginController.do?appLogin',
    // 选择登录部门
    getUserOrgs: '/userController.do?getUserOrgs',
    // 部门登录
    orgLogin: '/loginController.do?changeDefaultOrg',
  },
  // 设备外出管理
  eqEgressList: {
    list: '/rest/eqEgress/listByPage',
    add: '/rest/eqEgress/newEgress',
    detail: '/rest/eqEgress/egressDetail',
    dispose: '/rest/eqEgress/egressDispose',
    status: '/dictionaryController.do?getListByGroupId',
    getEgressInfo: '/rest/app/equipment/getEgressInfo',
    getDetailById: '/rest/app/equipment/getById',
    getByIdWithoutLogin: '/rest/app/equipment/getByIdWithoutLogin',
    taskList: '/reportCreateController.do?getTaskWithUnitAndProject',
    projectList: 'projectController.do?datagridNew',
    // 外出确认/拒绝
    egressConfirm: '/rest/eqEgress/egressConfirm',
    // 设备归还
    equipmentReturn: '/rest/eqEgress/equipmentReturn',
    // 归还确认/拒绝
    returnConfirm: '/rest/eqEgress/returnConfirm',
    // 批量延期，延期确认，延期拒绝(app通用操作接口迁移)
    batchOperation: '/rest/eqEgress/batch-operation',
  },
  equipmentInfo: {
    detail: '/equipmentNewController.do?getById',
  },
}

export default api
