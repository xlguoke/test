<template>
  <div>
    <a-modal
      v-model:visible="visibleAddOuterReport"
      width="550px"
      :centered="true"
      title="添加外委报告"
      :confirm-loading="loading"
      :mask-closable="false"
      @ok="addFromSubmit"
    >
      <a-form
        ref="addFormRef"
        :model="addFrom"
        name="basic"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item
          label="所属试验室"
          name="laboratoryId"
          :rules="[{ required: true, message: '选择所属试验室!' }]"
        >
          <common-select
            v-model:value="addFrom.laboratoryId"
            url="/labs?user-labs"
            :config="{
              placeholder: '请选择试验室'
            }"
            @change="changeLab"
          />
        </a-form-item>

        <a-form-item
          label="检测机构"
          name="testLaboratoryId"
          :rules="[{ required: true, message: '选择检测机构!' }]"
        >
          <common-select
            :key="visibleAddOuterReport + ''"
            v-model:value="addFrom.testLaboratoryId"
            :url="orgList()"
            placeholder="请选择机构"
            :config="{
              keyword: 'orgName',
              httpSearch: true
            }"
            @change="changeTestLab"
          />
        </a-form-item>

        <a-form-item
          label="报告编号"
          name="sn"
          :rules="[{ required: true, message: '请输入报告编号!' }]"
        >
          <a-input v-model:value="addFrom.sn" placeholder="请输入报告编号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import CommonSelect from "@/components/commonSelect/index.vue"
import { ref, nextTick } from "vue"
import { orgList } from "@/api/commonSelect.api"
import { message } from "ant-design-vue"
import { addOuterReportAPI } from "@/api/reportMgr.api"

let visibleAddOuterReport = ref(false)

let loading = ref(false)

let addFormRef = ref()

const emit = defineEmits(["successOk"])

let addFrom = ref({
  sn: "",
  laboratory: "",
  laboratoryId: "",
  testLaboratory: "",
  testLaboratoryId: ""
})

const addFromSubmit = async () => {
  await addFormRef.value.validateFields()
  loading.value = true
  addOuterReportAPI(addFrom.value)
    .then(() => {
      emit("successOk")
      message.success("添加成功")
      loading.value = false
      visibleAddOuterReport.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

const changeLab = (v) => {
  addFrom.value.laboratory = v.option.name
  addFrom.value.laboratoryId = v.option.id
}

const changeTestLab = (v) => {
  addFrom.value.testLaboratory = v.option.name
  addFrom.value.testLaboratoryId = v.option.id
}
const resetData = async () => {
  await nextTick()
  addFormRef.value.resetFields() //重置表单
  addFormRef.value = {
    sn: "",
    laboratory: "",
    laboratoryId: "",
    testLaboratory: "",
    testLaboratoryId: ""
  }
}
const openModel = () => {
  visibleAddOuterReport.value = true
  resetData()
}
defineExpose({
  openModel
})
</script>
