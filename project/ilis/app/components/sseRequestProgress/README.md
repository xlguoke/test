## 使用说明
jsp、vue中调用方式一致，仅引入文件方式不同

### VUE 中使用
```
<template>
  <a-upload :before-upload="showProgress">
    <a-button>导入文件</a-button>
  </a-upload>
</template>

<script>
import sseRequestProgress from '~/components/sseRequestProgress'

async function showProgress(file: File) {
  sseRequestProgress.show({
    api: 'rest/common-body/test/config/import/custom',
    method: 'postForm',
    datas: {
      file,
      paramVersionId: 'e0afa34e5f754df185081932462af623',
    },
    onComplete: () => {},
    onError: () => {},
  })
  return false
}
</script>
```

### JSP 中使用
```
<%@ page import="static com.hitek.web.ScriptHelper.includeBundles" %>

<head>
  <%
    includeBundles(out, "components/sseRequestProgress");
  %>
</head>

<body>
  <button onclick="importFun">导入</button>
  <input type="file" id="importFile" accept=".xls, .xlsx" style="display: none;" />

  <script>
    function importFun() {
      $("#importFile").click()
    }
    $("#importFile").on("change", function (e) {
      var file = e.target.files[0]
      if(!file) return
      e.target.value = ''
      sseRequestProgress.show({
        api: '',
        method: 'postForm',
        datas: {
          file: file,
        },
        onComplete: function () {},
        onError: function () {},
      })
    })
  </script>
</body>
```

## 事件
调用方式 sseRequestProgress[event]

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| show | 显示进度条（sse进度不支持在业务中关闭，进度完成后自动关闭） | `IProps` |
| showLoading | 显示loading动画 | string |
| hideLoading | 关闭loading动画 | - |
