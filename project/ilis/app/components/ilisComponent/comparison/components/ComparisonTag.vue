<!-- 文件Tag -->
<template>
  <div
    class="flex items-center rounded-[4px] px-[6px] py-1 mr-2 select-none cursor-grab h-[50px] w-[148px]"
    :class="{
      'bg-colorPrimary text-white': props.isHighlighted,
      'opacity-50': props.isDragging,
    }"
    draggable="true"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <component
      :is="props.file.icon"
      class="!text-[30px] mr-[8px]"
      :class="{
        'text-[#ACD1FF]': !props.isHighlighted,
      }"
    ></component>
    <div class="flex-1 w-[calc(100%_-_40px)]">
      <div class="w-full">
        <BaseText class="text-[14px]">
          {{ props.file.title }}
        </BaseText>
      </div>
      <div class="flex items-center">
        <BaseText class="text-[12px]">
          {{ props.file?.subTitle }}
        </BaseText>
        <!-- 显示报告转换状态 -->
        <BaseText
          v-if="props.file?.convertStatus && props.file.convertStatus !== '转换成功'"
          class="text-[12px] text-red-500 ml-2"
        >
          {{ props.file.convertStatus }}
        </BaseText>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IComparisonFile } from '../interface/IConparisonFile'

// Props
const props = defineProps<{
  /** 文件信息 */
  file: IComparisonFile
  /** 是否高亮 */
  isHighlighted: boolean
  /** 是否正在拖动 */
  isDragging: boolean
}>()

// Emits
const emit = defineEmits<{
  /** 点击事件 */
  click: [fileId: string]
  /** 拖动开始事件 */
  dragstart: [fileId: string]
  /** 拖动结束事件 */
  dragend: []
}>()

/**
 * 处理点击事件
 */
function handleClick() {
  emit('click', props.file.id)
}

/**
 * 处理拖动开始事件
 */
function handleDragStart() {
  emit('dragstart', props.file.id)
}

/**
 * 处理拖动结束事件
 */
function handleDragEnd() {
  emit('dragend')
}
</script>
