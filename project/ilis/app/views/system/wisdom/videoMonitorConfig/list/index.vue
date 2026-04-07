<template>
  <a-spin :spinning="spinning">
    <div class="spin-content">
      <a-space class="mb-3">
        <a-button @click="showConfigDetail">
          查看配置详情
        </a-button>
        <a-button v-permission="'dashboard::video:config'" @click="showVideoConfig">
          驾驶舱视频配置
        </a-button>
      </a-space>
      <a-table
        :columns="columns"
        :data-source="data"
        bordered
        :pagination="false"
        row-key="id"
        :row-class-name="rowClassName"
        :scroll="{ y: tableHeight }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button type="link" @click="settingRow(record)">
              编辑
            </a-button>
          </template>
        </template>
      </a-table>
      <ht-modal
        v-model:open="visible"
        :title="`视频监控配置 （${setRowData.name}）`"
        width="600px"
        :hide-confirm="isDetail"
        @cancel="handleCancel"
        @ok="handleOk"
      >
        <AddEditComponent ref="AddEditComponent" :callback="getData" />
      </ht-modal>
    </div>

    <ConfigDetail ref="configDetail" />
  </a-spin>
</template>

<script>
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import AddEditComponent from './components/addEdit.vue'
import ConfigDetail from './components/configDetail.vue'
import VideoConfig from './components/VideoConfig.vue'

const columns = [
  { title: '功能室名称', dataIndex: 'name' },
  { title: '监控设备名称', dataIndex: 'labConfigNames' },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    AddEditComponent,
    ConfigDetail,
  },
  data() {
    return {
      spinning: false,
      tableHeight: document.body.clientHeight - 166,
      visible: false,
      isDetail: false,
      data: [],
      cacheData: [],
      columns,
      setRowData: {},
    }
  },
  created() {
    this.getData()
  },
  mounted() {
    window.$oNextTick(() => {
      const height = document.body.clientHeight
      const tableHeader = document.querySelector(' .spin-content .ant-table-header').clientHeight
      this.tableHeight = height - 76 - tableHeader
    })
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async showVideoConfig() {
      AnyDialogHelper.showModel(VideoConfig, {
        labDatas: this.data,
      })
    },
    getData() {
      this.spinning = true
      this.visible = false
      window.$oAjax({
        url: window.$oApi.laboratory.tableUrl,
        data: window.$oQs.stringify({}),
      }).then((res) => {
        this.data = []
        if (res.rows && res.rows.length > 0) {
          this.data = res.rows
        }
        this.cacheData = JSON.parse(JSON.stringify(this.data))
        this.spinning = false
      })
    },
    settingRow(record) {
      this.visible = true
      this.setRowData = record
      window.$oNextTick(() => {
        this.$refs.AddEditComponent.showModal(record.id, `${record.name}`, this.isDetail)
      })
    },
    handleOk() {
      this.$refs.AddEditComponent.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.AddEditComponent.handleCancel()
    },
    showConfigDetail() {
      this.$refs.configDetail.showModal()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
