<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">商品管理</h1>
    <a-table :columns="columns" :data-source="data" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const data = ref([])

const columns = [
  { title: '商品名称', dataIndex: 'name' },
  { title: '价格', dataIndex: 'price' },
  { title: '库存', dataIndex: 'stock' },
  { title: '状态', dataIndex: 'status' },
  { title: '操作', key: 'action' }
]

onMounted(() => {
  // TODO: 加载商品数据
  data.value = []
})
</script>
