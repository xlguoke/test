<template>
  <div class="task-status-marker-wrap">
    <a-spin :spinning="loading">
      <a-tabs default-active-key="MANAGE_ASSIGN_PAGE" @change="chagneTabs">
        <a-tab-pane key="MANAGE_ASSIGN_PAGE" tab="委托收样"></a-tab-pane>
        <a-tab-pane key="MANAGE_TEST_PAGE" tab="试验检测"></a-tab-pane>
        <a-tab-pane key="MANAGE_REPORT_PAGE" tab="报告管理"></a-tab-pane>
      </a-tabs>
      <div class="mb-2">
        <a-button
          type="primary"
          @click="showEditModal('', true)"
        >
          新增
        </a-button>
      </div>
      <a-table
        :scroll="scroll"
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        bordered
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'markColor'">
            <span class="marker-style" :style="`background-color:${text}`">{{
              record.text
            }}</span>
          </template>

          <template v-if="column.dataIndex === 'handle'">
            <a-space>
              <a-button
                type="link"
                title="查看"
                primary
                @click="showEditModal(record.id, false)"
              >
                查看
              </a-button>
              <a-button
                type="link"
                title="编辑"
                primary
                @click="showEditModal(record.id, true)"
              >
                编辑
              </a-button>
              <a-button
                type="link"
                title="删除"
                danger
                @click="deleteById(record.id)"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>

    <Detail ref="detail" :tab-index="tabIndex" @update-list="getDataSource" />
  </div>
</template>

<script>
import { rootUrl } from '~/providers/configs/rootUrl'
import Detail from './components/Detail.vue'

export default {
  components: {
    Detail,
  },
  data() {
    return {
      tabIndex: 'MANAGE_ASSIGN_PAGE',
      visibleDetail: false,
      spinning: false,
      refresh: '',
      markRangeObj: {
        CONSIGN: '委托管理',
        ASSIGN: '任务分配',
        TASK: '试验任务',
        REVIEW: '试验复核',
        EDIT: '编制报告',
        AUDIT: '报告审核',
        APPROVE: '报告批准',
        PRINT: '报告打印',
        GRANT: '报告发放',
      },
      columns: [
        {
          title: '排序号',
          dataIndex: 'orderNum',
          key: 'orderNum',
          width: 60,
        },
        { title: '标记类型', dataIndex: 'textType', key: 'textType' },
        { title: '标记说明', dataIndex: 'explainText', key: 'explainText' },
        { title: '缩写标识', dataIndex: 'text', key: 'text' },
        {
          title: '标记样式',
          dataIndex: 'markColor',
          key: 'markColor',
          scopedSlots: { customRender: 'markColor' },
        },
        {
          title: '是否启用',
          dataIndex: 'isEnable',
          key: 'isEnable',
          width: 80,
          customRender: ({ text }) => {
            // eslint-disable-next-line eqeqeq
            return text == 1 ? '是' : '否'
          },
        },
        {
          title: '标记范围',
          dataIndex: 'markRange',
          key: 'markRange',
          customRender: ({ text }) => {
            const arr = text.split(',')
            const str = []
            for (let i = 0; i < arr.length; i++) {
              str.push(`${this.markRangeObj[arr[i]]}`)
            }
            return str.join('、')
          },
        },
        {
          title: '操作',
          dataIndex: 'handle',
          key: 'handle',
          width: 150,
          scopedSlots: { customRender: 'handle' },
        },
      ],
      scroll: { y: document.body.clientHeight - 220 },
      rootUrl,
      editId: '',
      loading: true,

      query: {},
      dataSource: [],
      page: 1,
      size: 10,
    }
  },
  created() {
    this.getDataSource()
  },
  methods: {
    chagneTabs(e) {
      this.tabIndex = e
      this.getDataSource()
    },
    // 查询列表数据
    getDataSource() {
      this.loading = true
      window.$oAjax
        .get(`${window.$oApi.statusMarker.list}&managePage=${this.tabIndex}`)
        .then((res) => {
          const list = res.obj || []

          list.length > 0
          && list.forEach((d) => {
            d.key = d.id
          })
          this.dataSource = list.sort((d, n) => d.orderNum - n.orderNum)
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 新增、详情、编辑
    showEditModal(rowId, isEdit) {
      this.$refs.detail.showModal(rowId, isEdit)
    },
    // 删除
    deleteById(id) {
      window.$oAntdConfirm({
        title: '是否删除已创建状态标记类型？',
        content:
          '点击确定按钮时，将删除当前创建的状态标记类型且任务列表中不再显示该标记。',
        onOk: () => {
          const url = `${window.$oApi.statusMarker.delete}?id=${id}`
          window.$oAjax.delete(url).then(() => {
            window.$oAntdMessage.success('删除成功!')
            this.getDataSource()
          })
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
