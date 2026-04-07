<template>
  <a-layout id="components-layout-demo-top-side-2" class="body-box">
    <a-layout>
      <a-layout-sider
        width="420"
        :style="{
          overflow: 'auto',
          padding: '10px',
          height: '100vh',
          position: 'fixed',
          left: 0,
          backgroundColor: 'var(--colorBgContainer)',
        }"
      >
        <div class="pr-2">
          <h3>设计级配类型</h3>
          <a-row style="margin: 8px 0px" class="search-header">
            <a-col :span="20">
              <a-input
                v-model:value="queryParam"
                placeholder="输入设计级配类型后回车即可查询"
                @press-enter="quickSearch"
              />
            </a-col>
            <a-col :span="2" offset="1">
              <a-button type="primary" @click="quickSearch()">
                查询
              </a-button>
            </a-col>
          </a-row>
          <div>
            <a-button type="primary" @click="showModal(false)">
              添加
            </a-button>
            <ht-modal
              :title="isEdit ? '编辑设计级配类型' : '添加设计级配类型'"
              :mask-closable="maskClosable"
              :open="visible"
              :confirm-loading="confirmLoading"
              @ok="typeOk"
              @cancel="typeCancel"
            >
              <a-form-item
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 15 }"
                label="请输入设计级配类型名称："
              >
                <a-input
                  v-model:value="typeName"
                  placeholder="请输入类型名称"
                />
              </a-form-item>
            </ht-modal>
            <a-button
              type="primary"
              :disabled="isDisabledEdit"
              @click="showModal(true)"
            >
              编辑
            </a-button>
            <!-- 这里加一个复制 -->
            <a-button type="primary" :disabled="false" @click="copyType">
              复制
            </a-button>
            <a-button
              type="primary"
              :disabled="isDisabledEdit"
              @click="showDelete"
            >
              删除
            </a-button>
          </div>
        </div>
        <a-tree
          show-line
          :tree-data="treeData"
          :selected-keys="selectedKeys"
          @select="onSelect"
        ></a-tree>
        <p v-if="isShowTree">
          暂无数据
        </p>
      </a-layout-sider>
      <a-layout :style="{ marginLeft: '420px', padding: '0px 10px', backgroundColor: 'var(--colorBgContainer)' }">
        <AppProvider>
          <a-layout-content
            :style="{
              padding: '10px',
              margin: 0,
              minHeight: '280px',
              overflow: 'initial',
              backgroundColor: 'var(--colorBgContainer)',
            }"
          >
            <h3>级配范围设置</h3>
            <div style="margin: 8px 0px">
              <a-button
                type="primary"
                :disabled="isDisabledEdit"
                @click="showModalAddEdit"
              >
                添加
              </a-button>
              <a-button
                type="primary"
                :disabled="isDisabledEdit"
                @click="editTable"
              >
                编辑
              </a-button>
              <a-button
                type="primary"
                :disabled="isDisabledEdit"
                @click="cancelTable"
              >
                删除
              </a-button>
              <div class="expired-box">
                注：此处填写的上下限为通过百分率!
              </div>
            </div>
            <!-- 删除变量 :rowClassName="rowClassName" -->
            <a-table
              :row-selection="rowSelection"
              :columns="columns"
              :data-source="data"
              row-key="id"
              :loading="loading"
              :pagination="false"
              :custom-row="customRow"
              @change="sorterChange"
            >
              <template #bodyCell="{ column, record, text }">
                <template v-if="column.dataIndex === 'name'">
                  <a href="javascript:;">{{ text }}</a>
                </template>

                <template v-if="column.dataIndex === 'screenSize'">
                  <span :class="{ active: expiredFun(record.standard) }">{{
                    text
                  }}</span>
                </template>

                <template v-if="column.dataIndex === 'upperLimit'">
                  <span :class="{ active: expiredFun(record.standard) }">{{
                    text
                  }}</span>
                </template>

                <template v-if="column.dataIndex === 'lowerLimit'">
                  <span :class="{ active: expiredFun(record.standard) }">{{
                    text
                  }}</span>
                </template>

                <template v-if="column.dataIndex === 'standard'">
                  <span :class="{ active: expiredFun(text) }">{{
                    text
                  }}</span>
                </template>
              </template>
            </a-table>
            <AddEditComponent
              ref="addeditchild"
              :type-id="typeId"
              :range-id="rangeId"
              :callback="handleOkAddEditCall"
            />
          </a-layout-content>
        </AppProvider>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import { ajaxRequest, downloadAccessory } from '~/providers/common/utils.js'
import HelloDemo from '~/providers/components/HelloDemo.vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import AddEditComponent from './components/addEdit.vue'

