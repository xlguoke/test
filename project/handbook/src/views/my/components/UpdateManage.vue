<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UpdateManageItem from './UpdateManageItem.vue'
import baseDataStore from '@/stores/baseData'
import type { DataVersionDTO } from '@/type/common'

const isDev = __DEV__
const dataList = ref<DataVersionDTO[]>([])
onMounted(async () => {
  dataList.value = await baseDataStore().dataVersions
})

// 清除更新记录
async function clearUpdateRecords() {
  baseDataStore().updateTime = {}
  location.reload()
}
</script>

<template>
  <div class="show-title-bar update-manage">
    <TitleBar />
    <div class="pd">
      <h4 class="title">
        离线数据更新列表
        <a v-if="isDev" href="javascript: void(0);" style="float:right;" @click="clearUpdateRecords">
          清除更新记录
        </a>
      </h4>
      <ul class="update-data-list">
        <template v-for="item in dataList" :key="item.type">
          <UpdateManageItem :data-item="item" />
        </template>
      </ul>
    </div>
  </div>
</template>

<style lang="less" scoped>
.update-manage {
  .title {
    margin-bottom: 1.5rem;
    font-size: 18px;
  }

  .update-data-list {
    height: 50vh;
  }
}

@media screen and (max-width: 480px) {
  .update-manage {
    .title {
      font-size: 16px;
    }
  }
}
</style>
