# 通用审批流程组件
## 使用
### 1. 常规使用 ProcessModal（适用审批弹窗无默认表单以外内容的场景）
``` ts
await AnyDialogHelper.showModel(IlisProcessModal, {
  processType: ProcessType.EQ_RENT, // 审批类型
  processId: row.id, // 审批实例id，用于查询是否配置审批流程
  queryParams: { id: row.id }, // 提交审批时要携带的额外参数
  submitAuditApi: submitEquipmentRentProcess, // 提交审批的api
  submitDataTransfer: data => data // 提交审批时，将数据转换成想要的数据格式(兼容手段，无特殊情况不传)
})
```
### 2. 特殊场景 ProcessForm （适用审批弹窗有默认表单以外内容的场景）
  如果审批表单有配置流程以外的内容，比如表单，表格等，可以采用 ProcessForm 组件自行封装审批弹窗，该组件暴露有一个``getProcessFormData``方法，用于获取流程表单数据，示例如下：
  ``` html
  <template>
    <ProcessForm ref="processFormRef" :process-type="props.param.processType" />
  </template>
  ```
  ``` ts
  import { IlisProcessForm } from '~/components/ilisComponent'
  const processFormRef = ref<IProcessFormExpose>()
  // 获取数据
  async function getData() {
    const data = await processFormRef.value.getProcessFormData()
  }
  ```
