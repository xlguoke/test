<template>
  <div class="qrConfig">
    <a-tabs v-if="!['equipmentBarcode', 'personBarcode', 'biddingPersonBarcode', 'fixedAssetBarcode'].includes(type)" v-model:active-key="activeTab" size="large" @change="changeTestType">
      <a-tab-pane
        v-for="item in tabList"
        :key="item.key"
        :tab="item.tab"
      />
    </a-tabs>
    <ComHeader v-else>
      {{ title }}
    </ComHeader>
    <div class="mb-2 qrConfig-tip">
      <div>提示：按住鼠标左键可以上下拖动排序，</div>
      <div>二维码字段全部关闭显示后，会读取系统默认配置</div>
    </div>
    <a-table
      row-key="id"
      :custom-row="customRow"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :loading="loading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'shown'">
          <a-switch v-model:checked="record.shown" @change="onChangeStatus(record)" />
        </template>

        <template v-if="column.dataIndex === 'action'">
          <a-button type="link" siz="small" @click="onEdit(record)">
            编辑
          </a-button>
        </template>
      </template>
    </a-table>

    <EditComponent
      v-model:value="editVisible"
      :row="row"
      :after-update="getList"
    />
  </div>
</template>

<script>
import ComHeader from '~/providers/components/comHeader/index.vue'
import EditComponent from '../components/edit.vue'

const dragInfo = {
  sourceId: null,
  sourceSort: null,

  targetId: null,
  targetSort: null,
}

const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    align: 'center',
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '系统字段',
    dataIndex: 'columnName',
  },
  {
    title: '显示名称',
    dataIndex: 'displayName',
  },
  {
    title: '是否显示',
    dataIndex: 'shown',
    scopedSlots: { customRender: 'shown' },
  },
  {
    title: '操作',
    width: 120,
    dataIndex: 'action',
  },
]

export default {
  name: 'List',
  components: {
    EditComponent,
    ComHeader,
  },
  props: {
    pageCode: {
      type: String,
      default: 'eqQrCodeConfig',
    },
  },
  data() {
    return {
      activeTab: 'reportBarcode',
      tabList: [
        { key: 'reportBarcode', tab: '室内检测' },
        { key: 'outdoorsReportBarcode', tab: '现场检测' },
      ],
      editVisible: false,
      loading: false,
      columns,
      row: {},
      tableData: [],
      downCodeRow: {},
      isEqQrCodeConfig: this.pageCode === 'eqQrCodeConfig',
      isAssetsQrCodeConfig: this.pageCode === 'assetsQrCodeConfig',
      isReportQrCodeConfig: this.pageCode === 'reportQrCodeConfig',
      isPersonQrCodeConfig: this.pageCode === 'personQrCodeConfig',
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
          },
          onMouseenter: (event) => {
            const ev = event || window.event
            ev.target.draggable = true
          },
          onDragstart: (event) => {
            const ev = event || window.event
            ev.stopPropagation()
            dragInfo.sourceId = record.id
            dragInfo.sourceSort = record.sort
          },
          onDragover: (event) => {
            const ev = event || window.event
            ev.preventDefault()
          },
          onDragenter: (event) => {
            const ev = event || window.event
            ev.preventDefault()

            dragInfo.targetId = record.id
            dragInfo.targetSort = record.sort

            // 设置拖动高亮效果
            const list = document.getElementsByClassName('ant-table-row')
            const node = document.getElementsByClassName('target')
            if (node.length) {
              node[0].classList.remove('target-top')
              node[0].classList.remove('target-bottom')
              node[0].classList.remove('target')
            }

            const index = this.tableData.findIndex(
              i => i.id === dragInfo.targetId,
            )
            if (index !== -1) {
              list[index].classList.add('target')
              if (dragInfo.targetSort <= dragInfo.sourceSort) {
                list[index].classList.add('target-top')
              }
              else {
                list[index].classList.add('target-bottom')
              }
            }
          },
          // 鼠标松开
          onDrop: (event) => {
            const ev = event || window.event
            ev.stopPropagation()

            dragInfo.targetId = record.id

            // 取消高亮效果
            const node = document.getElementsByClassName('target')
            if (node.length) {
              node[0].classList.remove('target-top')
              node[0].classList.remove('target-bottom')
              node[0].classList.remove('target')
            }

            this.dragSort()
          },
          style: {
            cursor: 'pointer',
          },
        }
      },
    }
  },
  computed: {
    title() { // 通用二维跳转
      if (this.isEqQrCodeConfig) {
        return '设备二维码设置'
      }

      if (this.isReportQrCodeConfig) {
        return '报告二维码设置'
      }

      if (this.isPersonQrCodeConfig) {
        return '人员二维码设置'
      }

      if (this.isAssetsQrCodeConfig) {
        return '固定资产二维码设置'
      }

      return ''
    },
    type() {
      if (this.isEqQrCodeConfig) {
        return 'equipmentBarcode'
      }

      if (this.isReportQrCodeConfig) {
        return 'reportBarcode'
      }

      if (this.isPersonQrCodeConfig) {
        return 'biddingPersonBarcode'
      }

      if (this.isAssetsQrCodeConfig) {
        return 'fixedAssetBarcode'
      }

      return ''
    },
  },
  created() {
    this.getList()
  },
  methods: {
    async dragSort() {
      if (dragInfo.sourceId === dragInfo.targetId) {
        return
      }
      const list = [...this.tableData]
      const targetIndex = list.findIndex(i => i.id === dragInfo.targetId)
      const sourceIndex = list.findIndex(i => i.id === dragInfo.sourceId)
      const sourceItem = list.splice(sourceIndex, 1)[0]

      this.loading = true

      window.$oAjax
        .post(
          `${window.$oApi.qrCodeConfig.sort}`,
          {
            ...sourceItem,
            sequence: targetIndex + 1,
          },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        .then((res) => {
          this.loading = false
          if (Number.parseInt(res.code) === 22000) {
            window.$oAntdMessage.success('操作成功！')
            this.getList()
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },
    onChangeStatus(row) {
      this.loading = true
      window.$oAjax
        .post(`${window.$oApi.qrCodeConfig.shown}`, row, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          this.loading = false
          if (Number.parseInt(res.code) === 22000) {
            window.$oAntdMessage.success('操作成功！')
          }
          else {
            row.shown = !row.shown
            window.$oAntdMessage.error(res.message)
          }

          // 全部关闭后重新获取列表
          if (this.tableData.every(item => item.shown === false)) {
            this.getList()
          }
        })
    },
    onEdit(row) {
      this.row = row
      this.editVisible = true
    },
    changeTestType() {
      this.getList()
    },
    getList() {
      this.loading = true
      let type = this.type
      if (this.isReportQrCodeConfig) {
        type = this.activeTab
      }
      window.$oAjax
        .get(`${window.$oApi.qrCodeConfig.list}`, {
          params: { type },
        })
        .then((res) => {
          this.loading = false
          if (Number.parseInt(res.code) === 20000) {
            this.tableData = res.data.sort((a, b) => a.sequence - b.sequence)
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
