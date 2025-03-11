<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EvaluateInvEntity"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #createBy="{ data }">
          <IlisInput
            v-model="data.createBy"
            style="min-width: 240px;width: 100%;"
            :entity="EvaluateInvEntity"
            :options="userSelectOptions"
            field="createBy"
            @change="handleSearch({ ...data, createBy: $event })"
          ></IlisInput>
        </template>
      </IlisFormSearch>
      <div>
        <a-button type="primary" @click="handleAdd">
          新增邀请
        </a-button>
      </div>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="EvaluateInvEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'userNum'">
              <a-button type="link" size="small" @click="AnyDialogHelper.showModel(Detail, record)">
                {{ text }}
              </a-button>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(Detail, record)"
              >
                详情
              </a-button>
              <a-button
                v-if="record.status === EvaluateInvStatus.OPEN"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(Deferment, record).then(() => handleReloadTable())"
              >
                延期
              </a-button>
              <a-button
                v-if="record.status === EvaluateInvStatus.OPEN"
                danger
                type="link"
                size="small"
                @click="handleOver(record as EvaluateInvEntity)"
              >
                结束
              </a-button>
              <a-button
                v-if="record.status === EvaluateInvStatus.CLOSE"
                type="link"
                size="small"
                danger
                @click="handleDelete([record] as EvaluateInvEntity[])"
              >
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { EvaluateInvEntity, EvaluateInvStatus } from './EvaluateInvEntity'
import { closeEvaluateInv, deleteEvaluateInv, getEvaluateInvPage, getEvaluateInvUserList } from './api'
import Edit from './components/Edit.vue'
import Detail from './components/Detail.vue'
import Deferment from './components/Deferment.vue'
import type { IInputOption } from '~/interface/IInputOption'
import { IlisFormSearch, IlisInput, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleSearch,
  handleReset,
  handleSortChange,
  handleDelete,
  handleReloadTable,
} = useTableHooks<EvaluateInvEntity>({
  api: getEvaluateInvPage,
  delApi: deleteEvaluateInv,
})

const userSelectOptions = ref<IInputOption[]>([])

/**
 * # 获取用户列表
 */
async function getUserList() {
  const { data } = await getEvaluateInvUserList()
  userSelectOptions.value = data?.map(item => ({ label: item.createName, value: item.createBy }))
}

function handleOver(row: EvaluateInvEntity) {
  Modal.confirm({
    title: '提前结束邀请评价！',
    content: '提前结束邀请评价后，未完成评价的人员无法进行评价，您确定结束吗？',
    centered: true,
    icon: createVNode(ExclamationCircleOutlined),
    async onOk() {
      await closeEvaluateInv(row)
      message.success('操作成功！')
      handleReloadTable()
    },
  })
}

async function handleAdd() {
  await AnyDialogHelper.showModel(Edit, EvaluateInvEntity.fromJSON({}))
  handleReloadTable()
}

function init() {
  getUserList()
}

init()
</script>

<style>

</style>
