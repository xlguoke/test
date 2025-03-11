<template>
  <HtModal
    v-model:open="internalOpen"
    title="邀请设置"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <BaseTitle>基础设置</BaseTitle>
    <IlisForm
      ref="ilisFormRef"
      class="w-[300px]"
      :cols="1"
      :entity="EvaluateInvEntity"
      :init-data="initData"
      :mixin-rules="mixinRules"
    >
      <template #modelId="{ data: fromData }">
        <IlisInput
          v-model="fromData.modelId"
          show-search
          :filter-option="filterOption"
          :entity="EvaluateInvEntity"
          :options="evaluateModelSelectOptions"
          field="modelId"
        ></IlisInput>
      </template>
    </IlisForm>
    <BaseTitle>人员列表</BaseTitle>
    <a-space direction="vertical" style="width: 100%;">
      <IlisFormSearch
        :entity="EvaluateInvUserEntity"
        :field-list="['quickQry']"
        @reset="handleReset"
        @search="handleSearch"
      />
      <div>
        <a-button type="primary" @click="handleAddUser">
          新增
        </a-button>
      </div>
      <IlisTable
        show-index
        :entity="EvaluateInvUserEntity"
        :field-list="['consignUnitName', 'contactPhone', 'sampleSenderName', 'contactPhone', 'operation']"
        :data-source="dataSource"
        :pagination="getPagination()"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button
              type="link"
              size="small"
              danger
              @click="handleDelete([record] as EvaluateInvUserEntity[])"
            >
              移除
            </a-button>
          </template>
        </template>
      </IlisTable>
    </a-space>
  </HtModal>
</template>

<script lang="ts" setup>
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { addEvaluateInv } from '../api'
import { EvaluateInvEntity, EvaluateInvType } from '../EvaluateInvEntity'
import { EvaluateInvUserEntity } from '../EvaluateInvUserEntity'
import { getEvaluateModelListAll } from '../../model/api'
import EvaluateInvUserSelector from './EvaluateInvUserSelector.vue'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import type { IlisFormExpose } from '~/components/ilisComponent'
import { IlisForm, IlisFormSearch, IlisInput, IlisTable } from '~/components/ilisComponent'
import { BaseTitle } from '~/components/UI'
import type { IInputOption } from '~/interface/IInputOption'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

const props = defineProps<IDialogPropsParam<null, EvaluateInvEntity>>()

const mixinRules = ref<Record<string, Rule[]>>({
  dueTime: [
    {
      validator: async (_rule: any, value: string) => {
        // 当天最后一刻
        const data = new Date(value).setHours(23, 59, 59, 999)
        if (AnyDateTimeHelper.getTime(data) < Date.now())
        // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('不能小于当前日期')
        else
          return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
})

const loading = ref(false)

const internalOpen = ref(false)

const initData = ref(props.param)

const ilisFormRef = ref<IlisFormExpose<EvaluateInvEntity>>()

const selUser = ref<EvaluateInvUserEntity[]>([])

const {
  dataSource,
  dataSourceAll,
  getList,
  getPagination,
  handleDelete,
  handleSearch,
  handleReset,
} = useLocalTableHooks<EvaluateInvUserEntity>({
  dataSource: selUser,
  immediate: false,
  quickQueryMap: ['quickQry', ['consignUnitName', 'sampleSenderName', 'contactPhone']],
})

const evaluateModelSelectOptions = ref<IInputOption[]>([])

async function getEvaluateModelList() {
  const { data } = await getEvaluateModelListAll()
  evaluateModelSelectOptions.value = data.map((item) => {
    return {
      label: item.name,
      value: item.id.toString(),
    }
  })
}

function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.trim().toLowerCase())
}

async function handleAddUser() {
  const sel = await AnyDialogHelper.showSelector<EvaluateInvUserEntity>(EvaluateInvUserSelector)
  const selUserIds = selUser.value.map(item => item.id)
  const add = sel.filter(item => !selUserIds.includes(item.id))
  selUser.value = [...selUser.value, ...add]
  getList()
}

async function handleOk() {
  const ilisFormData = await ilisFormRef.value?.getFormData()

  await Modal.confirm({
    title: '提示',
    content: '提交邀请后，无法修改问卷、邀请方式和新增人员，您确定提交吗？',
    centered: true,
    icon: createVNode(ExclamationCircleOutlined),
    async onOk() {
      if (!dataSourceAll.value?.length) {
        Modal.warning({
          title: '提交失败！',
          content: '邀请人员不能为空！',
          centered: true,
          icon: createVNode(ExclamationCircleOutlined),
        })
        return
      }
      ilisFormData!.userList = dataSourceAll.value
      loading.value = true
      await addEvaluateInv(ilisFormData!).finally(() => loading.value = false)
      message.success('操作成功！')
      internalOpen.value = false
      props.onConfirm(null)
    },
  })
}

function init() {
  if (!initData.value?.type) {
    initData.value.type = EvaluateInvType.LINK
  }
  getEvaluateModelList()
}

init()

onMounted(() => {
  internalOpen.value = true
})
</script>
