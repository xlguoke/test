<template>
  <div>
    <a-modal
      v-model:visible="visible"
      width="75%"
      :destroy-on-close="true"
      :title="title"
      @cancel="cancelModel"
    >
      <AccountLogoutInfo v-if="kind == 'ORG_LOGOUT'" :id="id" />

      <AccountInfo v-if="kind == 'ORG_REG'" :id="id" />
      <DetectionScoresInfo v-if="kind == 'ACHIEVEMENT_TEST_ADD'" :id="id" />

      <DetectionScoresChangeForLab v-if="kind == 'ACHIEVEMENT_LABORATORY_UPDATE'" :id="id" />

      <DetectionScoresChange v-if="kind == 'ACHIEVEMENT_TEST_UPDATE'" :id="id" />

      <LaboratoryInfo v-if="kind == 'NewLaboratory'" :id="id" />

      <LaboratoryBaseChangeInfo v-if="kind == 'LaboratoryAmend'" :id="id" />

      <LaboratoryDetails
        v-if="labClassify == 'LAB' && kind != 'AMEND'"
        :lab-id="id"
        :is-apply="['AMEND', 'DELAY'].includes(kind) ? true : false"
      />

      <ItemDetails
        v-if="labClassify == 'ITEM' && kind != 'AMEND'"
        :lab-id="id"
        :is-apply="['AMEND', 'DELAY'].includes(kind) ? true : false"
      />

      <ProjectsInfo v-if="kind == 'WATERWAY_PROJECT_AUDIT'" :id="id" />

      <ConstructionRegist v-if="kind == 'CONSTRUCTOR_ENROLL'" :id="id" />

      <template #footer>
        <a-button type="primary" @click="cancelModel">确定</a-button>
      </template>
    </a-modal>

    <OrgAmendDetail v-if="isOrgAmend" ref="orgAmendDetailRef" />

    <LabAlteration ref="labAlterationRef" />

    <ItemAlteration ref="itemAlterationRef" />
  </div>
</template>
<script lang="ts" setup>
import { getAuditoClassifyAPI } from "@/api/infoCheck.api"
import { ref, toRefs, watch, onMounted, nextTick, computed } from "vue"
// import { getlabIdByApplyId } from "@/api/infoCheck.api"
import DetectionScoresInfo from "../components/DetectionScoresInfos.vue"
import AccountLogoutInfo from "../components/AccountLogoutInfo.vue"
import AccountInfo from "../components/AccountInfo.vue"
import DetectionScoresChange from "../components/DetectionScoresChange.vue"
import DetectionScoresChangeForLab from "../components/DetectionScoresChangeForLab.vue"
import LaboratoryInfo from "../components/LaboratoryInfo.vue"
import LaboratoryBaseChangeInfo from "../components/LaboratoryChangeInfo.vue"
// 工地试验室详情
import LaboratoryDetails from "../../laboratory/laboratoryList/components/LaboratoryDetails/index.vue"

// 现场检测项目详情
import ItemDetails from "../../laboratory/sceneTest/components/LaboratoryDetails/index.vue"

import { getRecordDetailsAlterAPI } from "@/api/laboratory.api"

// 工地试验室变更详情
import LabAlteration from "../../laboratory/laboratoryList/components/LabAlteration/alteration.vue"

// 现场检测项目变更详情
import ItemAlteration from "../../laboratory/sceneTest/components/LabAlteration/alteration.vue"

//项目注册申请详情
import ProjectsInfo from "./ProjectsInfo.vue"
//建设单位注册详情
import ConstructionRegist from "./ConstructionRegist.vue"

// 机构变更详情
import OrgAmendDetail from "@/views/appPage/orgAmend/components/Detail.vue"

const props = defineProps({
  id: {
    type: String,
    default: ""
  },
  kind: {
    type: String,
    default: ""
  },
  visible: {
    type: Boolean,
    default: false
  }
})
const { visible, id, kind } = toRefs(props)
let labAlterationRef = ref()
let itemAlterationRef = ref()

let labClassify = ref("")
const orgAmendDetailRef = ref()

const isOrgAmend = computed(() => ["ORG_AMEND_REVIEW", "ORG_AMEND_PROCESSING"].includes(kind.value))

watch(visible, async () => {
  if (visible.value) {
    if (isOrgAmend.value) {
      emit("update:visible", false)
      nextTick(() => {
        orgAmendDetailRef.value.openModal(id.value, true)
      })
      return
    }

    const isLabAudit = ["KEEP", "AMEND", "REVOKE"].includes(kind.value) //是否试验室相关审核
    labClassify.value = isLabAudit ? await getAuditoClassifyAPI(kind.value, id.value) : "" //审核类型是_现场检测还是工地试验室

    if (kind.value == "AMEND") {
      //如果是查看试验室变更详情
      emit("update:visible", false)
      try {
        let res = await getRecordDetailsAlterAPI(id.value)
        labClassify.value == "LAB"
          ? labAlterationRef.value.showModal("", res.contents, id.value, true)
          : itemAlterationRef.value.showModal("", res.contents, id.value, true)
      } catch (error) {}
    }
  }
})

const emit = defineEmits(["update:visible", "auditOk"])

let title = ref()

const setTitle = () => {
  console.log("详情类型", kind.value)
  switch (kind.value) {
    case "ORG_LOGOUT": //注销申请
      title.value = "账户注销"
      break
    case "ORG_REG": //机构注册
      title.value = "机构注册"
      break
    case "ACHIEVEMENT_TEST_ADD": //新增检测业绩
      title.value = "新增检测业绩"
      break
    case "ACHIEVEMENT_LABORATORY_UPDATE": //试验室业绩变更
      title.value = "试验室业绩变更"
      break
    case "ACHIEVEMENT_TEST_UPDATE": //检测业绩变更
      title.value = "检测业绩变更"
      break
    case "NewLaboratory": //新增试验室
      title.value = "新增试验室"
      break
    case "LaboratoryAmend": //试验室信息变更
      title.value = "试验室信息变更"
      break
    case "CONSTRUCTOR_ENROLL": //注册建设单位审核
      title.value = "建设单位注册审核"
      break
    case "WATERWAY_PROJECT_AUDIT": //工程项目注册审批
      title.value = "工程项目注册审批"
      break
    case "REVOKE":
      title.value = "工地试验室详情"
      break
    case "ORG_AMEND_REVIEW":
      title.value = "检测机构信息变更"
      break
    case "ORG_AMEND_PROCESSING":
      title.value = "检测机构信息变更"
      break
    default:
      title.value = "详情"
      break
  }
}
const cancelModel = () => {
  emit("update:visible", false)
}

onMounted(async () => {
  console.log(233345, kind.value)

  setTitle()
})
</script>

<style lang="less" scoped></style>
