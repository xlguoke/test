//初始化全局变量
let $global = this
//udr.enableUdpLog("192.168.50.106");
console.log('主程序初始化udr...', [
  'supportAdoRs',
  udr.sheets.supportAdoRs,
  'supportJson',
  udr.sheets.supportJson,
])

//获取启动参数
let server = udr.startParams.get('server')
let taskId = udr.startParams.get('taskId')
let token = udr.startParams.get('token')
let testObjectId = udr.startParams.get('testObjectId')
let groupKey = udr.startParams.get('testItemId')
const unitCode = udr.startParams.get('unitCode')
const tisUdrServerURL = udr.startParams.get('TIS_UDR_ServerURL')

// 获取数据集
let apiUrl = `${server}/rest/task/data/${taskId}`
let rsConfig = []
let isInitGoupCount = ['检验参数值', '检验指标值']
console.log(`获取任务数据集，serverUrl:${server}，taskId: ${taskId}`)
udr.debugMode = udr.startParams.get('debug')
udr.debugMode && udr.startHttpServer(60001)

let resStr = udr.httpGet(apiUrl, {
  headers: {
    Authorization: token,
    'Unit-Code': unitCode,
  },
})
let taskRes = resStr ? JSON.parse(resStr) : {}

if (taskRes.code === 20000) {
  let taskData = taskRes.data
  let taskRecordSets = taskData.taskRecordSets || []

  for (let i = 0; i < taskRecordSets.length; i++) {
    let d = taskRecordSets[i]
    rsConfig.push({
      saveType: 'xml',
      autoInitGroupCount: isInitGoupCount.includes(d.name),
      initTaskId: d.testTaskId,
      initShiJianId: testObjectId,
      data: d.xml,
      name: d.name,
    })
  }
}

$global.TIS_UDR_ServerURL = tisUdrServerURL;
$global.TIS_UDR_IsPrintEmptyTable = 0
$global.g_bool_PrintEmptyTable_RWList = 0
$global.Is_Control_Code = 0

//加载服务端变量
// includeJs(serverUrl + "/tis/udrhandbook.aspx?taskId=" + taskId);
/*
$global.urlUdrGetData = "https://gxjx.qdm123.com/handler/getData.ashx";
$global.TIS_UDR_ProjectID=310;
$global.TIS_UDR_RWDID=4719516;
$global.TIS_UDR_RWDLIST=TIS_UDR_RWDID;
$global.TIS_UDR_ITEMID="981268c5-dd4a-45de-a1b4-2785ec91f728";
$global.TIS_UDR_PurposeName="";
$global.TIS_UDR_ParamsTableName="参数值_(无记录)混凝土抗压强度试验(立方体)_JTG E30-2005";
$global.TIS_UDR_StandardTableName="指标值_(无记录)混凝土抗压强度试验(立方体)_JTG E30-2005";
$global.Tis_Udr_TaskDate="2024-01-03";
*/

