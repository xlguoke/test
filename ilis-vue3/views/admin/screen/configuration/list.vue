<template>
  <IlisContainer app-id="screen">
    <div class="h-full flex flex-col gap-2">
      <a-form ref="formRef" :model="formState" layout="inline">
        <a-form-item name="quickQry">
          <a-input
            v-model:value="formState.quickQry"
            placeholder="请输入屏幕编号、屏幕名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item name="screenType">
          <a-select
            v-model:value="formState.screenType"
            style="width: 200px;"
            placeholder="请选择屏幕类型"
          >
            <a-select-option v-for="(item) in screentType" :key="item.id" :value="item.typename">
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch(formState)">
              查询
            </a-button>
            <a-button @click="handleReset">
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-space>
        <a-button type="primary" @click="editVueRef.show()">
          新增屏幕
        </a-button>
      </a-space>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <a-table
          :data-source="dataSource"
          :columns="columns"
          :loading="loading"
          :pagination="getPagination()"
          :scroll="{ y: tableHeight }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" size="small" @click="handlePreview(record as ScreenConfigEntity)">
                预览
              </a-button>
              <a-button type="link" size="small" @click="editVueRef.show(record)">
                编辑
              </a-button>
              <a-button
                type="link"
                danger
                size="small"
                @click="handleDelete(record as ScreenConfigEntity)"
              >
                删除
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <EditVue ref="editVueRef" :callback="getList" :screent-type="screentType" />
  </IlisContainer>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { deleteScreenConfig, getDictByCode, getScreenConfigPage } from './api'
import EditVue from './edit.vue'
import { type ScreenConfigEntity, type ScreenTypeEntity, columns } from '.'
import { useTableHooks } from '~/hooks/useTableHooks'

defineProps<{ count: number, used: number }>()

const formRef = ref()

const editVueRef = ref()

const screentType = ref([] as ScreenTypeEntity[])

const unitCode = localStorage.getItem('unitCode') || ''

const formState = ref({
  quickQry: '',
  screenType: undefined,
})

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  getList,
  handleReset,
  handleSearch,
  getPagination,
} = useTableHooks<ScreenConfigEntity>({
  api: getScreenConfigPage,
  query: formState,
  formRef,
})

/**
 * 删除
 */
function handleDelete(row: ScreenConfigEntity) {
  Modal.confirm({
    title: '确认要删除这条数据吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后数据无法恢复',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteScreenConfig(row)
      getList()
    },
  })
}

/**
 * 预览
 * @param row
 */
function handlePreview(row: ScreenConfigEntity) {
  if (!row.url) {
    return message.warning('该屏幕没有配置地址')
  }
  const connector = row.url.includes('?') ? '&' : '?'
  const previewUrl = `${row.url}${connector}screenNo=${row.sn}&unitCode=${unitCode}`
  console.warn(previewUrl)
  window.open(previewUrl)
}

async function getScreenType() {
  const { data } = await getDictByCode('SMART_SCREEN_TYPE')
  screentType.value = data
}

getScreenType()
</script>

<style scoped>
#screen{
  height: 100%;
}
</style>
