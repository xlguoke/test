<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="false">
      <a-layout class="hitek-height-full">
        <a-layout-sider class="body" width="auto" theme="light">
          <p
            style="
              padding: 10px;
              font-size: 14px;
              font-weight: 900;
              border-bottom: 1px solid var(--colorSplit);
            "
          >
            采集项目
          </p>
          <div style="padding: 10px">
            <div>
              <a-button type="primary" @click="openAddtBox">
                新增
              </a-button>
              <a-button class="toolBtn-bar" @click="openEditBox">
                编辑
              </a-button>
              <a-popconfirm
                title="删除选中采集项目及子级?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delTree"
              >
                <a-button class="toolBtn-bar">
                  删除
                </a-button>
              </a-popconfirm>
              <a-button class="toolBtn-bar" @click="dataSignConfig">
                数据标记配置
              </a-button>
            </div>
            <div style="margin: 10px 0">
              <a-button type="primary" @click="openModifyData">
                一键开启允许修改试验数据
              </a-button>
              <a-button danger @click="closeModifyData">
                一键关闭允许修改试验数据
              </a-button>
            </div>
            <a-table
              v-model:expanded-row-keys="expandedRowKeys"
              :columns="treeColumns"
              :data-source="treeData"
              :row-selection="{
                hideDefaultSelections: true,
                type: 'checkbox',
                onSelect,
                getCheckboxProps: getCheckBoxProps,
                selectedRowKeys: selTreeId,
              }"
              :custom-row="handleCheck"
              row-key="id"
              @expand="expand"
            >
              <template #headerCell="{ column }">
                <template v-if="column.dataIndex === 'enableModifyTestData'">
                  允许修改试验数据
                  <a-tooltip placement="topLeft">
                    <template #title>
                      <span>启用后，在系统表格中，试验数据区域仅允许手动填写与修改数据，不允许引用采集数据</span>
                    </template>
                    <ExclamationCircleFilled
                      style="color: #1890ff"
                    />
                  </a-tooltip>
                </template>
              </template>
              <template #bodyCell="{ column, record, text }">
                <template v-if="column.dataIndex === 'enableModifyTestData'">
                  <a-switch
                    v-if="!record.children"
                    checked-children="是"
                    un-checked-children="否"
                    :checked="text === '1'"
                    @change="
                      (checked, event) => {
                        enableModifyTestData(record.id, checked, false, event)
                      }
                    "
                  />
                  <span v-else></span>
                </template>
              </template>
            </a-table>
          </div>
        </a-layout-sider>
        <a-layout-content :style="{ padding: '10px' }">
          <div>
            <a-input
              v-model:value.trim="query.name"
              style="width: 250px"
              placeholder="输入字段名称后即可查询"
              @change="onFilter"
            />
          </div>
          <a-tabs v-model:active-key="filterType" @change="onFilter">
            <a-tab-pane :key="1" tab="显示全部"></a-tab-pane>
            <a-tab-pane :key="2" tab="显示已启用"></a-tab-pane>
          </a-tabs>
          <a-table
            :columns="columns"
            :data-source="tabledata"
            :pagination="pagination"
            bordered
            :row-key="returnkey"
            :locale="{ emptyText: '当前没有数据！' }"
            :scroll="{
              y: 450,
            }"
            @change="changePage"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'orderNum'">
                <a-input-number
                  v-if="filterType === 2"
                  v-model:value="record.orderNum"
                  :precision="0"
                  :min="0"
                  @blur="relationProject"
                />
                <span v-else>{{ record.orderNum }}</span>
              </template>
              <template v-if="column.dataIndex === 'displayName'">
                <a-input
                  v-if="filterType === 2"
                  v-model:value="record.displayName"
                  @blur="relationProject"
                />
                <span v-else>{{ record.displayName }}</span>
              </template>
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
              <template v-if="column.dataIndex === 'select'">
                <a-switch
                  v-model:checked="record.select"
                  checked-children="是"
                  un-checked-children="否"
                  @change="relationProject"
                />
              </template>
            </template>
          </a-table>
        </a-layout-content>
      </a-layout>
    </a-spin>

    <ht-modal
      v-model:open="editboxvb"
      width="450px"
      :mask-closable="false"
      :title="treeBoxState === 'add' ? '新增项目' : '编辑项目'"
      @cancel="editTreeRowVal = ''"
      @ok="saveTree"
    >
      <div class="input_row">
        <span class="lableName">项目名称：</span>
        <a-input
          v-model:value="addTreeParam.typeName"
          placeholder="请输入项目名称"
        ></a-input>
      </div>
      <div class="input_row">
        <span class="lableName">项目编码：</span>
        <a-input
          v-model:value="addTreeParam.testTypeCode"
          placeholder="请输入项目编码"
        ></a-input>
      </div>
      <div class="input_row">
        <span class="lableName">匹配数据用途：</span>
        <a-switch v-model:checked="addTreeParam.isDataUse" />
      </div>
      <div class="input_row">
        <span class="lableName">采集类型：</span>
        <a-select v-model:value="addTreeParam.testType" style="width: 280px">
          <a-select-option value="data">
            数据采集
          </a-select-option>
          <a-select-option value="file">
            现场试验文件采集
          </a-select-option>
        </a-select>
      </div>
      <div class="input_row">
        <span class="lableName">数据类型：</span>
        <a-select v-model:value="addTreeParam.dataType" style="width: 280px">
          <a-select-option value="json">
            json
          </a-select-option>
          <a-select-option value="xml">
            xml
          </a-select-option>
        </a-select>
      </div>
    </ht-modal>

    <ht-modal
      v-model:open="propertyProfileVisible"
      :mask-closable="false"
      title="自定义字段"
      @ok="handleProfile"
    >
      <CustomProperty :key="customizeType" :customize-type="customizeType" />
    </ht-modal>
  </div>
