<template>
  <div class="flex items-center">
    <!-- 常驻操作项 -->
    <template
      v-for="item in visibleOptions?.slice(0, visibleCount)"
      :key="item.label"
    >
      <a-button
        v-permission="item.permissions"
        type="link"
        size="small"
        v-bind="item"
        @click.stop="item.fn(row)"
      >
        {{ item.label }}
      </a-button>
    </template>
    <!-- 更多操作 -->
    <a-popover v-if="visibleOptions?.length > visibleCount" v-model:open="popVisible" placement="bottom" trigger="click">
      <template #content>
        <a-space direction="vertical" class="w-full" @click.stop="popVisible = false">
          <template v-for="item in visibleOptions?.slice(visibleCount)" :key="item.label">
            <a-button
              v-permission="item.permissions?.[0]"
              type="link"
              size="small"
              v-bind="item"
              @click="item.fn(row)"
            >
              {{ item.label }}
            </a-button>
          </template>
        </a-space>
      </template>
      <a-button
        type="link"
        size="small"
      >
        更多
        <DownOutlined />
      </a-button>
    </a-popover>
  </div>
</template>

<script setup lang='ts'>
import type { ITableActionItem } from '~/interface/ITableActionItem'
import { DownOutlined } from '@ant-design/icons-vue'

const props = withDefaults(defineProps<{
  /** 表格行数据 */
  row: any
  /** 表格操作项配置 */
  options: ITableActionItem<any>[]
  /** 常驻展示的操作项数量 */
  visibleCount?: number
}>(), {
  visibleCount: 3,
})

const popVisible = ref(false)

const visibleOptions = computed(() => {
  return props.options.filter(item => isShowButton(item))
})

/** # 判断是否展示按钮 */
function isShowButton(item: ITableActionItem<any>) {
  // 没有 visible 配置时，默认展示
  if (item.visible === undefined) {
    return true
  }
  return typeof item.visible === 'function' ? item.visible(props.row) : item.visible
}
</script>
