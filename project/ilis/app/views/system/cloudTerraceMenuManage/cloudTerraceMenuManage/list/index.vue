<template>
  <div class="sampleScanRecord">
    <div style="">
      <a-button type="primary" @click="addMenu">
        新增
      </a-button>
    </div>

    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
      children-column-name="subFunctions"
      :scroll="{ x: 1200 }"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'type'">
          <div>
            <span v-if="record.functionUrl">平台应用</span>
            <span v-else>分类导航</span>
          </div>
        </template>
        <template v-if="['publicKey', 'privateKey', 'functionExplain'].includes(column.dataIndex)">
          <a-tooltip placement="left">
            <template #title>
              <p style="max-height: 50vh; overflow: auto">
                {{ text }}
              </p>
            </template>
            <p class="more-text">
              {{ text }}
            </p>
          </a-tooltip>
        </template>
        <template v-if="column.dataIndex === 'iconUrl'">
          <img v-if="record.iconUrl" style="height: 40px" :src="record.iconUrl" />
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a @click="() => editData(record)">编辑</a>
            <a @click="() => deleteData(record)">删除</a>
          </div>
        </template>
      </template>
    </a-table>
    <EditModal :id="editId" ref="editModalRef" :callback="getData" />
  </div>
</template>

<script>
import editModal from './components/editModal.vue'

const columns = [
  {
    title: '菜单名称',
    dataIndex: 'functionName',
    width: 240,
    fixed: 'left',
  },
  {
    title: '菜单类型',
    dataIndex: 'type',
    scopedSlots: { customRender: 'type' },
    width: 100,
  },
  {
    title: '看板地址',
    dataIndex: 'boardUrl',
    width: '10%',
  },
  {
    title: '菜单地址',
    dataIndex: 'functionUrl',
    width: '10%',
  },
  {
    title: '菜单顺序',
    dataIndex: 'functionOrder',
    width: 80,
  },
  {
    title: '公钥',
    dataIndex: 'publicKey',
  },
  {
    title: '私钥',
    dataIndex: 'privateKey',
  },
  {
    title: '图标',
    dataIndex: 'iconUrl',
    scopedSlots: { customRender: 'iconUrl' },
    width: 50,
  },
  {
    title: '说明',
    dataIndex: 'functionExplain',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
    width: 90,
    fixed: 'right',
  },
]

export default {
  components: {
    EditModal: editModal,
  },
  data() {
    return {
      editId: '',
      selectedRowKeys: [],
      data: [],

      columns,
      selectedRowKeys: [],
      selectedRows: [],
      loading: false,
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: this.onSelectChange,
        hideDefaultSelections: true,
        onSelection: this.onSelection,
      }
    },
  },
  created() {
    this.getData()
  },
  methods: {
    deleteData(row) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除?`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: async () => {
          const res = await window.$oAjax.post(
            `functionController.do?del&id=${row.id}`,
          )
          window.$oAntdMessage.info(res.msg)
          this.getData()
        },
      })
    },
    // async details(row) {
    //   this.loading = true
    //   let res = await window.$oAjax.get(`rest/object/external/${row.id}`);
    //   this.loading = false
    //   this.$refs.editModalRef.isDisabled = true;
    //   this.$refs.editModalRef.showModal(res.data)
    // },
    async editData(row) {
      // this.$refs.editModalRef.isDisabled = false;
      this.$refs.editModalRef.menusArr = JSON.parse(JSON.stringify(this.data))
      this.$refs.editModalRef.showModal(row)
    },

    addMenu() {
      this.$refs.editModalRef.isDisabled = false
      this.$refs.editModalRef.menusArr = JSON.parse(JSON.stringify(this.data))
      this.$refs.editModalRef.showModal()
    },

    onSelectChange(selectedRowKeys, row) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = row
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.loading = true
      window.$oAjax
        .post(
          `/rest/functionController/function/tree?functionType=10`,
        )
        .then((res) => {
          if (res && res.code === 20000) {
            this.$refs.editModalRef.nodeTopId = res.data[0].id // 设置顶级id
            this.arrayFormat(res.data)
            if (res.data.length && res.data[0].subFunctions) {
              this.data = res.data[0].subFunctions
            }
            this.loading = false
          }
        })
    },
    arrayFormat(arr) {
      arr.forEach((it) => {
        if (!it.subFunctions.length) {
          delete it.subFunctions
        }
        else {
          this.arrayFormat(it.subFunctions)
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
