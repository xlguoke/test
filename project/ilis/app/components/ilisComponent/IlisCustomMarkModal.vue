<template>
  <ht-modal
    v-model:open="modalVisible"
    :title="param.title || '自定义标记'"
    width="500px"
    :after-close="onClosed"
    @cancel="modalVisible = false"
    @ok="handleOk"
  >
    <div class="min-h-[200px]">
      <div class="my-3">
        <a-checkbox v-model:checked="checkAll" :indeterminate="indeterminate" @change="onCheckAllChange">
          全选
        </a-checkbox>
      </div>
      <a-checkbox-group v-model:value="checkedIds" class="!gap-0">
        <div
          v-for="item in param.markList"
          :key="item.id"
          class="mb-2 min-w-[33.33333%]"
          :span="8"
        >
          <a-checkbox :value="item.id">
            <IlisCustomMark :data="item"></IlisCustomMark>
          </a-checkbox>
        </div>
      </a-checkbox-group>
    </div>
  </ht-modal>
</template>

<script lang="ts" setup>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { ICustomMark } from '~/interface/ICustomMark'
import { message } from 'ant-design-vue'

interface IProps {
  title?: string
  /** # 自定义标记列表（数据源） */
  markList: ICustomMark[]
  /** # 选中的自定义标记id列表（回显） */
  checkedMarkIds?: string[]
}

const props = defineProps<IDialogPropsParam<ICustomMark[], IProps>>()

const modalVisible = ref(true)

const checkAll = ref()

const indeterminate = ref(false)

const checkedIds = ref(props.param?.checkedMarkIds || [])

watch(
  () => checkedIds.value,
  (val) => {
    indeterminate.value = !!val.length && val.length < props.param.markList.length
    checkAll.value = val.length === props.param.markList.length
  },
)

function onCheckAllChange(e: any) {
  checkedIds.value = e.target.checked ? props.param.markList.map(item => item.id) : []
  indeterminate.value = false
}

function handleOk() {
  const checkedMarks = props.param.markList.filter(item => checkedIds.value.includes(item.id))
  if (!checkedMarks.length) {
    message.warning('请选择自定义标记')
    return
  }
  props.onConfirm(checkedMarks)
  modalVisible.value = false
}
</script>
