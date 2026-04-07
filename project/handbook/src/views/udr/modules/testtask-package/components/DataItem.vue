<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'
import type { TaskPackageDTO } from '../interface'

const props = defineProps({
  activeId: {
    type: String,
    default: '',
  },
  data: {
    type: Object as PropType<TaskPackageDTO>,
    default: () => {},
  },
})

const emits = defineEmits(['onCheck'])

const hasChildren = computed(() => props.data.children && props.data.children.length > 0)

const dataSource = computed(() => props.data)

function onCheck(item: any) {
  if (item.children && item.children.length > 0) {
    item.expand = !item.expand
    return
  }

  emits('onCheck', item)
}
</script>

<template>
  <div class="data-item">
    <div class="data-item-text" :class="{ active: activeId === dataSource.taskId }" @click="onCheck(dataSource)">
      <div>
        <div>{{ dataSource.sampleName }}</div>
        <div>任务编号：{{ dataSource.taskSn }}</div>
        <div>样品编号：{{ dataSource.sampleSn }}</div>
      </div>
      <van-icon v-if="hasChildren" name="arrow-down" @click.stop="dataSource.expand = !dataSource.expand" />
    </div>
    <div v-if="hasChildren && dataSource.expand" class="data-item-children">
      <DataItem v-for="(item, index) in dataSource.children" :key="index" :data="item" :active-id="activeId" @on-check="onCheck" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.data-item {
  flex: 1;

  .data-item-text {
    color: #151515;
    margin: 4px 0;
    border-radius: 4px;
    padding: 8px;
    display: flex;
    align-items: center;
    cursor: pointer;
    min-height: 48px;
    box-sizing: border-box;
    line-height: 24px;

    &.active {
      background: #0066EC;
      color: #fff;
    }

    & > div {
      flex: 1;
    }

    & > .van-icon {
      padding: 8px;
      padding-right: 0;
    }
  }

  .data-item-children {
    padding-left: 16px;
  }
}
</style>
