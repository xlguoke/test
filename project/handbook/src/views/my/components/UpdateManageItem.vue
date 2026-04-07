<script setup lang="ts">
import { computed } from 'vue'
import { useResourceFetch } from '@/composables/useResources'
import type { DataVersionDTO, DataVersionStatusDTO } from '@/type/common'
import baseData from '@/stores/baseData'

const { dataItem } = defineProps<{ dataItem: DataVersionDTO }>()
const { update, version, upgrade } = useResourceFetch(dataItem.type)

const statusObj: DataVersionStatusDTO = computed(() => {
  const find = baseData().dataVersionStatus.filter(
    d => d.type === dataItem.type,
  )
  return find[0] || {}
})

function updateData() {
  const { status } = statusObj.value
  if (!update.value || (status !== 'wait' && status !== 'fail'))
    return
  upgrade()
}
</script>

<template>
  <li class="my-list update-data-item">
    <div class="update-count">
      <i class="iconfont icon-file-group" />
      <!-- <span v-if="dataItem.count && dataItem.count > 0" class="count">
                {{ dataItem.count }}
              </span> -->
    </div>
    <span class="update-dataname">{{ dataItem.title }}</span>
    <span v-if="statusObj.msg" :class="`update-status ${statusObj.status}`">
      {{ statusObj.msg }}
    </span>
    <span class="update-datetime">{{ version }}</span>
    <div :class="`update-btn ${statusObj.status}`" @click="updateData">
      更新
    </div>
  </li>
</template>

<style lang="less" scoped>
.update-data-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}
.update-count {
  position: relative;
  .iconfont {
    font-size: 24px;
    color: var(--primary-color);
  }
  .count {
    position: absolute;
    top: -20%;
    left: 70%;
    padding: 0 2px;
    min-width: 16px;
    height: 16px;
    background-color: var(--error-color);
    line-height: 16px;
    text-align: center;
    color: #fff;
    font-size: 10px;
    border-radius: 20px;
    box-sizing: border-box;
  }
}
.update-dataname {
  margin-left: 3.5rem;
  flex: 1;
}
.update-status {
  width: 20%;
  &.finish {
    color: var(--success-color);
  }
  &.wait {
    color: var(--warning-color);
  }
  &.processing {
    color: var(--primary-color);
  }
  &.fail {
    color: var(--error-color);
  }
}
.update-datetime {
  margin-right: 5%;
  width: 25%;
}
.update-btn {
  padding: 8px 15px;
  background-color: #f3f3f3;
  color: #666;
  &.wait,
  &.fail {
    background-color: #f1f7ff;
    color: var(--primary-color);
  }
}

@media screen and (max-width: 480px) {
  .update-data-item {
    font-size: 12px;
  }
}
</style>