const columns = [
  {
    title: '筛孔尺寸',
    dataIndex: 'screenSize',
    scopedSlots: { customRender: 'screenSize' },
  },
  {
    title: '上限',
    dataIndex: 'upperLimit',
    scopedSlots: { customRender: 'upperLimit' },
  },
  {
    title: '下限',
    dataIndex: 'lowerLimit',
    scopedSlots: { customRender: 'lowerLimit' },
  },
  {
    title: '标准',
    dataIndex: 'standard',
    scopedSlots: { customRender: 'standard' },
  },
  {
    title: '限制区界限最小',
    dataIndex: 'minLimitZone',
    scopedSlots: { customRender: 'minLimitZone' },
  },
  {
    title: '限制区界限最大',
    dataIndex: 'maxLimitZone',
    scopedSlots: { customRender: 'maxLimitZone' },
  },
  {
    title: '控制点界限最小',
    dataIndex: 'minControlPoint',
    scopedSlots: { customRender: 'minControlPoint' },
  },
  {
    title: '控制点界限最大',
    dataIndex: 'maxControlPoint',
    scopedSlots: { customRender: 'maxControlPoint' },
  },
  { title: '顺序号', dataIndex: 'orderNum', sorter: true },
]
export default {
  name: 'List',
  components: {
    AddEditComponent,
    // eslint-disable-next-line vue/no-unused-components
    HelloDemo,
    // eslint-disable-next-line vue/no-unused-components
    UploadComponent,
  },
  data() {
    // eslint-disable-next-line ts/no-this-alias, unused-imports/no-unused-vars
    const self = this
    return {
      columns,
      standardVisible: false,
      standardUrl: '',
      queryParam: '',
      sort: 'indexOrder',
      order: '',
      typeName: '',
      typeId: '',
      isShowTree: false,
      isEdit: false, // 是否编辑设计级配类型
      visible: false,
      isDisabledDel: true,
      isDisabledEdit: true,
      confirmLoading: false,
      maskClosable: false,
      selectedKeys: [],
      groupSel: [],
      treeData: [],
      data: [],
      totals: 0,
      isLoadRange: true,
      selectedRowKeys: [],
      rangeId: '', // 规程id
      screenSize: '', // 规程名称
      lowerLimit: '',
      pages: 1,
      pageSize: 9999,
      pagination: {
        // current: 1,
        // pageSize: 10,
        //  ...window.pageConfig,
        // onShowSizeChange: (current, pageSize) =>{
        //   this.pageSize = pageSize;
        //   this.pages = 1
        //   this.getData();
        // },
        // onChange: (page, pageSize) => self.handleTableChange(page, pageSize),
        // total: 0 //总条数
      },
      // fileList:[],
      loading: false,
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.rangeId = `${this.selectedRowKeys}`
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: 'radio',
        onChange: (selectedRowKeys) => {
          this.rangeId = `${selectedRowKeys}`
          this.selectedRowKeys = selectedRowKeys
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
          },
        }),
      }
    },
  },
  created() {
    // this.getData();
    this.getTreeData()
  },
  methods: {
    ajaxRequest,
    downloadAccessory,
    expiredFun() {},
    showModal(isEdit) {
      this.isEdit = isEdit
      this.typeName = isEdit ? this.groupSel[0].typeName : ''
      this.visible = true
    },
    typeOk() {
      // 设计级配类型新增编辑
      this.confirmLoading = true
      let data = {}
      if (this.isEdit) {
        data = {
          id: this.typeId,
          typeName: this.typeName,
        }
      }
      else {
        data = {
          typeName: this.typeName,
        }
      }
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.designGrade.typeAddUpdateUrl,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: JSON.stringify(data),
      }).then((res) => {
        this.visible = false
        this.confirmLoading = false
        if (res.success) {
          setTimeout(() => {
            // 查询树的数据
            this.getTreeData()
          }, 100)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    typeCancel() {
      this.visible = false
    },
    // #35562 根据类型复制级配
    copyType() {
      this.loading = true
      // this.selectedKeys[0]是已选的级配类型id, this.typeId设计级配类型id
      if (this.selectedKeys[0]) {
        window.$oAjax
          .get(window.$oApi.designGrade.typeCopyUrl, {
            params: { id: this.typeId },
          })
          .then((res) => {
            if (res.success) {
              window.$oAntdMessage.success(res.msg)
              this.getTreeData()

              this.typeId = res.obj.id
              this.selectedKeys = []
              this.selectedKeys.push(res.obj.id)
              this.groupSel = []
              this.groupSel.push(res.obj)
              this.loading = false
            }
            else {
              window.$oAntdMessage.error(res.message || res.msg)
            }
          })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配类型'))
      }
    },

    showDelete() {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      if (this.typeId) {
        window.$oAntdConfirm({
          title: '是否删除已创建自定义级配？',
          content:
            '若已在UDR中引用该级配,删除后重新选择级配后原数据不可恢复,请谨慎操作。',
          onOk() {
            const data = {
              id: self.typeId,
            }
            window.$oAjax
              .get(window.$oApi.designGrade.typeDeleteUrl, {
                params: {
                  ...data,
                },
              })
              .then((res) => {
                if (res.success) {
                  self.typeId = ''
                  self.visible = false
                  self.confirmLoading = false
                  setTimeout(() => {
                    // 查询树的数据
                    self.getTreeData()
                  }, 100)
                  window.$oAntdMessage.success(res.msg)
                  self.groupSel = []
                }
                else {
                  window.$oAntdMessage.error(res.message || res.msg)
                }
              })
          },
          onCancel() {},
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配'))
      }
    },
    showModalAddEdit() {
      if (this.typeId) {
        this.rangeId = ''
        setTimeout(() => {
          this.selectedRowKeys = []
          this.$refs.addeditchild.showModal()
        }, 100)
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配类型'))
      }
    },
    handleOkAddEditCall() {
      this.getData(this.rangeId)
    },
    editTable() {
      if (this.typeId) {
        if (this.rangeId) {
          // eslint-disable-next-line ts/no-unused-expressions
          this.rangeId ? this.$refs.addeditchild.showModal() : ''
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择级配范围'))
        }
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配类型'))
      }
    },
    cancelTable() {
      if (!this.typeId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设计级配类型'))
        return
      }
      if (!this.rangeId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择级配范围'))
        return
      }
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '是否删除已创建筛孔尺寸？',
        content:
          '若已在UDR中引用该数据,删除后重新选择级配后原数据不可恢复,请谨慎操作。',
        onOk() {
          const data = {
            id: self.rangeId,
          }
          window.$oAjax
            .get(window.$oApi.designGrade.rangeDeleteUrl, {
              params: {
                ...data,
              },
            })
            .then((res) => {
              self.cancelTableCall(res)
            })
        },
        onCancel() {},
      })
    },
    cancelTableCall(res) {
      if (res.success) {
        this.getData()
      }
    },
    getData(rangeId) {
      this.isLoadRange = false
      const data = {
        typeId: this.typeId,
      }
      // eslint-disable-next-line ts/no-unused-expressions
      this.sort ? (data[this.sort] = this.order) : ''
      this.loading = true
      window.$oAjax
        .get(window.$oApi.designGrade.rangeListUrl, {
          params: {
            ...data,
          },
        })
        .then((res) => {
          this.isLoadRange = true
          if (res.success) {
            this.getDataCall(res.obj, rangeId)
          }
        })
    },
    getDataCall(res, rangeId) {
      if (res.rows) {
        this.data = res.rows
        // this.data = res.rows.sort((a, b)=> (b.screenSize || 0) - (a.screenSize || 0));
        if (rangeId) {
          this.rangeId = rangeId
        }
        else {
          setTimeout(() => {
            this.selectedRowKeys = []
          }, 100)
          this.rangeId = ''
        }
        this.loading = false
        if (this.data.length > 0) {
          // this.isDisabledDel = true;
        }
        else {
          // this.isDisabledDel = false;
        }
      }
      else if (res.msg) {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
      // #35562 需要让创建人才允许编辑
      this.isDisabledEditManage()
    },
    getTreeData() {
      const data = {
        page: 1,
        size: 9999,
        queryParam: this.queryParam,
      }
      this.treeData = []
      window.$oAjax
        .get(window.$oApi.designGrade.typeListUrl, {
          params: {
            ...data,
          },
        })
        .then((res) => {
          if (res.success) {
            this.selectedKeys = []
            this.getTreeDataCall(res.obj)
            // #35562 需要让创建人才允许编辑
            // this.isDisabledEditManage();
          }
        })
    },
    getTreeDataCall(res) {
      if (res.rows && res.rows.length > 0) {
        this.treeData = res.rows
        this.isShowTree = false
        this.renderTreeNodes(res.rows, true)
      }
      else {
        this.treeData = []
        this.isShowTree = true
      }
    },
    renderTreeNodes(data, defaultChecke) {
      for (const keys in data) {
        const item = data[keys]
        item.title = item.typeName
        item.key = item.id
        item.value = item.id
        if (keys === '0' && defaultChecke) {
          if (this.typeId) {
            // eslint-disable-next-line no-self-assign
            this.typeId = this.typeId
            this.selectedKeys.push(this.typeId)
          }
          else {
            this.typeId = item.id
            this.selectedKeys.push(item.id)
            this.groupSel.push(item)
          }
          this.getData()
        }
        if (item.children && item.children.length) {
          this.renderTreeNodes(item.children)
        }
      }
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      if (info.selected) {
        const treeRow = info.selectedNodes[0]
        this.groupSel = [{ ...treeRow }]
        this.typeId = selectedKeys[0]
        this.pages = 1
        if (this.isLoadRange) {
          setTimeout(() => {
            this.getData()
          }, 100)
        }
        this.isDisabledEditManage()
      }
      else {
        this.groupSel = []
        this.isDisabledEdit = true
        // this.isDisabledDel = true;
      }
    },
    quickSearch() {
      // 快速查询
      this.getTreeData()
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter) {
        this.sort = 'indexOrder'
        if (sorter.order === 'descend') {
          this.order = 'desc'
        }
        else if (sorter.order === 'ascend') {
          this.order = 'asc'
        }
        else {
          this.order = ''
          this.sort = ''
        }
        this.getData()
      }
    },
    // #35562 需要让创建人才允许编辑
    isDisabledEditManage() {
      // this.groupSel[0].createBy 属性为创建人
      const userInfo = JSON.parse(window.localStorage.getItem('userInfo'))
      if (userInfo.username === this.groupSel[0].createBy) {
        this.isDisabledEdit = false
      }
      else {
        this.isDisabledEdit = true
      }
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
