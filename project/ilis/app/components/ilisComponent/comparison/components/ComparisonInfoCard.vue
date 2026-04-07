<!-- 信息卡片 -->
<template>
  <div class="comparison-info-card p-[12px] mb-2 bg-[var(--colorBgContainer)] rounded-[4px]">
    <slot name="title">
      <BaseTitle v-if="!hideTitle">
        {{ props.title }}
        <template #right>
          <!-- 排序和设置按钮(鼠标移入comparison-info-card后展示) -->
          <div class="comparison-info-card-action hidden items-center justify-end gap-1">
            <a-tooltip title="拖动排序">
              <a-button :icon="h('img', { src: sortImg, alt: '排序图标' })" type="ghost" size="small" class="handle"></a-button>
            </a-tooltip>
            <a-tooltip title="列信息可见性编辑">
              <a-button :icon="h('img', { src: settingImg, alt: '设置图标' })" type="ghost" size="small" @click="handleSettingClick"></a-button>
            </a-tooltip>
          </div>
        </template>
      </BaseTitle>
    </slot>
    <div>
      <template v-for="item in props.options" :key="item.label">
        <template v-if="!hiddenOptionKeys.includes(item.label)">
          <component :is="item.customRender" v-if="item.customRender" :props="{ label: item.label, value: item.value }" />
          <div v-else class="flex items-start w-full overflow-hidden mb-2">
            <span class="text-[#666] shrink-0">{{ item.label }}：</span>
            <div v-if="typeof item.value !== 'function'" class="flex-1 whitespace-normal">
              {{ item.value }}
            </div>
            <component :is="item.value" v-else />
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IComparisonInfoCardOption } from '../interface/IComparisonInfoCardOption'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import settingImg from '~/assets/img/ilisConparison/setting.svg'
import sortImg from '~/assets/img/ilisConparison/sort.svg'
import { userStore } from '~/store/userStore'
import ComparisonInfoCardCustomModal from './ComparisonInfoCardCustomModal.vue'

const props = defineProps<{
  /** 卡片唯一标识（用作区分卡片缓存作用域） */
  id?: string
  /** 卡片标题 */
  title?: string
  /** 卡片选项 */
  options: IComparisonInfoCardOption[]
  /** 是否隐藏标题 */
  hideTitle?: boolean
}>()

/** # 获取当前用户的缓存 key 👤 */
function getCacheKey(): string {
  const { userInfo } = userStore()
  const userId = userInfo.userId || 'anonymous'
  return `[comparison-info-card]${props.id || props.title}_${userId}`
}

const hiddenOptionKeys = ref<string[]>([])

/** # 初始化隐藏选项 📝 */
function initHiddenOptions() {
  const cacheKey = getCacheKey()
  if (localStorage.getItem(cacheKey)) {
    hiddenOptionKeys.value = JSON.parse(localStorage.getItem(cacheKey) || '[]')
    props.options.forEach((item) => {
      item.hidden = hiddenOptionKeys.value.includes(item.label)
    })
  }
}

// 组件挂载时初始化
initHiddenOptions()

async function handleSettingClick() {
  const res = await AnyDialogHelper.showModel<IComparisonInfoCardOption[]>(ComparisonInfoCardCustomModal, { options: props.options })
  if (res?.length) {
    const keys = res?.filter(item => item.hidden)?.map(item => item.label) || []
    hiddenOptionKeys.value = keys
    localStorage.setItem(getCacheKey(), JSON.stringify(keys))
  }
}
</script>

<style scoped>
.comparison-info-card{
  transition: all 0.3s ease-in-out;
  &:hover{
    box-shadow: 0px 4px 10px 0px rgba(0, 102, 236, 0.1);
    .comparison-info-card-action{
      display: flex;
    }
  }
}
</style>
