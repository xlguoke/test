<template>
  <IlisContainer app-id="industry-config">
    <BaseSpinWrapper :spinning="loading">
      <HtButtonGroup>
        <a-button type="primary" @click="handleAdd()">
          新增领域
        </a-button>
      </HtButtonGroup>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :entity="IndustryListEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'enabled'">
              <a-switch v-model:checked="record.enabled" @change="eidtRow(record as IndustryListEntity)" />
            </template>
            <template v-if="column.dataIndex === 'actions'">
              <a-button type="link" size="small" @click="handleAdd(record as IndustryListEntity)">
                编辑
              </a-button>
              <a-button type="link" size="small" @click="handleConfig(record as IndustryListEntity)">
                字段配置
              </a-button>
              <a-button
                type="link" size="small" danger
                @click="handleDelete([record as IndustryListEntity], {
                  title: '删除提示',
                  content: '确定删除该领域吗？',
                })"
              >
                删除
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import HtButtonGroup from '~/components/htButtonGroup'
import { useTableHooks } from '~/hooks/useTableHooks'
import { deleteApi, pageListApi, saveApi } from './api'
import AddEdit from './components/AddEdit.vue'
import Configs from './components/Configs.vue'
import { IndustryListEntity } from './IndustryConfigEntity'

const {
  loading,
  tableBoxRef,
  tableHeight,
  dataSource,
  handleSearch,
  handleDelete,
} = useTableHooks({
  api: pageListApi,
  delApi: deleteApi,
  isPagination: false,
  responseDataTransform(res) {
    return {
      rows: res,
      total: res.length,
    }
  },
})

/** 新增 */
async function handleAdd(record?: IndustryListEntity) {
  await AnyDialogHelper.showModel(AddEdit, { entity: record })
  handleSearch()
}

/** 配置 */
async function handleConfig(record: IndustryListEntity) {
  await AnyDialogHelper.showModel(Configs, record)
}

/** 更新行 */
async function eidtRow(record: IndustryListEntity) {
  loading.value = true
  const row: any = { ...record }
  try {
    await saveApi(row)
    message.success('操作成功！')
    record.enabled = !record.enabled
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}
</script>

<style>

</style>
