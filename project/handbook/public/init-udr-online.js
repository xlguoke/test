//初始化全局变量
let $global = this
//udr.enableUdpLog("192.168.50.106");
console.log('主程序初始化udr...', [
  'supportAdoRs',
  udr.sheets.supportAdoRs,
  'supportJson',
  udr.sheets.supportJson,
  sheets.currentScript
])

//获取启动参数
let server = udr.startParams.get('server')
let taskId = udr.startParams.get('taskId')
let token = udr.startParams.get('token')
let testObjectId = udr.startParams.get('testObjectId')
let groupKey = udr.startParams.get('testItemId')
const unitCode = udr.startParams.get('unitCode')
const tisUdrServerURL = udr.startParams.get('TIS_UDR_ServerURL')
const udrLogLevel = udr.startParams.get('udrLogLevel')
const currentUserId = udr.startParams.get('currentUserId')
const currentUserName = udr.startParams.get('currentUserName')
const includeRecordSet = false

sheets.udrLogDoc.logLevel = udrLogLevel
sheets.udrLogDoc.currentUserId = currentUserId
sheets.udrLogDoc.currentUserName = currentUserName
console.log(`获取udr记录模式配置，logLevel:${udrLogLevel}`)
console.log(`获取udr当前用户id，currentUserId:${currentUserId}`)
console.log(`获取udr当前用户name，currentUserName:${currentUserName}`)

/**
 * ## 获取数据集名称集合 
 * 接口说明详见 OnlineTask.vue fetchTask方法注释
 * */
let arDataNames = ["taskRecordSetName", "VBScriptGetter", "jsonDataGetter"];

let apiUrl = `${server}/rest/task/data?testTaskId=${taskId}&groupKey=${groupKey}&dataNames=${arDataNames.join(",")}`
let rsConfig = []
let isInitGoupCount = ['检验参数值', '检验指标值']
console.log(`获取任务数据集，serverUrl:${server}，taskId: ${taskId}`)
if (udr.startParams.get('debug')) {
  udr.startHttpServer(60001);
}

let resStr = udr.httpGet(apiUrl, {
  headers: {
    Authorization: token,
    'Unit-Code': unitCode,
  },
})
let taskRes = resStr ? JSON.parse(resStr) : {}

