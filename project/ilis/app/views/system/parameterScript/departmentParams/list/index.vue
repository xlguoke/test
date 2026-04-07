<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div :spinning="spinning" class="h-full flex">
    <a-spin :spinning="spinning" style="position: fixed;top: 50%;left: 50%;"></a-spin>
    <div class="w-[320px] p-4 overflow-y-auto">
      <a-tree
        show-line
        :tree-data="departmentData"
        :selected-keys="treeKeys"
        @select="onSelect"
      ></a-tree>
      <p v-if="isShowTree">
        暂无数据
      </p>
    </div>
    <div class="flex-1 flex flex-col p-4" style="border-left: solid 1px #e2e2e2;">
      <div class="text-xs text-green-600">
        <p>说明：</p>
        <p>
          1.当前部门的检测业务范围包含该参数时，在委托收样中未选择检测部门时，在任务分配时该样品将自动显示在待分配中；
        </p>
        <p>2.若当前部门未选择任何参数，系统认为选择所有参数。</p>
      </div>
      <div class="flex-1 flex mt-4">
        <div class="w-[320px]">
          <div style="margin-bottom: 5px">
            <a-select
              :default-value="categoryType"
              style="width: 100%"
              @change="handleChange"
            >
              <a-select-option value="all">
                全部大类
              </a-select-option>
              <a-select-option value="sel">
                已选择权限大类
              </a-select-option>
            </a-select>
          </div>
          <!-- :autoExpandParent="autoExpandParent" -->
          <a-table
            class="mt-4"
            :columns="columnsT"
            :data-source="dataSourceT"
            :pagination="false"
            :row-selection="rowSelT"
            :custom-row="customRowT"
            row-key="id"
            :scroll="{ y: yTableT }"
            :expanded-row-keys="expandedRowKeys"
            @expand="onExpand"
          />
        </div>
        <div class="flex-1 pl-4">
          <div style="margin-bottom: 5px">
            <a-form ref="formRef" layout="inline">
              <a-form-item>
                <a-input
                  v-model:value="name"
                  placeholder="请输入参数名称"
                  @press-enter="searchFun"
                />
              </a-form-item>
              <a-form-item>
                <a-input
                  v-model:value="displayName"
                  placeholder="请输入参数显示名称"
                  @press-enter="searchFun"
                />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" @click="searchFun">
                  查询
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button @click="resetForm">
                  重置
                </a-button>
              </a-form-item>
              <a-form-item style="float: right">
                <a-button type="primary" @click="save">
                  保存
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <!-- :pagination="dataSource.length>0?pagination:false" -->
          <a-table
            class="mt-4"
            :row-selection="rowSelection"
            :columns="columns"
            :data-source="dataSource"
            row-key="id"
            :pagination="false"
            :custom-row="customRow"
            :row-class-name="rowClassName"
            :scroll="{ y: yTable }"
          >
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'testItemName'">
                <span v-html="replaceUdrChar(text)"></span>
              </template>
              <template v-if="column.dataIndex === 'name'">
                <span v-html="replaceUdrChar(text)"></span>
              </template>
              <template v-if="column.dataIndex === 'displayName'">
                <span v-html="replaceUdrChar(text)"></span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { replaceUdrChar } from '~/providers/common/utils.js'

