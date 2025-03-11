<template>
  <a-modal
    v-model:open="open"
    title="消息编辑"
    width="840px"
    :mask-closable="false"
    destroy-on-close
    :confirm-loading="submitLoading"
    centered
    @cancel="cancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      class="pt-2 max-h-[70vh] overflow-auto"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 19 }"
    >
      <a-form-item label="消息类型" name="messageType">
        预约温湿度达标提醒
      </a-form-item>
      <a-form-item label="启用状态" name="enableStatus">
        <a-switch v-model:checked="formState.enableStatus" checked-children="开" un-checked-children="关" />
      </a-form-item>
      <a-form-item label="发送渠道" name="sendWay">
        <a-card :body-style="{ padding: '8px' }">
          <a-tree
            v-model:selected-keys="selectedKeys"
            v-model:checked-keys="checkedKeys"
            checkable
            default-expand-all
            :tree-data="treeData"
          >
            <template #title="{ title, key }">
              <span v-if="key === '0-0-1-0'" style="color: #1890ff">{{ title }}</span>
              <template v-else>
                {{ title }}
              </template>
            </template>
          </a-tree>
        </a-card>
      </a-form-item>
      <a-form-item label="接收人员" name="receivePerson">
        <div class="mt-1 mb-2">
          <a-checkbox>操作人员</a-checkbox>
          <a-checkbox>试验室负责人</a-checkbox>
        </div>
        <a-button>添加人员</a-button>
        <div>
          <a-tag closable class="mt-2">
            张三
          </a-tag>
          <a-tag closable class="mt-2">
            张三
          </a-tag>
          <a-tag closable class="mt-2">
            张三
          </a-tag>
        </div>
      </a-form-item>
      <a-form-item label="消息模板" name="messageTemplate">
        <a-row :gutter="16">
          <a-col span="12">
            <a-table
              bordered
              row-key="id"
              :columns="columns"
              :data-source="variableList"
              size="small"
            >
            </a-table>
          </a-col>
          <a-col span="12">
            <a-card :body-style="{ padding: '8px' }" :head-style="{ padding: '8px', minHeight: '32px' }">
              <template #title>
                <p style="font-size: 14px;">
                  消息标题
                </p>
              </template>
              <a-textarea :rows="8" placeholder="请输入" />
            </a-card>
            <a-card class="mt-2" :body-style="{ padding: '8px' }" :head-style="{ padding: '8px', minHeight: '32px' }">
              <template #title>
                <p style="font-size: 14px;">
                  消息内容
                </p>
              </template>
              <a-textarea :rows="8" placeholder="请输入" />
            </a-card>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="onSubmit">
        保存
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { saveStandardApi } from '../api'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  dataSource: {
    type: Object,
    default: () => {},
  },
})

const emits = defineEmits(['update:open', 'onSave'])

const open = computed(() => props.open)

const formRef = ref()

const submitLoading = ref(false)

const selectedKeys = ref([])

const checkedKeys = ref([])

const variableList = ref([])

const treeData = [
  {
    key: '1',
    title: '全部',
    children: [
      {
        key: '1-1',
        title: '站内信',
        children: [
          { key: '1-1-1', title: '温湿度PC端' },
          { key: '1-1-2', title: 'ILIS-PC' },
          { key: '1-1-3', title: 'ILIS-APP' },
          { key: '1-1-4', title: '门口屏' },
          { key: '1-1-5', title: '设备屏' },
        ],
      },
      {
        key: '1-2',
        title: '短信',
      },
    ],
  },
]

const columns: ColumnType[] = [
  { title: '变量名', dataIndex: 'name', width: '20%' },
  { title: '释义', dataIndex: 'memo', width: '30%' },
  { title: '预览值', dataIndex: 'value', width: '30%' },
]

watch(open, (val) => {
  if (!val) {
    cancel()
  }
})

const formState = ref({
  enableStatus: false,
  messageTemplate: [],
})

function onSubmit() {
  formRef.value.validateFields().then(async () => {
    submitLoading.value = true
    await saveStandardApi(formState.value).finally(() => {
      submitLoading.value = false
    })
    message.success('保存成功')
    emits('onSave')
    cancel()
  })
}

// 关闭弹窗
function cancel() {
  emits('update:open', false)
  formRef.value.resetFields()
}
</script>
