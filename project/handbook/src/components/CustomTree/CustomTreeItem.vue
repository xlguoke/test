<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
})

const expanded = ref(true)
const hasChildren = computed(() => props.item.children && props.item.children.length > 0)

function toggleExpand() {
  expanded.value = !expanded.value
};

function handleCheck(e: Event, item: any) {
  if (item.checkable && !item.checkable) {
    e.stopPropagation()
    e.preventDefault()
    toggleExpand()
  }
}
</script>

<template>
  <div>
    <van-cell
      :is-link="hasChildren"
      @click="toggleExpand"
    >
      <template #title>
        <div
          v-if="hasChildren && item.checkable === false"
          class="tree-title"
          :style="{ paddingLeft: `${level * 20}px` }"
        >
          <img
            v-show="expanded"
            class="tree-icon"
            src="@/assets/images/tree-open.svg"
          >
          <img
            v-show="!expanded"
            class="tree-icon"
            src="@/assets/images/tree-close.svg"
          >
          <span>{{ item.title }}</span>
        </div>
        <van-checkbox
          v-else
          :style="{ paddingLeft: `${level * 20}px` }"
          :name="item.key"
          @click.stop="handleCheck($event, item)"
        >
          {{ item.title }}
        </van-checkbox>
      </template>
      <template #right-icon />
    </van-cell>
    <div v-if="expanded">
      <CustomTreeItem
        v-for="child in item.children"
        :key="child.key"
        :item="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tree-title{
  display: flex;
  align-items: center;
  .tree-icon {
    width: 24px;
    vertical-align: middle;
  }
}
</style>
