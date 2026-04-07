<!-- vue2组件弃用，后续使用 ~/components/PersonSelector.vue -->
<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="titles || '选择人员'"
      centered
      :mask-closable="false"
      class="components-selectPersonnel"
      width="520px"
      :destroy-on-close="true"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <p style="margin-bottom: 12px; color: #138900">
            提示：点击人员行内区域即可对其进行选中或取消
          </p>
          <div layout="inline" class="searchBox">
            <a-input
              v-model:value="searchString"
              placeholder="请输入名称后回车/查询"
              @keyup.enter="doFilter"
            />
            <a-button @click="doFilter">
              查询
            </a-button>
          </div>
          <div class="content-table">
            <!-- <a-table
                v-if="treeData.length>0"
                :defaultExpandAllRows="defaultExpandAllRows"
                :columns="columns"
                :dataSource="treeData"
                :expandedRowKeys="expandedRowKeys"
                @expand="onExpand"
                :pagination="false"
                :rowSelection="rowSelection"
                bordered
                :customRow="customRow" /> -->
            <HitekTreeTable
              ref="HitekTreeTable"
              :columns="columns"
              :data-source="tableTreeData"
              :default-select-data="defaultSelectData"
              :select-type="selectPage"
              :is-default-open="isDefaultOpen"
            />
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import HitekTreeTable from '~/providers/components/hitek-treeTable.vue'

// 整理数据
function getTree(data, department = '') {
  if (!Array.isArray(data)) {
    return
  }
  const arr = []
  for (let i = 0; i < data.length; i++) {
    let children = []
    if (data[i].children && data[i].children.length !== 0) {
      const depart
        = data[i].children[0].type === 'DEPART' ? department : data[i].name
      children = getTree(data[i].children, depart)
    }
    const obj = {
      ...data[i],
      value: data[i].id,
      title: data[i].name,
      key: data[i].id,
      department,
      children,
    }
    if (children.length === 0) {
      delete obj.children
    }
    if (obj.type === 'DEPART') {
      obj.disabled = true
    }
    arr.push(obj)
  }
  return arr
}

function getName(data) {
  if (!Array.isArray(data)) {
    return
  }
  let arr = []
  for (let i = 0; i < data.length; i++) {
    let arr2 = []
    if (data[i].children && data[i].children.length !== 0) {
      arr2 = getName(data[i].children)
      arr = arr.concat(arr2)
    }
    arr.push({
      id: data[i].id,
      name: data[i].name,
    })
  }
  return arr
}
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '账号',
    dataIndex: 'account',
    key: 'account',
    width: '140',
  },
]

