<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import uploadManageStore from '@/stores/uploadManage'
import NoData from '@/components/noData/index.vue'

const uploadStore = uploadManageStore()
const { uploadDatas } = storeToRefs(uploadStore)
</script>

<template>
  <div class="show-title-bar">
    <TitleBar />

    <div v-if="uploadDatas.length > 0" class="test-task-content pd">
      <div
        v-for="item in uploadDatas"
        :key="item.id"
        class="common-media-wrap my-list"
      >
        <div class="upload-data-info common-media-content">
          <div class="data-info">
            <p class="sample-name">
              {{ item.sampleName }}
            </p>
            <p class="task-code">
              任务编号：{{ item.testTaskCode }}
            </p>
          </div>
          <div class="status">
            <p :class="`status-${item.status}`">
              {{ item.statusText }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <NoData v-else />
  </div>
</template>

<style lang="less" scoped>
.test-task-content {
  height: 100%;
}

.upload-data-info {
  display: flex;
  align-items: center;
  .data-info {
    flex: 1;
  }
  .status {
    .status-wait {
      color: var(--warning-color);
    }
    .status-processing {
      color: var(--primary-color);
    }
    .status-fail {
      color: var(--error-color);
    }
    .status-pause {
      color: #aaa;
    }
  }
  .sample-name {
    margin-bottom: 5px;
    font-weight: bold;
  }
  .task-code {
    font-size: 12px;
  }
}
</style>
