<template>
  <div
    :data-id="data.data.id"
    :data-url="data.data.functionUrl"
    class="nav-tag"
    :class="[{
      'nav-tag-active': data.active,
      'nav-tag-google': displayType === 'google', // 暂时没实现
    }]"
    :title="data.data.functionName"
    @click="$emit('click', data)"
    @dblclick="$emit('dblclick', data)"
    @contextmenu="$emit('contextmenu', $event, data)"
  >
    <span class="nav-tag-label">
      {{ data.data.functionName }}
    </span>

    <!-- 操作按钮区域 -->
    <div v-if="data.data.functionName !== '首页'" class="nav-tag-actions">
      <a-button
        v-if="data.fixed"
        title="取消固定"
        size="small"
        type="ghost"
        :icon="h(LockOutlined)"
        @click.stop="$emit('toggleFix', data)"
      />
      <a-button
        v-else
        title="关闭"
        size="small"
        type="ghost"
        :icon="h('i', { class: 'iconfont icon-Union', style: 'font-size:10px;' })"
        @click.stop="$emit('close', data)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { INavTag } from '../types/INavTag'
import { LockOutlined } from '@ant-design/icons-vue'
import { theme } from 'ant-design-vue'
import { ENavTagDisplayType } from '../types/INavTag'

/** # 组件属性定义 ⚙️ */
interface Props {
  /** 标签数据 */
  data: INavTag
  /** 展示类型 */
  displayType?: ENavTagDisplayType
}

/** # 组件事件定义 ⚙️ */
interface Emits {
  /** 点击事件 */
  (e: 'click', data: INavTag): void
  /** 双击事件 */
  (e: 'dblclick', data: INavTag): void
  /** 右键菜单事件 */
  (e: 'contextmenu', event: MouseEvent, data: INavTag): void
  /** 关闭标签事件 */
  (e: 'close', data: INavTag): void
  /** 切换固定状态事件 */
  (e: 'toggleFix', data: INavTag): void
}

withDefaults(defineProps<Props>(), {
  displayType: ENavTagDisplayType.CURRENT,
})

defineEmits<Emits>()

const { useToken } = theme
const { token } = useToken()
</script>

<style scoped lang="less">
.nav-tag {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 12px;
  height: 32px;
  transition: all 0.3s ease;
  user-select: none;
  background-color: var(--colorFillContent);
  margin-right: 6px;
  color: #999;
  border-radius: var(--borderRadius) var(--borderRadius) 0 0;
  :deep(.ant-btn) {
    color: #999 !important;
  }

  &:hover {
    color: var(--colorText);
  }

  &:focus {
    outline: 2px solid v-bind('token.colorPrimary');
    outline-offset: 1px;
  }

  &-active {
    color: #fff !important;
    background-color: v-bind('token.colorPrimary') !important;
    :deep(.ant-btn) {
      color: #fff !important;
    }
  }

  /* Google 样式 */
  &-google {
    border-radius: 16px;
    background-color: #f1f3f4;
    border: 1px solid #dadce0;

    &::after {
      display: none;
    }

    &:hover {
      background-color: #e8f0fe;
      border-color: #1a73e8;
    }

    &.nav-tag-active {
      background-color: #1a73e8;
      color: white;
      border-color: #1a73e8;

      .nav-tag-actions :deep(.ant-btn) {
        color: rgba(255, 255, 255, 0.8);

        &:hover {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
}

.nav-tag-label {
  flex: 1;
  white-space: nowrap;
  margin-right: 8px;
}
</style>
