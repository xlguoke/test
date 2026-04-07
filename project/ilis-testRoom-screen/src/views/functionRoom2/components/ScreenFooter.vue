<template>
  <div class="contain">
    <div class="main">
      <div class="powerdBy">技术支持：重庆海特科技发展有限公司</div>
      <div>编码：{{ screenConfig.sn }}</div>
      <div>
        <span v-if="apkVersion" @click="checkUpdate">{{ apkVersion }} /&nbsp;</span>
        <span>{{ packageJSON.version }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "@/store"
import { toRefs, ref, onMounted } from "vue"
import packageJSON from "../../../../package.json"
import { androidTools } from "@/utils/AndroidTools"

const apkVersion = ref()

function checkUpdate() {
  androidTools.checkUpdate()
}

const { screenConfig } = toRefs(useStore())

onMounted(() => {
  apkVersion.value = androidTools.getAppVersion()
})
</script>

<style lang="less" scoped>
.contain {
  width: 100%;
  height: 0.4rem;
}
.main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: Source Han Sans;
  font-size: 0.18rem;
  font-weight: bold;
  letter-spacing: 0.03rem;
  color: #224059;
  padding: 0.09rem 0.4rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.android-version {
  font-size: 12px;
  color: #49557c;
  position: fixed;
  bottom: 8px;
  left: 8px;
  z-index: 200;
}
</style>
