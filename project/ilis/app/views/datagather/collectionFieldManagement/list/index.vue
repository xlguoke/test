<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="false">
      <a-row
        class="search-header"
        :gutter="15"
        type="flex"
        justify="start"
      >
        <a-col>
          <a-input
            v-model:value="query.name"
            style="width: 250px"
            placeholder="输入字段名称后即可查询"
          />
        </a-col>
        <a-col>
          <a-button @click="queryKey()">
            查询
          </a-button>
        </a-col>
      </a-row>
      <div style="margin: 8px 0px">
        <a-button type="primary" @click="openFieldEdit()">
          新增字段
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="tabledata"
        :pagination="pagination"
        :row-selection="rowSelection"
        :row-key="returnkey"
        @change="changePage"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'isShow'">
            <div>
              <a-tag v-if="text == 0" color="orange">
                隐藏
              </a-tag>
              <a-tag v-else color="green">
                显示
              </a-tag>
            </div>
          </template>
          <template v-if="column.dataIndex === 'systemFiled'">
            <div style="font-size: 14px">
              <span v-if="record.systemFiled === '1'">√</span>
              <span v-else>×</span>
            </div>
          </template>
          <template v-if="column.dataIndex === 'handleFun'">
            <div class="table-handle">
              <a href="javascript:;" @click="openFieldEdit(record)">编辑</a>
              <a-popconfirm
                title="确定要删除字段?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="delField(record)"
              >
                <a
                  v-if="record.systemFiled != '1'"
                  href="javascript:;"
                  type="link"
                >删除</a>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </a-spin>

    <ht-modal
      v-model:open="editFieldBox"
      width="350px"
      :mask-closable="false"
      title="字段配置"
      @ok="saveField"
    >
      <div class="input_row">
        <span class="lableName">字段名称：</span>
        <a-input
          v-model:value="addField.filedName"
          placeholder="请输入字段名称："
        ></a-input>
      </div>
      <div class="input_row">
        <span class="lableName">字段编码：</span>
        <a-input
          v-model:value="addField.filedCode"
          placeholder="请输入字段编码："
          :disabled="addField.systemFiled == '1'"
        ></a-input>
      </div>
      <div class="input_row">
        <span class="lableName">排序号：</span>
        <a-input
          v-model:value="addField.orderNum"
          placeholder="请输入排序号"
        ></a-input>
      </div>
      <div class="input_row">
        <span class="lableName">列表是否显示：</span>
        <a-switch v-model:checked="addField.isShow" />
      </div>
      <div class="input_row">
        <span class="lableName">字段类型：</span>
        <a-select v-model:value="addField.fieldType" style="width: 280px">
          <a-select-option
            v-for="(item, index) in fieldTypeList"
            :key="index"
            :value="item.value"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
    </ht-modal>
  </div>
</template>

