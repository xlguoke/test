<template>
  <div class="account">
    <div v-if="!!userInfo">
      <div @click="menuVisible = true">您好，{{ userInfo.realName }}</div>
    </div>
    <div v-else class="text-[#0066ec] cursor-pointer" @click="onLogin">登录</div>

    <van-action-sheet
      v-model:show="menuVisible"
      :actions="actions"
      cancel-text="取消"
      close-on-click-action
      :teleport="layoutEle"
      @select="onSelect"
    />

    <ScanLogin ref="scanLoginRef" />
  </div>
</template>
<script lang="ts" setup>
import { userStore } from "@/store/user"
import { message } from "ant-design-vue"
import { showConfirmDialog } from "vant"
import { onMounted, ref, toRefs } from "vue"
import { useRouter } from "vue-router"
import ScanLogin from "./ScanLogin.vue"

let layoutEle: HTMLElement | null

const router = useRouter()

const user = userStore()

const { userInfo } = toRefs(userStore())

const menuVisible = ref(false)

const scanLoginRef = ref()

const actions = ref([{ name: "账号信息" }, { name: "退出系统", color: "#ff0000" }])

async function onLogin() {
  await scanLoginRef.value.auth({})
}

function onSelect(action) {
  const { name } = action

  if (name === "退出系统") {
    showConfirmDialog({
      title: "提示",
      message: "您确定要注销吗？",
      teleport: document.querySelector("#app .layout")
    }).then(() => {
      user.logout()
      message.success("注销成功！")
    })
  } else if (name === "账号信息") {
    router.push({
      path: "/functionRoom2/userInfo"
    })
  }
}

onMounted(() => {
  layoutEle = document.querySelector("#app .layout")
})
</script>

<style lang="less" scoped>
.account {
  display: flex;
  justify-content: flex-end;
}
</style>
