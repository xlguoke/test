<template>
  <a-modal
    v-model:visible="visible"
    title="查看明细"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="confirmLoading"
    width="70%"
    @ok="handleOk"
  >
    <a-spin :spinning="spinning">
      <a-descriptions bordered size="small" :column="2">
        <a-descriptions-item label="咨询标题">{{ form.title }}</a-descriptions-item>
        <a-descriptions-item label="咨询时间">
          {{ form.createdAt && formatDate(form.createdAt, 2) }}
        </a-descriptions-item>
        <a-descriptions-item label="咨询内容" :span="2">{{ form.content }}</a-descriptions-item>
        <a-descriptions-item label="咨询单位">{{ form.unitName }}</a-descriptions-item>
        <a-descriptions-item label="联系方式">{{ form.contactNo }}</a-descriptions-item>
        <a-descriptions-item label="回复内容">
          <a-textarea v-model:value="replyVal"></a-textarea>
        </a-descriptions-item>
      </a-descriptions>
      <div style="padding-top: 20px; min-height: 300px">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          bordered
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key == 'handle'">
              <span v-if="record.adopt">-</span>
              <a-button
                v-else
                v-auth="'technical-exchange::top::adopt'"
                type="link"
                primary
                size="small"
                @click="useRow(record)"
              >
                采用
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, createVNode } from "vue"
import { Modal, message } from "ant-design-vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { getDetail, adoptApi, saveReply, detailType } from "@/api/technicalExchange.api"
import { formatDate } from "@/assets/js/common"

const emit = defineEmits(["updateList"])

const visible = ref(false)
const spinning = ref(false)
const editId = ref("")
const openModal = (id: string) => {
  editId.value = id || ""
  visible.value = true
  id && getDatas()
}

defineExpose({
  openModal
})

const form = ref<detailType>({
  id: "",
  title: "",
  content: "",
  contact: "",
  contactNo: "",
  unitName: "",
  solved: false,
  createdAt: null,
  replies: []
})

//  编辑时获取详情数据
const getDatas = () => {
  spinning.value = true
  getDetail(editId.value).then((res: any) => {
    spinning.value = false
    form.value = res
    dataSource.value = res.replies || []
  })
}

const columns = reactive([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "回答单位",
    dataIndex: "unitName",
    key: "unitName"
  },
  {
    title: "回答时间",
    dataIndex: "replyTime",
    key: "replyTime",
    customRender: ({ text }) => {
      return text ? formatDate(text, 2) : ""
    }
  },
  {
    title: "回答内容",
    dataIndex: "content",
    key: "content"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
  }
])

const dataSource = ref([])

const useRow = (row) => {
  openConfirm("确认采用这条回答？").then(() => {
    adoptApi({
      id: row.id,
      technicalExchangeId: row.technicalExchangeId
    }).then(() => {
      row.adopt = true
      message.success("已采用")
      emit("updateList")
    })
  })
}

// 保存
const replyVal = ref("")
const confirmLoading = ref<boolean>(false)
const handleOk = () => {
  if (!replyVal.value) {
    message.warning("请输入回复内容")
    return
  }
  saveReply({
    technicalExchangeId: form.value.id,
    content: replyVal.value
  }).then(() => {
    message.success("回复成功")
    emit("updateList")
    visible.value = false
  })
}

//  确认弹窗
const openConfirm = (title: string, content?: string) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        resolve("")
      }
    })
  })
}
</script>

<style scoped lang="less">
:deep(.ant-descriptions-item-label) {
  width: 120px;
  text-align: center;
}
</style>
