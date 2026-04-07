<template>
  <IlisContainer app-id="screen">
    <div class="h-full flex flex-col gap-2">
      <a-form ref="formRef" :model="formState" layout="inline">
        <a-form-item name="quickQry">
          <a-input
            v-model:value="formState.quickQry"
            placeholder="请输入屏幕编号、屏幕名称"
            allow-clear
            @keypress.enter="handleSearch(formState)"
          />
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

      <div class="w-full flex justify-between">
        <a-space>
          <a-button type="primary" @click="editVueRef.show()">
            新增屏幕
          </a-button>
          <a-button @click="onRestart">
            重启指定智慧屏
          </a-button>
          <a-button @click="onRestartAll">
            重启全部智慧屏
          </a-button>
          <a-button @click="onAuthConfig">
            操作屏鉴权配置
          </a-button>
        </a-space>
        <a-space>
          <span style="font-weight: 700;font-size: small;">已授权屏幕数：</span>
          <span style="color: #408cf0; font-weight: 700; font-size: small;">{{ count || '--' }}</span>
        </a-space>
      </div>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <a-table
          :data-source="dataSource"
          :columns="columns"
          :loading="loading"
          :pagination="getPagination()"
          :scroll="{ y: tableHeight }"
          :row-selection="getRowSelection()"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'authorized'">
              <template v-if="record.license && record.license.authorized">
                <span v-if="record.license.authExpireDate && dayjs(record.license.authExpireDate).valueOf() < dayjs().valueOf()" class="text-orange-500">授权已过期</span>
                <span v-else class="text-green-700">已授权</span>
              </template>
              <span v-else class="text-orange-500">未授权</span>
            </template>

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

    <EditVue ref="editVueRef" :callback="getList" />
  </IlisContainer>
</template>

<script setup lang='ts'>
import type { ScreenConfigEntity } from '.'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { createVNode } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { useTableHooks } from '~/hooks/useTableHooks'
import ScreenAuthConfig from '~/views/admin/screen/configuration/screenAuthConfig.vue'
import { columns } from '.'
import { deleteScreenConfig, getScreenConfigPage, restartAll, restartBatch } from './api'
import EditVue from './edit.vue'

defineProps<{ count: number | string, used: number | string }>()

const formRef = ref()

const editVueRef = ref()

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
  getRowSelection,
  selectedRowKeys,
} = useTableHooks<ScreenConfigEntity>({
  api: getScreenConfigPage,
  query: formState,
  formRef,
  totalKey: 'count',
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

function onAuthConfig() {
  AnyDialogHelper.showModel(ScreenAuthConfig, {
    record: {},
  })
}

/**
 * 重启设备屏
 */
function onRestart() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要重启的智慧屏！')
    return
  }

  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定要重启勾选的智慧屏吗？',
    async onOk() {
      await restartBatch(selectedRowKeys.value.join(','))
      message.success('操作成功！')
    },
  })
}

async function onRestartAll() {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定要重启所有智慧屏吗？',
    async onOk() {
      await restartAll()
      message.success('操作成功！')
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
</script>

<style scoped>
#screen{
  height: 100%;
}
</style>
