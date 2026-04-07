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
              <a-button class="toolBtn-bar" @click="openEditBox">
                编辑
              </a-button>
              <a-button class="toolBtn-bar" @click="delTree">
                删除
              </a-button>
            </div>

            <!-- <div style="    margin-top: 10px;">
                <a-col>
                  <a-input-search
                      v-model="query.name"
                    placeholder="输入模板名称后回车即可查询"
                    @change="onChangeForQueryTree"
                  />
                </a-col>
              </div> -->

            <a-tree
              class="mt-2"
              default-expand-all
              :show-line="true"
              show-icon
              draggable
              :field-names="replaceFields"
              :tree-data="treeData"
              @select="selTree"
              @drop="onDrop"
            >
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
              <a-space class="mb-2">
                <a-button type="primary" @click="openUploadBox">
                  新增
                </a-button>
                <a-button class="toolBtn-bar" @click="editBatch">
                  编辑
                </a-button>
                <a-popconfirm
                  title="确定删除选择?"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="delBatch"
                >
                  <a-button class="toolBtn-bar">
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
              <a-table
                :columns="columns"
                :data-source="tabledata"
                :pagination="false"
                :row-selection="rowSelection"
                row-key="id"
                @change="changePage"
              >
              </a-table>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>

    <ht-modal
      v-model:open="editboxvb"
      width="450px"
      :mask-closable="false"
      :title="`${treeBoxState === 'add' ? '新增位置' : '编辑位置'}`"
      @cancel="editTreeRowVal = ''"
      @ok="saveTree"
    >
      <div>
        <span style="display: inline-block; width: 80px"><span style="color: red">*</span>所属功能室：</span>
        <a-select
          v-model:value="laboratoryId"
          placeholder="请选择所属功能室"
          style="width: 280px"
        >
          <a-select-option
            v-for="item in funRoomData"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div style="margin-top: 10px">
        <span style="display: inline-block; width: 80px">名称</span>
        <a-input
          ref="edit_input"
          v-model:value="editTreeRowVal"
          placeholder="请输入名称"
          style="width: 280px"
        ></a-input>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="addListBoxVb"
      :mask-closable="false"
      width="400px"
      title="存放位置"
      @ok="addListOk"
    >
      <div class="add_lsit_box">
        <p>
          <span class="lable">编号：</span>
          <a-input
            v-model:value="addListObj.sn"
            style="width: 220px"
            placeholder="请输入编号"
          ></a-input>
        </p>
        <p>
          <span class="lable">存放样品：</span>
          <a-input
            v-model:value="addListObj.content"
            style="width: 220px"
            placeholder="请输入存放样品"
          ></a-input>
        </p>
        <p>
          <span class="lable">存放上限：</span>
          <a-input-number
            v-model:value="addListObj.max"
            style="width: 125px"
            placeholder="请输入存放数量"
            :min="1"
            :max="9999"
          />
          <span style="margin: 0px 10px; margin-top: 5px">/</span>
          <a-input
            v-model:value="addListObj.unit"
            style="width: 70px"
            placeholder="单位"
          ></a-input>
        </p>
        <p>
          <span class="lable">定位器编号：</span>
          <a-input
            v-model:value="addListObj.rfid"
            style="width: 220px"
            type="number"
            placeholder="请输入定位器编号"
          ></a-input>
        </p>
      </div>
    </ht-modal>
  </div>
</template>

<script>
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import { FolderOpenOutlined } from '@ant-design/icons-vue'
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '编号',
    dataIndex: 'sn',
    key: 'sn',
  },
  {
    title: '存放样品',
    dataIndex: 'content',
    key: 'content',
  },
  {
    title: '存放上限',
    dataIndex: 'max',
    key: 'max',
    customRender: ({ record: row }) => {
      return row.max + row.unit
    },
  },
  {
    title: '定位器编号',
    dataIndex: 'rfid',
    key: 'rfid',
  },
  // {
  //   title: "关联样品",
  //   scopedSlots: { customRender: "handleFun" },
  // },
]

