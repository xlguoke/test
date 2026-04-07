<template>
  <div>
    <a-modal
      v-model:visible="visibleAlter"
      width="90%"
      :destroy-on-close="true"
      :centered="true"
      :mask-closable="false"
      title="工地试验室变更"
      @cancel="cancelModel"
    >
      <a-tabs v-model:activeKey="current" :destroy-inactive-tab-pane="true">
        <a-tab-pane :key="1" :disabled="!isDetails" tab="基本信息">
          <a-spin tip="加载中..." :spinning="spinning">
            <div class="steps-content">
              <BaseInofAlter
                :key="alterId"
                ref="alterBaseLabRef"
                :alter-id="alterId"
                :alter-type="alterType"
                :details="isDetails"
              />
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane
          v-if="alterType.includes('TEST_ITEM')"
          :key="2"
          :disabled="!isDetails"
          tab="授权业务范围"
          force-render
        >
          <a-spin tip="加载中..." :spinning="spinning">
            <div class="steps-content">
              <AuthBusAlter
                v-if="alterId"
                :details="isDetails"
                :lab-id="labId"
                :alter-id="alterId"
              />
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane
          v-if="alterType.includes('PEOPLE')"
          :key="3"
          :disabled="!isDetails"
          tab="人员信息"
        >
          <a-spin tip="加载中..." :spinning="spinning">
            <div class="steps-content">
              <PersonAlter
                v-if="alterId"
                :alter-id="alterId"
                :details="isDetails"
                :lab-id="labId"
              />
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane
          v-if="alterType.includes('TEST_ITEM')"
          :key="5"
          :disabled="!isDetails"
          tab="检测业务范围"
        >
          <a-spin tip="加载中..." :spinning="spinning">
            <div class="steps-content">
              <LineOfBusAlter
                v-if="alterId"
                :alter-id="alterId"
                :details="isDetails"
                :lab-id="labId"
              />
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane :key="6" :disabled="!isDetails" tab="证明资料">
          <a-spin tip="加载中..." :spinning="spinning">
            <div class="steps-content">
              <InformationBackupAlter
                v-if="alterId"
                :details="isDetails"
                :alter-id="alterId"
                :lab-id="labId"
                :alter-type="alterType"
              />
            </div>
          </a-spin>
        </a-tab-pane>
      </a-tabs>

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
          key="submit"
          type="primary"
          :loading="loading"
          :disabled="current != 6 || isDetails"
          @click="submitAudit"
        >
          提交
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { Ref } from "vue"
import { ref, computed, watch, toRefs, onMounted, nextTick, provide, inject } from "vue"
import { message, Upload } from "ant-design-vue"

import BaseInofAlter from "./components/BaseInofAlter.vue"
import AuthBusAlter from "./components/AuthBusAlter.vue"
import PersonAlter from "./components/PersonAlter.vue"
import LineOfBusAlter from "./components/LineOfBusAlter.vue"
import InformationBackupAlter from "./components/InformationBackupAlter.vue"

import {
  checkTabAPI,
  submitLabAuditAPI,
  createAlterAPI,
  alterIntegrityCheck
} from "@/api/laboratory.api"

const loading = ref(false)

const isTabClick = ref(true)
const emit = defineEmits(["callBack"])

let alterId = ref("")
let alterType: Ref<Array<string>> = ref([])

let spinning = ref(false)
let current = ref(1)
let alterBaseLabRef = ref()
const updateSetup = async (type: string) => {
  console.log(type, current.value)
  switch (current.value) {
    case 1:
      if (type == "dw") {
        try {
          if (!isDetails.value) {
            await alterBaseLabRef.value.addBaseLaboratory()
            await alterIntegrityCheck(alterId.value, current.value)
          }
          if (alterType.value.includes("TEST_ITEM")) {
            current.value = 2
          } else if (alterType.value.includes("PEOPLE")) {
            current.value = 3
          } else {
            current.value = 6
          }
        } catch (error) {
          console.error(error)
        }
      }
      // baseLaboratoryRef.value.addBaseLaboratory().then((res) => {
      //   res ? emit("update:alterId", res) : "" //新增后返回编辑id 需要重新设置编辑id
      //   current.value++
      // })
      break
    case 2:
      if (type == "up") {
        current.value = 1
      } else {
        isDetails.value ? "" : await alterIntegrityCheck(alterId.value, current.value)
        if (alterType.value.includes("PEOPLE")) {
          current.value = 3
        } else if (alterType.value.includes("TEST_ITEM")) {
          current.value = 5
        } else {
          current.value = 6
        }
      }

      //await AuthBusinessScopeRef.value.addLaboratoryPaersonOk()
      // checkTab(current.value + 1).then((r) => {
      //   current.value++
      // })
      break
    case 3:
      if (type == "up") {
        if (alterType.value.includes("TEST_ITEM")) {
          current.value = 2
        } else {
          current.value = 1
        }
      } else {
        isDetails.value ? "" : await alterIntegrityCheck(alterId.value, current.value)
        if (alterType.value.includes("TEST_ITEM")) {
          current.value = 5
        } else {
          current.value = 6
        }
      }

      // checkTab(current.value + 1).then((r) => {
      //   current.value++
      // })
      break
    case 5:
      if (type == "up") {
        if (alterType.value.includes("PEOPLE")) {
          current.value = 3
        } else if (alterType.value.includes("TEST_ITEM")) {
          current.value = 2
        } else {
          current.value = 1
        }
      } else {
        isDetails.value ? "" : await alterIntegrityCheck(alterId.value, current.value)
        current.value = 6
      }
      // checkTab(current.value + 1).then((r) => {
      //   current.value++
      // })
      break

    case 6:
      if (type == "up") {
        if (alterType.value.includes("TEST_ITEM")) {
          current.value = 5
        } else if (alterType.value.includes("PEOPLE")) {
          current.value = 3
        } else {
          current.value = 1
        }
      }
      break
  }
}
let labId = ref("")
let isDetails = ref(false)
/**
 * @function  showModal
 * @description 打开变更模态框
 * @param {String} id   - 试验室id
 * @param {String} type - 试验室变更项
 * @param {String} alId - 变更申请id
 * @param {Boolean} isDet - 是否详情模式
 * @return {String}
 * @author yanghui 2022/07/06
 * @version 1.0.0
 * @example
 */
const showModal = async (id: string, type: Array<string>, alId: string, isDet = false) => {
  alterType.value = type
  current.value = 1
  labId.value = id
  visibleAlter.value = true
  try {
    //获取变更id
    if (alId) {
      alterId.value = alId
      isDetails.value = isDet
    } else {
      alterId.value = ""
      alterId.value = await createAlterAPI(id, type)
    }
  } catch (error) {
    console.error(error)
  }
}

const visibleAlter = ref<boolean>()

const cancelModel = () => {
  console.log("测试11111111")
  visibleAlter.value = false
}

const submitAudit = async () => {
  try {
    loading.value = true
    await alterIntegrityCheck(alterId.value, 6)
    await submitLabAuditAPI({
      labId: labId.value,
      applyId: alterId.value,
      applyType: "AMEND",
      remark: ""
    })
    message.success("审核提交成功")
    visibleAlter.value = false
    emit("callBack")
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

defineExpose({
  showModal
})
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
