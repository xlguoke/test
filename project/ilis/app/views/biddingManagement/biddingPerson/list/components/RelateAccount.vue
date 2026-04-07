<template>
  <ht-modal
    v-model:open="open"
    title="关联账户"
    width="640px"
    :mask-closable="false"
    @cancel="cancel"
  >
    <a-alert type="info" class="p-2">
      <template #description>
        <div>1.进入关联页面时，默认根据人员姓名查询系统账号，若无可选账号时，请点击“重置”按钮；</div>
        <div>2.只能选择未绑定人员信息的系统账号，一个系统账号只能绑定一个人员信息；</div>
      </template>
    </a-alert>
    <a-space class="my-4">
      <a-input v-model:value="queryState.realName" class="w-[220px]" placeholder="用户名称" />
      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset">
        重置
      </a-button>
    </a-space>
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="dataSource"
      :pagination="getPagination()"
      :row-selection="getRowSelection({
        type: 'radio',
        width: 10,
      })"
      bordered
      :loading="loading"
      :scroll="{ y: 280 }"
    />

    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onOk">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type { ViewLaboratoryDataEntity } from '~/views/common/humiture/display'
import { message } from 'ant-design-vue'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import { getUseRelateUser, relateAccount } from '~/views/biddingManagement/biddingPerson/api.ts'

const props = defineProps<IDialogPropsParam<null, {
  id: string
}>>()

const id = computed(() => props.param.id)

const submitLoading = ref(false)

const queryState = ref({
  realName: '',
})

const open = ref(true)

const columns = ref([
  { title: '用户账号', dataIndex: 'userName', width: 120 },
  { title: '用户名称', dataIndex: 'realName', width: 120 },
  { title: '角色', dataIndex: 'userkey', ellipsis: true },
])

const {
  loading,
  dataSource,
  getPagination,
  handleSearch,
  getRowSelection,
  selectedRowKeys,
} = useTableHooks<ViewLaboratoryDataEntity>({
  api: getUseRelateUser,
  query: queryState,
  totalKey: 'count',
})

function onReset() {
  queryState.value.realName = ''
  handleSearch(queryState.value)
}

async function onOk() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要关联的账号！')
    return
  }

  submitLoading.value = true
  await relateAccount(id.value, selectedRowKeys.value[0] as string).finally(() => {
    submitLoading.value = false
  })

  message.success('保存成功')
  props.onConfirm(null)
  cancel()
}

// 关闭弹窗
function cancel() {
  open.value = false
  props.onConfirm(null)
}
</script>
