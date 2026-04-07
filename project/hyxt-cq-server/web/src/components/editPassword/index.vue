<template>
  <a-modal
    v-model:visible="mvisible"
    title="修改密码"
    :closable="!hideCancel"
    :mask-closable="false"
    :keyboard="false"
    width="700px"
    @cancel="cancelModal"
  >
    <template #footer>
      <a-button v-if="!hideCancel" @click="cancelModal">取消</a-button>
      <a-button type="primary" :loading="saveLoading" @click="saveModal">确定</a-button>
    </template>
    <a-alert
      v-if="hideCancel"
      type="warning"
      style="margin-bottom: 18px"
      show-icon
      :message="
        !!userInfo.lastAlterPasswordAt
          ? '系统检测到您的密码已超过90天未修改，为确保账户安全，请修改密码！'
          : '当前登录密码为系统初始密码，为确保账户安全，请修改密码！'
      "
    />

    <EditPassword :key="updateKey" ref="editPwd" hide-ok />
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import dayjs from "dayjs"
import EditPassword from "./passwordForm.vue"
import userInfoStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
const userStore: any = userInfoStore()
const { userInfo } = storeToRefs(userStore)

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(["update:visible"])
const mvisible = ref<boolean>(props.visible)
const updateKey = ref<number>()
const hideCancel = ref<boolean>(false)

// 90天前
const lastEditPwd = dayjs().subtract(89, "days").valueOf()

onMounted(() => {
  // 超出90天未修改密码，或第一次登录，需要强制修改密码
  const { lastAlterPasswordAt } = userInfo.value
  if (!lastAlterPasswordAt || lastAlterPasswordAt <= lastEditPwd) {
    mvisible.value = true
    hideCancel.value = true
  }
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      updateKey.value = new Date().getTime()
    }
    mvisible.value = val
  }
)
const cancelModal = () => {
  mvisible.value = false
  emit("update:visible", false)
}

const editPwd = ref()
const saveLoading = ref(false)
const saveModal = async () => {
  try {
    saveLoading.value = true
    await editPwd.value.savePassword()
    userInfo.value.loginTimes = 2
    userStore.$state = {
      userInfo: userInfo.value
    }
    cancelModal()
    saveLoading.value = false
  } catch (err) {
    saveLoading.value = false
  }
}
</script>

<style lang="less" scoped></style>
