//初始化全局变量
let $global = this
console.log('主程序初始化udr...', [
  'supportAdoRs',
  udr.sheets.supportAdoRs,
  'supportJson',
  udr.sheets.supportJson,
])

//获取启动参数
let dbName = udr.startParams.get('dbName')
let taskId = udr.startParams.get('taskId')
console.log('dbName=' + dbName + ', taskId=' + taskId)

let db = udr.openDatabase(dbName)
let isInitGoupCount = ['检验参数值', '检验指标值']
let rsData = db.query('select * from task_recordset where taskId = ?', [taskId])
let rsConfig = []
console.log(JSON.stringify(rsData))
if (rsData) {
  for (let i = 0; i < rsData.length; i++) {
    let d = rsData[i]
    rsConfig.push({
      saveType: 'xml',
      autoInitGroupCount: isInitGoupCount.includes(d.name),
      initTaskId: d.testTaskId,
      data: d.xml,
      name: d.name,
    })
  }
}

//检验指标值、检验参数值：xml从数据库读取
// let xml1, xml2

//模板的json数据：也保存到UdrXmlData，记录集名称：_jsonData_
// let jsonDataRecord
//supportAdoRs：模板数据保存到记录集
// if (udr.sheets.supportAdoRs) {
//     console.info("从UdrXmlData加载xml...");
//     let db = udr.openDatabase(dbName)
//     try {
//         let rsData = db.query("select xmlData from UdrXmlData where taskId=? and rsName=?", [taskId, "检验指标值"])[0];
//         if (rsData) xml1 = rsData.xmlData;

//         rsData = db.query("select xmlData from UdrXmlData where taskId=? and rsName=?", [taskId, "检验参数值"])[0];
//         if (rsData) xml2 = rsData.xmlData;
//     } catch (e) {
//         console.error("加载 检验指标值、检验参数值 xml出现异常：" + e.message);
//     }
// }

//json数据：_jsonData_
// if (udr.sheets.supportJson) {
//     jsonDataRecord = db.query("select xmlData from UdrXmlData where taskId=? and rsName=?", [taskId, "_jsonData_"])[0];
//     console.info("从UdrXmlData加载json...", jsonDataRecord && jsonDataRecord.xmlData ? jsonDataRecord.xmlData.length : "null");
// }

//记录集定义
// let rsConfig = [
//     {
//         name: "检验指标值",
//         /*
//             记录集的保存类型
//             xml：保存到UdrXmlData
//             sql：直接保存到sqlite
//             http：保存到服务器
//         */
//         saveType:"xml",
//         //preload: true,
//         //自动初始化组次：sheets.intGroupMax、sheets.intCountMax，必须指定initTaskId
//         autoInitGroupCount: true,
//         initTaskId: taskId,
//         data: xml1
//     },
//     {
//         name: "检验参数值",
//         saveType: "xml",
//         //preload: true,
//         //自动初始化组次
//         autoInitGroupCount: true,
//         initTaskId: taskId,
//         data: xml2
//     },
//     {
//         name: "任务单信息",
//         saveType: "sql",

//         //直接操作sqlite：必须指定表tableName、主键keyColName
//         tableName: "view_UDR_JianYanRenWuDan",
//         keyColName: "检验任务号",
//         sql: `select * from view_UDR_JianYanRenWuDan where 检验任务号=${taskId}`
//     },
// ]

var config = {
  //模板初始化
  OnFileOpen() {
    //1、加载json，初始化 $global.$model
    //load from sqlite
    //let url = urlUdrGetData + "?UdrExtendData=1&CATAG_UDR_EXTEND_DATA=jsonData&ID_UDR_EXTEND_DATA=" + TIS_UDR_RWDID;
    //loadJsonData(url);
    //json模板数据
    if (udr.sheets.supportJson && jsonDataRecord) {
      loadJsonData(jsonDataRecord.xmlData)
    }

    //2、初始化记录集
    initRecordsets(rsConfig)

    //3、加载udr的其他状态
    loadUdrOtherState()
  },

  //自定义数据保存
  OnBeforeSave() {
    //1、保存json数据
    //let data = JSON.stringify($global.$model);
    //udr.addCustomSaveData("jsonData", data)
    if (udr.sheets.supportJson) {
      let data = JSON.stringify($global.$model)

      console.log('保存前：', data)
      //      if (data != '{}') {
      //        jsonDataRecord = jsonDataRecord || {
      //          taskId: taskId,
      //          rsName: '_jsonData_',
      //        }
      //        jsonDataRecord.xmlData = data
      //        //insert or update
      //        db.save('UdrXmlData', jsonDataRecord, 'taskId=? and rsName=?', [
      //          taskId,
      //          '_jsonData_',
      //        ])
      //        console.info('保存json数据...')
      //      } else {
      //        console.warn('json数据为空，忽略保存！')
      //      }
    }

    //2、保存单元格状态
    saveUdrOtherState()

    //3、兼容udr模板操作，保存后设置
    WriteBind('0', '任务单信息', '第一次打开模板', 1)
  },

  //保存按钮：执行数据保存
  DoSaveData() {
    try {
      for (let rsDef of rsConfig) {
        let rs = udr.sheets.recordsets.item(rsDef.name)
        if (!rs.opened) continue

        //xml, sql, http
        if (rsDef.saveType == 'xml') {
          let xmlData = rs.toXml()
          if (xmlData) {
            xmlData = xmlData.replace(
              '<?xml version="1.0" encoding="utf-8"?>',
              '',
            )
            db.execSQL('update task_recordset set xml = ? where taskId = ?', [
              xmlData,
              taskId,
            ])
            console.log('保存记录xml：', rsDef.name)
          }
        } else if (rsDef.saveType == 'sql') {
          //直接保存到sqlite
          rs.saveToDb()
        }
      }
      udr.toast('保存成功！')
    } catch (e) {
      udr.toast(e.message)
    }
  },

  //响应模板中的按钮点击
  OnClickControl(control) {
    try {
      defaultOnClickHandler(control)
    } catch (e) {
      udr.toast(e.message)
    }
  },

  /*
    OnFileOpenAfter() {
        console.log("主程序OnFileOpenAfter...");
    },

    OnFileOpenComplete() {
        console.log("主程序OnFileOpenComplete...");
    },
    */
}

return config
