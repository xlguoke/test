<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EvaluateModelEntity"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #createBy="{ data }">
          <IlisInput
            v-model="data.createBy"
            style="min-width: 240px;width: 100%;"
            :entity="EvaluateModelEntity"
            :options="userSelectOptions"
            field="createBy"
            @change="handleSearch({ ...data, createBy: $event })"
          ></IlisInput>
        </template>
      </IlisFormSearch>
      <div>
        <a-button type="primary" @click="editData = EvaluateModelEntity.fromJSON({});isShowEdit = true">
          新增问卷
        </a-button>
      </div>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EvaluateModelEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <a-switch
                v-model:checked="(record as EvaluateModelEntity).status"
                :loading="switchLoading"
                :checked-value="EvaluateModelStatus.OPEN"
                :un-checked-value="EvaluateModelStatus.CLOSE"
                @change="handleStatusChange((record as EvaluateModelEntity))"
              ></a-switch>
            </template>
            <template v-if="column.dataIndex === 'problemNum'">
              <a-button type="link" size="small" @click="editData = EvaluateModelEntity.fromJSON(record); showPreview = true">
                {{ text }}
              </a-button>
            </template>
            <template v-if="column.dataIndex === 'recordNum'">
              <a-button type="link" size="small" @click="handleOpenRecord(record as EvaluateModelEntity)">
                {{ text }}
              </a-button>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" size="small" @click="editData = EvaluateModelEntity.fromJSON(record); showPreview = true">
                预览
              </a-button>
              <a-button type="link" size="small" @click="editData = EvaluateModelEntity.fromJSON(record); isShowEdit = true">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleCopy(record as EvaluateModelEntity)">
                复制
              </a-button>
              <a-button type="link" size="small" @click="handleLog(record as EvaluateModelEntity)">
                日志
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="beforeDelete([record] as EvaluateModelEntity[])"
              >
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
    <!-- 新增、编辑 -->
    <EditVue
      v-model:show="isShowEdit"
      :data="editData"
      @confirm="handleReloadTable()"
    ></EditVue>
    <!-- 日志 -->
    <LogModal :id="logId" v-model:show="showLog" log-type="32" />
    <!-- 预览 -->
    <PreviewModal v-model:show="showPreview" :data="editData"></PreviewModal>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { getEvaluateInvListAll } from '../inv/api'
import { EvaluateModelEntity, EvaluateModelStatus } from './EvaluateModelEntity'
import { deleteEvaluateModel, getEvaluateModelPage, getEvaluateModelUserList, putEvaluateModelOnline } from './api'
import EditVue from './components/Edit.vue'
import PreviewModal from './components/PreviewModal.vue'
import CopyModal from './components/CopyModal.vue'
import type { IInputOption } from '~/interface/IInputOption'
import { IlisFormSearch, IlisInput, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import type { IDeleteConfig } from '~/interface/ITableHookConfig'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getPagination,
  handleReset,
  handleSearch,
  handleSortChange,
  handleReloadTable,
  handleDelete,
} = useTableHooks<EvaluateModelEntity>({
  api: getEvaluateModelPage,
  delApi: deleteEvaluateModel,
  isUpperOrderType: true,
})

const userSelectOptions = ref<IInputOption[]>([])

const switchLoading = ref(false)

const isShowEdit = ref(false)

const editData = ref(new EvaluateModelEntity())

const logId = ref('')

const showLog = ref(false)

const showPreview = ref(false)

const deleteConfig = ref<IDeleteConfig>({
  title: '您正在删除问卷！',
  content: '您确定要删除该问卷吗？',
})
/**
 * # 获取用户列表
 */
async function getUserList() {
  const { data } = await getEvaluateModelUserList()
  userSelectOptions.value = data?.map(item => ({ label: item.createName, value: item.createBy }))
}

async function handleStatusChange(row: EvaluateModelEntity) {
  switchLoading.value = true
  await putEvaluateModelOnline(row).finally(() => (switchLoading.value = false))
  message.success('操作成功')
  handleReloadTable()
}

async function handleCopy(row: EvaluateModelEntity) {
  await AnyDialogHelper.showModel(CopyModal, row)
  handleReloadTable()
}

/**
 * 查看日志
 */
function handleLog(row: EvaluateModelEntity) {
  logId.value = row.id?.toString()
  showLog.value = true
}

function handleOpenRecord(row: EvaluateModelEntity) {
  openIlisTab('评价记录', `/ilis2/rest/evaluate/record/index?${new URLSearchParams({ modelId: row.id.toString() })}`)
}

async function beforeDelete(deleteArr: EvaluateModelEntity[]) {
  if (deleteArr.some(item => item.status === EvaluateModelStatus.OPEN)) {
    Modal.warning({
      title: '无法删除！',
      content: '当前问卷已应用到线上，请更换线上问卷后再次尝试！',
      centered: true,
      icon: createVNode(ExclamationCircleOutlined),
      okText: '确认',
    })
    return
  }
  const res = await Promise.all(deleteArr.map(async (item) => {
    const { data } = await getEvaluateInvListAll({
      modelId: item.id,
    })
    return data
  }))
  if (res.some(item => item.length)) {
    deleteConfig.value = {
      title: '您正在删除问卷！',
      content: '当前问卷有进行中的评价邀请，删除后将结束进行中的评价邀请！',
    }
  }
  else {
    deleteConfig.value = {
      title: '您正在删除问卷！',
      content: '您确定要删除该问卷吗？',
    }
  }
  handleDelete(deleteArr, deleteConfig.value)
}

function init() {
  getUserList()
}

init()
</script>

<style>

</style>