export default {
  components: {
    HitekTreeTable,
  },
  props: ['callback'],
  data() {
    return {
      columns,
      selectPage: 'radio',
      selectedRowKeys: [],
      selectedRows: [],
      defaultExpandAllRows: false,
      expandedRowKeys: [],
      searchString: '',
      spinning: false,
      visible: false,
      treeData: [],
      allData: [],
      nameData: [],
      idsPerson: '',
      titles: '',
      defaultSelectData: [],
      tableTreeData: [],
      isDefaultOpen: false,
      authType: '',
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              if (!record.children) {
                this.selectedRowKeys = [record.id]
                this.selectedRows = [record]
              }
            }
            else {
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
                if (!record.children) {
                  this.selectedRowKeys.push(record.id)
                  this.selectedRows.push(record)
                }
              }
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: this.selectPage,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKey, selectedRow) => {
          this.selectedRowKeys = selectedRowKey
          this.selectedRows = selectedRow
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  methods: {
    onExpand(expanded, record) {
      if (this.expandedRowKeys.includes(record.id)) {
        const arr = this.expandedRowKeys
        arr.splice(
          arr.findIndex(item => item === record.id),
          1,
        )
      }
      else {
        this.expandedRowKeys.push(record.id)
      }
    },
    //  获取系统控制参数 - 报告批准采用会签模式
    async getBusinessParam() {
      await window.$oAjax({
        url: 'tSBusinessParamController.do?getBusinessParam&key=REPORT_MANAGE_42',
        method: 'get',
      }).then((res) => {
        this.selectPage = res.obj === 'Y' ? 'checobox' : 'radio'
      })
    },
    // 搜索数据
    doFilter() {
      // 装筛选结果的数组
      const newData = []
      const filter = this.searchString.trim()
      if (this.allData.length === 0) {
        return false
      }
      this.spinning = true
      const dataRows = this.allData
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        if (row.name.includes(filter)) {
          newData.push(row)
          // eslint-disable-next-line ts/no-unused-expressions
          this.expandedRowKeys.includes(row.id)
            ? ''
            : this.expandedRowKeys.push(row.id)
        }
        else {
          if (row.children && row.children.length > 0) {
            let _flag = false
            const _row = {
              ...row,
              children: [],
            }
            for (let j = 0; j < row.children.length; j++) {
              if (row.children[j].name.includes(filter)) {
                _row.children.push(row.children[j])
                _flag = true
              }
            }
            if (_flag === true) {
              newData.push(_row)
              // eslint-disable-next-line ts/no-unused-expressions
              this.expandedRowKeys.includes(_row.id)
                ? ''
                : this.expandedRowKeys.push(_row.id)
            }
          }
        }
      }

      if (filter !== '') {
        this.isDefaultOpen = true
      }
      else {
        this.isDefaultOpen = false
      }
      this.spinning = false
      this.treeData = newData
      this.tableTreeData = newData
    },
    getPersonData() {
      this.spinning = true
      window.$oAjax({
        url: '/reportCreateController.do?getPersonsForChoose',
        method: 'POST',
        timeout: 10 * 60 * 1000,
        // data: {
        //   type: this.authType,
        // },
      })
        .then((res) => {
          this.spinning = false
          if (res && res.rows) {
            this.treeData = getTree(res.rows)
            this.allData = getTree(res.rows)
            this.nameData = getName(this.treeData)
            this.tableTreeData = getTree(res.rows)
          }
          else {
            throw new Error(res.message)
          }
        })
        .catch((err) => {
          window.$oAntdModal.error({
            title: '提示',
            content: err.message || '获取人员列表失败',
            okText: '确定',
            centered: true,
          })
          this.spinning = false
        })
    },
    /**
     * 获取人员信息
     * @param {string} type 选择类型 checkbox radio
     * @param {string} idsPerson 人员职能类型
     * @param {string} acceptData 已选人员
     * @param {string} titles 标题
     * @param {string} authType 职能权限类型
     * @param {?boolean} isCheckbox 是否多选 - 是否根据控制参数控制多选
     */
    showModal(type, idsPerson, acceptData, titles, authType, isCheckbox) {
      if (isCheckbox) {
        this.getBusinessParam()
      }
      else {
        this.selectPage = type
      }
      this.titles = titles || ''
      this.authType = authType
      this.idsPerson = idsPerson
      this.defaultSelectData = acceptData || []
      this.selectedRows = acceptData || []
      this.selectedRowKeys = this.selectedRows
        .map(item => item.id)
        .filter(item => item)
      if (this.selectedRowKeys.length > 0) {
        this.defaultExpandAllRows = true
      }
      this.visible = true
      this.getPersonData()
    },
    cancelModal() {
      this.treeData = [...this.allData]
      this.tableTreeData = [...this.allData]
      this.searchString = ''
      this.isDefaultOpen = false
      this.defaultSelectData = []

      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
      this.visible = false
    },
    handleSubmit() {
      const selectData = this.$refs.HitekTreeTable.getSelectData()
      const selectedRowKeys = selectData.map(item => item.id)

      this.defaultSelectData = selectData
      // 查找匹配的
      // 查找存在的人员id
      let resData = selectedRowKeys.map((ids) => {
        const item = this.nameData.find(item => ids === item.id)
        if (item) {
          return item.id
        }
        return null
      })

      // 去除undfined
      resData = resData.filter(item => item)

      this.checkUnUseUser(selectData, () => {
        const allArr = selectData.filter(item => resData.includes(item.id))

        this.callback(this.idsPerson, allArr)
        this.selectedRowKeys = []
        this.rowSelection.selectedRowKeys = []

        this.cancelModal()
      })
    },
    // 检查是否有未激活账号
    checkUnUseUser(selectedList, cb) {
      const checkList = selectedList.filter((i) => {
        if (!i || !i.id) {
          return false
        }

        const item = this.nameData.find(j => i.id === j.id)
        return !item
      })

      if (checkList.length > 0) {
        window.$oAntdModal.confirm({
          title: '提示',
          content: `已选中人员中包含已禁用或删除人员【${checkList.map(i => i.name).join('、')}】，确定时将自动移除该人员。`,
          zIndex: 110000,
          onOk: () => {
            cb()
          },
        })
      }
      else {
        cb()
      }
    },
  },
}
</script>

<style lang="less">
.components-selectPersonnel {
  .searchBox {
    display: flex;
    margin-bottom: 10px;
  }
  .content-table {
    height: 300px;
    overflow-y: auto;
  }
}
</style>
