<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Checkbox, CheckboxGroup, message } from 'ant-design-vue'
import uploadManageStore from '@/stores/uploadManage'
import NoData from '@/components/noData/index.vue'

const uploadStore = uploadManageStore()
const { uploadDatas, uploadLength, uploadStatus } = storeToRefs(uploadStore)

const selectedAll = ref(false)
const selectedKeys = ref<string[]>([])
const indeterminate = computed(
  () =>
    selectedKeys.value.length > 0
    && selectedKeys.value.length < uploadDatas.value.length,
)

// 修改全选
function changeSelectedAll() {
  if (selectedAll.value)
    selectedKeys.value = uploadDatas.value.map(item => item.id || '')
  else selectedKeys.value = []
}

// 设置全选
function setSelectedAll() {
  const len = uploadDatas.value.length
  selectedAll.value = len > 0 && len === selectedKeys.value.length
}

// 批量操作
function batchHandle(fn: Function) {
  if (selectedKeys.value.length === 0)
    return message.warning('请选择要操作的任务')

  for (let i = 0; i < selectedKeys.value.length; i++) {
    const key = selectedKeys.value[i]
    fn(key)
  }
  selectedAll.value = false
  selectedKeys.value = []
}
</script>

<template>
  <div class="upload-data-list">
    <div v-show="uploadDatas.length > 0" class="batch-handle flex-between">
      <div class="upload-count">
        正在上传任务数（{{ uploadLength }}）
      </div>
      <div class="handle flex-between">
        <Checkbox
          v-model:checked="selectedAll"
          :disabled="uploadDatas.length === 0"
          :indeterminate="indeterminate"
          @change="changeSelectedAll"
        >
          {{ selectedAll ? '取消全选' : '全选' }}
        </Checkbox>
        <div class="btns">
          <a class="btn" @click="batchHandle(uploadStore.startUpload)">
            批量继续
          </a>
          <a class="btn" @click="batchHandle(uploadStore.pauseUpload)">
            批量暂停
          </a>
        </div>
      </div>
    </div>
    <div class="test-task-datas">
      <div class="pd-lr">
        <CheckboxGroup
          v-model:value="selectedKeys"
          style="width: 100%"
          @change="setSelectedAll"
        >
          <div
            v-for="item in uploadDatas"
            :key="item.id"
            class="common-media-wrap my-list"
          >
            <Checkbox :value="item.id" class="common-media-content">
              <div class="upload-data-info">
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
            </Checkbox>
            <div class="common-media-handle">
              <div class="delete-upload-item">
                <p
                  v-show="item.status !== uploadStatus.processing"
                  style="margin-top: 4px"
                  @click="uploadStore.removeUploadDatas(item.id || '')"
                >
                  移除
                </p>
              </div>
            </div>
          </div>
        </CheckboxGroup>
      </div>
      <NoData v-if="uploadDatas.length === 0" />
    </div>
  </div>
</template>

<style scoped lang="less">
.upload-data-list {
  flex: 1;
  height: 0;
  display: flex;
  flex-direction: column;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.batch-handle {
  padding: 1.5rem 2.5rem;
  flex-wrap: wrap;
  .upload-count {
    margin-right: 3rem;
    width: 140px;
    line-height: 22px;
  }
  .handle {
    flex: 1;
    min-width: 240px;
  }
  .btns .btn {
    margin-left: 3rem;
  }
}

.test-task-datas {
  padding-bottom: 1rem;
  flex: 1;
  height: 0;
  overflow-y: auto;
}

.upload-data-info {
  display: flex;
  align-items: center;
  .data-info {
    flex: 1;
  }
  .status {
    margin: 0 2rem;
    width: 30%;
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
    font-weight: bold;
  }
  .task-code {
    font-size: 12px;
  }
}

.delete-upload-item {
  color: var(--error-color);
  text-align: center;
  .iconfont {
    font-size: 16px;
  }
}

@media screen and (max-width: 480px) {
  .upload-data-info {
    .status {
      margin-right: -8px;
      width: auto;
    }
  }
  .delete-upload-item {
    text-align: right;
  }
}
</style>
