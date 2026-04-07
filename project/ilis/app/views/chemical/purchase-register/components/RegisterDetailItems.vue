<template>
  <div class="p-2">
    <IlisTable
      row-key="id"
      :entity="ChemicalPurchaseRegisterItemBaseEntity"
      :data-source="items"
      :loading="loading"
      :pagination="false"
      resizable
    />
  </div>
</template>

<script setup lang="ts">
import type { ChemicalPurchaseRegisterItem } from '../api'
import { message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { getPurchaseRegisterDetail } from '../api'
import { ChemicalPurchaseRegisterItemBaseEntity } from '../ChemicalPurchaseRegisterEntity'

const props = defineProps<{
  registerId: string
}>()

const loading = ref(false)
const items = ref<ChemicalPurchaseRegisterItem[]>([])

onMounted(async () => {
  if (!props.registerId)
    return
  loading.value = true
  try {
    const { data } = await getPurchaseRegisterDetail(props.registerId)
    items.value = data.items || []
  }
  catch (error) {
    console.error(error)
    message.error('获取详情数据失败')
  }
  finally {
    loading.value = false
  }
})
</script>