if (taskRes.code === 20000) {
  let taskData = taskRes.data
  // 处理数据集
  if (includeRecordSet) {
    let taskRecordSets = taskData.taskRecordSets || []
    for (let i = 0; i < taskRecordSets.length; i++) {
      let d = taskRecordSets[i]
      // 过滤不同检测项目的数据集
      if (d.testItemId !== groupKey) continue
      rsConfig.push({
        saveType: 'xml',
        autoInitGroupCount: isInitGoupCount.includes(d.name),
        initTaskId: d.testTaskId,
        initShiJianId: testObjectId,
        data: d.xml,
        name: d.name,
      })
    }
  } else {
    let recordSetNames = taskData.recordSetNameGroup ? taskData.recordSetNameGroup[groupKey] : []
    //批量加载的记录集
    var batchRsNames = ["检验指标值", "收样指标", "任务检测依据", "任务单信息", "检验参数值"];

    for (let i = 0; i < recordSetNames.length; i++) {
      var xmlName = recordSetNames[i]
      var recordSetName = xmlName;
      //批量加载
      if (batchRsNames.includes(xmlName))
        recordSetName = batchRsNames.join(",");

      rsConfig.push({
        saveType: 'xml',
        autoInitGroupCount: isInitGoupCount.includes(xmlName),
        initTaskId: taskId,
        initShiJianId: testObjectId,
        url: `${server}/rest/task/recordset/xml/${taskId}/${groupKey}?recordSetName=${recordSetName}&auth_token=${token}`,
        rawUrl: true,
        name: xmlName,
      })
    }
    console.log('数据集url：', rsConfig[0].url)
  }
  // 处理udr变量，同pc端udr一致
  if (taskData.udrVBScripts && taskData.udrVBScripts.length > 0) {
    for (let i = 0; i < taskData.udrVBScripts.length; i++) {
      let item = taskData.udrVBScripts[i];
      if (!!item[groupKey]) {
        let vbScripts = item[groupKey].split("\n")
        for (let j = 0; j < vbScripts.length; j++) {
          let vb = vbScripts[j];
          if (!vb) continue
          vb = vb.split("=")
          if (vb.length < 2) continue
          let val = vb[1].replace(/\"/g, '')
          $global[vb[0]] = val
          //console.log('加载全局变量:', vb[0], '=', val)
        }
        break
      }
    }
  }
}

$global.TIS_UDR_ServerURL = tisUdrServerURL
$global.TIS_UDR_IsPrintEmptyTable = 0
$global.g_bool_PrintEmptyTable_RWList = 0
$global.Is_Control_Code = 0
// 录入模板状态
$global.TIS_UDR_MBLB = 1
$global.TIS_token = token

//加载服务端变量
includeJs(
  `${tisUdrServerURL}/UDR Func/jsTemplateCode/Common/jsTplPublicFunc.js`,
)
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

const menuList = [
  { title: '预览记录' },
  { title: '预览报告' },
]

console.log('menuList->', JSON.stringify(menuList))

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

//自定义菜单，OnClickCustomMenu中处理事件
udr.initCustomMenu(menuList)

// 手簿转换报告或记录
function transformPDF(type, recognizeCheckMode) {
  try {
    let res = udr.httpPost(
      `${server}/rest/handbook/convert`,
      {
        testTaskId: taskId,
        testItemId: groupKey,
        type,
        recognizeCheckMode,
      },
      {
        headers: {
          Authorization: token,
          'Unit-Code': unitCode,
        },
      },
    )
    console.log('手簿转换报告或记录：', res)
    res = JSON.parse(res)
    if (res.code === 20000) {
      return res.data
    } else {
      udr.toast(`转换失败：` + res.message || '请求异常')
      return false
    }
  } catch (err) {
    udr.toast(`转换失败：` + err.message || '请求异常')
    return false
  }
}

// 转换状态
function getTransformStatus(fileId, uiLoading, btnType) {
  try {
    let res = udr.httpGet(`${server}/rest/convert/status/${fileId}`, {
      headers: {
        Authorization: token,
        'Unit-Code': unitCode,
      },
    })
    console.log('转换状态：', res)
    res = JSON.parse(res)
    if (res.code === 20000) {
      if (res.data == '00') {
        uiLoading.setTimeout(1000, function () {
          getTransformStatus(fileId, uiLoading, btnType)
        })
      } else if (res.data == '10') {
        getTransformResult(fileId, uiLoading, btnType)
      } else {
        uiLoading.dismiss()
        udr.toast('文件转换失败')
      }
    } else {
      uiLoading.dismiss()
      udr.toast('文件转换失败')
    }
  } catch (err) {
    uiLoading.dismiss()
    udr.toast('文件转换失败')
  }
}

// 获取转换结果
var settings = udr.getSettings()
function getTransformResult(fileId, uiLoading, btnType) {
  try {
    let res = udr.httpGet(`${server}/rest/preview/file/${fileId}`, {
      headers: {
        Authorization: token,
        'Unit-Code': unitCode,
      },
    })
    uiLoading.dismiss()
    console.log('转换结果：', res)
    res = JSON.parse(res)
    if (res.code === 20000) {
      // 将转换结果缓存到本地，下次打开时，若存在文件，则提示是否重新生成
      var objStr = JSON.stringify({
        url: res.data,
        fileId: fileId
      })
      var editor = settings.edit()
      editor.putString(btnType + taskId, objStr)
      editor.commit()
      udr.showPdf({
        url: res.data,
        // title: fileId + '.pdf',
        title: btnType === 'report' ? '预览报告' : '预览记录',
        autoDel: true,
      })
    } else {
      udr.toast(`文件转换失败，` + res.message || '请求异常')
    }
  } catch (err) {
    udr.toast(`文件转换失败，` + err.message || '请求异常')
    uiLoading.dismiss()
  }
}

var callbackAfterSave = null

var testConclusionData = {}

var config = {
  //模板初始化
  OnFileOpen() {
    console.log('在线taskId:', taskId);
    //1、加载json，初始化 $global.$model
    if (taskRes.data && taskRes.data.taskJsonData) {
      let taskJsonData = taskRes.data.taskJsonData

      // json数据集
      if (udr.sheets.supportJson && taskJsonData.jsonUdrData) {
        var jsonRecord = taskJsonData.jsonUdrData[0] || {}
        if (jsonRecord.value) {
          console.log('加载json数据集...')
          loadJsonData(jsonRecord.value)
        }
      }

      // 日志
      if (taskJsonData.log) {
        var logJson = taskJsonData.log[0] || {}
        if (logJson.value) {
          console.log('加载日志...')
          sheets.udrLogDoc.loadJson(logJson.value)
        }
      }

      // 笔迹
      if (taskJsonData.notes) {
        var noteJson = taskJsonData.notes[0] || {}
        if (noteJson.value) {
          console.log('加载笔迹...')
          sheets.loadInk(noteJson.value);
        }
      }
    }

    //2、初始化记录集
    console.log('初始化记录集...')
    initRecordsets(rsConfig)

    //3、加载udr的其他状态
    console.log('加载udr的其他状态...')
    loadUdrOtherState()
  },

  //自定义数据保存
  OnBeforeSave() {
    console.log('main OnBeforeSave：保存单元格状态...')
    if ($global.Global_OnBeforeSave) {
      console.log('main Global_OnBeforeSave')
      $global.Global_OnBeforeSave()
    }

    //1、保存json数据
    // if (udr.sheets.supportJson) {
    //   let data = JSON.stringify($global.$model)
    //   //console.log("主程序OnBeforeSave：保存json数据...", data);
    //   udr.addCustomSaveData('jsonData', data)
    // }

    //2、保存单元格状态
    saveUdrOtherState()

    //3、兼容udr模板操作，保存后设置
    WriteBind('0', '任务单信息', '第一次打开模板', 1)
  },

  //保存按钮：执行数据保存
  DoSaveData() {
    try {
      // 保存AI语音
      // 获取ai语音输入的数据
      const voiceData = udr.getAiInputSheets();
      // 转换为json 用于服务端存储
      const json = toJson(voiceData);
      udr.httpPost(`${server}/rest/upload/ai/sheets/${taskId}/TASK`, json, {
        headers: {
          Authorization: token,
          'Unit-Code': unitCode,
          'Content-Type': 'application/json'
        },
      });

      // 调用UDR提供的AI语音上传方法
      udr.postAiInputAudio(`${server}/rest/upload/ai/opus/${taskId}/TASK`, {
        headers: {
          Authorization: token,
          'Unit-Code': unitCode,
          "Content-Type": "multipart/form-data",
        },
      });

      let data = []
      let url = `${server}/rest/handbook/save/recordset`
      for (let rsDef of rsConfig) {
        let rs = udr.sheets.recordsets.item(rsDef.name)
        if (!rs.opened) continue
        let xmlData = rs.toXml()
        if (xmlData) {
          data.push({
            recordSetName: rsDef.name,
            recordSetValue: xmlData.replace(
              '<?xml version="1.0" encoding="UTF-8"?>',
              '',
            ),
          })
        }
      }

      if (udr.sheets.supportJson) {
        let jsonRs = JSON.stringify($global.$model)
        console.log('保存JSON数据集')
        data.push({
          jsonUdrData: jsonRs,
        })
      }

      // 笔迹
      // PS:调用SaveInk时可能会报错，报错时忽略错误，不要修改笔迹数据
      try {
        let inkJson = sheets.saveInk();
        if (inkJson) {
          console.log('saveInk()', inkJson)
          data.push({
            notes: inkJson,
          })
        }
      } catch (e) {
        console.log(e);
      }

      // 日志
      let logJson = sheets.udrLogDoc.saveJson()
      if (logJson) {
        console.log('saveJson()', logJson)
        data.push({
          log: logJson,
        })
      }

      udr.httpPost(
        url,
        {
          testTaskId: taskId,
          testObjectId: testObjectId,
          groupKey: groupKey,
          data: JSON.stringify(data),
          testStartDate: testConclusionData.testStartDate || '',
          testEndDate: testConclusionData.testEndDate || '',
          testConditions: testConclusionData.testConditions || ''
        },
        {
          headers: {
            Authorization: token,
            'Unit-Code': unitCode,
            'Content-Type': 'application/json'
          },

          //异步回调
          callback: function (res) {
            console.log('保存结果', res)
            res = JSON.parse(res)
            if (res && res.code === 20000) {
              udr.toast('保存成功！')
              if (callbackAfterSave) callbackAfterSave()

              // 通知web保存成功
              udr.invokeWebScript("OnSaveComplete(1)")
            } else {
              udr.toast(res ? res.msg : '保存异常！')
              // 通知web保存成功
              udr.invokeWebScript("OnSaveComplete(2)")
            }
            
            if($global.saveComplete){
              console.log('执行 saveComplete')
              $global.saveComplete()
            }
          }
        },
      )
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
    console.log('uhb:OnCheckClick')
    if ($global.Global_OnCheckClick) {
      console.log('uhb:Global_OnCheckClick')
      $global.Global_OnCheckClick(control)
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
  OnCmbSelChange(control) {
    console.log('uhb:OnCmbSelChange')
    if ($global.Global_OnCmbSelChange) {
      console.log('uhb:Global_OnCmbSelChange')
      $global.Global_OnCmbSelChange(control)
    }
  },

  OnClickCustomMenu(title, recognizeCheckMode) {
    var type = title === '预览记录' ? 'record' : 'report'

    //保存完成后的回调
    callbackAfterSave = function () {

      callbackAfterSave = null

      var uiLoading = udr.newLoading()

      uiLoading.update('正在生成pdf，请稍后...')
      uiLoading.show()

      let fileId = transformPDF(type, recognizeCheckMode)
      if (!fileId) {
        uiLoading.dismiss()
        return
      }

      getTransformStatus(fileId, uiLoading, type)
    }

    console.log('点击按钮：', title)
    var cacheFileKey = type + taskId
    var cacheFile = settings.getString(cacheFileKey, null)
    console.log('获取缓存的文件：', cacheFile)
    if (cacheFile) {
      confirm('是否重新生成文件？', function () {
        //1、转换pdf前：先保存数据
        udr.saveData()
      }, function () {
        cacheFile = JSON.parse(cacheFile)
        udr.showPdf({
          url: cacheFile.url,
          // title: cacheFile.fileId + '.pdf',
          title: title,
          autoDel: true,
        })
      })
    } else {
      //1、转换pdf前：先保存数据
      udr.saveData()
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
    console.log('uhb:OnFileOpenAfter')
    //调用模板提供的函数：根据收样参数控制表单
    if ($global.Global_OnFileOpenAfter) {
      console.log('uhb:Global_OnFileOpenAfter')
      $global.Global_OnFileOpenAfter()
    }

    // 加载AI语音
    // 获取sheetsJson地址
    const sheetsJsonRes = udr.httpGet(`${server}/rest/ai/input/files/${taskId}`, {
      headers: {
        Authorization: token,
        'Unit-Code': unitCode,
      },
    });
    const sheetsJsonResData = JSON.parse(sheetsJsonRes)
    if (sheetsJsonResData.code === 20000) {
      const sheetDataObj = sheetsJsonResData.data[0]
      if (sheetDataObj) {
        // 获取文件目录地址
        const filePathRes = udr.httpGet(`${server}/rest/ai/input/path/${taskId}/TASK`, {
          headers: {
            Authorization: token,
            'Unit-Code': unitCode,
          },
        });
        const filePathResData = JSON.parse(filePathRes)
        if (filePathResData.code === 20000) {
          const opusBaseUrl = filePathResData.data.replace(/\\/g, '/')
          console.log('加载AI语音opusBaseUrl：' + opusBaseUrl)
          // 读取json文件
          const jsonRes = udr.httpGet(sheetDataObj.fileUrl);
          console.log('加载AI语音sheetsJson：' + jsonRes)
          console.log("开始加载AI语音...")
          udr.loadAiInputSheets(opusBaseUrl, jsonRes);
        }
      }
    }
  },

  OnFileOpenComplete() {
    console.log('uhb:OnFileOpenComplete')
    //调用模板提供的函数：根据收样参数控制表单
    if ($global.Global_OnFileOpenComplete) {
      console.log('uhb:Global_OnFileOpenComplete')
      $global.Global_OnFileOpenComplete()
    }
  },

  //表单加载完成事件：完成针对表单的初始化
  OnSheetLoaded(sheet) {
    console.log('uhb:OnSheetLoaded')
    loadSheetImage(sheet)
    //调用模板提供的函数：根据收样参数控制区域
    if ($global.Global_OnSheetLoaded) {
      console.log('uhb:Global_OnSheetLoaded')
      $global.Global_OnSheetLoaded(sheet)
    }
  },
}

$global.test1 = 'test1 from main...'

$global.OnClickCustomMenu = config.OnClickCustomMenu

$global.SetTestConclusionData = function (data) {
  testConclusionData = data || {}
}

// noinspection JSAnnotator
return config
