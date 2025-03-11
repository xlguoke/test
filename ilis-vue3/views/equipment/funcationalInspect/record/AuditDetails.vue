<template>
  <IlisContainer>
    <TitleBar>
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
            <span>{{ formState.checkDepartment }}</span>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="核查人" name="checkUserId" :rules="[{ required: true, message: '请选择核查人！' }]">
            <span>{{ formState.checkUser }}</span>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="核查时间" name="checkDate" :rules="[{ required: true, message: '请选择核查时间！' }]">
            <span>{{ formState.checkStartDate }} ~ {{ formState.checkEndDate }}</span>
          </a-form-item>
        </a-col>
        <a-col span="12">
          <a-form-item label="备注" name="remark">
            <span>{{ formState.remark }}</span>
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="核查结论" name="checkResult" :rules="[{ required: true, message: '请输入核查结论！' }]">
            <span>{{ formState.checkResult }}</span>
          </a-form-item>
        </a-col>
        <a-col span="24">
          <a-form-item label="附件">
            <HtUploadFile
              v-if="formState.id"
              business-type="EQ"
              force-init
              :business-id="formState.id"
              is-reandonly
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
        :row-selection="getRowSelection()"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'value'">
            <span>{{ record.value }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import { getListByGroupId } from '~/api/common.ts'
import TitleBar from '~/components/TitleBar.vue'
import {
  AddCheckEntity,
  getRecordDetail,
} from '~/views/equipment/funcationalInspect/record/api.ts'
import { IlisContainer } from '~/components/ilisComponent'
import HtUploadFile from '~/components/htUploadFile/Index.vue'

const urlParams = new URLSearchParams(location.search)

const businessKey = urlParams.get('businessKey')

const formRef = ref()

const loading = ref(false)

const checkItemList = ref([])

const formState = ref(new AddCheckEntity())

const selectedRowKeys = ref([])

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
  await getCheckItems()
  getDetail()
}

async function getCheckItems() {
  const res = await getListByGroupId('6237f908815e4283bf66165ba1c2a16b')
  checkItemList.value = res.data.obj
}

async function getDetail() {
  if (!businessKey) {
    return
  }

  const res = await getRecordDetail(businessKey)
  const data = res.data
  const checkItems = data.checkItems || []

  formState.value = data

  checkItemList.value.forEach((item) => {
    const r = checkItems.find(i => i.dictId === item.id)
    if (r) {
      selectedRowKeys.value.push(r.dictId)
      item.value = r.value
    }
  })
}

function getRowSelection() {
  return {
    fixed: true,
    selectedRowKeys: selectedRowKeys.value,
  }
}
</script>