const columns = [
  {
    title: '系统检测项目',
    dataIndex: 'testItemName',
  },
  {
    title: '试验参数系统名称',
    dataIndex: 'name',
  },
  {
    title: '试验参数显示名称',
    dataIndex: 'displayName',
  },
  { title: '备注', dataIndex: 'remark' },
]
const columnsT = [{ title: '单位大类', dataIndex: 'title' }]
export default {
  name: 'List',
  components: {},
  data() {
    return {
      columns,
      columnsT,
      queryParam: null,
      name: '', // 试验参数系统名称
      displayName: '', // 试验参数显示名称
      treeKeys: [],
      expandedRowKeys: [], // 默认展开父节点
      isShowTree: false,
      departmentData: [],
      dataSourceT: [],
      categoryType: 'all',
      dataSource: [],
      dataSourceClone: [],
      selectedRowKeysT: [],
      selectedRowsT: [],
      selectedRowKeys: [], // 参数
      selectedRows: [], // 参数
      categoryId: '',
      departmentId: '',
      yTableT: 500,
      yTable: 500,
      page: 1,
      size: 10,
      // pagination: {
      //   current: 1,
      //   total: 0,
      //   ...window.pageConfig,
      //   onChange: (page)=> {
      //     this.page = page;
      //   },
      //   onShowSizeChange: (page, size)=> {
      //     this.page = 1;
      //     this.size = size;
      //   }
      // },
      spinning: false,
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
      customRowT: (record) => {
        return {
          on: {
            click: () => {
              if (record.key === '8888-8888-8888') {
                return
              }
              if (this.selectedRowKeysT.includes(record.id)) {
                const arr = this.selectedRowKeysT
                arr.splice(
                  arr.findIndex(item => item === record.id),
                  1,
                )
                this.selectedRowsT = this.selectedRowsT.filter(
                  item => item.id !== record.id,
                )
              }
              else {
                this.selectedRowKeysT = [record.id]
                this.selectedRowsT = [record]
                this.getData([record])
              }
            },
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
        type: 'checkbox',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
    rowSelT() {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const { selectedRowKeysT, selectedRowsT } = this
      return {
        selectedRowKeys: selectedRowKeysT,
        selectedRows: selectedRowsT,
        type: 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeysT = selectedRowKeys
          this.selectedRowsT = selectedRows
        },
        onSelect(record, selected) {
          if (selected) {
            self.getData([record])
          }
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.key === '8888-8888-8888', // Column configuration not to be checked
            name: record.name,
          },
        }),
      }
    },
  },
  created() {
    this.getLaboratoryData()
  },
  methods: {
    replaceUdrChar,
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    onExpand(expandedRowKeys) {
      this.expandedRowKeys = expandedRowKeys
    },
    getLaboratoryData() {
      window.$oAjax
        .get('rest/department/tree')
        .then((res) => {
          if (res.code === 20000) {
            const departments = res.data
            this.departmentData = this.formatDepartmentData(departments)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info('获取检测部门失败'))
          }
        })
        .catch((err) => {
          window.$oAntdModal.error(window.$oMsgTips.info('获取检测部门失败，请联系管理员'))
          console.error(err)
        })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          title: item.name,
          value: item.id,
          id: item.id,
          key: item.id,
          children,
        })
      })
      return arr
    },
    onSelect(treeKeys, info) {
      this.treeKeys = treeKeys
      if (info.selected) {
        const treeRow = info.node.dataRef
        this.pages = 1
        this.departmentId = treeRow.id
        this.getdataSourceT()
        this.dataSource = []
        this.dataSourceClone = []
      }
      else {
        this.departmentId = ''
      }
    },
    renderDataTree(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          this.expandedRowKeys.push(data[i].id)
          children = this.renderDataTree(data[i].children)
        }
        const obj = {
          ...data[i],
          value: data[i].id,
          title: data[i].text || data[i].name,
          key: data[i].id,
          children,
          _disabled: data[i].id === '8888-8888-8888',
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    // 获取大类
    getdataSourceT() {
      let url = window.$oApi.consignSampleStatistic.getTreeData
      let params
      if (this.categoryType === 'sel') {
        if (!this.departmentId) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请先选择部门'))
          return
        }
        url = window.$oApi.departmentParams.dataSourceT
        params = {
          departmentId: this.departmentId,
        }
      }
      this.spinning = true
      window.$oAjax({
        url,
        method: 'get',
        timeout: 60 * 60 * 1000,
        params,
      }).then((res) => {
        this.dataSourceT = []
        this.selectedRowKeysT = []
        this.selectedRowsT = []
        this.expandedRowKeys = []
        this.dataSource = []
        this.dataSourceClone = []
        if (res && res.length > 0) {
          this.dataSourceT = this.renderDataTree(res)
        }
        this.spinning = false
      })
    },
    // 获取参数，获取权限
    async getData(rowTree) {
      this.categoryId = rowTree[0].id
      await this.getDataDepartment(rowTree)
      this.spinning = true
      window.$oAjax({
        url: 'testParamController.do?getTestParamUnderCategory',
        method: 'get',
        params: {
          categoryId: this.categoryId,
        },
      }).then((res) => {
        this.dataSource = res
        this.dataSourceClone = JSON.parse(JSON.stringify(this.dataSource))
        this.spinning = false
      })
    },
    async getDataDepartment() {
      let data
      if (this.departmentId) {
        data = {
          departmentId: this.departmentId,
          categoryId: this.categoryId,
        }
        this.spinning = true
        await window.$oAjax({
          url: window.$oApi.departmentParams.dataSource,
          method: 'get',
          params: data,
        }).then((res) => {
          this.selectedRowKeys = []
          this.selectedRows = []
          if (res.code === 20000) {
            // eslint-disable-next-line array-callback-return
            res.data.map((item) => {
              this.selectedRowKeys.push(item.testParamId)
            })
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
      }
      else {
        this.selectedRowKeys = []
        this.selectedRows = []
      }
    },
    searchFun() {
      // this.getData();
      const oldData = JSON.parse(JSON.stringify(this.dataSourceClone))
      if (oldData.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先获取参数'))
        return
      }
      const { name, displayName } = this
      if (!name && !displayName) {
        this.dataSource = JSON.parse(JSON.stringify(this.dataSourceClone))
        return
      }
      const newData = []
      const idArr = []
      // eslint-disable-next-line array-callback-return
      oldData.map((item) => {
        if (name && displayName) {
          if (
            item.name
            && item.name.includes(name)
            && item.displayName
            && item.displayName.includes(displayName)
          ) {
            newData.push(item)
            idArr.push(item.id)
          }
        }
        else {
          if (name && item.name && item.name.includes(name)) {
            if (!idArr.includes(item.id)) {
              newData.push(item)
              idArr.push(item.id)
            }
          }
          if (
            displayName
            && item.displayName
            && item.displayName.includes(displayName)
          ) {
            if (!idArr.includes(item.id)) {
              newData.push(item)
              idArr.push(item.id)
            }
          }
        }
      })
      this.dataSource = newData
    },
    resetForm() {
      this.name = ''
      this.displayName = ''
      this.dataSource = JSON.parse(JSON.stringify(this.dataSourceClone))
    },
    handleChange(value) {
      this.categoryType = value
      this.getdataSourceT()
    },
    save() {
      this.spinning = true
      const paramsArr = []
      // eslint-disable-next-line ts/no-unused-expressions
      this.selectedRowKeys.length > 0
        // eslint-disable-next-line array-callback-return
        ? this.selectedRows.map((item) => {
            paramsArr.push({
              paramId: item.id,
              categoryId: item.categoryId,
            })
          })
        : ''
      window.$oAjax({
        url: window.$oApi.departmentParams.addDepartmentParams,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          departmentId: this.departmentId,
          categoryId: this.categoryId,
          params: paramsArr,
        },
      }).then((res) => {
        if (res.code === 21000) {
          // this.dataSource = res.data.rows;
          // this.pagination.pageSize = size;
          // this.pagination.current = page;
          // this.pagination.total = res.data.count;
          window.$oAntdMessage.success('操作成功')
        }
        else {
          this.dataSource = []
          this.dataSourceClone = []
          this.selectedRowKeys = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
  },
}
</script>
