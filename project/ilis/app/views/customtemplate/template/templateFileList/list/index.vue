<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="false">
      <a-layout class="hitek-height-full" :style="{ background: 'var(--colorBgContainer)' }">
        <a-layout style="background-color: var(--colorBgContainer);">
          <a-layout-sider
            width="260"
            :style="{
              overflow: 'auto',
              padding: '10px',
              height: '100vh',
              position: 'fixed',
              left: 0,
              background: 'var(--colorBgContainer)',
            }"
          >
            <div>
              <a-button type="primary" @click="openAddtBox">
                新增
              </a-button>
              <!-- <a-button type="primary toolBtn-bar">新增下级</a-button> -->
              <a-button class="toolBtn-bar" @click="openEditBox">
                编辑
              </a-button>
              <a-popconfirm
                title="删除此节点，节点下所有模板文件会删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delTree"
              >
                <a-button class="toolBtn-bar">
                  删除
                </a-button>
              </a-popconfirm>
            </div>

            <a-tree
              default-expand-all
              :show-line="true"
              show-icon
              draggable
              :replace-fields="replaceFields"
              :tree-data="treeData"
              @select="selTree"
              @drop="onDrop"
            >
              <template #selIcon>
                <FolderOpenOutlined />
              </template>
            </a-tree>
          </a-layout-sider>

          <a-layout style="margin-left: 260px; padding: 0px 10px" :style="{ background: 'var(--colorBgContainer)' }">
            <a-layout-content
              :style="{
                background: 'var(--colorBgContainer)',
                padding: '10px',
                margin: 0,
                minHeight: '280px',
                overflow: 'initial',
              }"
            >
              <a-space>
                <a-input
                  v-model:value="query.name"
                  style="width: 250px"
                  placeholder="输入模板名称后回车即可查询"
                  @press-enter="getTemplateList"
                />
                <a-select
                  v-model:value="query.selState"
                  style="width: 250px"
                >
                  <a-select-option value="">
                    全部
                  </a-select-option>
                  <a-select-option value="0">
                    可使用
                  </a-select-option>
                  <a-select-option value="1">
                    已删除
                  </a-select-option>
                </a-select>
                <a-button @click="getTemplateList()">
                  查询
                </a-button>
              </a-space>
              <div style="margin: 8px 0px">
                <a-button type="primary" @click="openUploadBox">
                  + 批量上传
                </a-button>
                <a-button class="toolBtn-bar" @click="editBatch">
                  批量编辑
                </a-button>
                <a-button type="primary toolBtn-bar" @click="saveBatch">
                  + 批量保存
                </a-button>

                <a-popconfirm
                  title="确定删除选择模板文件?"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="delBatch"
                >
                  <a-button class="toolBtn-bar">
                    批量删除
                  </a-button>
                </a-popconfirm>

                <!-- <a-button type="primary toolBtn-bar">批量下载</a-button> -->
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
                  <template v-if="column.dataIndex === 'name'">
                    <a-input
                      v-if="record.edit"
                      v-model:value="record.name"
                      placeholder="请输入模板名称"
                    />
                    <span v-else> {{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'code'">
                    <a-input
                      v-if="record.edit"
                      v-model:value="record.code"
                      placeholder="请输入编码"
                    />
                    <span v-else> {{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'instruction'">
                    <a-input
                      v-if="record.edit"
                      v-model:value="record.instruction"
                      placeholder="请输入填写说明"
                    />
                    <span v-else> {{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'deleted'">
                    <div>
                      <a-tag v-if="text == 1" color="orange">
                        删除
                      </a-tag>
                      <a-tag v-else color="green">
                        正常
                      </a-tag>
                    </div>
                  </template>

                  <template v-if="column.dataIndex === 'Action' && record.id">
                    <!-- <a-button type="link">编辑</a-button> -->
                    <a-button type="link" @click="downloadTemplateFile(record)">
                      模板文件下载
                    </a-button>
                    <a-button type="link" @click="openReplaceUploadBox(record)">
                      替换
                    </a-button>
                    <a-button type="link" @click="openHistoricalBox(record)">
                      历史版本
                    </a-button>
                    <a-button type="link" @click="openReferencesBox(record)">
                      模板引用情况
                    </a-button>
                    <a-button type="link" @click="openExampleBox(record)">
                      报告实列
                    </a-button>
                  </template>
                </template>
              </a-table>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>

    <ht-modal
      v-model:open="editboxvb"
      width="250px"
      :mask-closable="false"
      title="模板编辑"
      @cancel="editTreeRowVal = ''"
      @ok="saveTree"
    >
      <div>
        <a-input
          ref="edit_input"
          v-model:value="editTreeRowVal"
          placeholder="请输入名称"
        ></a-input>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="uploadBoxVb"
      :mask-closable="false"
      width="550px"
      title="模板文件上传"
      :confirm-loading="uploading"
      :ok-text="uploading ? '上传中' : '确定上传并生成模板'"
      @ok="uploadOk"
    >
      <div>
        <a-upload
          :multiple="true"
          :remove="handleRemove"
          :file-list="fileList"
          :before-upload="beforeUpload"
          @cancel="fileList = []"
        >
          <a-button>选择文件</a-button>
        </a-upload>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="replaceUploadVb"
      :mask-closable="false"
      width="450px"
      title="替换文件"
      @ok="replaceOk"
      @cancel="replaceFile = []"
    >
      <div>
        <a-upload
          name="file"
          :action="uploadUrl"
          :file-list="replaceFile"
          @change="handleChange"
        >
          <a-button>点击上传替换文件</a-button>
        </a-upload>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="historicalVersionVb"
      :mask-closable="false"
      width="50%"
      title="历史版本"
      @ok="historicalVersionVb"
    >
      <div>
        <a-table
          :columns="historicalColumns"
          :data-source="historicaltabledata"
          :pagination="false"
          :row-key="returnkey"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'Action'">
              <a-button type="link" :href="record.attachment">
                下载文件
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="referencesVb"
      :mask-closable="false"
      width="50%"
      title="模板引用情况"
      @ok="referencesVb = false"
    >
      <div>
        <a-table
          :columns="referencesColumns"
          :data-source="referencesTabledata"
          :pagination="false"
          :row-key="returnkey"
        >
        </a-table>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="exampleDetVb"
      :mask-closable="false"
      width="50%"
      title="报告实例"
      @ok="exampleDetVb = false"
    >
      <div>
        <a-table
          :columns="exampleDetColumns"
          :data-source="exampleDetTabledata"
          :pagination="paginationExample"
          :row-key="returnkey"
          @change="changePageExample"
        >
        </a-table>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { FolderOpenOutlined } from '@ant-design/icons-vue'
import { Downloader } from '~/providers/common/downloader'
import { rootUrl } from '~/providers/configs/rootUrl'

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
  if (format == 'yyyy-MM-dd') {
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
    dataIndex: 'instruction',
    key: 'instruction',
  },
  {
    title: '状态',
    dataIndex: 'deleted',
    key: 'deleted',
    width: 85,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedDate',
    key: 'updatedDate',
    width: 160,
    customRender: ({ text }) => {
      return formatDateCommon(text, 'yyyy-MM-dd HH:mm:ss')
    },
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: 450,
    scopedSlots: { customRender: 'handleFun' },
  },
]
const historicalColumns = [
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
    title: '编辑人',
    dataIndex: 'creator',
    key: 'creator',
  },
  {
    title: '上传时间',
    dataIndex: 'createdDate',
    key: 'createdDate',
    customRender: ({ text: v }) => {
      return formatDateCommon(v, 'yyyy-MM-dd HH:mm:ss')
    },
  },
  {
    title: '操作',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'handleFun' },
  },
]

const referencesColumns = [
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
    title: '大类',
    dataIndex: 'bigName',
    key: 'bigName',
  },
  {
    title: '参数',
    dataIndex: 'paramName',
    key: 'paramName',
  },
  {
    title: '关联人',
    dataIndex: 'creatorName',
    key: 'creatorName',
  },
  {
    title: '关联时间',
    dataIndex: 'createdDate',
    key: 'createdDate',
    customRender: ({ text: v }) => {
      return formatDateCommon(v, 'yyyy-MM-dd HH:mm:ss')
    },
  },
]
const exampleDetColumns = [
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
    title: '报告编号',
    dataIndex: 'reportNumber',
    key: 'reportNumber',
  },
  {
    title: '报告状态',
    dataIndex: 'reportStatus',
    key: 'reportStatus',
    customRender: ({ text: v }) => {
      switch (v) {
        case '0':
          return '重打申请成功'
        case '1':
          return '重打申请审核成功'
        case '2':
          return '重打申请批准成功'
        case '3':
          return '修改申请成功'
        case '4':
          return '修改申请审核成功'
        case '5':
          return '修改申请批准成功'
        case '8':
          return '已创建'
        case '9':
          return '已提交'
        case '10':
          return '未审批'
        case '15':
          return '复核通过'
        case '20':
          return '审核通过'
        case '30':
          return '批准通过'
      }
    },
  },
  {
    title: '生成时间',
    dataIndex: 'createdDate',
    key: 'createdDate',
    customRender: ({ text }) => {
      return formatDateCommon(text, 'yyyy-MM-dd HH:mm:ss')
    },
  },
  // {
  //   title: "操作",
  //   scopedSlots: { customRender: "handleFun" },
  // }
]
export default {
  name: 'List',
  components: {
    FolderOpenOutlined,
  },
  data() {
    return {
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      selTreeId: [],
      uploading: false,
      fileList: [],
      treeData: [],
      query: {
        name: '',
        selState: '',
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
      editboxvb: false,
      historicalVersionVb: false,
      uploadBoxVb: false,
      referencesVb: false,
      replaceUploadVb: false,
      exampleDetVb: false,
      selRow: [],
      selectedRowKeys: [],
      replaceFile: [],
      handleRow: {},
      historicalColumns,
      historicaltabledata: [],
      referencesColumns,
      referencesTabledata: [],
      exampleDetColumns,
      exampleDetTabledata: [],
      editTreeRowVal: '',
      treeBoxState: '',
      columns,
      tabledata: [],
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
        title: 'name',
        key: 'id',
      }
    },
  },
  beforeCreate() {},
  mounted() {},
  created() {
    this.getTree()
    this.getTemplateList()
  },
  methods: {
    returnkey(r, i) {
      return i
    },
    downloadTemplateFile(row) {
      const downloader = new Downloader()
      downloader.excute(row.attachment, row.name)
    },
    openReplaceUploadBox(row) {
      this.replaceUploadVb = true
      this.handleRow = row
    },
    openHistoricalBox(row) {
      this.historicalVersionVb = true
      window.$oAjax({
        method: 'get',
        url: `/rest/template-file/history/${row.id}`,
      }).then((res) => {
        if (res.code == '20000') {
          this.historicaltabledata = res.data
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    openExampleBox(row) {
      this.exampleDetVb = true
      this.handleRow = row
      this.paginationExample.current = 1
      this.getTemplateFile()
    },
    getTemplateFile() {
      window.$oAjax({
        method: 'get',
        url:
          `/rest/template-file/instance/${this.handleRow.id}?page=${
            this.paginationExample.current
          }&rows=10`,
      }).then((res) => {
        if (res.code == '20000') {
          this.paginationExample.total = res.data.total
          this.exampleDetTabledata = res.data.rows
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    openReferencesBox(row) {
      this.referencesVb = true
      window.$oAjax({
        method: 'get',
        url: `/rest/template-file/quote/${row.id}`,
      }).then((res) => {
        if (res.code == '20000') {
          this.referencesTabledata = res.data
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    replaceOk() {
      if (!this.replaceFile[0]) {
        window.$oAntdMessage.warn(`请先上传文件再替换`)
        return
      }
      window.$oAjax({
        method: 'PUT',
        url: `/rest/template-file/replace`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: {
          attachment: this.replaceFile[0].response.obj[0].realpath,
          id: this.handleRow.id,
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.replaceUploadVb = false
          window.$oAntdMessage.success(`替换成功`)
          this.getTemplateList()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    handleChange(info) {
      this.replaceFile = [info.file]
    },
    changePage(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
      this.getTemplateList()
    },
    changePageExample(v) {
      this.paginationExample.current = v.current
      this.getTemplateFile()
    },
    selTree(sel) {
      this.selTreeId = sel
      this.pagination.current = 1
      this.getTemplateList()
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file]
      this.testUploadFile()
      return false
    },
    openAddtBox() {
      this.editboxvb = true
      this.treeBoxState = 'add'
      window.$oNextTick(() => {
        this.$refs.edit_input.focus()
      })
    },
    openEditBox() {
      if (!this.selTreeId[0]) {
        window.$oAntdMessage.warning('请选择一个节点进行编辑')
        return
      }

      this.treeBoxState = 'edit'
      this.editboxvb = true

      window.$oNextTick(() => {
        this.$refs.edit_input.focus()
      })
    },
    // 左侧获取树
    getTree() {
      window.$oAjax.get(`/rest/template-group/tree`).then((res) => {
        if (Number.parseInt(res.code) === 20000) {
          this.treeData = res.data
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    openUploadBox() {
      if (this.selTreeId.length > 0) {
        this.uploadBoxVb = true
        this.fileList = []
      }
      else {
        window.$oAntdMessage.warning('新添加文件模板需要指定左侧节点')
      }
      // let isEdit=false
      //   this.tabledata.forEach(item=>{
      //     if(item.edit){
      //       isEdit=true
      //     }
      // })
      // if(isEdit){
      //       window.$oAntdMessage.warning("您还有正在编辑的文件没保存！");
      // }else{
      //   this.uploadBoxVb=true;
      // }
    },
    // 获取列表数据
    getTemplateList() {
      const load = window.$oAntdMessage.loading('加载中...')
      window.$oAjax
        .get(`/rest/template-file/list`, {
          params: {
            groupId: this.selTreeId[0],
            name: this.query.name,
            deleted: this.query.selState,
            page: this.pagination.current,
            rows: this.pagination.pageSize,
          },
        })
        .then((res) => {
          load()
          if (Number.parseInt(res.code) === 20000) {
            for (const i in res.data.rows) {
              res.data.rows[i].deleted = `${res.data.rows[i].deleted}`
            }
            this.pagination.total = res.data.total
            this.tabledata = res.data.rows
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
    // 批量删除
    delBatch() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请至少选择一条数据！')
        return
      }
      let ids = ''
      this.selRow.forEach((item, index) => {
        if (index < this.selRow.length - 1) {
          ids += `${item.id},`
        }
        else {
          ids += item.id
        }
      })
      window.$oAjax({
        method: 'DELETE',
        url: `/rest/template-file/delete/?ids=${ids}`,
      }).then((res) => {
        if (res.code == '20000') {
          window.$oAntdMessage.success(`删除成功`)
          this.getTemplateList()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    // 批量保存
    saveBatch() {
      const addData = []
      const editData = []
      let isSave = false
      this.tabledata.forEach((item) => {
        if (!item.code || !item.name) {
          isSave = true
        }
      })
      if (isSave) {
        window.$oAntdMessage.warning('模板名称和模板编码为必填项，请填写完整')
        return
      }
      this.tabledata.forEach((item) => {
        if (item.edit) {
          if (item.id) {
            editData.push(item)
          }
          else {
            addData.push(item)
          }
        }
      })
      if (addData.length == 0 && editData.length == 0) {
        window.$oAntdMessage.warning('请至少选择一行进行编辑！')
        return
      }
      Promise.all([
        this.editTemplate(editData),
        this.addTemplate(addData),
      ]).then(() => {
        this.getTemplateList()
      })
    },
    addTemplate(dataArr) {
      dataArr.forEach((item) => {
        item.groupId = this.selTreeId[0]
      })
      return new Promise((resolve, reject) => {
        if (dataArr.length == 0) {
          resolve(true)
          return
        }
        window.$oAjax({
          method: 'POST',
          url: `/rest/template-file/save`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: dataArr,
        }).then((res) => {
          if (res.code == '20000') {
            resolve(true)
            window.$oAntdMessage.success(`${dataArr.length}条模板文件新增成功！`)
          }
          else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(false)
            window.$oAntdMessage.error(res.message)
          }
        })
      })
    },
    editTemplate(dataArr) {
      return new Promise((resolve, reject) => {
        if (dataArr.length == 0) {
          resolve(true)
          return
        }
        window.$oAjax({
          method: 'PUT',
          url: `/rest/template-file/update`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: dataArr,
        }).then((res) => {
          if (res.code == '20000') {
            resolve(true)
            window.$oAntdMessage.success(`${dataArr.length}条模板文件更新成功！`)
          }
          else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(false)
            window.$oAntdMessage.error(res.message)
          }
        })
      })
    },
    // 批量编辑
    editBatch() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请至少选择一条数据！')
        return
      }
      this.selRow.forEach((selItem) => {
        this.tabledata.forEach((tableItem, i) => {
          if (selItem.id == tableItem.id) {
            this.tabledata[i].edit = true
          }
        })
      })
    },
    // 拖动树
    onDrop(info) {
      const dropKey = info.node.eventKey // 目标节点的id
      const dragKey = info.dragNode.eventKey // 拖拽节点的id
      const name = info.dragNode.title
      window.$oAjax({
        method: 'PUT',
        url: `/rest/template-group/update`,
        data: {
          id: dragKey,
          name,
          parentId: dropKey,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    // 删除文件
    handleRemove(file) {
      const uid = file.uid
      const { fileList } = this
      for (const i in fileList) {
        if (uid == fileList[i].uid) {
          this.fileList.splice(i, 1)
        }
      }
    },
    // 文件手动上传
    uploadOk() {
      const { fileList } = this
      if (fileList.length == 0) {
        window.$oAntdMessage.warning('您还没有添加文件！')
        return
      }
      let isErr = false
      fileList.forEach((file) => {
        if (file.status && file.status == 'error') {
          isErr = true
        }
      })
      if (isErr) {
        window.$oAntdMessage.warning(
          '您选择的文件包含有已生成的模板文件，请先删除在生成模板',
        )
        return
      }
      const formData = new FormData()
      fileList.forEach((file) => {
        formData.append('file', file)
      })
      this.uploading = true
      window.$oAjax({
        method: 'post',
        url: `/uploadController.do?upload`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((res) => {
        if (res.success) {
          window.$oAntdMessage.success('操作成功')
          this.fileList = []
          this.uploadBoxVb = false
          this.uploading = false
          for (const i in res.obj) {
            this.tabledata.unshift({
              attachment: res.obj[i].realpath,
              name: res.obj[i].attachmenttitle,
              code: '',
              instruction: '',
              deleted: '0',
              updateDate: '',
              edit: true,
            })
          }
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    saveTree() {
      if (this.treeBoxState == 'add') {
        this.addTree()
      }
      else {
        this.updateTree()
      }
    },
    addTree() {
      if (!this.editTreeRowVal) {
        window.$oAntdMessage.warning('名称不能为空')
        return
      }
      window.$oAjax({
        method: 'post',
        url: `/rest/template-group/save`,
        data: {
          parentId: this.selTreeId[0],
          name: this.editTreeRowVal,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
          this.editboxvb = false
          this.editTreeRowVal = ''
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    updateTree() {
      if (!this.editTreeRowVal) {
        window.$oAntdMessage.warning('名称不能为空')
        return
      }
      window.$oAjax({
        method: 'PUT',
        url: `/rest/template-group/update`,
        data: {
          id: this.selTreeId[0],
          name: this.editTreeRowVal,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
          this.editboxvb = false
          this.editTreeRowVal = ''
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    delTree() {
      if (!this.selTreeId[0]) {
        window.$oAntdMessage.warning('请先选中再删除')
        return
      }
      window.$oAjax({
        method: 'DELETE',
        url: `/rest/template-group/delete/${this.selTreeId[0]}`,
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    testUploadFile() {
      const names = this.fileList.map((item) => {
        return item.name
      })
      window.$oAjax({
        method: 'POST',
        url: `/rest/template-file/verify`,
        data: {
          names,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          const repeat = res.data
          if (repeat.length > 0) {
            window.$oAntdMessage.warning('当前模板文件已经存在')
          }
          const files = [...this.fileList]
          for (const i in repeat) {
            for (const j in files) {
              if (repeat[i].name == files[j].name) {
                files[j].status = 'error'
                files[j].response = '模板文件已经存在,不能在上传'
              }
            }
          }
          this.fileList = files
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
