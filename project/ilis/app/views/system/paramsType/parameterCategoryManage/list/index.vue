<template>
  <div class="sampleScanRecord">
    <div style="">
      <a-button type="primary" @click="addExternalSample">
        新增
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a v-show="record.isEdit" @click="() => saveData(record)">保存</a>
            <a v-show="record.isEdit" @click="cancelEdit(record, index)">取消</a>
            <a v-show="!record.isEdit" @click="() => editData(record)">编辑</a>
            <a
              v-show="record.id"
              style="color: red"
              @click="() => deleteData(record)"
            >删除</a>
          </div>
        </template>

        <template v-if="column.dataIndex === 'name'">
          <div>
            <a-input
              v-if="record.isEdit"
              v-model:value="record.name"
              placeholder="请输入"
            ></a-input>
            <span v-else>{{ record.name }}</span>
          </div>
        </template>

        <template v-if="column.dataIndex === 'instructions'">
          <div>
            <a-input
              v-if="record.isEdit"
              v-model:value="record.instructions"
              placeholder="请输入"
            ></a-input>
            <span v-else>{{ record.instructions }}</span>
          </div>
        </template>

        <template v-if="column.dataIndex === 'remark'">
          <div>
            <a-input
              v-if="record.isEdit"
              v-model:value="record.remark"
              placeholder="请输入"
            ></a-input>
            <span v-else>{{ record.remark }}</span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
const columns = [
  {
    title: '参数类别名称',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '类别说明',
    dataIndex: 'instructions',
    scopedSlots: { customRender: 'instructions' },
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    scopedSlots: { customRender: 'remark' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  data() {
    return {
      editId: '',
      selectedRowKeys: [],
      data: [],
      dataPoxy: [],
      query: {
        q: '',
      },
      sortParams: null,
      columns,
      loading: false,
    }
  },
  computed: {},
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
          const res = await window.$oAjax.delete(
            `rest/testParamCategory/${row.id}`,
          )
          if (res.code === 20000) {
            window.$oAntdMessage.success('删除成功！')
            this.getData()
          }
          else {
            window.$oAntdMessage.warning(res.message || res.msg)
          }
        },
      })
    },

    async editData(row) {
      const chack = this.data.some((it) => {
        return it.isEdit
      })

      if (chack) {
        window.$oAntdMessage.warning('存在正在编辑中的数据，请进行保存后在编辑')
        return
      }

      window.$oAntdConfirm({
        title: '提示',
        content: `若参数类别已被使用，修改参数类别名称后已使用的参数类别名称会统一修改，是否继续?`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: async () => {
          row.isEdit = true
        },
      })

      // this.loading = true
      // let res = await window.$oAjax.get(`rest/object/external/${row.id}`);
      // this.loading = false
    },
    cancelEdit(row, index) {
      if (row.id) {
        row.isEdit = false
        row.name = this.dataPoxy[index].name
        row.remark = this.dataPoxy[index].remark
        row.instructions = this.dataPoxy[index].instructions
      }
      else {
        this.data.splice(index, 1)
      }
    },
    async saveData(row) {
      const p = { ...row }
      if (!p.name) {
        window.$oAntdMessage.warning('请输入参数类别名称', 1000)
        return
      }
      row.isEdit = false
      delete p.isEdit
      window.$oAjax({
        method: 'POST',
        url: `/rest/testParamCategory/saveOrUpdate`,
        data: row,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功！')
          this.getData()
        }
      })
    },
    addExternalSample() {
      const add = this.data.some((it) => {
        return !it.id
      })
      if (add) {
        return
      }
      this.data.push({
        name: '',
        instructions: '',
        remark: '',
        isEdit: true,
      })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    getData() {
      this.loading = true

      const params = {
        ...this.query,
        ...this.sortParams,
      }

      window.$oAjax
        .get(`/rest/testParamCategory/all`, { params })
        .then((res) => {
          if (res && res.code === 20000) {
            res.data.forEach((it) => {
              it.isEdit = false
            })
            this.data = res.data
            this.dataPoxy = JSON.parse(JSON.stringify(this.data))
            // this.pagination.total = res.data.count;
            // this.pagination.current = page;
            // this.pagination.pageSize = size;
            this.loading = false
          }
        })
    },
    returnSel() {
      return this.selectedRows
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
