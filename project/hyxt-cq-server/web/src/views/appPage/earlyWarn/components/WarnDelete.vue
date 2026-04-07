<template>
  <div>
    <a-modal
      v-model:visible="modelVisible"
      width="550px"
      :centered="true"
      title="强制删除示警信息"
      :mask-closable="false"
      @ok="deleteFromSubmit"
      @cancel="cancelHandle"
    >
      <a-form
        ref="deleteFromRef"
        :model="deleteForm"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item
          label="删除原因"
          name="reason"
          :rules="[{ required: true, message: '请选择!' }]"
        >
          <a-input v-model:value="deleteForm.reason" placeholder="请输入删除原因" />
        </a-form-item>
        <a-form-item label="删除说明" name="remark">
          <a-textarea
            v-model:value="deleteForm.remark"
            :rows="4"
            placeholder="请输入删除说明"
            :maxlength="6"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRaw, watch, toRefs } from "vue"
import { deleteEarlyWarningAPI } from "@/api/earlyWarn.api"
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
const emit = defineEmits(["update:visible", "callBack"])

const { visible, id, type } = toRefs(props)

watch(visible, (val) => {
  val ? (modelVisible.value = true) : (modelVisible.value = false)
  resetFrom()
})

let modelVisible = ref(false)

const resetFrom = () => {
  deleteForm.value = {
    id: "",
    reason: "",
    remark: "",
    kind: ""
  }
  deleteFromRef.value && deleteFromRef.value.resetFields() //重置表单
}

let deleteFromRef = ref()

let deleteForm = ref({
  id: "",
  reason: "",
  remark: "",
  kind: ""
})

//数据提交
const deleteFromSubmit = async () => {
  deleteForm.value.id = id.value
  deleteForm.value.kind = type.value
  await deleteFromRef.value.validateFields()
  await deleteEarlyWarningAPI(deleteForm.value)
  emit("update:visible", false)
  emit("callBack")
  message.success("删除成功")
}

const cancelHandle = () => {
  emit("update:visible", false)
}
</script>

<style scoped lang="less"></style>
