<template>
  <div>
    <a-modal
      v-model:visible="modelVisible"
      width="550px"
      :centered="true"
      title="退回"
      :mask-closable="false"
      @ok="rollbackFormSubmit"
      @cancel="cancelHandle"
    >
      <a-form
        ref="rollbackFromRef"
        :model="rollbackForm"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item
          label="退回原因"
          name="reason"
          :rules="[{ required: true, message: '退回原因!' }]"
        >
          <a-input v-model:value="rollbackForm.reason" placeholder="退回原因" />
        </a-form-item>
        <a-form-item label="退回说明" name="remark">
          <a-textarea
            v-model:value="rollbackForm.remark"
            :rows="4"
            placeholder="请输入说明"
            :maxlength="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, toRefs } from "vue"
import { rollbackEarlyWarningAPI } from "@/api/earlyWarn.api"
import { Modal, message } from "ant-design-vue"

const props = defineProps({
  id: {
    type: String,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: ""
  }
})
const { visible, id, type } = toRefs(props)

watch(visible, (val) => {
  val ? (modelVisible.value = true) : (modelVisible.value = false)
  resetFrom()
})

const emit = defineEmits(["update:visible", "callBack"])

let modelVisible = ref(false)

const resetFrom = () => {
  rollbackForm.value = {
    id: "",
    reason: "",
    remark: "",
    kind: ""
  }
  rollbackFromRef.value && rollbackFromRef.value.resetFields() //重置表单
}

let rollbackFromRef = ref()

let rollbackForm = ref({
  id: "",
  reason: "",
  remark: "",
  kind: ""
})

//数据提交
const rollbackFormSubmit = async () => {
  rollbackForm.value.id = id.value
  rollbackForm.value.kind = type.value

  await rollbackFromRef.value.validateFields()
  await rollbackEarlyWarningAPI(rollbackForm.value)
  emit("update:visible", false)
  emit("callBack")
  message.success("退回成功")
}

const cancelHandle = () => {
  emit("update:visible", false)
}
</script>

<style scoped lang="less"></style>
