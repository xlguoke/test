<template>
  <a-space>
    <a-button size="small" type="ghost" :icon="h(SettingOutlined)" @click="handleClickSetting" />
    <a-button size="small" type="ghost" :icon="isFullscreen ? h(CompressOutlined) : h(ExpandOutlined)" @click="handleClickExpand" />
  </a-space>
</template>

<script setup lang="ts">
import { CompressOutlined, ExpandOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import IlisThemeSettingModal from '~/components/ilisComponent/IlisThemeSettingModal.vue'
import { useMenuStore } from '~/store/menuStore'

const { isFullscreen } = storeToRefs(useMenuStore())

function handleClickSetting() {
  AnyDialogHelper.showModel(IlisThemeSettingModal)
}

/** # 全屏/退出全屏 */
function handleClickExpand() {
  if (isFullscreen.value) {
    document.exitFullscreen()
  }
  else {
    document.documentElement.requestFullscreen()
  }
  isFullscreen.value = !isFullscreen.value
}
</script>

<style scoped>
:deep(.ant-btn){
  color: #fff !important;
}
</style>
