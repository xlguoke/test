<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import autoUpdate from '@/stores/autoUpdate'

const { autoUpdateTime } = storeToRefs(autoUpdate())

const visible = ref<boolean>(false)
const updateTime = ref([1])

const columns = ref([
  { text: '每隔 1 小时更新一次', value: 1 },
  { text: '每隔 0.5 小时更新一次', value: 0.5 },
  { text: '不自动更新', value: 0 },
])

function openSet() {
  updateTime.value = [autoUpdateTime.value]
  visible.value = true
}

function handleOk() {
  autoUpdate().setUpdateTime(updateTime.value[0])
  visible.value = false
}
</script>

<template>
  <div>
    <span class="label">自动更新时间设置</span>
    <div class="value" @click="openSet">
      <span v-if="autoUpdateTime">每隔 {{ autoUpdateTime }} 小时更新一次</span>
      <span v-else>不自动更新</span>
      <van-icon name="arrow" />
    </div>
    <van-popup v-model:show="visible" round position="bottom">
      <van-picker
        v-model="updateTime"
        :columns="columns"
        @confirm="handleOk"
        @cancel="visible = false"
      />
    </van-popup>
  </div>
</template>

<style></style>
