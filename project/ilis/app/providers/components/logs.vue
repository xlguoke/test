<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="日志"
      :mask-closable="false"
      class="addModalBox"
      :width="800"
      @ok="cancelModal"
      @cancel="cancelModal"
    >
      <template #footer>
        <div>
          <a-button style="display: none" @click="cancelModal">
            取消
          </a-button>
          <a-button @click="cancelModal">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
      <!-- :scroll="{ y: 160 }" -->
      <a-table
        :columns="columns"
        :row-class-name="rowClassName"
        :data-source="data"
        :loading="loading"
        row-key="id"
        bordered
        table-layout="auto"
        :pagination="false"
        :scroll="{ y: 350 }"
      >
        <template #bodyCell="{ column, record }">
          <span v-if="column.dataIndex === 'content'">
            <div v-html="record.content"></div>
          </span>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'

const columns = [
  {
    title: '内容',
    dataIndex: 'content',
    width: '30%',
  },
  {
    title: '处理意见',
    dataIndex: 'opinion',
    width: '20%',
  },
  {
    title: '对象编号',
    dataIndex: 'objectSn',
    width: '20%',
  },
  {
    title: '处理人',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD HH:mm:ss'),
  },
]

export default {
  props: {
    relationQry: Boolean,
  },
  data() {
    return {
      data: [],
      columns,
      loading: false,
      visible: false,
      isEdit: false,
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取自定义字段
    getData(id, type, isNewUrl) {
      this.loading = true
      let params = {
        id,
        objectType: type,
        relationQry: this.relationQry,
      }
      let url = window.$oApi.testItem.synthesisLog
      if (isNewUrl) {
        params = {
          businessKey: id,
          processTypeId: type,
        }
        url = window.$oApi.auditProcess.processLogs
      }
      if (this.relationQry) {
        params.objectId = id
        url = window.$oApi.offlineDataManage.logList
      }
      window.$oAjax({
        url,
        params,
      }).then((res) => {
        if ((res && res.data) || (res && res.rows)) {
          this.data = res.data || res.rows
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
        this.loading = false
      })
    },
    showModal(id, type, isNewUrl) {
      this.data = []
      this.getData(id, type, isNewUrl)
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
  },
}
</script>
