<template>
  <div class="header">
    <img class="logo" :src="unitInfo?.logoUrl" alt="logo" />
    <div class="flex items-center gap-[0.48rem]">
      <div class="network_status" :class="isOnline ? 'online' : 'offline'">
        {{ isOnline ? "正常" : "异常" }}
      </div>
      <Account class="flex-1" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import { useNetwork } from "@vueuse/core"
import request from "@/utils/request"
import Account from "./Account.vue"

interface unitInfo {
  unitName: string
  logoUrl: string
}

const { isOnline } = useNetwork()

const unitInfo = ref<unitInfo>()

async function getUnitInfo() {
  const { data, code } = await request.get("/api/smart-screen/config/unit/info")
  if (code === 20000) {
    unitInfo.value = data
  }
}
getUnitInfo()
</script>
<style lang="less" scoped>
.header {
  position: fixed;
  top: 0.2rem;
  left: 0;
  right: 0;
  height: 0.72rem;
  padding: 0 0.48rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #151515;
  font-size: 0.24rem;
  margin-bottom: 0.16rem;

  .logo {
    height: 0.72rem;
  }
  .network_status {
    display: flex;
    align-items: center;
    margin-left: 0.64rem;

    &::before {
      content: "";
      display: inline-block;
      width: 0.12rem;
      height: 0.12rem;
      border-radius: 50%;
      margin-right: 0.12rem;
    }
    &.online {
      &::before {
        background-color: #24b276;
      }
    }
    &.offline {
      &::before {
        background-color: #ffae58;
      }
    }
  }
}
</style>