export default {
  name: 'list',
  components: {
    FolderOpenOutlined
  },
  data() {
    return {
      laboratoryId: undefined,
      funRoomData: [],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      selTreeId: [],
      selNode: [],
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
        pageSize: 10, //每页中显示10条数据
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'], //每页中显示的数据
        showTotal: (total) => `共有 ${total} 条数据`, //分页中显示总的数据
      },
      paginationExample: {
        current: 1,
        total: 0,
      },
      editboxvb: false,
      historicalVersionVb: false,
      addListBoxVb: false,
      referencesVb: false,
      replaceUploadVb: false,
      exampleDetVb: false,
      selRow: [],
      selectedRowKeys: [],
      replaceFile: [],
      handleRow: {},
      historicaltabledata: [],
      referencesTabledata: [],
      exampleDetTabledata: [],
      editTreeRowVal: '',
      treeBoxState: '',
      columns,
      tabledata: [],
      addListObj: {
        sn: '',
        rfid: '',
        max: '',
        unit: '',
        content: '',
      },
    }
  },
  beforeCreate() {},
  mounted() {},
  components: {},
  created() {
    this.getTree()
    this.getTemplateList()
    this.getLaboratory()
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
  methods: {
    getLaboratory() {
      let that = this
      window.$oAjax({
        method: 'get',
        url: `/rest/laboratoryController?dataGridPage&size=99999&page=1`,
      }).then((res) => {
        if (res.success) {
          that.funRoomData = res.obj.rows
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
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
        } else {
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
          `/rest/template-file/instance/${this.handleRow.id}?page=` +
          this.paginationExample.current +
          '&rows=10',
      }).then((res) => {
        if (res.code == '20000') {
          this.paginationExample.total = res.data.total
          this.exampleDetTabledata = res.data.rows
        } else {
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
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
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
    selTree(sel, e) {
      console.log(e)
      this.selRow = []
      this.selectedRowKeys = []
      this.selNode = e.selectedNodes
      this.selTreeId = sel
      this.pagination.current = 1
      this.getTemplateList()
    },

    openAddtBox() {
      this.editboxvb = true
      this.treeBoxState = 'add'
      this.laboratoryId = undefined
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
      this.editTreeRowVal = this.selNode[0].name
      this.laboratoryId = this.selNode[0].laboratoryId
      window.$oNextTick(() => {
        this.$refs.edit_input.focus()
      })
    },
    //左侧获取树
    getTree() {
      window.$oAjax
        .get(`/rest/periodStorageSiteGroup/tree`)
        .then((res) => {
          if (parseInt(res.code) === 20000) {
            this.treeData = res.data
          } else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },
    openUploadBox() {
      if (this.selTreeId.length > 0) {
        this.addListBoxVb = true
        this.fileList = []
        this.addListObj = {
          sn: '',
          rfid: '',
          max: '',
          unit: '',
          content: '',
          groupId: this.selTreeId[0],
        }
      } else {
        window.$oAntdMessage.warning('新增需指定左侧节点')
      }
    },
    //获取列表数据
    getTemplateList() {
      const load = window.$oAntdMessage.loading('Loading...')
      window.$oAjax({
        method: 'get',
        url: `/rest/periodStorageSite/getAll`,
        params: {
          groupId: this.selTreeId[0],
        },
      }).then((res) => {
        if (res.code == '20000') {
          load()
          this.tabledata = res.data
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    //批量删除
    delBatch() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请至少选择一条数据！')
        return
      }
      let ids = ''
      this.selRow.forEach((item, index) => {
        if (index < this.selRow.length - 1) {
          ids += item.id + ','
        } else {
          ids += item.id
        }
      })
      window.$oAjax({
        method: 'get',
        url: `/rest/periodStorageSite/del/?ids=` + ids,
      }).then((res) => {
        if (res.code == '20000') {
          // 删除成功后，
          window.$oAntdMessage.success(`删除成功`)
          this.selectedRowKeys = []
          this.selRow = []
          this.getTemplateList()
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    //编辑
    editBatch() {
      if (this.selRow.length != 1) {
        window.$oAntdMessage.warning('请选择一条数据进行编辑！')
        return
      }
      this.addListObj = {
        sn: this.selRow[0].sn,
        rfid: this.selRow[0].rfid,
        max: this.selRow[0].max,
        unit: this.selRow[0].unit,
        content: this.selRow[0].content,
        groupId: this.selRow[0].groupId,
        id: this.selRow[0].id,
      }
      this.addListBoxVb = true
    },
    //拖动树
    onDrop(info) {
      const dropKey = info.node.eventKey // 目标节点的id
      const dragKey = info.dragNode.eventKey // 拖拽节点的id
      const name = info.dragNode.title
      let data = {
        id: dragKey,
        name: name,
        parentId: dropKey,
        laboratoryId: info.dragNode.dataRef.laboratoryId || '',
      }
      this.saveTreeAjax(data).then((res) => {
        if (res.code == '20000') {
          this.getTree()
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    //添加列
    addListOk() {
      if (!this.addListObj.content) {
        window.$oAntdMessage.warning('请输入存放样品')
        return
      }
      if (!this.addListObj.unit) {
        window.$oAntdMessage.warning('请输入单位')
        return
      }
      if (!this.addListObj.sn) {
        window.$oAntdMessage.warning('请输入编号')
        return
      }
      if (!this.addListObj.max) {
        window.$oAntdMessage.warning('请输入数量')
        return
      }
      if (!this.addListObj.rfid) {
        window.$oAntdMessage.warning('请输入定位器编号')
        return
      }
      let data = { ...this.addListObj }
      window.$oAjax({
        method: 'post',
        url: `/rest/periodStorageSite/save`,
        data: data,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTemplateList()
          this.addListBoxVb = false
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    onChangeForQueryTree(e) {},
    saveTree() {
      if (!this.laboratoryId) {
        window.$oAntdMessage.warning('所属功能室不能为空！')
        return
      }
      if (this.treeBoxState == 'add') {
        this.addTree()
      } else {
        this.updateTree()
      }
    },
    //新增节点
    addTree() {
      if (!this.editTreeRowVal) {
        window.$oAntdMessage.warning('名称不能为空')
        return
      }
      let data = {
        parentId: this.selTreeId[0],
        name: this.editTreeRowVal,
        laboratoryId: this.laboratoryId,
      }
      this.saveTreeAjax(data).then((res) => {
        if (res.code == '20000') {
          this.getTree()
          this.editboxvb = false
          this.editTreeRowVal = ''
          this.laboratoryId = null
        } else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    //编辑节点
    updateTree() {
      if (!this.editTreeRowVal) {
        window.$oAntdMessage.warning('名称不能为空')
        return
      }
      let data = {
        id: this.selTreeId[0],
        name: this.editTreeRowVal,
        parentId: this.selNode[0].parentId,
        laboratoryId: this.laboratoryId,
      }
      this.saveTreeAjax(data).then((res) => {
        this.getTree()
        this.editboxvb = false
        this.selNode[0].name = this.editTreeRowVal
        this.editTreeRowVal = ''
      })
    },

    saveTreeAjax(data) {
      return new Promise((resolve, reject) => {
        window.$oAjax({
          method: 'post',
          url: `/rest/periodStorageSiteGroup/save`,
          data: data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res.code == '20000') {
            resolve(res)
          } else {
            window.$oAntdMessage.error(res.message)
            reject(res)
          }
        })
      })
    },
    delTree() {
      if (!this.selTreeId[0]) {
        window.$oAntdMessage.warning('请先选中再删除')
        return
      }
      window.$oAjax({
        method: 'get',
        url: `/rest/periodStorageSiteGroup/del`,
        params: {
          id: this.selTreeId[0],
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
        } else {
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
.add_lsit_box p {
  margin: 10px 0;
  display: flex;
}
.add_lsit_box .lable {
  display: inline-block;
  width: 82px;
  text-align: right;
}
</style>
