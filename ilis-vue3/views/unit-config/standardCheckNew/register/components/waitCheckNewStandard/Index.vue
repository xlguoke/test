<template>
  <ht-modal
    v-model:open="visible"
    title="添加待查新规程"
    width="80%"
    :after-close="onClosed"
  >
    <div class="h-[80vh]">
      <ht-drag :min-width="200">
        <ht-drag-item :width="260">
          <StandardGroup @select="selectStandardGroup" />
        </ht-drag-item>
        <ht-drag-item>
          <StandardList
            ref="standardListRef"
            :key="standardGroupId + key"
            :check-new-id="param.checkNewId"
            :standard-type-id="standardGroupId"
          />
        </ht-drag-item>
      </ht-drag>
    </div>
    <template #footer>
      <a-button @click="visible = false ">
        取消
      </a-button>
      <a-button
        type="primary"
        :loading="loading1"
        :disabled="loading2"
        @click="saveQueryResult"
      >
        引用查询结果规程
      </a-button>
      <a-button
        type="primary"
        :loading="loading2"
        :disabled="loading1"
        @click="saveSelResult"
      >
        引用选中规程
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { createVNode } from 'vue'
import { quoteQueryResultApi, quoteSelResultApi } from '../../api'
import StandardGroup, { type TreeData } from './StandardGroup.vue'
import StandardList from './StandardList.vue'
import { DATA_FROM } from '.'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'

interface PropsParam {
  checkNewId: string
  onConfirm: () => void
}

const props = defineProps<IDialogPropsParam<null, PropsParam>>()

const visible = ref(true)
/** 规程分组id */
const standardGroupId = ref('')
const standardListRef = ref()
const loading1 = ref(false)
const loading2 = ref(false)
const key = ref(1)

/** 选择规程分组 */
function selectStandardGroup(row?: TreeData) {
  if (!row)
    return
  standardGroupId.value = row.id
}

/** 引用本地查询结果规程 */
async function saveQueryResult() {
  const query = standardListRef.value?.queryParams
  loading1.value = true
  await quoteQueryResultApi(query)
    .finally(() => loading1.value = false)
  props.onConfirm(null)
  message.success('操作成功')
  visible.value = false
}

/** 引用选中规程 */
async function saveSelResult() {
  const selections = standardListRef.value.selectedRowKeys
  if (selections.length === 0) {
    message.warning('请选择规程')
    return
  }

  loading2.value = true
  await quoteSelResultApi(DATA_FROM.LOCAL, selections, props.param.checkNewId)
    .finally(() => loading2.value = false)

  props.param.onConfirm()

  Modal.confirm({
    title: '添加成功',
    icon: createVNode(CheckCircleFilled, { style: { color: '#52c41a' } }),
    content: '是否继续添加其他规程？',
    centered: true,
    okText: '确定',
    onOk: () => {
      key.value++
    },
    onCancel: () => {
      visible.value = false
    },
  })
}
</script>

<style>

</style>
