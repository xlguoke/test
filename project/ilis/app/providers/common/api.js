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
    // 数据字典
    getDictionaryData: '/dictionaryController.do?getListByGroupId',
    // 数据字典
    getDictionary:
      '/systemController.do?typeGrid&field=id,typename,typecode,sourceFrom',
    // 数据字典：根据编码获取 ?code=..
    getDictByCode: 'rest/dictionaryController/types',
    // 获取部门树
    getDepartmentTree: '/orgController.do?getOrgComboTree',
    // 获取人员部门
    getOrgList: '/rest/tSnCategoryOrgController/getOrgList',
    // 获取流程人员
    getProcessUserUrl: '/rest/auditProcess/getProcessUserTaskList',
    // 获取流程人员
    getProcessFormUrl: '/rest/auditProcess/getStartFormData',
    // 获取类型
    getDictContent: '/systemController.do?getDictContent',
    // 获取委托单位
    consignUnit: '/consignUnitController.do?datagridNew',
    // 根据委托单位获取工程项目
    projectByConsignUnit: '/consignUnitController.do?getConsignUnitProjects',
    // 获取工程项目
    project: '/projectController.do?datagridNew',
    customProperties: '/rest/common/custom-properties',
    customProperty: '/rest/common/custom-property',
    customValues: '/rest/common/custom-values',
    // 资质类型
    qualifications: '/rest/common-body/qualification/list',
    // 临时存数据
    putTemporaryData: '/rest/dictionaryController/putDataInServer',
    // 取临时数据
    getTemporaryData: '/rest/dictionaryController/getData',
    // 通用退回
    rollback: '/businessRollbackController.do?rollback',
    // 大类获取参数
    getCategoryParams: '/testParamPriceWorkingHourController.do?datagridCommon',
    // 获取登录人员所在部门id
    getUserOrgIds: '/userController.do?getCurrentUserOrg',
  },
  // 文件管理
  folderManages: {
    // 文件目录list
    datagridByFolder: 'eqFolderController.do?folderListByMainEntity',
    // 文件目录保存
    saveFolder: 'eqFolderController.do?saveFolder',
    // 文件目录删除
    delFolder: 'eqFolderController.do?delFolder',
    // 文件列表
    datagridByFile: 'eqFileController.do?datagridByFolder',
    // 保存文件
    saveFile: 'eqFileController.do?saveFile',
    // 删除文件
    delFile: 'eqFileController.do?delFile',
  },
  home: {
    test: '/consignController.do?datagridNew',
    // test: "/ILIS2_0_war_exploded/consignController.do?datagridNew"
  },
  testItem: {
    // 综合项目列表
    list: '/rest/synthesis/list',
    // 新增项目
    addProject: '/projectController.do?doAdd',
    // 更新项目信息
    updateProject: '/projectController.do?doUpdate',
    // 完成项目
    completeProject: '/rest/synthesis/project',
    recoverProject: '/rest/synthesis/recover-project',
    // 删除项目
    deleteProject: '/projectController.do?doDel',
    // 获取导航树
    getTree: '/rest/synthesis/nav/tree',
    // 其他成果列表
    achievementList: '/rest/synthesis/achievement/list',
    // 新增/编辑其他成果
    achievement: '/rest/synthesis/achievement',
    // 查询其他成果详情
    achievementById: '/rest/synthesis/achievement/getAchievementById',
    // 查询其他成果预设人员
    getPresetAuditer: '/rest/auditProcess/getPresetAuditer',
    // 联系人列表
    contactList: '/rest/synthesis/contact/list',
    // 新增/编辑/删除 联系人
    addContact: '/rest/synthesis/contact',
    // 设置/获取相关人员
    setPerson: '/rest/synthesis/person',
    // 登记进度列表
    progressList: '/rest/synthesis/progress/tree',
    // 更新进度
    updateProgress: '/rest/synthesis/progress',
    // 进度详情
    progressDetail: '/rest/synthesis/progress',
    // 获取自定义字段
    getFields: '/rest/synthesis/column',
    // 修改自定义字段
    column: '/rest/synthesis/column',
    // 新增单位工程
    unit: '/rest/synthesis/unit',
    // 新增/修改/获取合同段
    contract: '/rest/synthesis/contract',
    // 获取单位工程
    unitProject: '/rest/synthesis/unitProject',
    // 合同段/单位工程列表
    contractUnit: '/rest/synthesis/contract/unit',
    // 合同段/单位工程列表 搜索
    contractUnitSearch: '/rest/synthesis/contract/unit/tree',
    // 合同段/单位工程设置人员
    setCUPerson: '/rest/synthesis/contract/unit/person',
    // 获取待审核/已审核列表
    auditAchieve: '/rest/synthesis/audit/achieve/list',
    // 审核其它成果
    audit: '/rest/synthesis/audit',
    // 综合日志
    synthesisLog: '/rest/synthesis/log',
    // 获取查询附录列表(搜文件名)
    appendixByFile: '/rest/synthesis/attachment',
    // 获取查询附录列表(根据树筛选)
    appendixByField: '/rest/synthesis/attachment',
    // 获取检测报告
    reportList: '/rest/synthesis/report/list',
    // 查询当前审核人
    checkAudit: '/rest/synthesis/achievement/person/check',
    // 查询当前合同段/单位工程的人员
    getPersonInCU: '/rest/synthesis/contact',
    // 相同项目编号检测
    sameProjectCodeDetect: '/rest/synthesis/detect/project-code',
    // 同步工程划分
    syncProject: '/rest/synthesis/sync',
    // 示例文件
    templateUrl: '/rest/synthesis/unit-projects/template',
    // 工程划分导入预览接口 参数contractPartId  Content-Type: multipart/form-data
    importPreview: '/rest/synthesis/unit-projects',
    // 导入工程划分接口 Content-Type: application/json
    // formData:{unitProjects:treeData,contractPartId:id}
    importSave: '/rest/synthesis/unit-projects',
    // 上下移动
    moveUrl: '/rest/synthesis/unit-project/level/exchange',
  },
  standard: {
    // 选择规程
    tableUrl: '/baseStandardManageController.do?datagrid',
    treeUrl: '/baseStandardTypeController.do?datagrid',
    treeSave: '/baseStandardTypeController.do?save',
    treeDel: '/baseStandardTypeController.do?delete',
    standardType: '/baseStandardManageController.do?changeStandardType',
    standardDel: '/baseStandardManageController.do?delete',
    standardSave: '/baseStandardManageController.do?save',
    standardGetById: '/baseStandardManageController.do?getById',
    syncBaseStandard:
      '/baseStandardNewController.do?doSyncTestParamStandardsFromHitekDataCenter',
    merge: '/baseStandardNewController.do?duplicateMerge',
    whetherThisUnitChange:
      '/baseStandardManageController.do?whetherThisUnitChange',
  },
  designGrade: {
    // 设计级配
    typeListUrl: '/tDesignGradeTypeController/dataGrid.do',
    typeAddUpdateUrl: '/tDesignGradeTypeController/addOrUpdateData.do',
    typeDetailUrl: '/tDesignGradeTypeController/queryDetail.do',
    typeDeleteUrl: '/tDesignGradeTypeController/delete.do',
    typeCopyUrl: '/tDesignGradeTypeController/copy.do',
    // 范围配置
    rangeListUrl: '/tDesignGradeRangeController/dataGrid.do',
    rangeAddUpdateUrl: '/tDesignGradeRangeController/addOrUpdateData.do',
    rangeDetailUrl: '/tDesignGradeRangeController/queryDetail.do',
    rangeDeleteUrl: '/tDesignGradeRangeController/delete.do',
  },
  laboratory: {
    tableUrl: '/laboratoryController.do?datagridAll',
    realTimeData: `/rest/labEnvironment/real-time`,
    saveUrl: '/laboratoryController.do?save',
    delUrl: '/laboratoryController.do?delete',
    getConfig: '/rest/labConfig/info',
  },
  environment: {
    tableUrl: '/labEnvironmentController.do?datagrid',
    editUrl: '/labEnvironmentController.do?getById',
    saveUrl: '/labEnvironmentController.do?save',
    delUrl: '/labEnvironmentController.do?delete',
  },
  environmentStatistics: {
    tableUrl: '/labEnvironmentController.do?datagrid',
    chartUrl: '/labEnvironmentController.do?lineChart',
    export: '/labEnvironmentController.do?exportXls',
  },
  environmentCollection: {
    list: '/rest/labEnvironment/list',
  },
  reportQuestion: {
    // 数据文件及报告
    testTaskFileTree: '/testTaskAttachmentController.do?getTestTaskFileTree',
    // 通过报告id获取报告及对应的文件
    getReportAndFileById: 'rest/reportFileController/file/',
    // 通过任务id获取报告及对应的文件
    getReportAndFile: 'rest/reportFileController/report/file/',
    // 查询问题列表
    list: '/rest/reportQuestion/list',
    // 新增/修改/删除报告问题
    editQuestion: '/rest/reportQuestion',
    // 修正问题
    amend: '/rest/reportQuestion/amend',
    // 修改为未修正
    disAmend: '/rest/reportQuestion/disAmend',
    // 打回问题
    disallow: '/rest/reportQuestion/disallow',
    // 问题类型列表
    // typeList: "/rest/reportQuestionType/list"
    typeList: '/rest/reportQuestionType/listByReport',
  },
  reportQuestionStat: {
    // 查询报告列表
    list: '/rest/reportQuestion/reportQuestionStat',
    // 查询报告各种严重程度的问题数量
    listItemQuestion: '/rest/reportQuestion/questionSeverityGroupCount',
    // 导出复核审批意见列表
    export: '/rest/reportQuestion/reportQuestionStat/export',
  },
  reportQuestionType: {
    // 查询问题类型列表
    list: '/rest/reportQuestionType/list',
    // 根据id查问题类型/新增问题/删除问题/修改问题
    operation: '/rest/reportQuestionType',
    // 批量指定参数
    batchSetParams: '/rest/reportQuestionType/batchSetParams',
    // 导出
    export: '/reportQuestionViewController.do?exportQuestionType',
    // 下载导入模板
    download: '/reportQuestionViewController.do?downloadQuestionTypeTemplate',
    // 导入
    import: '/reportQuestionViewController.do?importQuestionType',
  },
  contractTestReport: {
    // 列表
    list: '/rest/contract/report/list',
    // 合同列表
    contractList: '/contractController.do?datagrid',
  },
  taskAddPeriod: {
    // 列表
    list: '/testObjectPeriodController.do?datagridByTesttask',
    // 添加任务龄期
    add: '/testObjectPeriodController.do?addTaskPeriod',
    // 批量保存任务龄期
    addAll: '/testObjectPeriodController.do?addTaskPeriodBatch',
    // 删除任务龄期
    delete: 'testObjectPeriodController.do?delPeriod',
    // 查询任务关联的流转样品集合
    sampleList: '/allObjectController.do?getProcessObjectByTestTask',
    // 查询任务关联的参数集合
    paramsList: '/testObjectPeriodController.do?getTestObjectParamByTestTask',
    // 指定龄期记录检测状态改变
    changeStatus: '/testObjectPeriodController.do?markTested',
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
    // 获取默认制件人
    getDefaultPerson: '/testingObjectController.do?getTesters',
  },
  auditAuthority: {
    // 列表
    list: '/rest/auditAuthorityController/all',
    // 新增
    add: '/rest/auditAuthorityController/add',
    // 删除
    delete: '/rest/auditAuthorityController/del',
    // 更新
    update: '/rest/auditAuthorityController/updateUserAuthority',
    // 获取用户权限
    getUserInfo: '/rest/auditAuthorityController/userAuthority',
  },
  auditProcessRelation: {
    // 查询全部业务和流程绑定记录
    getRelations: '/rest/auditProcessRelation/getRelations',
    // 查询全部通用审核流程
    getCommonProcessList: '/rest/auditProcessRelation/getCommonProcessList',
    // 保存
    save: '/rest/auditProcessRelation/saveRelation',
    saveCommon: '/rest/auditProcessRelation/addCommonProcess',
    // 删除
    delete: '/rest/auditProcessRelation/delCommonProcess',
    // 流程审批意见列表
    auditProcessList: '/rest/auditProcessProblem/getByProcessInstanceId',
    // 上传成果审批意见列表
    getByBusinessList: '/rest/auditProcessProblem/getByBusinessId',
    // 新增问题保存
    auditProcessSave: '/rest/auditProcessProblem/saveProcessProblem',
    // 新增问题删除
    auditProcessDel: '/rest/auditProcessProblem/delProcessProblem',
    // 新增处理问题（修正）
    amend: '/rest/auditProcessProblem/setRecovered',
    // 新增撤销处理问题（未修正）
    disAmend: '/rest/auditProcessProblem/cancelRecovered',
    // 判断是否配置了审核流程 url/${processType}/${processId}
    isAuditProcess: '/rest/auditProcessRelation/preSubmit',
  },
  checkPlanSubmit: {
    submit: '/checkPlanController.do?submitPlanAudit',
    submit2: '/checkController.do?submitCheckAudit',
  },
  auditProcess: {
    list: '/rest/auditProcess/getAuditList',
    auditDetail: '/rest/auditProcess/getAuditDetail',
    detail: '/rest/commonAudit',
    delete: '/rest/commonAudit/del',
    auditPass: '/rest/auditProcess/auditPass',
    auditRefuse: '/rest/auditProcess/auditRefuse',
    goDetail: '/rest/auditProcess/goBusinessDetail',
    submit: '/rest/commonAudit/submit',
    // 查看日志
    processLogs: '/rest/auditProcess/processLogs',
  },
  // 查看预委托列表
  consignList: {
    list: 'api/services/app/ILISIntegration/GetBuConsignInfoList',
    detail: 'api/services/app/ILISIntegration/GetConsignInfoDetail',
    save: '/consignController.do?doSave',
    complete: '/consignController.do?doCompleteById',
    getParams: '/testParamController.do?getTestParamByTestSample',
    getOriginPath: '/rest/pre/consign/deploy',
    consignStatus: '/rest/pre/consign/status',
    log: 'api/services/app/ILISIntegration/GetConsignLog',
    getConsginTestType: '/checkTypeController.do?getAll',
    getSample: 'testSampleController/getUnitSample.do',
    getParamsList: 'testParamController.do?datagrid',
  },
  // 查看预委托列表
  selectSample: {
    getTree: '/bigCategoryController.do?comboTreeSync',
    getParams: '/testParamController/getChooseTestParams.do',
    getSampleData: '/testSampleController.do?getSampleComboTreeByBigCategory',
    // 添加附注
    addParamNode: '/rest/testParamController/add-note',
    addSampleNote: '/rest/testSampleController/add-note',
  },
  // 打包参数管理
  buildParams: {
    list: '/rest/param-packs',
    update: '/rest/param-pack', // add-POST edit-PUT
    editById: '/rest/param-pack', // url/{id}： DELETE-del  GET-detail
    getTestParams: '/baseStandardNewController.do?getHitekTestParamStandards',
  },
  // 设备外出管理
  eqEgressList: {
    applyList: '/rest/eq/egress/apply/list', // 申请视图数据列表
    eqList: '/rest/eqEgress/list', // 设备视图数据列表
    list: '/rest/eqEgress/listByPage',
    add: '/rest/eqEgress/newEgress',
    detail: '/rest/eqEgress/egressDetail',
    dispose: '/rest/eqEgress/egressDispose',
    status: '/dictionaryController.do?getListByGroupId',
    rollback: `/rest/eqEgress/rollback`,
    // 批量删除
    batchDel: `/rest/eqEgress/batch-del`,
    // 确认外出 & 拒绝外出
    confirm: '/rest/eqEgress/egressConfirm',
    // 设备归还
    return: '/rest/eqEgress/equipmentReturn',
    // 确认归还 & 归还拒绝
    returnConfirm: '/rest/eqEgress/returnConfirm',
    // 批量新增设备外出记录
    batchAdd: '/rest/eqEgress/batch-add',
    // 批量操作
    batchOperation: '/rest/eqEgress/batch-operation',
    // 是否配置了设备外出审批流程
    isAuditProcess: '/rest/eq/egress/apply/exist/audit/process',
    // 申请视图详情 url/${egressApplyId}
    applyDetail: '/rest/eq/egress/apply/detail',
    // 申请视图对应的设备列表
    applyEqList: '/rest/eq/egress/apply/eq/list',
    // 导出
    export: '/rest/eq/egress/apply/export',
    // 新增外出申请
    addApply: '/rest/eq/egress/apply',
    submitAudit: '/rest/eqEgress/submit/audit',
  },
  // 设备 -- 耗材
  consumablesList: {
    list: '/consumablesController.do?datagrid',
    delUrl: '/consumablesController.do?delConsumable',
    // 入库、出库
    addOutbound: '/consumablesController.do?saveInventory',
    // 查询耗材库存明细
    detailById: '/consumablesController.do?getById',
    // 查询耗材出入库记录
    detailDatagrid: '/consumablesController.do?datagridInventory',
    // 设置库存告警数量
    setAlarmAmount:
      '/consumablesController.do?setConsumablesInventoryAlarmAmount',
  },
  // 设备 -- 购置计划
  equipBuyPlanList: {
    list: '/buyPlanController.do?datagrid',
    // 保存购置计划信息
    savePlan: '/buyPlanController.do?savePlan',
    // 查询指定购置计划信息
    detailById: '/buyPlanController.do?getById',
    // 查询购置计划明细信息
    detailDatagrid: '/buyPlanController.do?datagridPlanDetail',
    // 提交购置计划
    submitUrl: '/buyPlanController.do?submitPlan',
    // 删除设备购置计划
    delPlan: '/buyPlanController.do?delPlan',
  },
  // 设备 -- 购置申请
  equipBuyApplyList: {
    list: '/buyApplyController.do?datagrid',
    // 保存购置计划信息
    savePlan: '/buyApplyController.do?saveApply',
    // 查询指定购置计划信息
    detailById: '/buyApplyController.do?getById',
    // 查询购置计划明细信息
    detailDatagrid: '/buyApplyController.do?datagridApplyDetail',
    // 提交购置申请审批
    submitUrl: '/buyApplyController.do?submitApply',
    // 删除设备购置申请
    delApply: '/buyApplyController.do?delApply',
    // 下载
    download: '/rest/buyApplyController/import-model',
    // 导入
    import: '/rest/buyApplyController/import',
  },
  // 设备 -- 购置信息
  equipBuyList: {
    // 查询设备购置信息列表
    list: '/buyController.do?datagrid',
    // 查询购置的全部信息（包含购置基本信息/供应商快照/设备快照/验收信息）
    getBuyInfoAll: '/buyController.do?getBuyInfoAll',
    // 同步购置申请
    syncBuyApply: '/buyController.do?syncBuyApply',
    // 保存设备购置信息
    saveBuy: '/buyController.do?saveBuy',
    // 保存设备购置时的供应商快照信息
    saveSupplierSnapshot: '/buyController.do?saveSupplierSnapshot',
    // 保存购置时的设备快照
    saveEquipmentSnapshot: '/buyController.do?saveEquipmentSnapshot',
    // 保存购置验收信息
    saveBuyAcceptance: '/buyController.do?saveBuyAcceptance',
    // 删除购置信息
    delBuyInfo: '/buyController.do?delBuyInfo',
    // 提交购置信息审批
    submitBuy: '/buyController.do?submitBuy',
    // 提交购置验收信息审批
    submitBuyAcceptance: '/buyController.do?submitBuyAcceptance',
    // 获取供应商文件
    getSupplier: '/eqFileController.do?getFileGroupByRelationEntityId',
  },
  // 设备管理公共方法
  equipCommon: {
    // 设备列表
    equipList: '/equipmentNewController.do?datagrid',
  },
  // 设备工作台统计
  eqWrokbench: {
    backlog: '/rest/equipment/page/handle', // 待办事项
    storage: '/rest/equipment/page/storage', // 部门设备分布
    mgrType: '/rest/equipment/page/type', // 部门管理类别
    overview: '/rest/equipment/page/overview', // 设备概况
    status: '/rest/equipment/page/status', // 设备状态
    purchase: '/rest/equipment/page/purchase', // 设备购置统计
  },
  // 设备管理-期间核查计划
  equipInspectPlan: {
    // 查询期间核查计划列表
    list: '/eqInspectPlan.do?datagrid',
    // 查询期间核查计划的明细信息
    planById: '/eqInspectPlan.do?getPlanById',
    // 查询核查计划的设备条目明细
    planDetail: '/eqInspectPlan.do?datagridPlanDetail',
    // 保存期间核查计划
    savePlan: '/eqInspectPlan.do?savePlan',
    // 删除期间核查计划
    delPlan: '/eqInspectPlan.do?delPlan',
    // 提交核查计划
    submitUrl: '/eqInspectPlan.do?submitPlanAudit',
  },
  // 设备管理-期间核查记录
  equipInspectRecord: {
    // 设备期间核查记录列表查询
    list: '/eqInspect.do?datagrid',
    // 查询设备期间核查记录详细信息
    detailById: '/eqInspect.do?getById',
    // 保存期间核查信息
    saveInspect: '/eqInspect.do?saveInspect',
    // 删除期间核查信息
    delInspect: '/eqInspect.do?delInspect',
    // 提交核查计划
    submitUrl: '/eqInspect.do?submitInspect',
  },
  // 设备管理-保养计划
  equipUpkeepPlan: {
    // 查询设备计划列表
    list: '/eqUpkeepPlanController.do?datagrid',
    // 查询计划详情
    getPlanById: '/eqUpkeepPlanController.do?getPlanById',
    // 查询计划设备明细
    datagridPlanDetail: '/eqUpkeepPlanController.do?datagridPlanDetail',
    // 保存设备计划
    savePlan: '/eqUpkeepPlanController.do?savePlan',
    // 删除计划
    delPlan: '/eqUpkeepPlanController.do?delPlan',
    // 提交核查计划(到审核流程)
    submitUrl: '/eqUpkeepPlanController.do?submitPlanAudit',
  },
  // 设备管理-保养登记 记录
  equipUpkeepRecord: {
    // 查询设备列表
    list: '/eqUpkeepController.do?datagrid',
    // 查询计划详情
    getById: '/eqUpkeepController.do?getById',
    // 保存设备记录
    saveUrl: '/eqUpkeepController.do?save',
    // 删除计划
    delById: '/eqUpkeepController.do?delById',
    saveByPlan: 'rest/eqUpkeepController?plan',
    batchEdit: 'rest/eqUpkeepController?batchSave',
  },
  // 设备管理- 设备维修管理
  equipRepair: {
    // 查询设备维修记录列表
    list: '/eqRepairController.do?queryList',
    // 查询维修详情
    getById: '/eqRepairController.do?getById',
    // 保存设备维修信息
    saveRepair: '/eqRepairController.do?saveRepair',
    // 保存设备维修的外联信息
    saveRepairContact: '/eqRepairController.do?saveRepairContact',
    // 保存设备维修明细信息
    saveRepairDetail: '/eqRepairController.do?saveRepairDetail',
    // 保存设备维修检验信息
    saveRepairVerify: '/eqRepairController.do?saveRepairVerify',
    // 删除维修记录
    delRepair: '/eqRepairController.do?delRepair',
    // 维修信息提交审核
    submitRepair: '/eqRepairController.do?submitRepair',
    // 验收信息提交审核
    submitRepairVerify: '/eqRepairController.do?submitRepairVerify',
  },
  // 设备管理- 设备调拨管理
  equipAllocation: {
    // 查询列表
    list: '/eqAllotController.do?datagrid',
    // 查询详情
    getById: '/eqAllotController.do?getById',
    // 保存
    saveUrl: '/eqAllotController.do?saveAllot',
    // 删除
    delById: '/eqAllotController.do?delById',
    // 提交信息(到审核流程)
    submitUrl: '/eqAllotController.do?submitAllot',
  },
  // 设备管理- 设备调拨申请管理
  equipAllotApply: {
    // 组织机构
    projectOrg: '/rest/eqTransfer/projectOrg/list',
    // 人员列表
    userList: '/rest/userRelation/list', //  项目负责人
    departUsers: '/rest/departController/principal', // 部门人员
    departAllUsers: '/rest/departController/allUsers', // 部门人员
    pageList: '/rest/eq/transfer/apply/dataGrid', // 列表
    senderList: '/rest/eq/transfer/apply/dataGrid/sender', // 待寄送列表
    confirmList: '/rest/eq/transfer/apply/dataGrid/confirm', // 待确认列表
    save: '/rest/eq/transfer/apply/save', // 新增、更新
    detail: '/rest/eq/transfer/apply/get', // 详情
    delete: '/rest/eq/transfer/apply/del', // 删除
    submit: '/rest/eq/transfer/apply/submit', // 提交审核
    submitCheck: '/rest/eq/transfer/apply/submit/check', // 提交验证
    changeEq: '/rest/eq/transfer/apply/change', // 修改设备
    sender: '/rest/eq/transfer/apply/sender', // 寄送
    confirm: '/rest/eq/transfer/apply/confirm', // 确认
    registration: '/rest/eq/transfer/apply/confirm/registration', // 登记
    delEq: '/rest/eq/transfer/apply/eq/del', // 待邮寄-移除设备
  },
  // 设备管理- 设备启停管理
  equipStartStop: {
    // 查询列表
    list: '/eqStartstopController.do?datagrid',
    // 查询详情
    getById: '/eqStartstopController.do?getById',
    // 保存
    saveUrl: '/eqStartstopController.do?saveStartstop',
    // 删除
    delById: '/eqStartstopController.do?delById',
    // 提交信息(到审核流程)
    submitUrl: '/eqStartstopController.do?submitStartstop',
  },
  // 设备管理- 设备租借
  equipRent: {
    // 查询列表
    list: '/eqRentController.do?datagrid',
    // 查询详情
    getById: '/eqRentController.do?getById',
    // 保存
    saveUrl: '/eqRentController.do?saveRent',
    // 删除
    delById: '/eqRentController.do?delById',
    // 提交信息(到审核流程)
    submitUrl: '/eqRentController.do?submitRent',
  },
  // 设备管理- 设备报废管理
  equipScrap: {
    // 查询列表
    list: '/eqScrapController.do?datagrid',
    // 查询详情
    getById: '/eqScrapController.do?getById',
    // 保存
    saveUrl: '/eqScrapController.do?saveScrap',
    // 删除
    delById: '/eqScrapController.do?delById',
    // 提交信息(到审核流程)
    submitUrl: '/eqScrapController.do?submitScrap',
  },
  // 主题管理
  dataCollection: {
    // 新增/编辑主题
    operation: '/dataCollectionController/addOrUpdateData.do',
    // 主题列表
    list: '/dataCollectionController/dataGrid.do',
    // 主题详情
    detail: '/dataCollectionController/getDetail.do',
    // 删除主题
    delete: '/dataCollectionController/deleteData.do',
    // 结束主题
    end: '/dataCollectionController/endData.do',
    // 新增节点
    addNode: '/dataCollectionController/addOrUpdateNode.do',
    // 获取可选人员
    getPerson: '/dataCollectionController/queryContentPerson.do',
    // 编辑节点
    operationNode: '/dataCollectionContentController/addOrUpdateNodeContent.do',
    // 主题资料上报
    reportList: '/dataCollectionController/dataGridUpload.do',
    // 主题内容附件新增
    addFile: '/dataCollectionContentController/saveAttachment.do',
    // 附件删除
    deleteFile: '/dataCollectionContentController/deleteAttachment.do',
    // 自定义字段列表
    customFields: '/biddingCustomizeColumnController/queryColumn.do',
    // 自定义字段新增
    addCustomField: '/biddingCustomizeColumnController/addUpdateColumn.do',
    // 自定义字段删除
    deleteCustomField: '/biddingCustomizeColumnController/deleteColumn.do',
    // 删除时间节点
    deleteNode: '/rest/dataCollectionController/deleteNode',
    // 配置项新增
    addQuote: '/rest/dataCollectionConfigurationController/add',
    // 配置项修改
    updateQuote: '/rest/dataCollectionConfigurationController/update',
    // 配置项删除
    delQuote: '/rest/dataCollectionConfigurationController',
    // 配置项列表
    listQuote: '/rest/dataCollectionConfigurationController/list',
  },
  // 检测任务量统计
  testTaskStatistic: {
    getData: '/rest/statistic/task/count',
    getDepartment: '/orgController.do?departgrid',
  },
  // 试验检测结果统计分析
  testResultStatistic: {
    getData: '/rest/statistic/result/info',
    getTree: '/bigCategoryController.do?comboTreeSync',
    getSampleData: '/testSampleController.do?getSampleComboTreeByBigCategory',
  },
  // 检测超期统计
  testOverStatistic: {
    getData: '/rest/statistic/overDuo/info',
    detail: '/rest/statistic/overDuo/detail/list',
    export: '/rest/statistic/overDuo/export',
    detail_export: '/rest/statistic/overDuo/detail/export',
  },
  // 不合格试验台账管理
  disqualification: {
    getData: '/rest/disqualification/list',
    export: '/rest/disqualification/export',
  },
  // 单位业绩管理
  biddingPerformance: {
    // 业绩新增/修改
    operation: '/biddingPerformanceController/addOrUpdate.do',
    // 业绩列表
    getData: '/biddingPerformanceController/dataGrid.do',
    // 业绩删除
    delete: '/biddingPerformanceController/delete.do',
    // 自定义字段列表
    customFields: '/biddingCustomizeColumnController/queryColumn.do',
    // 自定义字段新增
    addCustomField: '/biddingCustomizeColumnController/addUpdateColumn.do',
    // 自定义字段删除
    deleteCustomField: '/biddingCustomizeColumnController/deleteColumn.do',
    // 附件目录新增
    addFile: '/biddingFolderController/addUpdateFolder.do',
    // 附件目录删除
    deleteFile: '/biddingFolderController/deleteFolder.do',
    // 附件目录树
    fileTree: '/biddingFolderController/queryFolderTree.do',
    // 附件目录附件
    getFolder: '/biddingFolderController/queryFolderAttach.do',
    // 附件新增
    addAttach: '/biddingAttachmentController/addAttach.do',
    // 附件删除
    deleteAttach: '/biddingAttachmentController/deleteAttach.do',
  },
  // 人员信息管理
  biddingPerson: {
    // 列表
    list: '/biddingPersonController/dataGrid.do',
    // 人员新增/修改
    person: '/biddingPersonController/addOrUpdate.do',
    // 人员删除
    delete: '/biddingPersonController/delete.do',
    // 人员详情
    personDetail: '/biddingPersonController/detail.do',
    // 人员证书列表
    certificateList:
      '/biddingPersonCertificateController/queryCertificateList.do',
    // 人员证书新增/修改
    certificate: '/biddingPersonCertificateController/addOrUpdate.do',
    // 人员证书删除
    certificateDelete: '/biddingPersonCertificateController/delete.do',
    // 业绩列表
    personPerformanceList:
      '/biddingPersonPerformanceController/queryPerformanceList.do',
    // 业绩新增/修改
    personPerformance: '/biddingPersonPerformanceController/addOrUpdate.do',
    // 业绩删除
    personPerformanceDelete: '/biddingPersonPerformanceController/delete.do',
    // 人员引用记录
    record: '/biddingPersonController/queryQuoteRecord.do',
    // 导入
    import: '/rest/biddingPersonController/import',
    // 下载
    download: '/rest/biddingPersonController/export',
  },
  // 投标记录管理
  biddingRecord: {
    // 投标记录新增/修改
    operation: '/biddingRecordController/addOrUpdate.do',
    // 设置中标单位
    setWinUnit: '/biddingRecordController/setWinUnit.do',
    // 投标记录列表
    list: '/biddingRecordController/dataGrid.do',
    // 投标记录详情
    detail: '/biddingRecordController/detail.do',
    // 投标记录删除
    delete: '/biddingRecordController/delete.do',
    // 投标单位新增/编辑
    unitOperation: '/biddingRecordUnitController/addOrUpdate.do',
    // 投标单位删除
    deleteUnit: '/biddingRecordUnitController/delete.do',
    // 投标单位列表
    unitList: '/biddingRecordUnitController/dataGrid.do',
    // 投标记录引用人员新增/修改
    personOperation: '/biddingRecordPersonQuoteController/addOrUpdate.do',
    // 投标记录引用人员删除
    personDelete: '/biddingRecordPersonQuoteController/delete.do',
    // 投标记录引用人员列表
    personList: '/biddingRecordPersonQuoteController/dataGrid.do',
    // 投标记录引用业绩新增/修改
    performanceOperation:
      '/biddingRecordPerformanceQuoteController/addOrUpdate.do',
    // 投标记录引用业绩删除
    performanceDelete: '/biddingRecordPerformanceQuoteController/delete.do',
    // 投标记录引用业绩列表
    performanceList: '/biddingRecordPerformanceQuoteController/dataGrid.do',
  },
  // 邮寄单配置
  mailListConfig: {
    list: '/rest/post/list',
    operation: '/rest/post/info',
    delete: '/rest/post',
  },
  // 消息通知
  weChatNotice: {
    list: '/rest/msgHistory/list',
    detail: '/rest/msgHistory/getById',
    markRead: '/rest/msgHistory/markRead',
  },
  // 数据采集上报
  reportingDataCollection: {
    fileds: '/rest/dataGatherField/fields', // 获取所有字段
    push: '/rest/dataGather/push/', // 上报
    pushAll: '/rest/dataGather/push/all/', // 一键上报
    getTaskInfo: '/rest/dataGather/task/info/',
  },
  // 力学数据采集
  mechanicsDataCollection: {
    list: '/dataGather/dataGrid.do',
    getTypeData: '/dataGatherTestTypeController/getTestTypeAll.do',
  },
  testingDataCollection: {
    list: '/dataGatherTestSiteController/dataGrid.do',
    update: '/dataGatherTestSiteController/update.do',
    // download: "/dataGatherTestSiteController/downloadFile.do"
    download: '/FolderController.do?downloadFile',
  },
  // 账号信息
  userBasicInfo: {
    // 获取用户基本信息
    getData: '/userController.do?getCurrentUser',
    // 更新用户信息
    update: '/userController.do?updateUserBasicInfo',
    // 修改密码
    changePassword: '/userController.do?savenewpwd',
    // 实例化绑定微信的二维码信息
    getBindWechatInfo: '/rest/wechatLoginController/getQrCodeInfoBind',
    // 绑定结果
    getBindResult: '/rest/wechatLoginController/weChatBind',
    // 查询三方平台绑定信息集合
    getBindData: '/rest/thirdPartyController/curUserThirdPartyList',
    // 解绑/作废三方绑定信息
    cancelBind: '/rest/thirdPartyController/invalidThirdPartyUser',
    // 查询全部消息类型
    msgList: '/rest/msgType/list',
    // 开启某消息开关
    msgSwitchON: '/rest/msgType/currentUserMsgSwitchON',
    // 查询当前用户的消息开关
    userMsg: '/rest/msgType/currentUserMsgSwitchList',
    // 关闭某消息开关
    msgSwitchOFF: '/rest/msgType/currentUserMsgSwitchOFF',
  },
  // 参数版本管理
  parameterVersion: {
    // 参数版本列表
    getData: '/paramVersionManagementController/list.do',
    // 版本新增修改
    addUpdate: '/paramVersionManagementController/addOrUpdate.do',
    // 版本删除
    delete: '/paramVersionManagementController/delete.do',
    // 启用参数版本
    enableVersion: '/paramVersionManagementController/enableVersion.do',
    // 复制版本
    copyVersion: 'paramVersionManagementController/copyVersion.do',
    // 获取进度对应的key
    getBusinessKey: 'rest/progressMsg/getBusinessKey',
    // 获取复制进度
    copyProcess: 'rest/progressMsg/getProgressMsg',
  },
  // 委托信息统计 数量，费用
  consignInfoStatistic: {
    getCountData: '/rest/statistic/consign',
    getFeeData: '/rest/statistic/consign-fee',
  },
  // 收样走势图
  consignSampleStatistic: {
    getData: '/rest/statistic/consign',
    getTreeData: '/bigCategoryController.do?datagrid',
  },
  // 收费统计
  chargeStatistic: {
    getData: '/rest/statistic/fee',
  },
  // 欠费统计
  arrearsStatistic: {
    getData: '/rest/statistic/bills',
  },
  // 合同费用统计
  contractCostStatistic: {
    getData: '/rest/statistic/annual-contract-fee',
  },
  // 检测参数覆盖统计
  testParameterStatistic: {
    getData: '/rest/statistic/test-param-coverage',
  },
  // 收样样品分类统计
  consignCollectionStatistic: {
    getData: '/rest/statistic/category-sample-count',
    detail: '/rest/statistic/category-sample-detail',
  },
  // 检测产值统计
  testOutputStatistic: {
    getData: '/rest/statistic/task-work-price',
  },
  // 报告打印统计
  reportPrintStatistics: {
    getData: '/rest/statistic/print/count',
  },
  // 报告发放统计
  reportGrantStatistics: {
    getData: '/rest/statistic/reportIssueWayStat',
  },
  // 检测模板更新
  testTemplate: {
    // 获取 检测模板更新列表 GET
    list: '/rest/udrVersionController/list',
    // 获取 修改版本列表 GET
    versionList: '/rest/udrVersionController/versionList',
    // 获取 表头表尾列表 GET
    headTailInfo: '/rest/udrVersionController/headTailInfo',
    // 同步数据中心表头定制信息 GET
    synInfoList: '/rest/udrVersionController/synInfo',
    // 获取资质列表接口 POST
    getDict: '/systemController.do?getDictContent',
    // 模板更新 POST
    updateVersion: '/rest/udrVersionController/updateVersion',
    // 表头表尾更新 POST
    updateHeadTail: '/rest/udrVersionController/updateHeadTail',
    // 获取任务数据集
    getRecordSets: '/rest/udrVersionController/getRecordSets',
    // 数据集同步或新增
    synRecordSet: '/rest/udrVersionController/synRecordSet',
    // 获取单位信息
    getUnitInfo: '/rest/udrVersionController/getUnitInfo',
    // 删除数据集
    delRecordSet: '/rest/udrVersionController/delete/record-set',
  },
  // 编号修改
  snModification: {
    list: '/rest/snHistoryController/list',
    editUrl: '/rest/snHistoryController/editSn',
    // snType: '/tSnCategoryController.do?getSnCategoryUser',
    snType: '/tSnCategoryController.do?getAllSnCategory',
    // 获取样品编号
    sampleUrl: '/rest/consignController/parsStringToCodes',
    // 获取来样编号编号
    ptcSampleUrl:
      '/rest/consignController/parsStringToProvideToCustomerSampleCodes',
    // 获取样品编号
  },
  //  udr表格空白区域设置
  udrBlankDraw: {
    list: '/rest/udrBlankDrawTypeController/list',
    addEditUrl: '/rest/udrBlankDrawTypeController',
    delUrl: '/rest/udrBlankDrawTypeController',
  },
  // 系统图标
  iconList: {
    list: '/rest/iconController/dataGrid',
    saveOrUpdateIcon: '/rest/iconController/saveOrUpdateIcon',
    delUrl: '/rest/iconController',
  },
  // 资料归档
  archiving: {
    // 查询模板列表
    listTemplate: '/documentTemplateController.do?getAll',
    saveTemplate: '/documentTemplateController.do?saveTemplate',
    delTemplate: '/documentTemplateController.do?delTemplate',
    // 查询模板目录列表
    getFolderTemplate: '/documentTemplateFolderController.do?getAllByTemplate',
    saveFolderTemplate: '/documentTemplateFolderController.do?saveFolder',
    delFolderTemplate: '/documentTemplateFolderController.do?delFolder',
    // 查询目录下全部资料项
    listItem: '/documentTemplateItemController.do?getAllByFolder',
    saveItem: '/documentTemplateItemController.do?saveItem',
    delItem: '/documentTemplateItemController.do?delItem',
    // 查询全部分组
    getAll: '/documentGroupController.do?getAll',
    saveGroup: '/documentGroupController.do?saveGroup',
    delGroup: '/documentGroupController.do?delGroup',
    // 查询档案列表
    list: '/documentController.do?datagrid',
    getById: '/documentController.do?getById',
    saveDocument: '/documentController.do?saveDocument',
    delDocument: '/documentController.do?delDocument',
    complete: '/documentController.do?complete',
    downloadData: '/documentController.do?downloadData',
  },
  archivingDetail: {
    // 归档详情模板引用
    getTemplate: '/rest/documentDetailFolderController/citation/template',
    addFolder: '/rest/documentDetailFolderController/add',
    updateFolder: '/rest/documentDetailFolderController/update',
    delFolder: '/rest/documentDetailFolderController',
    treeFolderList: '/rest/documentDetailFolderController/treeList',
    // 新增资料项
    addMaterial: '/rest/documentDetailItemController/add',
    updateMaterial: '/rest/documentDetailItemController/update',
    deleteMaterial: '/rest/documentDetailItemController',
    // 资料项多级列表查询
    listMaterial: '/rest/documentDetailItemController/list',
    // 新增档案
    addArchives: '/rest/documentDetailItemDataController/add',
    updateArchives: '/rest/documentDetailItemDataController/update',
    delArchives: '/rest/documentDetailItemDataController',
    // 资料项周期编辑
    updateCycleTime: '/rest/documentDetailItemCycleController/update',
    delCycleTime: '/rest/documentDetailItemCycleController',
    // 标记为未归档
    unMarkUrl: '/rest/documentDetailItemDataController/un/mark',
    markUrl: '/rest/documentDetailItemDataController/mark',
    // 当前需要归档的资料
    mtodoDataUrl: '/rest/documentDetailItemDataController/todoData',
    // 获取doucment下综合项目ids
    getSyProjects: '/rest/documentController/getSyProjects',
    // 查询关联报告归档情况
    getReport: '/documentController.do?getReportArchiveStatus',
  },
  // 检测报告台账
  reportStandingBook: {
    list: '/rest/reportStandingBook/list',
    // 导出
    export: '/rest/reportStandingBook/export',
    // 编号类别
    snType:
      '/tSnCategoryController.do?datagrid&field=id,createName,createBy,createDate,updateName,updateBy,updateDate,sysOrgCode,sysCompanyCode,bpmStatus,name,remarks,pid,isDefault,orgNames,',
  },
  // A4纸资质章
  qualificationSeal: {
    getDetail: '/rest/qualificationLocation/detail',
    addUpdate: '/rest/qualificationLocation',
    getDetailSC: '/rest/report/security-code/',
    addUpdateSC: '/rest/report/security-code',
  },
  // 参数脚本
  parameterScript: {
    list: '/rest/param/fee/scripts',
    addUrl: '/rest/param/fee/script',
    getById: '/rest/param/fee/script',
    updateUrl: '/rest/param/fee/script',
    delById: '/rest/param/fee/script',
  },
  // 生产产值统计
  productionValueStatistics: {
    list: 'rest/statistic/productionValue',
    // 导出 二进制
    exportUrl: 'statisticalController.do?exportProductionValue',
  },
  // 自定义列
  customColumn: {
    getUrl: '/rest/common/columns',
    updateUrl: '/rest/common/columns',
    reset: '/rest/common/default-columns',
    // 获取默认列
    getDefaultColumns: '/rest/common/default-columns',
    // 获取已选列
    getSelectColumns: '/rest/common/chosen-columns',
    // 重置
    resetColumns: '/rest/common/actions/reset',
    // 保存列
    saveColumns: '/rest/common/columns',
  },
  // 单位分包
  unitSubcontract: {
    listUrl: '/rest/subcontractUnit/list',
    // 分包单位新增 post，json
    addUpdateUrl: '/rest/subcontractUnit',
    // 删除 /rest/subcontractUnit/{id} delete
    delUrl: '/rest/subcontractUnit/batch-delete',
    getIdUrl: '/rest/subcontractUnit/detail',
  },
  subcontractManage: {
    // 查询分包列表
    datagridList: '/rest/subcontractController/datagrid',
    saveUrl: '/rest/subcontractController/save',
    // 批量设置分包状态
    modifyStatus: '/rest/subcontractController/modifyStatus',
    detailUrl: '/rest/subcontractController/detail',
    // 保存分包报告
    saveScReport: '/rest/subcontractController/saveScReport',
    // 删除分包报告
    delScReport: '/rest/subcontractController/delScReport',
  },
  sample: {
    // 样品流转处理
    dispose: '/objectDisposeController.do?dispose',
  },
  // 台账设置
  ledgerSetting: {
    // 获取台账分类，树形结构
    getTree: '/rest/ledger/categories',
    // 新增台账分类 post put
    addUpdateClass: '/rest/ledger/category',
    delClass: '/rest/ledger/category',
    // 获取台账分类
    getData: '/rest/ledger/category/ledger-profile',
    delLedger: '/rest/ledger',

    getById: '/rest/ledger',
    // 新增台账 post put
    addUpdateLedger: '/rest/ledger',
    // 新增台账条件，有必填项检查
    addUpdateCondition: '/rest/ledger/condition',
    delCondition: '/rest/ledger/condition',
  },
  // 台账管理
  ledgerManagement: {
    // 根据分类获取台账，用于台账管理中用户使用台账。此接口将根据用户角色权限过滤。
    getCondition: 'rest/ledger',
    getTree: '/rest/ledger/combine-tree',
    // /rest/ledger/{id}/result
    resultUrl: '/rest/ledger',
    // /rest/ledger/{id}/document
    exportUrl: '/rest/ledger',
  },
  departmentParams: {
    // 获取已选择权限大类
    dataSourceT: '/bigCategoryController.do?comboTreeSelect',
    // 获取所选部门所选大类下已勾选的参数id
    dataSource: '/rest/system-config/department-params',
    // 所选部门添加参数
    addDepartmentParams: '/rest/system-config/department-params',
  },
  taskAllocationDepartment: {
    // 批量样品指定部门
    setDepartments: '/rest/object/distributions',
    // 获取委托样品分配详情
    getConsignDistribute: '/rest/consign/object-distribute',
    // 获取部门检测人员
    // getDepartUsers: '/taskAssignedController/getDepartUsers.do',
    getTree: '/rest/department/tree',
  },
  videoMonitorConfig: {
    // POST 设备保存
    saveUrl: '/rest/labConfig/save',
    // GET 获取设备列表
    getById: '/rest/labConfig/list',
    // GET 获取自定义字段
    getColumns: '/rest/labConfig/getColumns',
  },
  editSample: {
    sampleTree: '/testSampleController.do?getSampleComboTreeByTestParams',
    units:
      '/systemController.do?typeGrid&typegroupid=8a8ab0b246dc81120146dc8181c3006d&field=id,typename,typecode,sourceFrom',
    testObject: '/testTaskController/getTestObject.do',
    otherInfo: '/testObjectOtherInfoController.do?getTestObjectOtherInfo',
    profile: '/rest/specification/config',
    systemFields:
      'systemController.do?typeGrid&typegroupid=99064352841138306&field=id,typename,typecode,sourceFrom,orderNumber',
    sampleProfile: '/rest/sample/other-info',
    specificationProfile: '/rest/specification/saveOrUpdate',
  },
  printConfig: {
    configCatalogs: '/rest/system/print/catalogs',
    configurations: '/rest/system/print/configurations',
    configurationsStatus: '/rest/system/print/configurations/state',
  },
  acquisitionFieldConfiguration: {
    enableModifyTestData: `/rest/dataGatherTestTypeController/enable-modify`,
  },
  signConfig: {
    default: `rest/signOrderConfig`,
    list: `rest/signOrderConfig/list`,
    dictContent: `systemController.do?getDictContent`,
    saveDictContent: `rest/signer/saveServer`,
    signService: `rest/signer/sign-service`,
    signType: `rest/systemProperty/sign-type`,
    configure: 'rest/deed/configure',
    userList: 'rest/signer/user/list',
    systemProperty: 'rest/systemProperty',
    createUser: 'rest/deed/user/create',
    userAuth: 'rest/deed/user/auth',
    userAuthStatus: 'rest/deed/user/auth/status',
  },
  reportFile: `/api/exam/report-file`,
  getFile: `/api/exam/open-file`,
  getBusinessParam: `tSBusinessParamController.do?getBusinessParam`,
  // 项目产值统计
  projectProduction: {
    pageList: 'rest/project/output/page',
    config: 'rest/project/output/config',
    export: 'rest/project/output/export',
  },
  // 状态标记
  statusMarker: {
    list: `markObjectColorTextController.do?listByManagePage`,
    detail: `markObjectColorTextController.do?getById`,
    delete: `markObjectColorTextController.do`,
    save: `markObjectColorTextController.do?addOrUpdate`,
  },
  // 平台看板
  platform: {
    orgOverview: 'rest/dash/material/org-overview', // 机构概况
    manageOverview: 'rest/dash/material/manage-overview', // 运营概况
    consignLineChart: 'rest/dash/material/{cycle}/consign-line-chart', // 委托趋势
    personOutput: 'rest/dash/material/person-output', // 个人产值排行
    deptOutput: 'rest/dash/material/dept-output', // 部门产值排行
    sampleStatistics: 'rest/dash/material/sample-statistics',
    reportStatistics: 'rest/dash/material/report-statistics',
    qualifiedRate: 'rest/dash/material/qualified-rate',
  },
  // 培训管理
  trainMgr: {
    list: 'trainPlanController.do?datagrid', // 培训计划列表
    save: 'trainPlanController.do?save', // 保存、编辑计划
    submit: 'trainPlanController.do?submit', // 提交计划
    revoke: 'trainPlanController.do?revoke', // 撤回计划
    delete: 'trainPlanController.do?del', // 删除计划
    detail: 'trainPlanController.do?getById', // 培训计划详情
    recordList: 'trainRecordController.do?datagrid', // 记录列表
    recordSave: 'trainRecordController.do?save', // 新增、修改记录
    recordDel: 'trainRecordController.do?del', // 删除记录
    fileList: 'trainRecordFileController.do?datagrid', // 培训资料列表
    fileSave: 'trainRecordFileController.do?save', // 新增培训资料
    fileDel: 'trainRecordFileController.do?del', // 删除培训资料
  },
  // 手簿离线数据管理
  offlineDataManage: {
    list: '/rest/handbook/record/list', // 离线数据列表
    detail: '/rest/handbook/record/detail', //  详情 url/${recordId}
    edit: '/rest/handbook/record/edit', //  编辑udr
    delete: '/rest/handbook/record', // 删除 url/${recordId}
    import: '/rest/handbook/record/task/import', // 导入离线数据 url/{recordId}
    selTaskImport: '/rest/handbook/record/select/task/import', // 选择任务导入指定数据
    testTaskList: '/rest/handbook/record/handbook/task/list', // 离线数据关联任务,任务待选列表
    paramsCompare: '/rest/handbook/record/params/compare', // 任务和离线数据参数比较
    getTemplates: '/rest/handbook/record/templates', // 获取的离线数据的pc端模板 url/{recordId}
    uploadUser: '/rest/handbook/record/upload/user', // 获取离线任务上传人 url?status=''|10|20|30
    logList: '/rest/tSLogProcessController?getProcessLogList', // 离线数据日志列表 url&objectType=5&objectId=&relationQry=true
    offlineLog: '/rest/handbook/error/log/list', // app上报的操作日志
    downloadLog: '/uploadController.do?download', // 下载文件
  },
  qrCodeConfig: {
    list: '/rest/barcode/list', // 配置列表
    update: '/rest/barcode/update', // 配置项更新
    shown: '/rest/barcode/shown', // 列表直接设置是否显示
    sort: '/rest/barcode/sequence', // 配置列表排序
  },
  completionDataConfig: {
    // 获取配置工程项目列表
    projectsList: '/rest/document/report/projects',
    // 获取合同段
    getContracts: '/rest/synthesis/contracts',
    // 获取工程项目关联的委托单位
    getConsignUnits: '/rest/project/consign-units',

    // 新增、编辑系统配置
    addUpdateSystemProfile: '/rest/document/report/system-profile',
    delSystemProfile: '/rest/document/report/system-profile',
    listSystemProfile: '/rest/document/report/system-profiles',

    // 新增项目配置
    addPutProjectProfile: '/rest/document/report/project-profile',
    delProjectProfile: '/rest/document/report/project-profile',
    listProjectProfile: '/rest/document/report/project-profiles',
  },
  completionDataDetail: {
    list: '/rest/document/report/detail',
    getTree: '/rest/synthesis/nav/tree',
    tableReport: '/rest/document/report/files',
    treeReport: '/rest/document/report/menus',
    synthesisLog: '/rest/document/report/logs',
    validation: '/rest/document/report/validation',
    subUnitProjects: '/rest/document/report/sub-unit-projects',
  },
  completionDataList: {
    // 系统配置
    list: '/rest/document/report/details',
  },
  electronicLabel: {
    getList: '/rest/rfid/records',
    import: '/rest/rfid/file',
    template: '/rest/rfid/template',
    records: '/rest/rfid/records',
    rfid: '/rest/rfid',
    log: '/rest/rfid/records/log',
  },
  equipmentAuthManage: {
    // 查询物联网设备列表
    list: '/equipmentNewController.do?datagrid',
    // 查询设备已授权的人员ID集合
    authUserUrl: '/rest/eqIotAuth/authUserIds',
    saveAuthUrl: '/rest/eqIotAuth/saveAuth',
  },
  equipmentAuthRecord: {
    // 查询设备鉴权记录列表
    list: '/rest/eqIotAuthRecord/getAuthRecords',
  },
  objectProcessStoragePage: {
    // 批量入库
    putStorage: '/waitStorageObjectController.do?putStorage',
    // type=QRcode &type=scanRFID type=warehousingAdd
    // 根据RFID批量查询样品信息
    scanRFIDUrl: '/waitStorageObjectController.do?getProcessObjectByRFIDs',
    // 通过二维码查询样品信息
    QRcodeUrl: '/waitStorageObjectController.do?getProcessObjectByQrCode',
    // 通过标签编号查询样品信息
    byLabelUrl: '/waitStorageObjectController.do?getProcessObjectByLabelId',
    list: '/waitStorageObjectController.do?datagrid',
  },
  reportCopyList: {
    // 报告副本
    reportCopy: '/rest/report-copy',
  },
  samplingManage: {
    // 取样大类
    getSamplingCategory: '/rest/sampleCategory/list',
    // 取样样品
    getSamplingSample: '/rest/categorySysSample/list',
    // 获取样品辅助信息
    getTestOtherInfo: '/testParamController.do?getTestOtherInfo',
    // 取样
    sample: '/rest/extract/sample',
    // 列表
    getSampleList: '/rest/extract/samples',
    // 标签记录
    labelRecordList: '/rest/extract/sample/rfids',
    // 获取电子标签
    getLabelId: '/rest/rfid',
    // 获取取样大类树
    getSamplingCategoryTree: '/rest/sampleCategory/tree',
    // 变更电子签名
    changeRecord: '/rest/rfid/record',
    // 作废电子签名
    deleteRfid: '/rest/rfid',
    // 取样标段树
    projectTree: '/rest/project/tree',
    // 根据工程项目获取委托单位
    getConsignUnitByProject: '/projectController.do?getProjectConsignUnits',
    // 根据工程项目获取送样人
    getSenderByUnit: '/consignUnitController.do?getConsignUnitSampleSenders',
    // 获取参数
    getTestParamByTestSample: '/testParamController.do?getTestParamByTestSample',
    // 获取收费标准版本
    paramPriceStandards: '/rest/param-price/standards',
  },
  snSerialNum: {
    // 获取页面权限
    list: '/rest/snSerialNum/getSnTerms',
    // 获取当前掩码获取使用最大流水号
    getSnNum: '/rest/snSerialNum/getSnNum',
    // 设置编号流水号
    setSnNum: '/rest/snSerialNum/setSnNum',
  },
  storageList: {
    ByRFIDsUrl: 'periodStorage.do?getPeriodByRFIDs',
    // 通过二维码查询样品信息
    QRcodeUrl: 'periodStorage.do?getPeriodByQrCode',
    // 通过标签编号查询样品信息
    byLabelUrl: 'periodStorage.do?getPeriodByLabelId',
    list: '/rest/periodStorage/getPager',
    storageInOut: 'rest/periodStorage/storageInOut',
    waitStorageIn: `/rest/periodStorage/waitStoragePeriods`,
    // 编辑入库记录
    editStorageIn: '/rest/periodStorage',

  },
  testCategory: {
    // 获取检测类别大类
    getCategories: '/rest/system-config/inspect/categories',
    // 新增、编辑检测类别大类
    addUpdateCategory: '/rest/system-config/inspect/category',
    delCategory: '/rest/system-config/inspect/category',
    // 获取大类下的检测类别
    getInspects: '/rest/system-config/inspects',
    doUpdateInspects: '/checkTypeController.do?doUpdate',
    doAddInspects: '/checkTypeController.do?doAdd',
    doDelInspects: '/checkTypeController.do?doDel',
  },
  testPieceManage: {
    list: '/rest/periodController/getPager',
  },
}

export default api