<script>
const columns = [
  {
    title: '序号',
    dataIndex: 'orderNum',
    key: 'orderNum',
    width: '10%',
    align: 'center',
  },
  {
    title: '字段名称',
    dataIndex: 'filedName',
    key: 'filedName',
    width: '15%',
  },
  {
    title: '字段编码',
    dataIndex: 'filedCode',
    key: 'filedCode',
    width: '15%',
  },
  {
    title: '字段类型',
    dataIndex: 'fieldTypeStr',
    key: 'fieldTypeStr',
    width: '10%',
  },
  {
    title: '列表是否显示',
    dataIndex: 'isShow',
    key: 'isShow',
    width: '15%',
    align: 'center',
  },
  {
    title: '是否为系统字段',
    dataIndex: 'systemFiled',
    key: 'systemFiled',
    scopedSlots: { customRender: 'systemFiled' },
    width: '15%',
    align: 'center',
  },
  {
    title: '操作',
    dataIndex: 'handleFun',
    key: '',
    scopedSlots: { customRender: 'handleFun' },
    width: '15%',
  },
]
export default {
  name: 'List',
  components: {},
  data() {
    return {
      query: {
        name: '',
      },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      paginationExample: {
        current: 1,
        total: 0,
      },
      editFieldBox: false,
      selRow: [],
      selectedRowKeys: [],
      handleRow: {},
      exampleDetTabledata: [],
      addField: {
        filedCode: '',
        filedName: '',
        isShow: true,
        fieldType: 'string',
        orderNum: '',
      },
      fieldBoxState: '',
      columns,
      tabledata: [],
      fieldTypeList: [
        { name: '字符串', value: 'string' },
        { name: '对象', value: 'bean' },
        { name: '数组', value: 'list' },
        { name: '对象数组', value: 'beanList' },
        { name: '文件', value: 'file' },
      ],
    }
  },

  computed: {
    rowSelection() {
      return {
        columnWidth: '80px',
        selectedRowKeys: this.selectedRowKeys,
        getCheckboxProps: (record) => {
          return {
            props: {
              defaultChecked: record.edit,
            },
          }
        },
        onChange: (selRowKey, selRow) => {
          this.selRow = selRow
          this.selectedRowKeys = selRowKey
        },
      }
    },
    replaceFields() {
      return {
        children: 'children',
        title: 'typeName',
        key: 'id',
      }
    },
  },
  beforeCreate() {},
  mounted() {},
  created() {
    const fieldTypeObj = {}
    // eslint-disable-next-line array-callback-return
    this.fieldTypeList.map((item) => {
      fieldTypeObj[item.value] = item.name
    })
    this.fieldTypeObj = fieldTypeObj

    this.getFieldList()
  },
  methods: {
    returnkey(r, i) {
      return i
    },
    queryKey() {
      this.pagination.current = 1
      this.pagination.pageSize = 10
      this.getFieldList()
    },
    changePage(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.getFieldList()
    },
    // 获取列表数据
    getFieldList() {
      const load = window.$oAntdMessage.loading('Loading...')
      window.$oAjax
        .get(`/rest/dataGatherField/list`, {
          params: {
            quickQry: this.query.name,
            page: this.pagination.current,
            size: this.pagination.pageSize,
          },
        })
        .then((res) => {
          load()
          if (Number.parseInt(res.code) === 20000) {
            this.pagination.total = res.data.count
            this.tabledata = res.data.rows.map(item => ({
              ...item,
              fieldTypeStr: this.fieldTypeObj[item.fieldType] || '',
            }))
            setTimeout(() => {
              this.selRow = []
              this.selectedRowKeys = []
            }, 100)
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },

    openFieldEdit(row) {
      this.editFieldBox = true
      if (row) {
        this.addField = { ...row }

        this.addField.isShow == 1
          ? (this.addField.isShow = true)
          : (this.addField.isShow = false)
        this.fieldBoxState = 'edit'
      }
      else {
        this.emptyFieldForm()
        this.fieldBoxState = 'add'
      }
    },
    saveField() {
      if (!this.addField.filedCode) {
        window.$oAntdMessage.warning('字段编码不能为空')
        return
      }
      else if (!this.addField.filedName) {
        window.$oAntdMessage.warning('字段名称不能为空')
        return
      }
      else if (this.addField.orderNum === '') {
        window.$oAntdMessage.warning('排序号不能为空')
        return
      }
      if (this.fieldBoxState == 'add') {
        this.addFieldFun()
      }
      else {
        this.editField()
      }
    },
    delField(row) {
      window.$oAjax({
        method: 'DELETE',
        url: `/rest/dataGatherField/${row.id}`,
      }).then((res) => {
        if (res.code == '20000') {
          this.getFieldList()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    editField() {
      const param = { ...this.addField }

      param.isShow ? (param.isShow = 1) : (param.isShow = 0)
      window.$oAjax({
        method: 'put',
        url: `/rest/dataGatherField`,
        data: param,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getFieldList()
          this.editFieldBox = false
          this.emptyFieldForm()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    addFieldFun() {
      const param = { ...this.addField }

      param.isShow ? (param.isShow = 1) : (param.isShow = 0)
      window.$oAjax({
        method: 'post',
        url: `/rest/dataGatherField`,
        data: param,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getFieldList()
          this.editFieldBox = false
          this.emptyFieldForm()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    emptyFieldForm() {
      this.addField = {
        filedCode: '',
        filedName: '',
        isShow: true,
        fieldType: 'string',
        orderNum: '',
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>

<style>
.ant-table-pagination.ant-pagination {
  text-align: right;
}

.input_row {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.input_row .lableName {
  text-align: right;
  white-space: nowrap;
}

.input_row input {
  width: 280px;
}
</style>
