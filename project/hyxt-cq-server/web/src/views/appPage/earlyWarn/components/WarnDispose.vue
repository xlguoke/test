<template>
  <div>
    <a-modal
      v-model:visible="modelVisible"
      width="550px"
      :centered="true"
      title="处理方案"
      :mask-closable="false"
      @ok="disposeFromSubmit"
      @cancel="cancelHandle"
    >
      <a-form
        ref="disposeFromRef"
        :model="disposeFrom"
        name="basic"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        autocomplete="off"
      >
        <a-form-item
          label="处理人"
          name="operator"
          :rules="[{ required: true, message: '请输入处理人!' }]"
        >
          <a-input
            v-model:value="disposeFrom.operator"
            :disabled="isDetails"
            placeholder="请输入处理人"
          />
        </a-form-item>
        <a-form-item
          label="处理方式"
          name="mannerCode"
          :rules="[{ required: true, message: '选择处理方式!' }]"
        >
          <DictCode
            v-model:value="disposeFrom.mannerCode"
            :disabled="isDetails"
            :code="dictionaryCode"
            placeholder="处理方式"
            @change="changeMannerCode"
          />
        </a-form-item>
        <a-form-item
          label="处理说明"
          name="remark"
          :rules="[{ required: true, message: '请输入!' }]"
        >
          <a-textarea
            v-model:value="disposeFrom.remark"
            :rows="4"
            :disabled="isDetails"
            placeholder="请输入处理说明"
            :maxlength="6"
          />
        </a-form-item>
        <a-form-item label="附件" name="attachments">
          <UploadFile v-model:value="disposeFrom.attachments" :disabled="isDetails" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, watch, toRefs, computed } from "vue"
import { addEarlyWarningProcessAPI } from "@/api/earlyWarn.api"
import { message } from "ant-design-vue"
import DictCode from "@/components/dictCode/index.vue"
import UploadFile from "@/components/uploadFile/index.vue"

const props = defineProps({
  id: {
    type: String,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  },
  isDetails: {
    type: Boolean,
    default: false
  },
  echo: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: ""
  }
})
const { visible, id, isDetails, echo, type } = toRefs(props)

const emit = defineEmits(["update:visible", "callBack"])

watch(visible, (val) => {
  val ? (modelVisible.value = true) : (modelVisible.value = false)
})

// let dictionaryCode = ref("")
watch(
  () => echo,
  (val: any) => {
    val.id ? (disposeFrom.value = val) : ""
  }
)

const dictionaryCode = computed(() => {
  if (type.value == "Analysis.Staff") {
    return "staffDispose"
  } else if (type.value == "Analysis.Collect") {
    return "gatherDispose"
  } else if (type.value == "Analysis.EQ") {
    return "equipmentDispose"
  } else {
    return ""
  }
})

let modelVisible = ref(false)

let disposeFromRef = ref()

let disposeFrom = ref({
  id: "",
  operator: "",
  mannerCode: "",
  mannerValue: "",
  remark: "",
  attachments: []
})

const resetFrom = () => {
  disposeFrom.value = {
    id: "",
    operator: "",
    mannerCode: "",
    mannerValue: "",
    remark: "",
    attachments: []
  }
  disposeFromRef.value && disposeFromRef.value.resetFields() //重置表单
}

// const isDetails = ref(false)
const uploadAccessory: any = ref([])

const changeMannerCode = (v) => {
  disposeFrom.value.mannerValue = v.option.name
}
//示警处理数据提交
const disposeFromSubmit = async () => {
  if (isDetails.value) {
    //如果是详情模式直接关闭
    emit("update:visible", false)
    return
  }
  disposeFrom.value.id = id.value

  try {
    await disposeFromRef.value.validateFields() //验证
  } catch (error) {
    console.error("表单验证失败")
    return
  }
  if (uploadAccessory.value.length) {
    disposeFrom.value.attachments = uploadAccessory.value.map((item) => {
      return item.url
    })
  }
  let params = JSON.parse(JSON.stringify(toRaw(disposeFrom.value)))
  params.attachments = JSON.stringify(params.attachments)
  try {
    await addEarlyWarningProcessAPI(params)
    message.success("操作成功!")
    resetFrom()
    emit("update:visible", false)
    emit("callBack")
  } catch (error) {
    console.error("操作失败")
  }
}

const cancelHandle = () => {
  resetFrom()
  emit("update:visible", false)
}
</script>

<style scoped lang="less"></style>
