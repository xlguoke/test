<template>
  <div>
    <HtModal
      v-model:open="visible"
      :title="title"
      width="800px"
      :after-close="onClosed"
    >
      <TitleBar class="mt-4">
        信息编辑
      </TitleBar>
      <a-form
        ref="formRef"
        class="mt-4"
        :model="formState"
        :label-col="{ style: { width: '75px' } }"
        :wrapper-col="{ style: { flex: 1 } }"
      >
        <a-row>
          <a-col span="12">
            <a-form-item label="核查部门" name="checkDepartmentId" :rules="[{ required: true, message: '请选择核查部门！' }]">
              <span v-if="isDetail">{{ formState.checkDepartment }}</span>
              <a-tree-select
                v-else
                v-model:value="formState.checkDepartmentId"
                class="w-[220px]"
                :tree-data="treeData"
                :field-names="{
                  label: 'text',
                  value: 'id',
                }"
                allow-clear
                placeholder="请选择核查部门"
                tree-node-filter-prop="text"
                @change="(id, names) => { selectDepartment(id, names) }"
              />
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="核查人" name="checkUserId" :rules="[{ required: true, message: '请选择核查人！' }]">
              <span v-if="isDetail">{{ formState.checkUser }}</span>
              <a-input-group v-else compact>
                <a-input v-model:value="formState.checkUser" placeholder="请选择" readonly style="width: calc(100% - 48px)" />
                <a-button @click="userSelectorVisible = true">
                  <UnorderedListOutlined style="font-size: 16px;" />
                </a-button>
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="核查时间" name="checkDate" :rules="[{ required: true, message: '请选择核查时间！' }]">
              <span v-if="isDetail">{{ formState.checkStartDate }} ~ {{ formState.checkEndDate }}</span>
              <a-range-picker v-else v-model:value="formState.checkDate" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD" />
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="备注" name="remark">
              <span v-if="isDetail">{{ formState.remark }}</span>
              <a-input v-else v-model:value.trim="formState.remark" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col span="24">
            <a-form-item label="核查结论" name="checkResult" :rules="[{ required: true, message: '请输入核查结论！' }]">
              <span v-if="isDetail">{{ formState.checkResult }}</span>
              <a-textarea v-else v-model:value.trim="formState.checkResult" :rows="2" placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col v-if="!isBatch" span="24">
            <a-form-item label="附件">
              <HtUploadFile
                v-if="formState.id"
                business-type="EQ"
                force-init
                :business-id="formState.id"
                :is-reandonly="isDetail"
                @get-qr-code-key="formState.attachmentQrKey = $event"
              >
                <template #footer="{ handleCancel: closeFn }">
                  <a-space>
                    <a-button type="primary" @click="closeFn">
                      确定
                    </a-button>
                    <a-button @click="closeFn">
                      取消
                    </a-button>
                  </a-space>
                </template>
              </HtUploadFile>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <TitleBar class="mt-4">
        核查记录
      </TitleBar>

      <div class="mt-4">
        <a-table
          row-key="id"
          :columns="columns"
          :data-source="checkItemList"
          :pagination="false"
          :loading="loading"
          :scroll="{ y: 240 }"
          :row-selection="getRowSelection()"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'value'">
              <span v-if="isDetail">{{ record.value }}</span>
              <a-input v-else v-model:value.trim="record.value" placeholder="请输入核查结果" />
            </template>
          </template>
        </a-table>
      </div>

      <template #footer>
        <a-button @click="visible = false">
          {{ isDetail ? '关闭' : '取消' }}
        </a-button>
        <a-button v-if="!isDetail" type="primary" :loading="submitLoading" @click="handleOk">
          确定
        </a-button>
      </template>
    </HtModal>

    <PersonSelector v-model:show="userSelectorVisible" @confirm="selectPerson" />
  </div>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import type { EquipmentFunCheckRecordEntity } from '../EquipmentFunCheckRecordEntity.ts'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import PersonSelector from '~/components/PersonSelector.vue'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import { getListByGroupId, getOrgComboTree } from '~/api/common.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import TitleBar from '~/components/TitleBar.vue'
