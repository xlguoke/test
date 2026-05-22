<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">会员管理</h1>
    <a-table :columns="columns" :data-source="data" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(false)
const data = ref([])

const columns = [
  { title: '昵称', dataIndex: 'nickname' },
  { title: '等级', dataIndex: 'level' },
  { title: '积分', dataIndex: 'points' },
  { title: '余额', dataIndex: 'balance' },
  { title: '累计消费', dataIndex: 'totalConsume' },
  { title: '操作', key: 'action' }
]

onMounted(() => {
  // TODO: 加载会员数据
  data.value = []
})
</script>
