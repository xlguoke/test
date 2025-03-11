## 使用

### jsp页面使用

#### demo.jsp
```
<%@ page import="static com.hitek.web.ScriptHelper.includeBundles" %>

<head>
  <% includeBundles(out, 'consign/component/selectSpecification') %>
</head>

<body>
  <!-- vue挂载节点，id 不可变更 -->
  <div id="select_specification"></div>

  <script>
    /**
     * 非必须
     * 初始化规格型号：需要设置默认值时执行
     */
    function vm_initSpecifications(){
      /** 获取规格型号的逻辑，根据业务场景调整 */
      var specifications = otherInfos.filter(d => d.isJoinSpecification)
      var dataCatalog = {
        sampleId: '', // 选择的样品id
        specifications: [], // 辅助信息中筛选处理的规格型号
        view: 'add',  // 初始化时为固定值
        isInit: true, // 初始化时为固定值
      }
      // 调用vue组件内暴露出来的初始化方法
      window.vm.initSpecifications(dataCatalog)
    }

    /**
     * 必须有该方法
     * 返回辅助信息中的规格型号与元数据中specificationConfig合并后的数据
     * 打开规格型号弹窗时，vue内部会调用该方法
     */
    function vm_selectSpecification(){
      var dataCatalog = {
        sampleId: '',
        specifications: [],
        view: '',
      }
      ...
      return dataCatalog
    }

    /**
     * 必须有该方法
     * 保存规格型号时的回调，vue组件内部调用
     */
    function vm_specificationsCallback(data){}

  </script>
</body>
```

### vue中组件引入
```
<template>
  <a-button type="primary" @click="showModal = true">
    规格型号
  </a-button>

  <SpecificationModal
    v-model:open="showModal"
    :sample-id="sampleId"
    :specifications="specifications"
    :view="VIEW_TYPE.EDIT"
    @ok="getSpecifications"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SpecificationModal, type Specifications, type SpecificationsInfo, VIEW_TYPE } from '~/views/consign/component/selectSpecification'

const showModal = ref(false)
const sampleId = ref('')
const specifications = ref<Specifications[]>([])

function getSpecifications(data: SpecificationsInfo){
  showModal.value = false

  // 业务逻辑...

}
</script>
```

## API
| 属性 | 是否必传 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- | ------ |
| v-model:open | 是 | 对话框是否可见（vue组件引用时生效） | boolean | false |
| sampleId | 是| 样品id（用于读取最后一次保存的数据） | string | '' |
| specifications | 是 |  保存在元数据的规格型号（新增时初始数据来自辅助信息中isJoinSpecification为true的数据） | array | [] |
| view | 否| 显示模式，可选值add、edit、detail（可选值提供了枚举，可直接引用，详见示例） | string | 'add' |
| showAddProperty | 否 | 是否显示添加属性功能 | boolean | false |

## 方法
| 方法名 | 说明 | 参数 |
| ---- | ---- | ---- |
| cancel | 点击关闭或右上角关闭图标回调 | - |
| ok | 点击确定回调 | 返回规格型号明细 |
| addProperty | 添加属性保存成功回调 | - |
| afterRender | 弹窗内容加载完成后的回调（将force-render设为true时，可在加载时获取明细数据） | 返回规格型号明细 |

### 测试地址参考
http://localhost:8080/ilis2/consignController/goSpecificationSelect.do?view=edit&sampleId=40287a8292aea9c50192aeb825cf0010&specifications=%5B%7B%22isNotNull%22%3Afalse%2C%22inputHistory%22%3A%5B%22p.o%22%5D%2C%22orderNo%22%3A1%2C%22consignRemark%22%3Afalse%2C%22displayName%22%3A%22%E4%BB%A3%E5%8F%B7%22%2C%22dataType%22%3A1%2C%22testDataProcess%22%3Afalse%2C%22parentID%22%3A%22eec72c69-aa1b-464f-87ba-5e1df278b0e3%22%2C%22systemFieldName%22%3A%22%E5%9E%8B%E5%8F%B7%22%2C%22isDefaultValue%22%3Afalse%2C%22listValue%22%3A%22%22%2C%22infoType%22%3A3%2C%22isDesignValue%22%3Afalse%2C%22isJoinSpecification%22%3Anull%2C%22name%22%3A%22%E4%BB%A3%E5%8F%B7%22%2C%22isShowTest%22%3Atrue%2C%22customized%22%3Afalse%2C%22attributeId%22%3A%223d03576f-6cca-45d2-8e7a-e9c819308cd6%22%2C%22value%22%3A%22p.o%20%22%7D%2C%7B%22isNotNull%22%3Afalse%2C%22inputHistory%22%3A%5B%5D%2C%22orderNo%22%3A4%2C%22consignRemark%22%3Afalse%2C%22displayName%22%3A%22%E7%AD%89%E7%BA%A7%22%2C%22dataType%22%3A1%2C%22testDataProcess%22%3Afalse%2C%22parentID%22%3A%22eec72c69-aa1b-464f-87ba-5e1df278b0e3%22%2C%22systemFieldName%22%3A%22%E7%AD%89%E7%BA%A7%22%2C%22isDefaultValue%22%3Afalse%2C%22listValue%22%3A%22%22%2C%22infoType%22%3A3%2C%22isDesignValue%22%3Afalse%2C%22isJoinSpecification%22%3Anull%2C%22name%22%3A%22%E7%AD%89%E7%BA%A7%22%2C%22isShowTest%22%3Atrue%2C%22customized%22%3Afalse%2C%22attributeId%22%3A%229b99f6c1-7f95-4807-a3a4-3a8603b39bfb%22%2C%22value%22%3A%22123%22%7D%2C%7B%22deleteAble%22%3Atrue%2C%22displayName%22%3A%22%E8%87%AA%E5%AE%9A%E4%B9%89%22%2C%22value%22%3A%22-666%22%7D%5D
