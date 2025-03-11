<template>
  <span>
    <ht-modal
      v-model:open="visible"
      title="列筛选"
      width="800px"
      :loading="loading"
      @cancel="cancel"
      @ok="handleConfirm"
    >
      <div class="mx-[16px]">
        <a-space>
          <a-button :icon="h(ReloadOutlined)" @click="getColumnData">还原为上一次保存的数据</a-button>
          <a-button :icon="h(ReloadOutlined)" @click="defaultBtn">还原为默认版本</a-button>
        </a-space>
        <div class="my-2 text-[green] text-right">
          鼠标左键可左右上下拖动列表项；双击列表项后，该项将会移动到另一侧
        </div>
        <a-row :gutter="15">
          <a-col :span="12">
            <div :class="titleClass">待选列</div>
            <div class="draggableBox">
              <VueDraggable
                v-model="arrL"
                :class="dragableClass"
                :animation="150"
                filter=".no-drag"
                ghost-class="ghost"
                group="people"
              >
                <div
                  v-for="(item, i) in arrL"
                  :key="item.columnKey"
                  :class="`${dragItemClass}`"
                  @dblclick="dbClick(i, 'l')"
                >
                  {{ item.columnName }}
                </div>
                <div v-if="arrL.length === 0" class="no-drag pt-10 text-center text-gray-500">
                  暂无数据
                </div>
              </VueDraggable>
            </div>
          </a-col>
          <a-col :span="12">
            <div :class="titleClass">已选列</div>
            <div class="draggableBox">
              <VueDraggable
                v-model="arrR"
                :class="dragableClass"
                :animation="150"
                filter=".no-drag"
                group="people"
                ghost-class="ghost"
              >
                <div
                  v-for="(item, i) in arrR"
                  :key="item.columnKey"
                  :class="`${dragItemClass}`"
                  @dblclick="dbClick(i, 'r')"
                >
                  {{ item.columnName }}
                </div>
                <div v-if="arrR.length === 0" class="no-drag pt-10 text-center text-gray-500">
                  请选择数据
                </div>
              </VueDraggable>
            </div>
          </a-col>
        </a-row>
      </div>
    </ht-modal>
    <a-button @click="visible = true;">
      <slot>
        <SettingOutlined />
        列筛选
      </slot>
    </a-button>
  </span>
</template>

<script lang="ts" setup>
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { VueDraggable } from 'vue-draggable-plus'
import { IlisApiHelper } from '~/utils/IlisApiHelper'

interface ColumnsData {
  id: string
  columnKey: string
  columnName: string
  module?: string
  type?: string
  sequence: number
}

const props = defineProps({
  /**
   * # 列筛选传递类型
   */
  type: String,
})

const emits = defineEmits<{
  (e: 'update:open', data: boolean): void
  (e: 'confirm'): void
}>()

const titleClass = 'mb-1 h-30 bg-gray-500/10 rounded p-3 text-sm'
const dragableClass = 'flex flex-col gap-[6px] p-2 h-[50vh] m-auto bg-gray-400/5 rounded overflow-y-auto overflow-x-hidden'
const dragItemClass = 'cursor-move h-30 bg-gray-500/5 rounded p-3'

const visible = ref(false)
const loading = ref(false)
const arrL = ref<ColumnsData[]>([])
const arrR = ref<ColumnsData[]>([])

/**
 * 关闭弹窗，重置变量
 */
function cancel() {
  visible.value = false
  loading.value = false
  arrL.value = []
  arrR.value = []
}

/**
 * 打开弹窗时加载数据
 */
watch(() => visible.value, (val) => {
  if (val) {
    getColumnData()
  }
  else {
    emits('update:open', false)
  }
})

/**
 * 初始化列表数据
 */
async function getColumnData() {
  try {
    loading.value = true
    const { data: lList } = await IlisApiHelper.get<ColumnsData[]>(`rest/common/default-columns?type=${props.type}`)
    const { data: rList } = await IlisApiHelper.get<ColumnsData[]>(`rest/common/chosen-columns?type=${props.type}`)

    arrR.value = rList.sort((a, b) => a.sequence - b.sequence)

    const keys = arrR.value.map(i => i.columnKey)
    lList.sort((a, b) => a.sequence - b.sequence)
    arrL.value = lList.filter(i => !keys.includes(i.columnKey))
  }
  finally {
    loading.value = false
  }
}

/**
 * 还原为默认版本
 */
function defaultBtn() {
  Modal.confirm({
    title: '还原为默认版本',
    content: '确定要还此操作会立即生效，是否确认操作？',
    onOk: async () => {
      loading.value = true
      try {
        await IlisApiHelper.postForm(`rest/common/actions/reset`, {
          type: props.type,
        })
        message.success('操作成功')
        emits('confirm')
        getColumnData()
      }
      finally {
        loading.value = false
      }
    },
  })
}

/**
 * 双击列表项，将该项移动到另一侧
 */
function dbClick(ind: number, type: 'l' | 'r') {
  if (type === 'l') {
    const item = arrL.value[ind]
    arrR.value.push(item)
    arrL.value.splice(ind, 1)
  }
  else {
    const item = arrR.value[ind]
    arrL.value.push(item)
    arrR.value.splice(ind, 1)
  }
}

/**
 * # 确认
 */
async function handleConfirm() {
  const data = arrR.value.map((d, i) => {
    return {
      ...d,
      sequence: i + 1,
      type: props.type,
    }
  })
  loading.value = true
  await IlisApiHelper.post(`rest/common/columns?type=${props.type}`, data)
    .finally(() => {
      loading.value = false
    })
  emits('confirm')
  message.success('保存成功')
  cancel()
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
