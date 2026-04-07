<template>
  <div style="padding: 15px 0; padding-top: 0px">
    <a-spin :spinning="spinning">
      <div>
        <div
          v-for="item in data"
          :key="item.id"
          style="
            padding-bottom: 10px;
            margin-top: 10px;
            border-bottom: solid 1px #e2e2e2;
          "
        >
          <div style="font-size: 14px; font-weight: bold">
            {{ item.unitName }}
            <a
              href="javascript:;"
              style="margin-right: 5px; margin-left: 5px"
              title="编辑"
              class="text-blue-500"
              @click="edit(item)"
            >
              编辑
            </a>
            <a
              href="javascript:;"
              style="color: red"
              title="删除"
              @click="deleteRow(item)"
            >
              删除
            </a>
          </div>
          <div style="color: gray">
            报价：{{ item.quoteAmount }}元
          </div>
          <div style="font-weight: bold; margin-top: 5px">
            其他说明：
          </div>
          <div style="color: gray">
            {{ item.otherDescription }}
          </div>
          <div style="font-weight: bold; padding-top: 5px">
            附件：
          </div>
          <div v-for="file in item.unitAttach" :key="file.id">
            <a
              href="javascript:;"
              style="text-decoration: underline"
              :title="file.name"
              @click="
                () => {
                  downloadAccessory(file.attachmentId)
                }
              "
            >{{ file.name }}</a>
          </div>
        </div>
      </div>
    </a-spin>
    <div style="padding-top: 10px">
      <a-button type="primary" @click="addCertificate">
        添加本次投标竞争单位
      </a-button>
    </div>
    <EditModal :id="id" ref="EditModal" :callback="getBaseInfo" />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { downloadAccessory, getQueryVariable } from '~/providers/common/utils'
import EditModal from './components/editModal.vue'

export default {
  components: {
    EditModal,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      data: [],
      spinning: false,
      downloadAccessory,
    }
  },
  created() {
    this.getBaseInfo()
  },
  methods: {
    getBaseInfo() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.biddingRecord.unitList, {
          params: { recordId: this.id, type: 1 },
        })
        .then((res) => {
          if (res && res.success) {
            this.data = res.obj
          }
          this.spinning = false
        })
    },
    addCertificate() {
      this.$refs.EditModal.showModal()
    },
    edit(data) {
      this.$refs.EditModal.showModal(data)
    },
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除单位 ${data.unitName} 的信息吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingRecord.deleteUnit, {
              params: { id: data.id },
            })
            .then((res) => {
              if (res && res.success) {
                message.success(res.msg || res.message)
                this.getBaseInfo()
              }
              else {
                message.error(res.msg || res.message)
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
