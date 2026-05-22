<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">订单管理</h1>
    <a-table :columns="columns" :data-source="data" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const data = ref([])

const columns = [
  { title: '订单号', dataIndex: 'orderNo' },
  { title: '会员', dataIndex: 'memberName' },
  { title: '金额', dataIndex: 'amount' },
  { title: '状态', dataIndex: 'status' },
  { title: '时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action' }
]

onMounted(() => {
  // TODO: 加载订单数据
  data.value = []
})
</script>
