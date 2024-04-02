// noinspection ThisExpressionReferencesGlobalObjectJS
let $global = this
udr.debugMode = udr.startParams.get('debug')
udr.debugMode && udr.startHttpServer(60001)
const taskId = udr.startParams.get('taskId')
const dbName = udr.startParams.get('dbName')
$global.TIS_UDR_ServerURL = udr.startParams.get('TIS_UDR_ServerURL')
$global.TIS_UDR_IsPrintEmptyTable = 0
$global.g_bool_PrintEmptyTable_RWList = 0
$global.Is_Control_Code = 0

if (!udr.sheets.supportAdoRs) {
  udr.toast('当前模板不支持保存到数据集')
}

const db = udr.openDatabase(dbName)
const recordSets = db.query('select * from task_recordset where taskId = ?', [taskId]).map(transform)

function transform(record) {
  const conf = {
    saveType: 'xml',
    name: record.name,
    data: record.xml,
  }
  switch (record.name) {
    case '检验参数值':
    case '检验指标值':
      conf.autoInitGroupCount = true
      conf.initTaskId = taskId
      // todo
      conf.initShiJianId = ''
      break
    case '收费参数':
      delete conf.data
      conf.schemaXml = record.xml
      conf.sql = `select testParamDisplayName as '参数名称', testParamId as '参数ID', 1 as '组数', 1 as '检测次数'
                from task_param
                where taskId = ${taskId}`
      break
  }
  return conf
}
// noinspection JSAnnotator
return {
  OnFileOpen() {
    initRecordsets(recordSets)
    loadUdrOtherState()
  },
  OnBeforeSave() {

    //2、保存单元格状态
    saveUdrOtherState()

    //3、兼容udr模板操作，保存后设置
    WriteBind('0', '任务单信息', '第一次打开模板', 1)
  },
  OnFileOpenAfter() {
    //调用模板提供的函数：根据收样参数控制表单
    if ($global.setSheetsVisivleWithCharge) {
      $global.setSheetsVisivleWithCharge()
    }
  },
  //表单加载完成事件：完成针对表单的初始化
  OnSheetLoaded(sheet) {
    //调用模板提供的函数：根据收样参数控制区域
    if ($global.setRangeVisivleWithCharge) {
      $global.setRangeVisivleWithCharge(sheet)
    }
  },
  DoSaveData() {
    for (let recordset of recordSets) {
      let rs = udr.sheets.recordsets.item(recordset.name)
      if (!rs.opened) continue
      let xml = rs.toXml()
      if (!xml) {
        console.log(`${recordset.name} 未能生成XML`)
        continue
      }
      console.log(`开始保存数据集：${recordset.name}`)
      db.execSQL(`update task_recordset set xml = ? where taskId = ? and name = ?`, [xml, taskId, recordset.name])
      console.log(`数据集：${recordset.name} 保存成功`)
    }
    db.execSQL(`update task set status = 'edited' where id = ?`, [taskId])
    udr.toast('保存成功！')
  }
}
