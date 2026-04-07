<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="false">
      <a-layout class="hitek-height-full">
        <a-layout>
          <a-layout-sider
            width="260"
            :style="{
              overflow: 'auto',
              padding: '10px',
              height: '100vh',
              position: 'fixed',
              left: 0,
              background: '#fff',
            }"
          >
            <a-tree
              v-if="treeData.length > 0"
              :show-line="true"
              show-icon
              draggable
              default-expand-all
              :default-selected-keys="defaultSel"
              :replace-fields="replaceFields"
              :tree-data="treeData"
              @select="selTree"
            >
              <template #selIcon>
                <FolderOpenOutlined />
              </template>
            </a-tree>
          </a-layout-sider>

          <a-layout style="margin-left: 260px; padding: 0px 10px">
            <a-layout-content
              :style="{
                background: '#fff',
                padding: '10px',
                margin: 0,
                minHeight: '280px',
                overflow: 'initial',
              }"
            >
              <div class="mb-2">
                <a-space>
                  <a-input
                    v-model:value="query.name"
                    style="width: 250px"
                    placeholder="输入模板名称后回车即可查询"
                    @keypress.enter="getTemplateList()"
                  />
                  <a-select
                    v-model:value="query.selState"
                    style="width: 250px"
                  >
                    <a-select-option value="">
                      全部
                    </a-select-option>
                    <a-select-option value="1">
                      已删除
                    </a-select-option>
                    <a-select-option value="0">
                      可使用
                    </a-select-option>
                  </a-select>
                  <a-button @click="getTemplateList()">
                    查询
                  </a-button>
                </a-space>
              </div>
              <a-table
                :columns="columns"
                :data-source="tabledata"
                :pagination="pagination"
                :row-selection="rowSelection"
                :row-key="returnkey"
                @change="changePage"
              >
                <template #bodyCell="{ column, text }">
                  <template v-if="column.dataIndex === 'deleted'">
                    <div>
                      <a-tag v-if="text === 1" color="orange">
                        删除
                      </a-tag>
                      <a-tag v-else color="green">
                        正常
                      </a-tag>
                    </div>
                  </template>
                </template>
              </a-table>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>
  </div>
</template>

<script>
import { FolderOpenOutlined } from '@ant-design/icons-vue'
import { getQueryVariable } from '~/providers/common/utils'

// 把时间戳格式化为：yyyy-MM-dd HH:mm:ss,yyyy-MM-dd
function formatDateCommon(v, format) {
  if (!v) {
    return ''
  }
  const dateV = new Date(v)
  const year = dateV.getFullYear()
  let month = dateV.getMonth() + 1
  month = month < 10 ? `0${month}` : month
  let date = dateV.getDate()
  date = date < 10 ? `0${date}` : date
  let hour = dateV.getHours()
  hour = hour < 10 ? `0${hour}` : hour
  let minute = dateV.getMinutes()
  minute = minute < 10 ? `0${minute}` : minute
  let second = dateV.getSeconds()
  second = second < 10 ? `0${second}` : second
  const str1 = `${year}-${month}-${date}`
  const str2 = `${hour}:${minute}:${second}`
  let str
  if (format === 'yyyy-MM-dd') {
    str = str1
  }
  else {
    str = `${str1} ${str2}`
  }
  return str
}

const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width: 60,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '模板编码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '模板说明',
    dataIndex: 'groupName',
    key: 'groupName',
  },
  {
    title: '状态',
    dataIndex: 'deleted',
    key: 'deleted',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedDate',
    key: 'updatedDate',
    customRender: ({ text }) => {
      return formatDateCommon(text, 'yyyy-MM-dd HH:mm:ss')
    },
  },
]

export default {
  name: 'List',
  components: {
    FolderOpenOutlined,
  },
  data() {
    return {
      defaultSel: [],
      selTreeId: [],
      treeData: [],
      query: {
        name: '',
        selState: '',
        page: 1,
        rows: 10,
      },
      pagination: {
        total: 0,
        pageSize: 10, // 每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      selRow: [],
      selectedRowKeys: [],
      columns,
      tabledata: [],
      paramId: '',
    }
  },

  computed: {
    rowSelection() {
      return {
        columnWidth: '80px',
        type: 'checkbox',
        selectedRowKeys: this.selectedRowKeys,
        getCheckboxProps: (record) => {
          return {
            props: {
              // eslint-disable-next-line eqeqeq
              defaultChecked: record.flag == 1,
            },
          }
        },
        onChange: (selRowKey, selRow) => {
          const n = selRowKey.length - 1
          if (selRowKey[n] === this.selectedRowKeys[0]) {
            this.selRow = []
            this.selectedRowKeys = []
          }
          else {
            this.selRow = [selRow[n]]
            this.selectedRowKeys = [selRowKey[n]]
          }
        },
      }
    },
    replaceFields() {
      return {
        children: 'children',
        title: 'name',
        key: 'id',
      }
    },
  },
  beforeCreate() {},
  mounted() {
    window.getSelectedRow = this.getSelectedRow
  },
  created() {
    this.paramId = getQueryVariable('paramIds')
    this.getTree().then((res) => {
      if (res) {
        this.getTemplateList()
      }
    })
  },
  methods: {
    getSelectedRow() {
      return this.selRow
    },
    returnkey(r) {
      return r.id
    },

    changePage(v) {
      this.query.page = v.current
      this.query.rows = v.pageSize
      this.getTemplateList()
    },
    selTree(sel) {
      this.selTreeId = sel
      this.getTemplateList()
    },
    // 左侧获取树
    getTree() {
      return new Promise((resolve, reject) => {
        window.$oAjax
          .get(
            `/rest/templateParamRelation/paramFileGroupTree?paramsId=${this.paramId}`,
          )
          .then((res) => {
            if (Number.parseInt(res.code) === 20000) {
              // 设置树默认选中
              const fu = (arr) => {
                arr.forEach((item) => {
                  // eslint-disable-next-line eqeqeq
                  if (item.isSelected == 1) {
                    this.selTreeId = [item.id]
                    this.defaultSel = [item.id]
                  }
                  if (item.children || item.children.length > 0) {
                    fu(item.children)
                  }
                })
              }
              fu(res.data)
              this.treeData = res.data
              resolve(true)
            }
            else {
              window.$oAntdMessage.error(res.message)
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
            }
          })
      })
    },
    // 获取列表数据
    getTemplateList() {
      const load = window.$oAntdMessage.loading('Loading...')
      window.$oAjax
        .get(`/rest/templateParamRelation/paramFileList`, {
          params: {
            paramsIdStr: this.paramId,
            groupId: this.selTreeId[0],
            name: this.query.name,
            deleted: this.query.selState,
            page: this.query.page,
            rows: this.query.rows,
          },
        })
        .then((res) => {
          load()
          if (Number.parseInt(res.code) === 20000) {
            this.pagination.total = res.data.total
            this.selRow = []
            this.selectedRowKeys = []

            for (const i in res.data.rows) {
              // eslint-disable-next-line eqeqeq
              if (res.data.rows[i].flag == 1) {
                this.selRow = [res.data.rows[i]]
              }
            }
            this.tabledata = res.data.rows
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
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
</style>
