<template>
  <IlisContainer app-id="regulatory">
    <div>
      <div style="padding: 10px">
        <a-button type="primary" @click="create">
          新增
        </a-button>
        <a-button @click="update">
          编辑
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :row-selection="rowSelection"
        :pagination="false"
        :data-source="data"
        bordered
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'operation'">
            <span class="table-handle">
              <a-button danger @click.stop="del(record)">
                删除
              </a-button>
              <a-button type="primary" @click.stop="config(record)">
                上报设置
              </a-button>
            </span>
          </template>
        </template>
      </a-table>
      <Regulatory ref="regulatory" :edit="regulatoryEdit" :callback="getDate" />
      <Config ref="config" />
    </div>
  </IlisContainer>
</template>

<script>
import Config from './config.vue'
import Regulatory from './regulatory.vue'

export default {
  name: 'App',
  components: {
    Regulatory,
    Config,
  },
  data() {
    return {

      key: '1',
      data: [],
      temp: [],
      selectedRowKeys: [],
      selectedRows: [],
      regulatoryEdit: false, // 行管系统新增/编辑
      regulatoryVisible: false, // 行管系统新增编辑 visible
      columns: [
        {
          title: '监管系统名称',
          dataIndex: 'name',
          key: 'name',
          width: '150px',
        },
        {
          title: '管理单位',
          dataIndex: 'agency',
          key: 'agency',
          width: '150px',
        },
        {
          title: '排序',
          dataIndex: 'sort',
          key: 'sort',
          width: '150px',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
          width: '120px',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '200px',
          key: 'operation',
          scopedSlots: { customRender: 'operation' },
        },
      ],
    }
  },
  computed: {
    rowSelection() {
      return {
        hideDefaultSelections: false,
        type: 'radio',
        selectedRowKeys: this.selectedRowKeys,
        selectedRows: this.selectedRows,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getDate()
  },
  methods: {
    getDate() {
      window.$oRest.get('/rest/regulatory/').then((res) => {
        if (res && res.code === 20000) {
          this.data = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('列表加载失败'))
        }
      })
    },
    create() {
      this.regulatoryEdit = false
      this.$refs.regulatory.show()
    },
    update() {
      this.regulatoryEdit = true
      if (this.selectedRows.length < 1) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要编辑的监管系统'))
        return
      }
      this.$refs.regulatory.show(this.selectedRows[0])
    },
    del(record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '删除确认',
        content: '将删除该监管系统的所有配置项，确认删除吗?',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          window.$oRest.delete(`/rest/regulatory/${record.id}`).then((res) => {
            if (res && res.code === 23000) {
              _this.data = res.data
              _this.getDate()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info('删除失败'))
            }
          })
        },
      })
    },
    config(record) {
      this.$refs.config.show(record)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
