<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="advanced-body">
    <a-form ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol" :model="formState">
      <a-form-item label="委托编号">
        <a-input v-model:value="formState.consignSn" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="样品编号">
        <a-input v-model:value="formState.objectSn" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="任务编号">
        <a-input v-model:value="formState.taskSn" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="记录编号">
        <a-input v-model:value="formState.recordSn" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="报告编号">
        <a-input v-model:value="formState.reportSn" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="委托单位">
        <a-input v-model:value="formState.unitName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="工程项目">
        <a-input v-model:value="formState.projectName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="检测类别">
        <a-select v-model:value="formState.checkTypeName" placeholder="请选择">
          <a-select-option value="">
            全部
          </a-select-option>
          <a-select-option
            v-for="(item, index) in checkTypeList"
            :key="index"
            :value="item.name"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="编号类别">
        <a-select v-model:value="formState.snName" placeholder="请选择">
          <a-select-option value="">
            全部
          </a-select-option>
          <a-select-option
            v-for="(item, index) in snTypeList"
            :key="index"
            :value="item.name"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="数据来源">
        <a-select v-model:value="formState.consignType" placeholder="请选择">
          <a-select-option value="">
            全部
          </a-select-option>
          <a-select-option value="创建委托">
            创建委托
          </a-select-option>
          <a-select-option value="创建综合任务">
            创建综合任务
          </a-select-option>
          <a-select-option value="创建报告">
            创建报告
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="报告类型">
        <a-select v-model:value="formState.reportType" placeholder="请选择">
          <a-select-option value="">
            全部
          </a-select-option>
          <a-select-option value="正式报告">
            正式报告
          </a-select-option>
          <a-select-option value="临时报告">
            临时报告
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="委托日期">
        <a-range-picker v-model:value="formState.consignDate" value-format="YYYY-MM-DD" style="width: 100%" />
      </a-form-item>
      <a-form-item label="检测日期">
        <a-range-picker v-model:value="formState.testDate" value-format="YYYY-MM-DD" style="width: 100%" />
      </a-form-item>
      <a-form-item label="报告日期">
        <a-range-picker
          v-model:value="formState.signDate"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item label="样品名称">
        <a-input v-model:value="formState.objectName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="检测科室">
        <a-input v-model:value="formState.departName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="报告负责人">
        <a-input v-model:value="formState.dutyNames" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="检测人员">
        <a-input v-model:value="formState.testNames" placeholder="请输入" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  name: 'AdvancedQuery',
  props: ['defaultTestDate'],
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      formState: {
        signDate: this.defaultTestDate,
      },
      // 编号类型
      snTypeList: [],
      // 检测类型
      checkTypeList: [],
    }
  },
  created() {
    this.init()
  },
  methods: {
    /**
     * 初始化器
     */
    getFormState() {
      return { ...this.formState }
    },
    resetFormState() {
      this.formState = {
        signDate: [],
      }
    },
    init() {
      window.$oAjax.get('/tSnCategoryController.do?datagrid&field=id,createName,createBy,createDate,updateName,updateBy,updateDate,sysOrgCode,sysCompanyCode,bpmStatus,name,remarks,pid,isDefault,orgNames,').then((res) => {
        if (res.rows && Array.isArray(res.rows)) {
          this.snTypeList = res.rows
        }
      })

      window.$oAjax.get('/checkTypeController.do?getAll').then((res) => {
        const set = []
        if (res && Array.isArray(res)) {
          for (const key in res) {
            if (
              // eslint-disable-next-line no-prototype-builtins
              res.hasOwnProperty(key)
              && !set.find(it => it.name === res[key].name)
            ) {
              set.push({ name: res[key].name })
            }
          }
          this.checkTypeList = Array.from(new Set(set))
        }
      })
    },
  },
}
</script>

<style scoped>
.advanced-body {
  max-height: 400px;
  overflow-y: auto;
}
</style>
