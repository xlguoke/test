<template>
  <div class="advanced-body">
    <a-form :model="formState">
      <a-form-item
        label="委托单位"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.consignUnitName" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="工程项目"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.projectTenderName" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="项目编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.projectCode" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="委托编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.consignCode" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="样品编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.testObjectCode" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        v-if="showCustomerSampleCode"
        label="来样编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input
          v-model:value="formState.provideToCustomerSampleCode"
          placeholder="请输入"
        />
      </a-form-item>
      <a-form-item
        label="样品名称"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.sampleDisplayName" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="工程部位/用途"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.projectPartAndUse" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="规格型号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.objectStandard" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="任务编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.taskCode" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="记录编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.recordCode" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="批号" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-model:value="formState.batchNum" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="报告编号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input v-model:value="formState.reportNumber" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        label="要求报告时间"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-range-picker
          v-model:value="formState.requireReportDate"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item
        label="委托时间段"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-range-picker v-model:value="formState.consignDate" value-format="YYYY-MM-DD" style="width: 100%" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  name: 'AdvancedQuery',
  props: ['showCustomerSampleCode', 'defaultTestDate'],
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      formState: {
        consignDate: this.defaultTestDate,
      },
    }
  },
}
</script>

<style scoped>
.advanced-body {
  max-height: 400px;
  overflow-y: auto;
}
</style>
