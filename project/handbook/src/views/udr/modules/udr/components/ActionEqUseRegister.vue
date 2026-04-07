<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { EquipmentUseRecord, EquipmentUseRecordAdd } from '../../equipment-use-register'
import { udrCore } from '@/views/udr/provider/UdrCore'
import BaseModal from '@/views/udr/components/BaseModal.vue'

// 设备使用登记下拉菜单
const showDropdownMenu = ref(false)
const eqUseRecordVisible = ref(false)
const eqUseRecordActions = ref([
  { text: '设备使用记录', key: 1 },
  { text: '扫码登记', key: 2 },
])
const offset = ref<[number, number]>([-50, 8])

const eqUseRecordAddRef = ref()

function clickDropdownMenu(e: Event) {
  const rect = (e.target as any).getBoundingClientRect()
  const udrAction = document.querySelector('.udr-action') as HTMLElement
  const parentRect = udrAction.getBoundingClientRect()
  // 140px为设备使用记录按钮的宽度 + 预留右边距
  const left = 140 + rect.left - parentRect.left
  const x = udrAction.offsetWidth - left
  offset.value[0] = x < 0 ? x : 0
}

// 设备使用登记下拉菜单
function triggleDropdownMenu(row: any) {
  if (!row || !row.key)
    return

  if (row.key === 1)
    eqUseRecordVisible.value = true
  else if (row.key === 2)
    udrCore.$this.startScanErCode('udr-main', 'eqUseRegisterScanCallback')
}

(window as any).eqUseRegisterScanCallback = (ercode: string) => {
  eqUseRecordAddRef.value.showScanModal(ercode)
}

const isVisible = computed(() => showDropdownMenu.value || eqUseRecordVisible.value)

// 隐藏/显示udr
watch(isVisible, (newVal) => {
  udrCore.$this.setUdrVisibility(!newVal)
})
</script>

<template>
  <div>
    <van-popover v-model:show="showDropdownMenu" :offset="offset" :actions="eqUseRecordActions" @select="triggleDropdownMenu">
      <template #reference>
        <div class="udr-action-dropdown-link" @click="clickDropdownMenu($event)">
          <img src="@/assets/images/udr/action-preview.svg">
          设备使用登记
          <van-icon name="arrow-down" />
        </div>
      </template>
    </van-popover>

    <BaseModal
      v-model:show="eqUseRecordVisible"
      title="设备使用登记"
      hide-footer
      @close="eqUseRecordVisible = false;"
    >
      <EquipmentUseRecord v-if="eqUseRecordVisible" />
    </BaseModal>

    <EquipmentUseRecordAdd ref="eqUseRecordAddRef" />
  </div>
</template>

<style scoped>
.udr-action-dropdown-link{
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  font-size: 14px;
}
</style>
