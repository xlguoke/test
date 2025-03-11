<template>
  <a-modal
    v-model:open="visible"
    :keyboard="false"
    :mask-closable="false"
    centered
    :wrap-class-name="`ht-modal-wrap ${tiledLevel ? 'ht-modal-tiled-level' : ''}`"
    :after-close="afterClose"
    @cancel="cancel"
  >
    <a-spin :spinning="loading">
      <slot></slot>
    </a-spin>
    <template #title>
      <div
        ref="modalTitleRef"
        :class="`custom-modal-head ${draggable ? 'hover:cursor-move' : ''}`"
      >
        {{ title }}
      </div>
    </template>
    <template #modalRender="{ originVNode }">
      <div :style="transformStyle">
        <component :is="originVNode" />
      </div>
    </template>
    <template #footer>
      <a-button v-if="showCloseAll" @click="cancelAll">
        关闭全部
      </a-button>
      <slot name="footer">
        <a-button @click="cancel">
          {{ cancelText || (hideConfirm ? '关闭' : '取消') }}
        </a-button>
        <a-button
          v-if="!hideConfirm"
          type="primary"
          :loading="confirmLoading"
          :disabled="loading"
          @click="ok"
        >
          {{ okText }}
        </a-button>
      </slot>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { useDraggable, useEventBus, useResizeObserver } from '@vueuse/core'
import { defaultDomRect } from './'

const props = defineProps({
  /** 标题 */
  title: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
  okText: {
    type: String,
    default: '确定',
  },
  /** 是否显示弹窗 */
  open: Boolean,
  confirmLoading: Boolean,
  /** 是否可拖动 */
  draggable: {
    type: Boolean,
    default: true,
  },
  /** 同层级显示 */
  tiledLevel: Boolean,
  /** 加载动画 */
  loading: Boolean,
  /** 隐藏 确定 按钮 */
  hideConfirm: Boolean,
  /** 显示 关闭全部 按钮 */
  showCloseAll: Boolean,
})

const emit = defineEmits(['update:open', 'cancel', 'ok'])

const disabledDrag = computed(() => !props.draggable)
const visible = ref(false)

watch(() => props.open, (val) => {
  visible.value = val
  if (props.tiledLevel) {
    nextTick(() => initMousedown())
  }
}, {
  immediate: true,
})

function cancel() {
  visible.value = false
  emit('update:open', false)
  emit('cancel')
}

function ok() {
  emit('ok')
}

/**
 * 关闭全部弹窗，事件总线
 */
const bus = useEventBus('close-all-modals')
bus.on(cancel)
function cancelAll() {
  if (props.showCloseAll) {
    bus.emit()
  }
}

/**
 * 提供对外调用的钩子
 */
function cancelAllModal() {
  bus.emit()
}

const modalTitleRef = ref<HTMLElement>()
const { x, y, isDragging } = useDraggable(modalTitleRef, {
  disabled: disabledDrag,
  preventDefault: true,
})

const startedDrag = ref(false)
// 初始位置
const startX = ref(0)
const startY = ref(0)
// 偏移量
const transformX = ref(0)
const transformY = ref(0)
// 初始偏移量
const preTransformX = ref(0)
const preTransformY = ref(0)
// 弹窗可拖动范围
const dragRect = ref({ scopeX: 0, scopeY: 0 })
// 样式中设置的padding值
const cssPd = 32
let titleRect: DOMRect = { ...defaultDomRect }
let wrapRect: DOMRect = { ...defaultDomRect }

/** 弹窗完全关闭后的回调 */
function afterClose() {
  initTransform()
  nextTick(() => {
    startedDrag.value = false
  })
}

// 获取当前弹窗容器
function getModalWrap() {
  return modalTitleRef.value?.closest('.ht-modal-wrap') as HTMLElement
}

// 初始化mousedown事件
function initMousedown() {
  const modalWrap = getModalWrap()
  if (!modalWrap)
    return ''
  modalWrap.style.zIndex = `${getMaxZindex() + 20}`
  modalWrap.addEventListener('mousedown', () => {
    const n = getMaxZindex() + 10
    modalWrap.style.zIndex = `${n}`
  })
}

