<script setup lang="ts">
import { inject, ref, watch } from 'vue'
import { Checkbox } from 'ant-design-vue'
import type { DataVersionDTO } from '@/type/common'
import { useResourceFetch } from '@/composables/useResources'
import baseDataStore from '@/stores/baseData'

const { item } = defineProps<{ item: DataVersionDTO }>()
const { update, upgrade } = useResourceFetch(item.type)

const isOpenModal = ref<boolean>(inject('isOpenModal') || false)
const startUpdate = ref<number>(inject('startUpdate') || 0)
const selectedType = ref<string[]>(inject('selectedType') || [])

watch(
  () => update.value,
  (bol) => {
    if (!bol)
      return
    selectedType.value.push(item.type)
    if (!isOpenModal.value)
      isOpenModal.value = true
  },
)

watch(
  () => startUpdate.value,
  () => {
    if (!selectedType.value.includes(item.type))
      return
    upgrade().then(() => {
      baseDataStore().updateProcess++
    })
  },
)
</script>

<template>
  <Checkbox v-if="update" :key="item.type" :value="item.type">
    更新{{ item.title }}
  </Checkbox>
</template>

<style></style>