import {
  AddCheckEntity,
  batchUpdateCheck,
  getRecordDetail,
  updateCheck,
} from '~/views/equipment/funcationalInspect/record/api.ts'
import HtUploadFile from '~/components/htUploadFile/Index.vue'

const props = defineProps<IDialogPropsParam<null, EquipmentFunCheckRecordEntity>>()

const formRef = ref()

const visible = ref(true)

const userSelectorVisible = ref(false)

const rowData = ref<EquipmentFunCheckRecordEntity>(props.param.record)

const batchIds = ref<string[]>(props.param.ids)

const isBatch = ref(props.param.ids && props.param.ids.length > 0)

const isDetail = computed(() => props.param.isDetail)

const loading = ref(false)

const submitLoading = ref(false)

const checkItemList = ref([])

const formState = ref(new AddCheckEntity())

const title = computed(() => {
  if (isBatch.value) {
    return '批量编辑'
  }
  return `${formState.value.equipmentName || ''}（${formState.value.equipmentCode || ''}）核查记录`
})

const selectedRowKeys = ref([])

const selectedRows = ref([])

const treeData = ref<IDepartmentEntity[]>([])

const columns: ColumnType[] = [
  {
    title: '核查项目',
    dataIndex: 'typename',
    width: 220,
  },
  {
    title: '核查结果',
    dataIndex: 'value',
    width: 150,
  },
]

init()

async function init() {
  getTreeData()
  await getCheckItems()

  if (!isBatch.value) {
    getDetail()
  }
}

function selectDepartment(id, names) {
  if (id) {
    formState.value.checkDepartment = names[0]
  }
  else {
    formState.value.checkDepartment = ''
  }
}

async function getCheckItems() {
  const res = await getListByGroupId('6237f908815e4283bf66165ba1c2a16b')
  checkItemList.value = res.data.obj
}

async function getDetail() {
  const res = await getRecordDetail(rowData.value.id)
  const data = res.data
  const checkItems = data.checkItems || []

  formState.value = data

  if (data.checkStartDate && data.checkEndDate) {
    formState.value.checkDate = [data.checkStartDate, data.checkEndDate]
  }

  checkItemList.value.forEach((item) => {
    const r = checkItems.find(i => i.dictId === item.id)
    if (r) {
      selectedRowKeys.value.push(r.dictId)
      item.value = r.value
    }
  })

  selectedRows.value = checkItemList.value.filter(i => selectedRowKeys.value.includes(i.id))
}

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

function getRowSelection() {
  return {
    fixed: true,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows) => {
      if (isDetail.value) {
        return
      }
      selectedRowKeys.value = keys
      selectedRows.value = rows
    },
  }
}

function selectPerson(rows: IUserSelectVoEntity[]) {
  const [row] = rows

  formState.value.checkUserId = row.id
  formState.value.checkUser = row.name
  userSelectorVisible.value = false

  formRef.value.validate('checkUserId')
}

async function handleOk() {
  formRef.value.validateFields().then(async () => {
    const checkItems = selectedRows.value.map(i => ({
      dictId: i.id,
      name: i.typename,
      value: i.value,
    }))

    if (checkItems.find(i => !i.value)) {
      message.warn('核查结果为必填，请填写完整后提交！')
      return
    }

    const formData = {
      ...formState.value,
      checkItems,
    }

    formData.checkStartDate = formData.checkDate[0]
    formData.checkEndDate = formData.checkDate[1]
    delete formData.checkDate

    submitLoading.value = true

    if (isBatch.value) {
      formData.ids = batchIds.value
      delete formData.equipmentId
      await batchUpdateCheck(formData).finally(() => {
        submitLoading.value = false
      })
    }
    else {
      await updateCheck(formData).finally(() => {
        submitLoading.value = false
      })
    }

    message.success('操作成功！')
    props.onConfirm(null)
    visible.value = false
  })
}
</script>
