<script setup lang="ts">
import { Spin } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import UpdateManageItem from './UpdateManageItem.vue'
import baseDataStore from '@/stores/baseData'
import type { DataVersionDTO } from '@/type/common'

const spinning = ref<boolean>(false)
const dataList = ref<DataVersionDTO[]>([])
onMounted(async () => {
  dataList.value = await baseDataStore().dataVersions
})
</script>

<template>
  <div class="show-title-bar update-manage">
    <TitleBar />
    <Spin :spinning="spinning">
      <div class="pd">
        <h4 class="title">
          离线数据更新列表
        </h4>
        <ul class="update-data-list">
          <template v-for="item in dataList" :key="item.type">
            <UpdateManageItem :data-item="item" />
          </template>
        </ul>
      </div>
    </Spin>
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
