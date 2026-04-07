<template>
  <div class="content-wrap flex-column">
    <RoomCard title="当前试验情况" class="flex-column flex-h-1">
      <!-- 试验室信息 -->
      <RoomLabInfo :lab-info="labInfo" show-status show-lab-intro show-more class="flex-h-1" />

      <div v-if="labInfo.status === '空闲中'" class="device-action">
        <span class="bg-btn" @click="changeTab('EqList')">试验室设备</span>
        <span class="bg-btn" @click="changeTab('RiskInformation')">风险告知</span>
      </div>
    </RoomCard>

    <div class="foot-btns" v-if="!isModalView">
      <div v-if="labInfo.status === '空闲中'" class="btn start" @click="startTest">开始试验</div>
      <div v-else class="btn end" @click="endTest">结束试验</div>
    </div>

    <!-- 确认弹窗 -->
    <ConfirmModal v-model:value="visible" @cancel="closeConfirm" @confirm="okConfirm">
      <span>{{ errMsg }}</span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onBeforeMount } from "vue"
import { useRouter } from "vue-router"
import ConfirmModal from "@/components/ConfirmModal.vue"
import { RoomCard, RoomLabInfo } from "../../components"
import { useBaseInfo } from "../../composables/useBaseInfo"
import { endLabTest } from "@/api/testRoom.api"
const { labInfo, getLabInfo } = useBaseInfo()
const router = useRouter()

// 来于useCustomTabs，用于切换标签页
const changeTab = inject("changeTab") as (key: string) => void
const loading = ref(inject("loading") as boolean)
const errMsg = ref("")
const isModalView = ref(parent.location.href.indexOf("/hallSeatScreen") !== -1);
const visible = ref(false)

// 开始试验
const startTest = () => {
  router.push({
    path: "/functionRoom/taskList",
    query: {
      labId: labInfo.value.id
    }
  })
}

// 结束试验
const endTest = () => {
  errMsg.value = "确认结束试验？"
  visible.value = true
}
const confirmEndTest = () => {
  loading.value = true
  endLabTest({
    laboratoryScreenId: labInfo.value.id
  })
    .then((res) => {
      loading.value = false
      if (res.code === 20000) {
        getLabInfo()
        return
      }
    })
    .catch(() => {
      loading.value = false
    })
}

// 确认弹窗 - 点击确认按钮
const okConfirm = () => {
  confirmEndTest()
  closeConfirm()
}

const closeConfirm = () => {
  visible.value = false
  errMsg.value = ""
}
</script>
