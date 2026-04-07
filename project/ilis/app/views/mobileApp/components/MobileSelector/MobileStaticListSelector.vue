<template>
  <van-popup
    duration="0.2"
    position="right"
    :style="{ width: '90%', height: '100%' }"
    :show="open"
  >
    <div class="flex flex-col h-full">
      <MobileTitleBar :title="title || '请选择'" />

      <div class="flex-1 min-h-0 overflow-y-auto p-4">
        <div
          v-for="item in list"
          :key="item.id"
          class="li-box"
          @click="onSelect(item)"
        >
          <div class="li-box-content">
            <p style="color: #444;">
              {{ item.label }}
            </p>
          </div>
          <van-icon
            name="checked"
            size="28"
            :color="
              selectedRowKeys.includes(item.value) ? '#1989fa' : '#999'
            "
          />
        </div>
      </div>

      <div class="flex">
        <van-button block square @click="onCancel">
          取消
        </van-button>
        <van-button block type="primary" square @click="onConfirm">
          确定
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

interface IOption {
  label: string
  value: string
}

const props = defineProps({
  title: String,
  open: Boolean,
  // 默认勾选项
  selectedRows: Object as PropType<any[]>,
  // 开启多选
  enableMultiple: Boolean,
  // 数据来源，支持静态数据或接口获取
  dataSource: [Object, Function] as PropType<IOption | (() => Promise<IOption[]>)>,
})

const emits = defineEmits(['update:open', 'select'])

const list = ref<any[]>([])

const selectedRows = ref<any[]>([])

const selectedRowKeys = computed(() => selectedRows.value.map(i => i.value))

const open = computed(() => props.open)

watch(open, (val) => {
  if (val === true) {
    if (props.selectedRows && props.selectedRows.length) {
      selectedRows.value = [...props.selectedRows]
    }
    else {
      selectedRows.value = []
    }

    if (!list.value.length) {
      getData()
    }
  }
})

async function getData() {
  if (Array.isArray(props.dataSource)) {
    list.value = props.dataSource
  }

  if (typeof (props.dataSource) === 'function') {
    const toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
    })
    const data = await props.dataSource().finally(toast.close)
    list.value = data
  }
}

function onSelect(item: IOption) {
  if (props.enableMultiple) {
    if (selectedRowKeys.value.includes(item.value)) {
      selectedRows.value = selectedRows.value.filter(i => i.value !== item.value)
    }
    else {
      selectedRows.value.push(item)
    }
    return
  }

  if (selectedRowKeys.value.includes(item.value)) {
    selectedRows.value = []
  }
  else {
    selectedRows.value = [item]
  }
}

function onCancel() {
  emits('update:open', false)
}

function onConfirm() {
  emits('select', selectedRows.value, selectedRowKeys.value)
  onCancel()
}
</script>

<style lang="less" scoped>
.li-box {
  display: flex;
  gap: 16px;
  border: solid 1px #e2e2e2;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 2px;

  .li-box-content {
    flex: 1;
    font-size: 14px;
  }
}
</style>