//记录集定义
// let rsConfig = [
//     {
//         name: "检验指标值",
//         //preload: true,
//         //自动初始化组次：sheets.intGroupMax、sheets.intCountMax
//         autoInitGroupCount: true,
//         initTaskId:TIS_UDR_RWDID,
//         url: `urlUdrGetData & "?projectId="&TIS_UDR_ProjectID&"&sql=" & EscapeUrl(Base64Encode("select * from ["&TIS_UDR_StandardTableName&"] where (检验任务单ID='"&TIS_UDR_RWDID&"')")) & "&PKName=" &  EscapeUrl(Base64Encode("")) & "&AutocompleteWhere=" &  EscapeUrl(Base64Encode(""))`
//     },
//     {
//         name: "检验参数值",
//         //preload: true,
//         //自动初始化组次
//         autoInitGroupCount: true,
//         initTaskId:TIS_UDR_RWDID,
//         url: `urlUdrGetData & "?projectId="&TIS_UDR_ProjectID&"&sql=" & EscapeUrl(Base64Encode("select * from ["&TIS_UDR_ParamsTableName&"] where (检验任务单ID='"&TIS_UDR_RWDID&"')")) & "&PKName=" &  EscapeUrl(Base64Encode("")) & "&AutocompleteWhere=" &  EscapeUrl(Base64Encode(""))`
//     },
//     {
//         name: "任务单信息",
//         url: `urlUdrGetData & "?projectId="&TIS_UDR_ProjectID&"&sql=" & EscapeUrl(Base64Encode("select * from view_UDR_JianYanRenWuDan where (view_UDR_JianYanRenWuDan.检验任务号 in ('"&TIS_UDR_RWDLIST&"'))")) & "&PKName=" &  EscapeUrl(Base64Encode("检验任务号")) & "&AutocompleteWhere=" &  EscapeUrl(Base64Encode(""))`
//     },
//     {
//         name: "任务单信息附表",
//         url: `urlUdrGetData & "?projectId="&TIS_UDR_ProjectID&"&sql=" & EscapeUrl(Base64Encode("select * from Testtask_extra where (Testtask_extra.检验任务号='"&TIS_UDR_RWDID&"')")) & "&PKName=" &  EscapeUrl(Base64Encode("检验任务号")) & "&AutocompleteWhere=" &  EscapeUrl(Base64Encode(""))`
//     },
//     {
//         name: "辅助信息",
//         url: `urlUdrGetData & "?projectId="&TIS_UDR_ProjectID&"&sql=" & EscapeUrl(Base64Encode("select * from view_UDR_TestOtherInfoValue where (生效日期<= '"&Tis_Udr_TaskDate&"' or 生效日期 is null) and (失效日期>'"&Tis_Udr_TaskDate&"' or 失效日期 is null) and 检验任务号 in ('"&TIS_UDR_RWDLIST&"') and ProjectID='"&TIS_UDR_ProjectID&"' order by 试验项目ID,顺序号")) & "&PKName=" &  EscapeUrl(Base64Encode("辅助信息值ID")) & "&AutocompleteWhere=" &  EscapeUrl(Base64Encode(""))`
//     },
//     {
//         name: "任务引用仪器视图",
//         url: `urlUdrGetData & "?projectId="&TIS_UDR_ProjectID&"&sql=" & EscapeUrl(Base64Encode("select * from view_UDR_RenWuYiQi where (检验任务号='"&TIS_UDR_RWDID&"') order by 顺序号")) & "&PKName=" &  EscapeUrl(Base64Encode("ID")) & "&AutocompleteWhere=" &  EscapeUrl(Base64Encode(""))`
//     },
// ];

var config = {
  //模板初始化
  OnFileOpen() {
    //1、加载json，初始化 $global.$model
    // if (udr.sheets.supportJson)
    // {
    //     let url = urlUdrGetData + "?UdrExtendData=1&CATAG_UDR_EXTEND_DATA=jsonData&ID_UDR_EXTEND_DATA=" + TIS_UDR_RWDID;
    //     loadJsonData(url);

    //     console.log(JSON.stringify($global.$model))

    // }

    //2、初始化记录集
    initRecordsets(rsConfig)

    //3、加载udr的其他状态
    loadUdrOtherState()
  },

  //自定义数据保存
  OnBeforeSave() {
    console.log('main OnBeforeSave：保存单元格状态...')

    //1、保存json数据
    if (udr.sheets.supportJson) {
      let data = JSON.stringify($global.$model)
      //console.log("主程序OnBeforeSave：保存json数据...", data);
      udr.addCustomSaveData('jsonData', data)
    }

    //2、保存单元格状态
    saveUdrOtherState()

    //3、兼容udr模板操作，保存后设置
    WriteBind('0', '任务单信息', '第一次打开模板', 1)
  },

  //保存按钮：执行数据保存
  DoSaveData() {
    try {
      let data = []
      let url = `${server}/rest/handbook/save/recordset`
      for (let rsDef of rsConfig) {
        let rs = udr.sheets.recordsets.item(rsDef.name)
        if (!rs.opened) continue
        let xmlData = rs.toXml()
        if (xmlData) {
          data.push({
            recordSetName: rsDef.name,
            recordSetValue: xmlData.replace('<?xml version="1.0" encoding="UTF-8"?>',''),
          })
        }
      }
      let res = udr.httpPost(
        url,
        {
            testTaskId: taskId,
            testObjectId: testObjectId,
            groupKey: groupKey,
            data: JSON.stringify(data),
        },
        {
          headers: {
            "Authorization": token,
            'Unit-Code': unitCode,
            'Content-Type': 'application/json',
          },
        },
      )
      console.log('保存结果', JSON.stringify(res))
      res = JSON.parse(res)
      if (res.code === 20000) {
        udr.toast('保存成功！')
      } else {
        udr.toast(res.msg)
      }
    } catch (e) {
      udr.toast(e.message)
    }
  },
  // DoSaveData() {
  //     // let url = urlUdrGetData + "?UDR_ENCODING=utf8&ID_UDR_EXTEND_DATA=" + TIS_UDR_RWDID;
  //     udr.saveData(url, function (data, err) {
  //         if (!err) {
  //             udr.toast("保存成功！");
  //         } else {
  //             let ar = [data, err].filter(it => it);
  //             udr.toast(ar.join("\n"));
  //         }
  //     });
  // },

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
}

$global.test1 = 'test1 from main...'
// noinspection JSAnnotator
return config
