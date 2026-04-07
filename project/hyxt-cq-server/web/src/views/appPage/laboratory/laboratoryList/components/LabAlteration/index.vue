<template>
  <div>
    <a-modal
      v-model:visible="visible"
      width="400px"
      :destroy-on-close="true"
      :centered="true"
      :mask-closable="false"
      title="请选择变更内容"
      @cancel="cancelModel"
      @ok="commitOk"
    >
      <a-spin tip="加载中..." :spinning="spinning">
        <div class="steps-content">
          <a-checkbox-group v-model:value="selValue" style="width: 100%">
            <a-row class="checkbox_row">
              <a-col :span="24">
                <a-checkbox value="LAB_NAME">试验室名称变更</a-checkbox>
              </a-col>
            </a-row>
            <a-row class="checkbox_row">
              <a-col :span="24">
                <a-checkbox value="DELAY">延期变更</a-checkbox>
              </a-col>
            </a-row>
            <a-row class="checkbox_row">
              <a-col :span="24">
                <a-checkbox value="PEOPLE">试验室人员变更</a-checkbox>
              </a-col>
            </a-row>
            <a-row class="checkbox_row">
              <a-col :span="24">
                <a-checkbox value="TEST_ITEM">试验检测项目（参数）变更</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </div>
      </a-spin>
    </a-modal>

    <Alteration ref="alterationRef" @callBack="emit('callBack')" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { message, Upload } from "ant-design-vue"

import { alterIdGetLabIdAPI, getRecordDetailsAlterAPI } from "@/api/laboratory.api"
import Alteration from "./alteration.vue"

const loading = ref(false)

const emit = defineEmits(["callBack"])

const selValue = ref([])

let spinning = ref(false)
let visible = ref(false)
let labId = ref("") //需要变更的试验室id
const showModal = async (id: string, isEditAlter) => {
  if (isEditAlter) {
    try {
      let alterId = await alterIdGetLabIdAPI(id)
      let res = await getRecordDetailsAlterAPI(alterId)
      alterationRef.value.showModal(id, res.contents, alterId)
      visible.value = false
    } catch (error) {
      console.error("接口错误：", error)
    }
  } else {
    selValue.value = []
    visible.value = true
    labId.value = id
  }
}
let alterationRef = ref()

const commitOk = () => {
  console.log(selValue.value)
  if (!selValue.value.length) {
    message.warning("请至少选择一个进行变更!")
    return
  }
  alterationRef.value.showModal(labId.value, selValue.value)
  visible.value = false
}

const cancelModel = () => {
  visible.value = false
}

defineExpose({
  showModal
})
</script>
<style lang="less" scoped>
.checkbox_row {
  padding: 10px 30px;
}
</style>
