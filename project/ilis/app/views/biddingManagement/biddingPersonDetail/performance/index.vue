<template>
  <div style="padding: 15px 0; padding-top: 5px">
    <a-spin :spinning="spinning">
      <div>
        <div
          v-for="item in data"
          :key="item.id"
          style="padding: 10px 0; border-bottom: solid 1px #e2e2e2"
        >
          <div style="font-size: 14px">
            <span style="color: #000; font-weight: bold">项目名称：{{ item.projectName }}</span>
            <a
              href="javascript:;"
              title="编辑"
              style="font-size: 14px; margin-left: 5px"
              class="text-blue-500"
              @click="edit(item)"
            >
              编辑
            </a>
            <a
              href="javascript:;"
              title="删除"
              style="font-size: 14px; color: red; margin-left: 5px"
              @click="deleteRow(item)"
            >
              删除
            </a>
          </div>
          <a-row style="color: gray">
            <a-col span="12">
              担任职务：{{ item.position }}
            </a-col>
            <a-col span="12">
              时间：{{ item.positionDate }}
            </a-col>
            <a-col span="12">
              业绩文件：
            </a-col>
          </a-row>
          <div v-for="file in item.performanceAttach" :key="file.id">
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
      <a-button type="primary" @click="add">
        添加人员业绩
      </a-button>
    </div>
    <EditModal :id="id" ref="EditModal" :callback="getData" />
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
    this.getData()
  },
  methods: {
    getData() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.biddingPerson.personPerformanceList, {
          params: { personId: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.data = res.obj
          }
          this.spinning = false
        })
    },
    add() {
      this.$refs.EditModal.showModal()
    },
    edit(data) {
      this.$refs.EditModal.showModal({ ...data })
    },
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除人员业绩 ${data.projectName} 的吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingPerson.personPerformanceDelete, {
              params: { id: data.id },
            })
            .then((res) => {
              if (res && res.success) {
                message.success(res.msg || res.message)
                this.getData()
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
