<template>
  <a-modal
    v-model:visible="visible"
    :title="mtitle"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="confirmLoading"
    width="900px"
    @ok="saveModal"
  >
    <a-form ref="refForm" :model="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        label="设备名称"
        name="equipmentName"
        :rules="[{ required: true, message: '请输入设备名称' }]"
      >
        <a-input
          v-model:value="form.equipmentName"
          :disabled="disabled"
          placeholder="请输入设备名称"
        />
      </a-form-item>
      <a-form-item
        label="采集类型"
        name="categoryCode"
        :rules="[{ required: true, message: '请选择采集类型' }]"
      >
        <DictCode
          v-model:value="form.categoryCode"
          code="collectEqClasses"
          :disabled="disabled"
          placeholder="请选择采集类型"
        />
      </a-form-item>
      <a-form-item
        label="所属试验室"
        name="laboratoryName"
        :rules="[{ required: true, message: '请选择所属试验室' }]"
      >
        <a-input
          v-model:value="form.laboratoryName"
          readonly
          :disabled="disabled"
          placeholder="请选择所属试验室"
          @click="openTestRoom"
        >
          <template #suffix>
            <down-outlined style="color: #ccc; font-size: 12px" @click="openTestRoom" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        label="设备编号"
        name="equipmentSn"
        :rules="[{ required: true, message: '请选择设备编号' }]"
      >
        <a-input
          v-model:value="form.equipmentSn"
          :disabled="disabled"
          placeholder="请输入设备编号"
        />
      </a-form-item>
      <a-form-item
        label="规格型号"
        name="model"
        :rules="[{ required: true, message: '请输入规格型号' }]"
      >
        <a-input v-model:value="form.model" :disabled="disabled" placeholder="请输入规格型号" />
      </a-form-item>
      <a-form-item label="安装位置" name="location">
        <a-input v-model:value="form.location" :disabled="disabled" placeholder="请输入安装位置" />
      </a-form-item>
      <a-form-item label="设备厂家" name="maker">
        <a-input v-model:value="form.maker" :disabled="disabled" placeholder="请输入设备厂家" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="form.remark" :disabled="disabled" placeholder="请输入备注" />
      </a-form-item>
    </a-form>

    <Laboratory
      v-model:visible="visibleTestRoom"
      :selected="selectedLab"
      type="radio"
      @confirm="getTestRoom"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { message } from "ant-design-vue"
import { DownOutlined } from "@ant-design/icons-vue"
import Laboratory from "@/components/commonListModal/laboratory.vue"
import DictCode from "@/components/dictCode/index.vue"
import { saveEq, getDetail } from "@/api/dataMonitoring.api"
import { dataItemType } from "@/type/api/dataMonitoring.api"

const props = defineProps(["labInfo"])
const emit = defineEmits(["updateList"])

const mtitle = ref<string>("")
const visible = ref<boolean>(false)
const disabled = ref<boolean>(false)
const dataId = ref<string>("")
const openModal = (title: string, id: string, isEdit: boolean) => {
  mtitle.value = title
  dataId.value = id || ""
  disabled.value = !isEdit
  visible.value = true
  id && getDetailDatas()
}

defineExpose({
  openModal
})

const form = ref<dataItemType>({
  id: "",
  categoryCode: "", // 采集类型
  laboratoryName: props.labInfo.labName, // 所属试验室
  laboratoryId: props.labInfo.labId, // 所属试验室
  equipmentName: "", // 设备名称
  equipmentSn: "", // 设备编号
  maker: "", // 设备厂家
  model: "", // 规格型号
  location: "", // 位置
  dataType: "", // 状态
  remark: "" // 备注
})

const getDetailDatas = () => {
  getDetail(dataId.value).then((res: any) => {
    form.value = res
  })
}

// 试验室
const visibleTestRoom = ref<boolean>(false)
const selectedLab = ref<{ id: string; name: string }[]>([])
const openTestRoom = () => {
  if (form.value.laboratoryId) {
    selectedLab.value[0] = {
      id: form.value.laboratoryId,
      name: form.value.laboratoryName
    }
  }
  visibleTestRoom.value = true
}
const getTestRoom = (list) => {
  if (list.length == 0) {
    form.value.laboratoryName = ""
    form.value.laboratoryId = ""
  } else {
    form.value.laboratoryName = list[0].name
    form.value.laboratoryId = list[0].id
  }
  visibleTestRoom.value = false
}

const refForm = ref()
const confirmLoading = ref<boolean>(false)
const saveModal = async () => {
  await refForm.value.validateFields()
  confirmLoading.value = true
  saveEq(form.value)
    .then((res) => {
      message.success("保存成功")
      emit("updateList")
      visible.value = false
    })
    .catch(() => {
      confirmLoading.value = false
    })
}
</script>

<style lang="less" scoped></style>
