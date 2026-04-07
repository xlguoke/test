// 接口地址
export const api = {
  common: {
    // 查询项目配置
    getConfigs: '/rest/profileController/getAppConfigs',
    // 获取页面权限
    getUserFunctionTreeJson: '/functionController.do?getUserFunctionTreeJson',
    // 获取页面功能权限
    getUserFunctionByCode: '/functionController.do?getUserFunctionByCode',
    // 检测任务
    getTaskWithUnitAndProject: '/reportCreateController.do?getTaskWithUnitAndProject',
    // 根据任务获取参数
    getTestTaskParams: '/testTaskController.do?getTestTaskParams',
    // 上传文件
    upload: '/uploadController.do?upload',
    // 字典
    getListByGroupId: '/dictionaryController.do?getListByGroupId',
    // 获取委托单PDF
    getConsignPdf: '/rest/app/consignAppController/getConsignPDF',
    // 委托单转PDF
    convertConsign2PDF: '/rest/app/consignAppController/convertConsign2PDF',
    // udr预览
    udrPreview: '/rest/app/udr/review',
    // udr重新生成
    udrConvert: '/rest/app/udr/re/convert',
    // 工程项目
    getProjectList: '/projectController.do?datagridNew',
    // 资质类型
    getQualificationTypeList: 'common-body/qualification/pagination',
    // 查询业务参数
    getBusinessParam: '/tSBusinessParamController.do?getReportMergeSettings',
    // 获取token
    getTempToken: 'loginController.do?getTempToken',
    // 下载文件
    // downloadFile: '/FolderController.do?downloadFile',
    // 数量的单位
    typeGrid: 'systemController.do?typeGrid',
    // 编号类别
    getSnCategoryUser: 'tSnCategoryController.do?getSnCategoryUser',
    // 获取样品标签的数据来源
    getSampleLabelUdrData: '/rest/app/udr/record-set',
    // 获取样品试件
    getProcessObjectByObject: '/rest/testObjectController/getProcessObjectByObject',
    // 获取上传附件二维码
    getQrCodeLink: (type: string) => `rest/attachmentQR/getQrCode/${type}`,
    // 通过二维码key获取历史附件
    getAttachmentByKey: (key: string) => `/rest/attachmentQR/attachments/${key}?recursion=false`,
    // 删除二维码上关联的附件
    deleteAttachmentByKey: (key: string, attachmentId: string) => `/rest/attachmentQR/fileDel?key=${key}&attachmentId=${attachmentId}`,
  },
  // 授权模块
  verification: {
    // 授权
    doAuth: '/rest/eqIotAuthRecord/doAuth',
    // 授权记录
    getAuthRecords: '/rest/eqIotAuthRecord/getAuthRecords',
  },
  // 报关模块
  report: {
    // 报告审核
    reportAudit: '/reportAuditController.do?datagridAudit',
    // 报告批准
    reportApprove: '/reportApproveController.do?datagridApprove',

    // 电子签名模式
    signType: '/rest/systemProperty/sign-type',
    // 电子签名列表
    signList: '/rest/signer/signList',
    // 提交电子签名
    submitSign: '/rest/signer/sign',
    // 获取签字类型
    getSignInfo: 'rest/signer/getSignInfo',
    // 获取短信验证码
    getAuthCode: '/rest/creditSign/auth/code',
    // 验证实名认证
    validUserAuth: '/rest/deed/user/auth/status/',
    // 电子签章待签列表
    stampSignList: '/rest/signer/stampSignList?dataType=0',
    // 提交电子签章
    submitStampSign: 'rest/signer/stamp/sign',
    // 签章类型 type = signature-签字 | stamp-签章
    signerServerType: '/rest/signer/server/type?type=',
    // 获取资质章列表
    getQualifications: '/rest/common-body/qualification/list',
    // 获取选中的资质章
    getSelectedQualifications: 'reportController.do?getSelectedQualifications',
    // 保存资质章时检查
    checkQualifications: 'reportController.do?doCheckClashOfTestParamQualification',
    // 保存资质章
    saveQualifications: '/reportController.do?doSaveReportQualifications',
    // 获取资质章页码
    getQualificationPage: '/rest/reportFileQualification/report-qualification/',
    // 保存资质章页码
    saveQualificationPage: '/rest/reportFileQualification/report-qualification',
    // 检查是否需要签字
    getSignProcess: 'rest/signer/getSignProcess',

    // 报告详情
    reportDetail: '/rest/app/reportAppController/getReport',
    // 报告相关文件
    reportFile: '/wordReportController.do?getReportFileTree',
    // 复核审批意见
    reportQuestion: '/rest/reportQuestion/list',
    // 新增复核审批意见
    addReportQuestion: '/rest/reportQuestion',
    // 问题类型
    questionType: '/rest/reportQuestionType/listByReport',
    // 打回修正
    repulseQuestion: '/rest/reportQuestion/disallow',
    // 报告审核通过
    auditPass: '/reportAuditController.do?doReportAuditPass',
    // 批准审核通过
    approvePass: '/reportApproveController.do?doReportApprovePass',
    // 报告退回
    rollback: '/businessRollbackController.do?rollback',
    // 通知修改委托
    consignModifyNotice: '/noticeController.do?doConsignModifyNotice',
    // 获取udr文件
    getUdrAttachment: '/testTaskAttachmentController.do?getUdrAttachment',
    // udr转pdf
    udrConvert2Pdf: '/testObjectUseUdrController.do?udrConvert2Pdf',
    // 获取报告资质
    getReportSummary: '/rest/reportController/reportSummary',
  },
  // 首页
  home: {
    getNotice: '/noticeController.do?datagrid',
    updateNoticeRead: '/noticeController.do?updateNoticeRead',
    getNoticeDetail: '/noticeController.do?readNotice',
    getMessage: '/rest/msgHistory/list',
    getMessageDetail: '/rest/msgHistory/getById',
    // 首页待办
    statisticTodo: '/rest/statistic/todo',
  },
  // 管理层首页
  bossHome: {
    overallSituation: 'rest/app/leaderBoard/overallSituation',
    contract: 'rest/app/leaderBoard/contract',
    revenue: 'rest/app/leaderBoard/revenue',
    sampling: 'rest/app/leaderBoard/sampling',
    productions: 'rest/app/leaderBoard/productions',
    reports: 'rest/app/leaderBoard/reports',
  },
  //  登录
  applogin: {
    checkUserOnlineStatus: '/loginController.do?checkUserOnlineStatus',
    checkUser: '/loginController.do?checkuser',
    login: '/loginController.do?appLogin',
    loginOut: '/loginController.do?logout',
    // 微信 登录
    wechatLogin: '/rest/wechatLoginController/weChatLogin',
    // 部门登录
    orgLogin: '/loginController.do?changeDefaultOrg',
    // 获取部门
    getDepartment: '/userController.do?getUserOrgs',
  },
  setting: {
    // 获取用户信息
    getCurrentUser: '/userController.do?getCurrentUser',
    // 修改密码
    saveNewPassword: '/userController.do?savenewpwd',
    // 更新用户信息
    updateUserBasicInfo: '/userController.do?updateUserBasicInfo',
    // 消息设置列表
    setNoticeList: '/rest/msgType/list',
    // 当前用户的消息设置
    currentUserMsgSwitchList: '/rest/msgType/currentUserMsgSwitchList',
    // 打开消息通知
    msgOn: '/rest/msgType/currentUserMsgSwitchON',
    // 关闭消息通知
    msgOff: '/rest/msgType/currentUserMsgSwitchOFF',
  },
  // 设备综合管理
  equipment: {
    // 获取设备位置
    eqLocation: '/rest/eq/egress/locate',
    // 获取设备信息
    eqDet: '/rest/app/equipment/getById',

    list: '/equipmentNewController.do?datagrid',
    // 详情
    detail: '/equipmentNewController.do?getById',
    // 获取多个设备详情
    moreDetail: '/rest/equipment/use/record',
    // 外出管理
    goOutList: '/rest/eqEgress/listByPage',
    // 使用记录
    useRecord: '/rest/equipment/useRecord',
    // 使用记录详情
    useRecordInfo: '/rest/equipment/getUseRecord',
    // 期间核查记录
    eqInspect: '/eqInspect.do?datagrid',
    // 保养记录
    eqUpkeep: '/eqUpkeepController.do?datagrid',
    // 维修记录
    eqRepair: '/eqRepairController.do?queryList',
    // 维修记录详情
    useRecordDetail: '/eqRepairController.do?getById',
    // 检校记录
    eqCheck: '/checkController.do?datagrid',
    // 附件
    eqFiles: '/eqFileController.do?getFileListByMainEntityId',
    // 附件目录
    eqFilesFolder: '/eqFolderController.do?folderListByMainEntity',
    // 新增设备使用
    eqSaveUse: '/rest/equipment/use/record',
    // eqSaveUse: "/equipmentController.do?doSaveUseEquipments",
    // 设备使用记录列表
    usageRecord: '/rest/equipment/use/record/list',
    // 设备维修
    repairList: '/eqRepairController.do?queryList',
    // 删除设备维修记录
    delRepir: '/eqRepairController.do?delRepair',
    // 物联网设备列表
    deviceList: '/rest/eq/iots',
    // 物联网设备数量
    deviceCount: '/rest/eq/iots/count',
    // 远程操作智能装置
    start: (id: string, boollean: string) => {
      let str = ''
      if (boollean) {
        str = '?SWITCH_ON=true'
      }
      else {
        str = '?SWITCH_OFF=true'
      }
      return `/rest/eq/iots/devices/${id}/command${str}`
    },
    startLock: (id: string) => {
      return `/rest/eq/iots/${id}/command?UNLOCK=true`
    },
    getIotDevice: (id: string) => {
      return `/rest/eq/iots/${id}`
    },
    getIotDeviceAttr: (id: string) => {
      return `/rest/eq/iots/devices/${id}/attributes`
    },
  },
  // 样品流转
  samples: {
    // 寻找试件
    findSpecimen: 'rest/periodStorageSite/find',
    // 查询全部存放位置分组
    LocationGroup: 'rest/periodStorageSiteGroup/tree',
    // 查询某分组下的全部存放位置
    storageLocation: 'rest/periodStorageSite/getAll',
    // 待检测样品
    waitTestObject: '/waitTestObjectController.do?datagrid',
    // 在检样品
    testingObject: '/testingObjectController.do?datagrid',
    // 已留样样品
    savedObject: '/savedObjectController.do?datagrid',
    // 已处理样品
    processedObject: '/processedObjectController.do?datagrid',
    // 全部样品
    allObject: '/allObjectController.do?datagrid',

    // 取样大类
    sampleCategoryList: '/rest/sampleCategory/list',
    // 取样大类 - 样品
    categorySysSampleList: '/rest/categorySysSample/list',
    // 取样类型
    sampleCategoryTree: '/rest/sampleCategory/tree',
    // 辅助收样信息
    getTestOtherInfo: '/testParamController.do?getTestOtherInfo',
    // 获取综合项目
    synthesisList: '/rest/synthesis/list?page=1&size=100',
    // 获取合同段
    synthesisContract: '/rest/synthesis/nav/tree/',
    // 获取综合项目树
    projectTree: '/rest/project/tree',
    // 根据工程项目获取委托单位
    getConsignUnitByProject: '/projectController.do?getProjectConsignUnits',
    // 根据工程项目获取送样人
    getSenderByUnit: '/consignUnitController.do?getConsignUnitSampleSenders',

    // 获取电子标签
    rfid: '/rest/rfid',
    // 新增取样
    extractSample: '/rest/extract/sample',
    // 获取取样信息
    sampleInfo: '/rest/extract/sample/',
    // 获取取样其他信息
    sampleOtherInfo: 'rest/extract/snInfo',
    // 通过二维码查询样品信息
    // getProcessObjectByQrCode: "/waitStorageObjectController.do?getProcessObjectByQrCode",
    getProcessObjectByQrCode: '/rest/allObjectController/getProcessInfoByMixCode',
    // 根据RFID批量查询样品信息
    getProcessObjectByRFIDs: '/waitStorageObjectController.do?getProcessObjectByRFIDs',
    // 通过标签编号查询样品信息
    getProcessObjectByLabelId: '/waitStorageObjectController.do?getProcessObjectByLabelId',
    // 查询样品入库记录
    queryStorageRecord: '/rest/waitStorageObjectController/queryStorageRecord',
    // 查询试件详细信息(含出入库记录)
    getPeriodDetail: '/rest/periodController/getPeriodDetail',
    // 样品分包台账(外委台账)
    subcontractPager: '/rest/objectDisposeController/subcontractPager',
    // 取样台账
    extractSamples: '/rest/extract/samples',
    // 留样台账
    objectSavePager: '/rest/objectDisposeController/objectSavePager',
    // 留样台账
    periodControllerGetPager: '/rest/periodController/getPager',
    // 查询试件出入库列表
    periodStorageGetPager: '/rest/periodStorage/getPager',
    // 批量入库
    putStorage: '/waitStorageObjectController.do?putStorage',
    // 分包单位
    subcontractUnitList: '/rest/subcontractUnit/list',
    // 分包
    dispose: '/objectDisposeController.do?dispose',
    // 根据样品获取参数
    getTestParamByTestSample: '/testParamController.do?getTestParamByTestSample',

    // 待入库列表接口
    waitStoragePeriods: '/rest/app/periodStorage/waitStoragePeriods',
    // 待出库列表接口
    storagePeriods: '/rest/app/periodStorage/storagePeriods',
    // 二维码查询待入库试件接口
    waitStoragePeriodsByBarcode: '/rest/app/periodStorage/waitStoragePeriodsByBarcode',
    // 二维码查询待出库试件接口
    storagePeriodsByBarcode: '/rest/app/periodStorage/storagePeriodsByBarcode',
    // 试件出入库
    periodStoragStorageInOut: 'rest/periodStorage/storageInOut',
    // 查询取样样品编号格式项信息
    getSnTerms: '/rest/app/ExtractSampleSn/getSnTerms',
    // 保存取样样品编号格式项信息,并生成样品编号
    generateTestObjectSn: '/rest/app/ExtractSampleSn/generateTestObjectSn',
    // 使用用户指定的样品编号
    userAppointedSn: '/rest/app/ExtractSampleSn/userAppointedSn',
    // 退回编号
    returnTestObjectCode: '/rest/app/ExtractSampleSn/returnTestObjectCode',
  },
  objectProcessAddPeriod: {
    // 列表
    list: '/testObjectPeriodController.do?datagridByObjectProcess',
    // 添加任务龄期
    add: '/testObjectPeriodController.do?addProcessObjectPeriod',
    // 删除任务龄期
    delete: '/testObjectPeriodController.do?delPeriod',
    // 查询流转样品关联的检测参数集合
    paramsList: '/testObjectPeriodController.do?getTestObjectParamByProcessObject',
  },
  sampleManageApp: {
    // 专门查人员的接口
    queryPerson: '/rest/userController/departmentUserTree',
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
  // 设备外出管理
  eqEgressList: {
    list: '/rest/eqEgress/listByPage',
    add: '/rest/eqEgress/newEgress',
    detail: '/rest/eqEgress/egressDetail',
    dispose: '/rest/eqEgress/egressDispose',
    status: '/dictionaryController.do?getListByGroupId',
    getEgressInfo: '/rest/app/equipment/getEgressInfo',
    getDetailById: '/rest/app/equipment/getById',
    taskList: '/reportCreateController.do?getTaskWithUnitAndProject',
    // 外出确认/拒绝
    egressConfirm: '/rest/eqEgress/egressConfirm',
    // 设备归还
    equipmentReturn: '/rest/eqEgress/equipmentReturn',
    // 归还确认/拒绝
    returnConfirm: '/rest/eqEgress/returnConfirm',
    // 批量新增设备外出记录
    batchAdd: '/rest/eqEgress/batch-add',
    // 批量操作
    batchOperation: '/rest/eqEgress/batch-operation',
    // 根据设备ID批量获取外出记录
    getBatchEgress: '/rest/app/equipment/getBatchEgress',
    // 获取外出设备信息
    egressEqInfo: '/rest/eqEgress/eq/info',
    // 编辑设外出申请
    editApply: 'rest/eqEgress/update/egress',
    // 编辑确认操作记录
    editOperation: 'rest/eqEgress/update/operation',
  },
  temperature: {
    // 功能室列表
    appList: '/rest/laboratoryController/app/list',
    // 报表接口
    charts: '/rest/laboratoryController/charts',
    // 详情接口
    detail: '/rest/laboratoryController/app/detail',
    // 记录列表接口
    recordlist: '/rest/labEnvOverRecord/list',
  },
  // 试验管理
  testManage: {
    // 不合格台账
    disqualificationUrl: '/rest/disqualification/list',
    // 不合格台账详情
    disqualificationDetail: '/rest/app/disqualification/detail',
    // 试验任务
    testTaskUrl: '/testTaskController.do?datagrid',
    // 任务分配
    getObjectTrees: '/unAssignedTaskController.do?getObjectTrees',
    // 保存任务分配
    saveObjectUrl: '/unAssignedTaskController.do?assignTaskWithObject',
    getObjectUrl: '/assignedTaskController.do?getObjectTasks',
    // 待分配列表
    unAssignedlist: '/unAssignedTaskController.do?datagrid',
    // 已分配分配列表
    assignedlist: '/assignedTaskController.do?datagrid',
    assignedDetail: '/assignedTaskController.do?getTestTaskById',
    // 重新分配
    reAssignTaskUrl: '/assignedTaskController.do?reAssignTask',
    // 根据taskId获取打开udr的相关参数
    getUdrTemplate: '/rest/app/task/template-detail',
    // 获取检测任务下的参数 &testTaskId=
    testTaskParams: 'testTaskController.do?getTestTaskParams',
    // 根据参数id获取设备列表 ?testTaskId=&taskParamId=
    taskParamEquipment: 'rest/testTaskController/task/param/equipment',
    // 保存设备
    saveUseEquipments: 'equipmentController.do?doSaveUseEquipments',
    // 删除设备
    delUseEquipment: 'equipmentController.do?doDelUseEquipment',
    // 开始
    testTaskStart: '/rest/app/task/use/equipment/start',
    // 结束
    testTaskEnd: '/rest/app/task/use/equipment/end',
  },
  inspectManage: {
    inspectList: 'rest/app/inspection/pageList',
    categoryList: 'rest/app/inspectionCategory/pageList',
    categoryTree: 'rest/app/inspectionKeypointCategory/getTrees',
    pointsList: 'rest/app/inspectionKeypoint/pageList',
    questionData: 'rest/app/inspectionProblem/findByKeypoint',
    detailsData: 'rest/app/inspection',
    rsaveOrUpdate: 'rest/app/inspection/saveOrUpdate',
    generateSn: 'rest/inspection/generateSn',
    delInspects: 'rest/app/inspection/batchDel',
    copyInspect: 'rest/app/inspection/copy',
    addKeypoint: 'rest/app/inspectionKeypoint/saveOrUpdate',
  },
  // 流程审核管理
  auditProcess: {
    pageList: 'rest/app/commonProcess/getAuditList', // 分页列表
    auditDetail: 'rest/app/commonProcess/getAuditDetail', // 审核详情
    detail: 'rest/app/commonProcess', // 详情
    submit: 'rest/app/commonProcess/submit', // 提交(发起审批)
    delete: 'rest/app/commonProcess/del', // 删除
    auditPass: 'rest/app/commonProcess/auditPass', // 审核通过
    auditRefuse: 'rest/app/commonProcess/auditRefuse', // 审核不通过
    // 获取流程人员
    getProcessUserUrl: '/rest/app/commonProcess/getProcessUserTaskList',
    // 查询其他成果预设人员
    getPresetAuditer: '/rest/app/commonProcess/getPresetAuditer',
    getProcessFormUrl: '/rest/app/commonProcess/getStartFormData',
    getRelations: '/rest/app/commonProcess/getRelations', // 查询全部业务流程
  },
  // 设备盘点(PC设备盘点记录的接口)
  equipmentInventory: {
    pageList: 'rest/eq/inventory/list',
    static: 'rest/eq/inventory/statistics/count',
    devicePageList: 'rest/eq/inventory/eq/list',
    register: 'rest/eq/inventory/register',
    axis: 'rest/eq/inventory/axis',
    detail: (id: string) => `rest/eq/inventory/${id}`,
  },
}
