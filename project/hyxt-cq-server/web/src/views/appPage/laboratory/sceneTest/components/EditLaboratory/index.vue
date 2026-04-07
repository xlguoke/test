<template>
  <div>
    <a-modal
      v-model:visible="visibleFildLaboratory"
      width="70%"
      :destroy-on-close="true"
      :centered="true"
      :mask-closable="false"
      :title="modelTitle"
      @cancel="cancelModel"
    >
      <div class="step_wrap">
        <a-steps :current="current" :initial="1" size="small" progress-dot @change="changeSteps">
          <a-step title="基本信息" />
          <a-step title="授权业务范围" />
          <a-step title="人员信息" />
          <a-step title="设备信息" />
          <a-step title="检测业务范围" />
          <a-step title="备案资料" />
          <!-- <a-step title="建设单位审批资料" /> -->
        </a-steps>
      </div>

      <a-spin tip="加载中..." :spinning="spinning">
        <div class="steps-content">
          <div v-if="current === 1">
            <BaseLaboratoryForm ref="baseLaboratoryRef" :edit-id="editId" />
          </div>
          <div v-if="current === 2" class="person_wrap">
            <AuthBusinessScope ref="AuthBusinessScopeRef" :edit-id="editId" />
          </div>
          <div v-if="current === 3" class="person_wrap">
            <PersonConfig ref="PersonConfigRef" :edit-id="editId" />
          </div>
          <div v-if="current === 4" class="equipment_wrap">
            <EquipmentConfig :edit-id="editId" />
          </div>
          <div v-if="current === 5">
            <LineOfBusiness :edit-id="editId" />
          </div>
          <div v-if="current === 6">
            <InformationBackup :edit-id="editId" />
          </div>
          <!-- <div v-if="current === 7">
            <ApprovalFiles :edit-id="editId" />
          </div> -->
        </div>
      </a-spin>

      <template #footer>
        <a-button @click="cancelModel">关闭</a-button>
        <a-button
          :loading="loading"
          type="primary"
          :disabled="current == 1"
          @click="updateSetup('up')"
        >
          上一步
        </a-button>
        <a-button
          :loading="loading"
          type="primary"
          :disabled="current == 6"
          @click="updateSetup('dw')"
        >
          下一步
        </a-button>
        <a-button
          v-if="applyCode == ''"
          key="submit"
          type="primary"
          :loading="loading"
          :disabled="current < 6"
          @click="operatingSteps"
        >
          完成
        </a-button>

        <a-button
          v-if="applyCode != ''"
          key="submit"
          type="primary"
          :loading="loading"
          :disabled="current < 6"
          @click="applySendFun"
        >
          {{ applyCode == "AMEND" ? "变更申请" : "延期申请" }}
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { Ref } from "vue"
import { ref, computed, watch, toRefs, onMounted, nextTick, provide, inject } from "vue"
import BaseLaboratoryForm from "./BaseLaboratoryForm.vue"
import PersonConfig from "./PersonConfig.vue"
import EquipmentConfig from "./EquipmentConfig.vue"
import LineOfBusiness from "./LineOfBusiness.vue"
import InformationBackup from "./InformationBackup.vue"
import AuthBusinessScope from "./AuthBusinessScope.vue"
import ApprovalFiles from "./ApprovalFiles.vue"
import { message, Upload } from "ant-design-vue"

import { checkTabAPI, submitLabAuditAPI } from "@/api/laboratory.api"

const loading = ref(false)
const props = defineProps({
  visible: {
    type: Boolean, //显示
    default: false
  },
  editId: {
    type: String, //编辑id
    required: true
  }
})
const { visible, editId } = toRefs(props) //父组件参数

let applyCode = inject("applyCode") as Ref //  编辑类型 延期||变更
let isApply = ref(false) //  是否有申请变更或延期
provide("isApply", isApply)
watch(applyCode, (v) => {
  isApply.value = v != "" ? true : false
})

// provide('laboratoryId', editId)

const emit = defineEmits(["addOk", "update:visible", "update:editId"])

const modelTitle = computed(() => {
  if (editId.value) {
    if (applyCode.value == "AMEND") {
      return "现场检测项目变更"
    } else if (applyCode.value == "DELAY") {
      return "现场检测项目延期"
    } else {
      return "编辑现场检测项目"
    }
  } else {
    return "新增现场检测项目"
  }
})

let spinning = ref(false)
let current = ref(1)

let baseLaboratoryRef = ref()
let PersonConfigRef = ref()
let AuthBusinessScopeRef = ref()

const updateSetup = (type: string) => {
  if (type == "up") {
    current.value--
  } else {
    operatingSteps()
  }
}
const checkTab = async (target: Number) => {
  return await checkTabAPI({
    labId: editId.value,
    flow: current.value,
    targetFlow: target
  })
}

const visibleFildLaboratory = ref<boolean>()
watch(visible, (v) => {
  visibleFildLaboratory.value = v
  if (!v) {
    current.value = 1 //每次关闭 重置步骤数和试验室id
    emit("addOk")
  }
})

const cancelModel = () => {
  emit("update:visible", false)
}

const changeSteps = async (v) => {
  if (editId.value) {
    if (current.value > v) {
      //如果是后面往前面跳转，直接跳转
      current.value = v
    } else {
      if (current.value == 1) {
        //如果当前是编辑基本信息步骤，需要先验证 保存后在进行步骤跳转
        await baseLaboratoryRef.value.addBaseLaboratory()
      }
      checkTab(v).then((r) => {
        current.value = v
      })
    }
  } else {
    message.warning("试验室基本信息未保存!")
    return
  }
}

//发起变更或者延期申请
const applySendFun = async () => {
  submitLabAuditAPI({
    labId: editId.value,
    applyType: applyCode.value
  }).then((res) => {
    message.success("操作成功")
    visibleFildLaboratory.value = false
    emit("addOk")
  })
}

//每步按钮的执行事件
const operatingSteps = async () => {
  switch (current.value) {
    case 1:
      baseLaboratoryRef.value.addBaseLaboratory().then((res) => {
        res ? emit("update:editId", res) : "" //新增后返回编辑id 需要重新设置编辑id
        current.value++
      })
      break
    case 2:
      //await AuthBusinessScopeRef.value.addLaboratoryPaersonOk()
      checkTab(current.value + 1).then((r) => {
        current.value++
      })
      break
    case 3:
      checkTab(current.value + 1).then((r) => {
        current.value++
      })
      break
    case 4:
      checkTab(current.value + 1).then((r) => {
        current.value++
      })
      break
    case 5:
      checkTab(current.value + 1).then((r) => {
        current.value++
      })
      break
    case 6:
      checkTab(current.value + 1).then((r) => {
        message.success("操作成功")
        visibleFildLaboratory.value = false
        emit("addOk")
      })
      break
    case 7:
      // checkTab(current.value).then((r) => {
      //   message.success("操作成功")
      //   visibleFildLaboratory.value = false
      //   emit("addOk")
      // })
      break
  }
}
</script>
<style lang="less" scoped>
.step_wrap {
  width: 100%;
  margin: 0 auto;
}

.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  height: 550px;
  padding: 10px;
  overflow: auto;

  .baseForm {
    width: 900px;
    margin: 0 auto;
  }
}
</style>
