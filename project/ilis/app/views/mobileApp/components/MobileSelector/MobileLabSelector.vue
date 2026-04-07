<template>
  <MobileStaticListSelector
    title="选择功能室"
    :data-source="getList"
    v-bind="$attrs"
  />
</template>

<script setup lang='ts'>
import qs from 'qs'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import MobileStaticListSelector from './MobileStaticListSelector.vue'

const props = defineProps({
  query: {
    type: Object,
  },
})

async function getList() {
  const res = await mRequest.post(
    '/rest/laboratoryController?dataGridPage',
    qs.stringify({
      page: 1,
      size: 999,
      ...props.query,
    }),
  )

  return res.obj.rows.map(item => ({
    ...item,
    label: item.name,
    value: item.id,
  }))
}
</script>
