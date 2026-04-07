// noinspection ThisExpressionReferencesGlobalObjectJS
let $global = this
udr.debugMode = udr.startParams.get('debug')
udr.debugMode && udr.startHttpServer(60001)
const taskId = udr.startParams.get('taskId')
const testItemId = udr.startParams.get('testItemId')
const dbName = udr.startParams.get('dbName')
const udrLogLevel = udr.startParams.get('udrLogLevel')
const currentUserId = udr.startParams.get('currentUserId')
const currentUserName = udr.startParams.get('currentUserName')

sheets.udrLogDoc.logLevel = udrLogLevel
sheets.udrLogDoc.currentUserId = currentUserId
sheets.udrLogDoc.currentUserName = currentUserName
console.log(`获取udr记录模式配置，logLevel:${udrLogLevel}`)
console.log(`获取udr当前用户id，currentUserId:${currentUserId}`)
console.log(`获取udr当前用户name，currentUserName:${currentUserName}`)
$global.TIS_UDR_ServerURL = udr.startParams.get('TIS_UDR_ServerURL') + 'files'
$global.TIS_UDR_IsPrintEmptyTable = 0
$global.g_bool_PrintEmptyTable_RWList = 0
$global.Is_Control_Code = 0
// 录入模板状态
$global.TIS_UDR_MBLB = 1

if (!udr.sheets.supportAdoRs) {
  udr.toast('当前模板不支持保存到数据集')
}
console.log('TIS_UDR_ServerURL', $global.TIS_UDR_ServerURL)
includeJs(`${$global.TIS_UDR_ServerURL}/UDR Func/jsTemplateCode/Common/jsTplPublicFunc.js`)

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

/**
 * 保存UDR操作日志
 * @param taskId 任务ID
 * @param trace json string
 */
function saveTaskTrace(taskId, trace) {
  db.execSQL('insert or replace into task_trace(taskId, trace) values (?, ?)', [taskId, trace]);
}

/**
 * 获取UDR操作日志
 * @param taskId 任务ID
 * @return {Record<string, any>|undefined}
 */
function getTaskTrace(taskId) {  
  console.log('off get task trace', taskId)
  const rs = db.query('select trace from task_trace where taskId = ?', [taskId]);
  return rs.length ? rs[0] : undefined;
}

/**
 * 保存UDR手写笔迹
 * @param taskId 任务ID
 * @param handwriting json string
 */
function saveTaskHandwriting(taskId, handwriting) {
  db.execSQL('insert or replace into task_handwriting(taskId, handwriting) values (?, ?)', [taskId, handwriting]);
}

/**
 * 获取UDR手写笔迹
 * @param taskId 任务ID
 * @return {Record<string, any>|undefined}
 */
function getTaskHandwriting(taskId) {
  const rs = db.query('select handwriting from task_handwriting where taskId = ?', [taskId]);
  return rs.length ? rs[0] : undefined;
}

// 兼容日志数据
// udr返回的日志数据为string类型，但之前同事以为是对象用JSON.stringify包了一层，导致pc端解析异常，此处已修复，但需要兼容下老数据
// PS：后面删掉这个兼容方法
function compatibleLogJSON(trace) {
  try {
    const pData = JSON.parse(trace)
    
    if (typeof(pData) === 'string') {
      return pData
    }
  } catch (e) {}

  return trace
}

/**
 * 获取并加载日志
 */
function handleLoadLogJSON() {
  let res = getTaskTrace(taskId)
  if(res && res.trace){
    console.log(`离线日志获取成功:${res.trace}`);
    sheets.udrLogDoc.loadJson(compatibleLogJSON(res.trace))
  }else{
    console.error(
      `加载离线操作日志失败，未获取到日志'`,
      res,
    )
  }
}

/**
 * 获取并加载手写笔迹
*/
function handleLoadHandwriting() {
  const res = getTaskHandwriting(taskId)
  if(res && res.handwriting){
    sheets.loadInk(res.handwriting);
  }else{
    console.error(
      `加载手写笔迹失败，未获取到笔迹'`,
      res,
    )
  }
}

// noinspection JSAnnotator
return {
  OnFileOpen() {
    console.log('离线taskId:',taskId);
    if (udr.sheets.supportJson) {
      db.query('select * from task_json_recordset where taskId = ? and testItemId = ?', [taskId, testItemId])
        .forEach(r => {
          loadJsonData(r.value);
          console.log('加载JSON数据集');
        })
    }
    initRecordsets(recordSets)
    loadUdrOtherState()
    handleLoadLogJSON()
    handleLoadHandwriting()
  },
  OnBeforeSave() {
    if ($global.Global_OnBeforeSave) {
      $global.Global_OnBeforeSave()
    }
    //2、保存单元格状态
    saveUdrOtherState()

    //3、兼容udr模板操作，保存后设置
    WriteBind('0', '任务单信息', '第一次打开模板', 1)
  },
  OnFileOpenAfter() {
    //调用模板提供的函数：根据收样参数控制表单
    if ($global.Global_OnFileOpenAfter) {
      $global.Global_OnFileOpenAfter()
    }
  },
  //表单加载完成事件：完成针对表单的初始化
  OnSheetLoaded(sheet) {
    //调用模板提供的函数：根据收样参数控制区域
    if ($global.Global_OnSheetLoaded) {
      $global.Global_OnSheetLoaded(sheet)
    }
  },
  DoSaveData() {
    // 保存日志
    const logJson = sheets.udrLogDoc.saveJson()
    saveTaskTrace(taskId, logJson)
    console.log('离线任务保存日志, taskId=', taskId)

    // 保存笔迹
    // PS：调用SaveInk时可能会报错，报错时忽略错误，不要修改笔迹数据
    try {
      const inkJson = sheets.saveInk();
      if (inkJson) {
        saveTaskHandwriting(taskId, inkJson)
      }
    } catch(e) {
      console.log(e);
    }

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
    if (udr.sheets.supportJson && $global.$model) {
      db.execSQL('update task_json_recordset set value = ? where taskId = ? and testItemId = ?', [JSON.stringify($global.$model), taskId, testItemId])
      console.log('保存JSON数据集成功')
    }
    udr.toast('保存成功！')

    if($global.saveComplete){
      console.log('执行 saveComplete')
      $global.saveComplete()
    }
  },
    //响应模板中的按钮点击
  OnClickControl(control) {
    console.log('uhb:OnClickControl')
    if ($global.Global_OnClickControl) {
      console.log('uhb:Global_OnClickControl')
      $global.Global_OnClickControl(control)
    }
    try {
      defaultOnClickHandler(control)
    } catch (e) {
      udr.toast(e.message)
    }
  },
  OnCheckClick(control) {
    if ($global.Global_OnCheckClick) {
      $global.Global_OnCheckClick(control)
    }
  },
  OnCmbSelChange(control) {
    if ($global.Global_OnCmbSelChange) {
      $global.Global_OnCmbSelChange(control)
    }
  },
  OnCellValueChange(control) {
    console.log('uhb:OnCellValueChange')
    if ($global.Global_OnCellValueChange) {
      console.log('uhb:Global_OnCellValueChange')
      $global.Global_OnCellValueChange(control)
    }
  },
  OnCalculate(control) {
    console.log('uhb:OnCalculate')
    if ($global.Global_OnCalculate) {
      console.log('uhb:Global_OnCalculate')
      $global.Global_OnCalculate(control)
    }
  },
}
