## 使用
1. 在 vue 页面中使用
```
<template>
   <a-button @click="openSignatureModal">签字</a-button>

   <OnlineSginatureModal ref="onlineSginatureRef" @confirm="getSignature" />
</template>

<script setup lang='ts'>
import { OnlineSginatureModal, SIGNATURE_SOURCE, type SignatureData } from '~/components/onlineSignature'

  const dataId = ref('')
  const onlineSginatureRef = ref()

  function openSignatureModal(){
    onlineSginatureRef.value.openModal({
      title: '线上签字',
      dataId: dataId.value,
      source: SIGNATURE_SOURCE.REPORT,
    })
  }

  async function getSignature(data: SignatureData) {

  }
</script>
```

2. 在 jsp 页面中使用
```
<%@ page import="static com.hitek.web.ScriptHelper.includeBundles" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<head>
  <%
    includeBundles(out, "components/onlineSignature");
  %>
</head>

<body>
  <button onclick="demoSignature">签字</button>

  <%--  挂载节点   --%>
  <div id="online_signature"></div>

  <script>
    function demoSignature() {
      ...
      window.vm.openOnlineSignatureModal({
        title: '线上签字',
        dataId: '123',
        source: '',
      })
    }

    // 点击弹窗关闭按钮回调
    function vm_onlineSignatureCancel(data){}

    // 点击弹窗确定按钮回调
    function vm_onlineSignatureConfirm(data){}
  </script>
</body>
```

## openModal 参数说明
参数为对象，下列为对象属性说明：

| 属性 | 必填 | 说明 | 类型 | 默认值 |
| ---- | ---- |---- | ---- | ---- |
| source | 否 | 数据来源：委托签字、报告领取签字 | SIGNATURE_SOURCE | SIGNATURE_SOURCE.REPORT |
| dataId | 是 | 数据id，目前使用场景包含了委托id、报告id | string | '' |
| title |  否 |弹窗名称 | string | '线上签字' |

## 组件内部暴露的方法
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| openModal | 打开弹窗 | 见openModal参数说明 | undefined |

## 事件
| 事件 | 说明 |  返回值 |
| ---- | ---- |  ---- |
| confirm | 点击确定按钮回调 | 见 SignatureData |
| cancel | 关闭弹窗回调 | 见 SignatureData |

## window.vm 挂载的方法
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| openOnlineSignatureModal | 打开弹窗 | 见openModal参数说明 | undefined |

## jsp页面回调
| 方法名 | 说明 |  参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| vm_onlineSignatureConfirm | 点击弹窗确定按钮触发 | 见 SignatureData | undefined |
| vm_onlineSignatureCancel | 关闭弹窗触发 | 见 SignatureData | undefined |