</template>

<script>
import { ExclamationCircleFilled } from '@ant-design/icons-vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'

const columns = [
  {
    title: '序号',
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center',
    width: '10%',
  },
  {
    title: '字段名称',
    dataIndex: 'filedName',
    key: 'filedName',
    width: '20%',
  },
  {
    title: '显示名称',
    dataIndex: 'displayName',
    key: 'displayName',
    width: '20%',
  },
  {
    title: '字段编码',
    dataIndex: 'filedCode',
    key: 'filedCode',
    width: '20%',
  },
  {
    title: '列表是否显示',
    dataIndex: 'isShow',
    key: 'isShow',
    width: '15%',
  },
  {
    title: '启用',
    dataIndex: 'select',
    key: 'select',
    width: '15%',
  },
]

const treeColumns = [
  {
    title: '采集项目',
    dataIndex: 'typeName',
    key: 'typeName',
  },
  {
    dataIndex: 'enableModifyTestData',
    key: 'enableModifyTestData',
  },
]

export default {
  name: 'List',
  components: { CustomProperty, ExclamationCircleFilled },
  data() {
    return {
      selTreeId: [],
      fileList: [],
      treeData: [],
      pagination: {
        current: 1,
        total: 0,
        pageSize: 50, // 每页中显示50条数据
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50', '100'], // 每页中显示的数据
        showTotal: total => `共有 ${total} 条数据`, // 分页中显示总的数据
      },
      query: {
        name: '',
      },
      editboxvb: false,
      addTreeParam: {
        typeName: '',
        testTypeCode: '',
        testType: 'data',
        dataType: 'json',
        isDataUse: true,
      },
      editTreeRowVal: '',
      treeBoxState: '',
      columns,
      treeColumns,
      expandedRowKeys: [],
      tabledata: [],
      metadata: [],
      filterType: 1,
      propertyProfileVisible: false,
      customizeType: '',
    }
  },
  computed: {
    replaceFields() {
      return {
        children: 'children',
        title: 'typeName',
        key: 'id',
      }
    },
  },
  created() {
    this.getTree()
  },
  methods: {
    getCheckBoxProps() {
      return record => ({
        props: {
          defaultChecked: record.id === this.selTreeId[0],
        },
      })
    },
    onSelect(record, selected) {
      if (selected) {
        this.selTree([record.id])
      }
      else {
        this.selTree([])
      }
    },
    handleCheck(record) {
      return {
        onClick: () => {
          const index = this.selTreeId.indexOf(record.id)
          if (index > -1) {
            this.selTree([])
          }
          else {
            this.selTree([record.id])
          }
        },
      }
    },
    returnkey(r) {
      return r.filedId
    },
    onFilter() {
      this.tabledata = this.metadata
        // eslint-disable-next-line array-callback-return
        .filter((item) => {
          if (this.filterType == 2) {
            if (
              (item.filedName.includes(this.query.name)
                || item.filedCode.includes(this.query.name))
              && item.select
            ) {
              return item
            }
          }
          else {
            if (
              item.filedName.includes(this.query.name)
              || item.filedCode.includes(this.query.name)
            ) {
              return item
            }
          }
        })
        .sort((a, b) => {
          return a.orderNum - b.orderNum
        })
    },
    // 关联
    relationProject() {
      if (!this.selTreeId[0]) {
        window.$oAntdMessage.warning('请选择一个项目进行关联')
        return
      }

      const fieldList = this.metadata.filter((item) => {
        return item.select
      })

      window.$oAjax({
        method: 'post',
        url: `/rest/testField/fields-save`,
        data: {
          testId: this.selTreeId[0],
          fieldList,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          if (res.code == '20000') {
            window.$oAntdMessage.success('操作成功')
            this.onFilter()
          }
          else {
            window.$oAntdMessage.error(res.message || res.msg || '请求异常')
          }
        })
        .catch(() => {
          window.$oAntdMessage.error('请求异常，请联系管理员')
        })
    },

    changePage(v) {
      this.pagination.current = v.current
      this.pagination.pageSize = v.pageSize
    },

    selTree(sel) {
      this.selTreeId = sel
      this.pagination.current = 1
      this.query.name = ''
      if (sel.length) {
        this.getLinkedData()
      }
      else {
        this.tabledata = []
      }
    },
    // 获取列表数据
    getLinkedData() {
      const load = window.$oAntdMessage.loading('加载中...')
      window.$oAjax
        .get(`/rest/testField/fields?testId=${this.selTreeId[0]}`)
        .then((res) => {
          load()
          if (res.code === 20000) {
            this.metadata = res.data
            this.onFilter()
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },
    openAddtBox() {
      this.editboxvb = true
      this.treeBoxState = 'add'
      this.emptyAddTree()
    },
    openEditBox() {
      if (!this.selTreeId[0]) {
        window.$oAntdMessage.warning('请选择一个节点进行编辑')
        return
      }
      this.treeBoxState = 'edit'
      this.editboxvb = true
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      this.getProjectDetails(this.selTreeId[0]).then((data) => {
        data.isDataUse == 1
          ? (data.isDataUse = true)
          : (data.isDataUse = false)
        _this.addTreeParam = {
          ...data,
        }
      })
    },
    getProjectDetails(id) {
      return new Promise((r) => {
        window.$oAjax
          .get(`/rest/dataGatherTestTypeController/${id}`)
          .then((res) => {
            if (res.code === 20000) {
              r(res.data)
            }
            else {
              window.$oAntdMessage.error(res.msg)
            }
          })
      })
    },
    expand(expanded, record) {
      if (expanded) {
        this.expandedRowKeys.push(record.id)
      }
      else {
        const index = this.expandedRowKeys.indexOf(record.id)
        this.expandedRowKeys.splice(index, 1)
      }
    },
    // 数据标记配置
    dataSignConfig() {
      if (this.selTreeId.length === 0) {
        window.$oAntdMessage.warning('请选择采集项目')
        return
      }
      this.customizeType = this.selTreeId[0]
      this.propertyProfileVisible = true
    },
    // 保存自定义字段后的回调
    handleProfile() {
      this.propertyProfileVisible = false
    },
    // 左侧获取树
    getTree() {
      window.$oAjax
        .get(`/rest/dataGatherTestTypeController/getTestTypeAll`)
        .then((res) => {
          if (res.success) {
            this.treeData = res.obj
            if (this.selTreeId.length < 1) {
              this.selTreeId = [res.obj[0].id]
            }
            this.getLinkedData()
          }
          else {
            window.$oAntdMessage.error(res.msg)
          }
        })
    },

    saveTree() {
      if (!this.addTreeParam.typeName) {
        window.$oAntdMessage.warning('名称不能为空')
        return
      }
      else if (!this.addTreeParam.testTypeCode) {
        window.$oAntdMessage.warning('编码不能为空')
        return
      }
      if (this.treeBoxState == 'add') {
        this.addTree()
      }
      else {
        this.updateTree()
      }
    },

    addTree() {
      const params = { ...this.addTreeParam }

      params.isDataUse ? (params.isDataUse = 1) : (params.isDataUse = 0)
      params.typePid = this.selTreeId[0]
      window.$oAjax({
        method: 'post',
        url: `/rest/dataGatherTestTypeController`,
        data: params,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
          this.editboxvb = false
          this.emptyAddTree()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    emptyAddTree() {
      this.addTreeParam.typeName = ''
      this.addTreeParam.testTypeCode = ''
      this.addTreeParam.testType = 'data'
      this.addTreeParam.dataType = 'json'
      this.addTreeParam.isDataUse = true
    },

    updateTree() {
      const params = { ...this.addTreeParam }

      params.isDataUse ? (params.isDataUse = 1) : (params.isDataUse = 0)
      window.$oAjax({
        method: 'PUT',
        url: `/rest/dataGatherTestTypeController`,
        data: params,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.getTree()
          this.editboxvb = false
          this.emptyAddTree()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    delTree() {
      if (!this.selTreeId[0]) {
        window.$oAntdMessage.warning('请先选择一个节点再删除')
        return
      }
      window.$oAjax({
        method: 'DELETE',
        url: `/rest/dataGatherTestTypeController/${this.selTreeId[0]}`,
      }).then((res) => {
        if (res.code == '20000') {
          this.selTreeId = []
          this.getTree()
          this.tabledata = []
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    enableModifyTestData(id, checked, all, event) {
      if (event) {
        event.stopPropagation()
      }
      const url = window.$oApi.acquisitionFieldConfiguration.enableModifyTestData
      window.$oAjax({
        method: 'PUT',
        url,
        params: { id, checked, all },
      }).then((res) => {
        if (res.code === 20000) {
          this.getTree()
        }
        else {
          window.$oAntdMessage.error(`修改失败：${res.message}`)
        }
      })
    },
    openModifyData() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '确定要开启吗?',
        content: '该操作将开启所有项目允许修改试验数据',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          _this.enableModifyTestData(null, true, true, null)
        },
        onCancel() {},
      })
    },
    closeModifyData() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '确定要关闭吗?',
        content: '该操作将关闭所有项目允许修改试验数据',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          _this.enableModifyTestData(null, false, true, null)
        },
        onCancel() {},
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>

<style>
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
.body {
  border-right: var(--colorSplit) 5px solid;
}
</style>