/** 初始化弹窗偏移位置 */
function initTransform() {
  if (props.tiledLevel) {
    transformX.value = -(titleRect.width + cssPd * 2) / 2
    transformY.value = -((wrapRect.height) / 2)
  }
  else {
    transformX.value = transformY.value = 0
  }
  preTransformX.value = transformX.value
  preTransformY.value = transformY.value
}

/**
 * 初始化弹窗可拖动范围
 */
function initWrapScope() {
  if (!modalTitleRef.value)
    return ''
  const bodyRect = document.body.getBoundingClientRect()
  titleRect = modalTitleRef.value.getBoundingClientRect()
  dragRect.value.scopeX = bodyRect.width - titleRect.width
  dragRect.value.scopeY = bodyRect.height - titleRect.height
}

/**
 * 更新弹窗z-index值
 */
function refreshZindex() {
  const modalWrap = getModalWrap()
  if (!modalWrap)
    return ''
  modalWrap.style.zIndex = `${getMaxZindex() + 10}`
}

/**
 * 鼠标按下时，初始化位置变量
 */
watch([x, y], () => {
  if (!startedDrag.value) {
    startX.value = x.value
    startY.value = y.value
    wrapRect = getModalWrap().getBoundingClientRect()
    initWrapScope()
    initTransform()
  }
  startedDrag.value = true
})

// 计算拖动偏移量
watchEffect(() => {
  if (startedDrag.value) {
    transformX.value
      = preTransformX.value
      + Math.min(Math.max(x.value, 0), dragRect.value.scopeX)
      - startX.value
    transformY.value
      = preTransformY.value
      + Math.min(Math.max(y.value, 0), dragRect.value.scopeY)
      - startY.value
  }
})

/**
 * 监听窗口大小变化，重新计算位置变量
 */
useResizeObserver(document.body, () => {
  if (!disabledDrag.value && startedDrag.value) {
    initWrapScope()
    preTransformX.value = transformX.value
    preTransformY.value = transformY.value
    startX.value = titleRect.left
    startY.value = titleRect.top
  }
})

/**
 * 触发mousedown事件时，isDragging为true
 * 触发mouseup事件时，isDragging为false
 */
watch(isDragging, () => {
  if (!isDragging) {
    startedDrag.value = false
  }
  else if (isDragging.value) {
    clickModalTitle()
  }
})

/**
 * 拖动时，设置弹窗位置
 * 支持同级打开多个弹窗时，拖拽移到遮罩位置
 */
watchEffect(() => {
  if (!props.tiledLevel) {
    return
  }
  if (modalTitleRef.value && startedDrag.value) {
    const modalWrap = getModalWrap()
    modalWrap.style.transform = `translate(${transformX.value}px, ${transformY.value}px)`
  }
})

/**
 * 拖动时，设置弹窗位置
 * 不支持同级打开多个弹窗时，拖拽移动弹窗容器
 */
const transformStyle = computed(() => {
  if (props.tiledLevel) {
    return {}
  }
  return {
    transform: `translate(${transformX.value}px, ${transformY.value}px)`,
  }
})

/**
 * ## 将点击的弹窗置于最顶层
 */
function clickModalTitle() {
  if (!props.tiledLevel)
    return ''
  const modalWrap = getModalWrap()
  const maxZIndex = getMaxZindex()
  modalWrap.style.zIndex = String(maxZIndex + 10)
}

// 获取打开的弹窗中最大的z-index
function getMaxZindex() {
  const wraps = document.querySelectorAll('.ht-modal-wrap')
  const zIndexs = []
  for (let i = 0; i < wraps.length; i++) {
    const wrap = wraps[i] as HTMLElement
    const zIndex = Number(wrap.style.zIndex || 1000)
    zIndexs.push(zIndex)
  }
  return Math.max(...zIndexs)
}

defineExpose({
  refreshZindex,
  cancelAllModal,
})
</script>

<style>
.ht-modal-wrap {
  overflow: hidden !important;
}
.ht-modal-wrap .ant-modal-header{
  margin: -20px -24px 8px;
  border-bottom: 1px solid #f2f2f2;
}
.custom-modal-head{
  padding: 12px 24px;
  font-size: 16px;
}

.ant-modal-root .ht-modal-tiled-level {
  padding: 32px;
  right: initial;
  bottom: initial;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  overflow: hidden;
}
.ht-modal-wrap .ant-modal-body{
  min-height: 100px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}
</style>
