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
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'log'">
            <div v-html="text"></div>
          </template>
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
    dataIndex: 'log',
    width: '30%',
    scopedSlots: { customRender: 'log' },
  },
  //  {
  //   title: '处理意见',
  //   dataIndex: 'opinion',
  //   width: '20%',
  // },{
  //   title: '对象编号',
  //   dataIndex: 'objectSn',
  //   width: '20%',
  // },{
  //   title: '处理人',
  //   dataIndex: 'createName',
  //   width: '10%',
  // },
  {
    title: '时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD HH:mm:ss'),
  },
]

export default {
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
    getData(id) {
      this.loading = true
      const params = {
        bookPurchaseId: id,
      }
      const url = 'rest/standardBookPurchaseController/getBookPurchaseLog'
      window.$oAjax({
        url,
        params,
      }).then((res) => {
        if (res && res.code === 20000) {
          this.data = res.data
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.message || res.msg || '查询错误'),
          )
        }
        this.loading = false
      })
    },
    showModal(id) {
      this.getData(id)
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.addModalBox {
  .ant-modal-body {
    height: 360px;
    max-height: 360px;
    min-height: 360px;
    overflow-y: auto;
    padding: 0 15px;
  }
}
</style>
