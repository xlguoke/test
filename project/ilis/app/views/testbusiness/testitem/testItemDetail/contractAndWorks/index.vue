<template>
  <div class="contractAndWorks">
    <a-spin :spinning="spinning">
      <div>
        <div class="contractAndWorks-search">
          <a-input
            v-model:value="searchText"
            placeholder="请输入合同段/单位工程名称"
            class="contractAndWorks-search-all"
          />
          <a-button @click="getSearchData">
            查询
          </a-button>
          <a-button
            v-permission="'add:contract'"
            :disabled="isDetail"
            type="primary"
            @click="addContract"
          >
            添加合同段
          </a-button>
          <a-button
            v-permission="'add:unit'"
            :disabled="isDetail"
            type="primary"
            @click="addUnit"
          >
            添加工程划分
          </a-button>
          <a-button
            v-permission="'set:workers'"
            :disabled="isDetail"
            type="primary"
            @click="setPeople"
          >
            流程人员设置
          </a-button>
          <a-button
            v-permission="'set:workers'"
            :disabled="isDetail"
            type="primary"
            @click="setMove(1)"
          >
            上移
          </a-button>
          <a-button
            v-permission="'set:workers'"
            :disabled="isDetail"
            type="primary"
            @click="setMove(2)"
          >
            下移
          </a-button>
          <a-button
            v-permission="'set:workers'"
            :disabled="isDetail"
            type="primary"
            @click="setImport"
          >
            导入工程划分
          </a-button>
        </div>
        <div style="text-align: right; padding: 0 5px 5px 0">
          <span class="contractAndWorks-spot" style="background: #0e77d1" />
          外部系统同步的工程划分
          <span class="contractAndWorks-spot" style="background: #00a854" />
          在本系统创建的工程划分
        </div>

        <a-table
          v-model:expanded-row-keys="expandedRowKeys"
          :default-expanded-row-keys="expandedRowKeys"
          :columns="columns"
          :data-source="data"
          row-key="oid"
          expand-fixed
          :row-selection="{
            type: 'radio',
            selectedRowKeys,
            onChange: (selectedKeys, selectedRows) => {
              selectedRowKeys = selectedKeys
              rowData = selectedRows
            },
          }"
          :custom-row="customRow"
          @expand="onExpandRow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              <template v-if="record.tableId">
                <span class="contractAndWorks-spot" style="background: #0E77D1"></span>
                {{ record.name }}
              </template>
              <template v-else-if="!record.tableId">
                <span class="contractAndWorks-spot" style="background: #00A854"></span>
                {{ record.name }}
              </template>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <template v-if="`${record.type}` === '-1'">
                <a-button
                  v-permission="'add:contract'"
                  type="link"
                  :disabled="isDetail"
                  @click="(e) => edit(record, e)"
                >
                  编辑
                </a-button>
                <!-- 当合同段被标记为“对接外部系统”时，合同段的操作列显示【同步工程划分】按钮； -->
                <template v-if="record.needSync">
                  <a-button
                    v-permission="'del:contract'"
                    type="link"
                    :disabled="isDetail"
                    @click="(e) => synchroRow(record, e)"
                  >
                    同步工程划分
                  </a-button>
                </template>
                <a-button
                  v-permission="'del:contract'"
                  type="link"
                  danger
                  :disabled="isDetail"
                  @click="(e) => deleteRow(record, e)"
                >
                  删除
                </a-button>
              </template>
              <template v-else>
                <a-button
                  v-permission="'add:unit'"
                  type="link"
                  :disabled="isDetail"
                  @click="(e) => edit(record, e)"
                >
                  编辑
                </a-button>
                <template v-if="record.needSync">
                  <a-button
                    v-permission="'del:contract'"
                    type="link"
                    :disabled="isDetail"
                    @click="(e) => synchroRow(record, e)"
                  >
                    同步工程划分
                  </a-button>
                </template>
                <a-button
                  v-permission="'del:unit'"
                  type="link"
                  danger
                  :disabled="isDetail"
                  @click="(e) => deleteRow(record, e)"
                >
                  删除
                </a-button>
              </template>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <AddContract
      ref="AddContract"
      :contract-type="contractType"
      :callback="getData"
      :is-add="isAdd"
    />
    <AddUnit ref="AddUnit" :callback="getData" :is-add="isAdd" />
    <TreeImport ref="TreeImport" :callback="getData" />
    <SetPersonnel
      ref="SetPersonnel"
      :selected-row-keys="selectedRowKeys"
      :callback="getData"
    />
  </div>
</template>

<script>
import { Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import AddContract from './components/addContract.vue'
import AddUnit from './components/addUnit.vue'
import SetPersonnel from './components/setPersonnel.vue'
import TreeImport from './components/treeImport.vue'

const typeObj = {
  '1': '单位工程',
  '2': '分部工程',
  '3': '分项工程',
  '-1': '合同段',
  '-2': '工程项目',
}

const columns = [
  {
    title: '合同段/工程划分',
    dataIndex: 'name',
    width: '18%',
  },
  {
    title: '工程大类',
    dataIndex: 'type',
    width: '10%',
    customRender: ({ text }) => {
      return typeObj[text] || ''
    },
  },
  {
    title: '工程划分类别',
    dataIndex: 'contractPartTypeName',
    width: '10%',
    customRender: ({ record, text }) => {
      if (record.type === -1) {
        return `${record.contractPartTypeName || ''}（合同段）`
      }
      else {
        text = record.unitType
        return text
      }
    },
  },
  {
    title: '工程编号',
    dataIndex: 'projectCode',
    width: '10%',
  },
  {
    title: '说明',
    dataIndex: 'description',
    width: '10%',
  },
  {
    title: '试验人员',
    dataIndex: 'testPersons',
    width: '8%',
    customRender: ({ text }) => {
      return text.toString()
    },
  },
  {
    title: '复核人员',
    dataIndex: 'reviewPersons',
    width: '8%',
    customRender: ({ text }) => {
      return text.toString()
    },
  },
  {
    title: '审核人员',
    dataIndex: 'auditPersons',
    width: '8%',
    customRender: ({ text }) => {
      return text.toString()
    },
  },
  {
    title: '签发人员',
    dataIndex: 'approvePerson',
    width: '8%',
    customRender: ({ text }) => {
      return text.toString()
    },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
  },
]

export default {
  components: {
    AddContract,
    AddUnit,
    SetPersonnel,
    TreeImport,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      isDetail: getQueryVariable('status') === '1',
      //  typeObj : {'1': '单位工程', '2': '分部工程', '3': '分项工程', '-1': '合同段', '-2': '工程项目'};
      data: [],
      columns,
      searchText: '',
      formLayout: 'horizontal',

      spinning: false,
      contractType: [
        { name: '路基', value: '001' },
        { name: '路面', value: '002' },
        { name: '交安', value: '003' },
        { name: '机电', value: '004' },
        { name: '绿化', value: '005' },
        { name: '房建', value: '006' },
        { name: '综合', value: '007' },
      ],
      selectedRowKeys: [],
      rowData: [],
      expandedRowKeys: [],
      expandedRow: [],
      isAdd: true,
      height: 600,
      customRow: (record) => {
        return {
          onClick: () => {
            const ind = this.selectedRowKeys.indexOf(record.oid)
            if (ind === -1) {
              this.selectedRowKeys = [record.oid]
              this.rowData = [record]
            }
            else {
              this.selectedRowKeys = []
              this.rowData = []
            }
          },
        }
      },
    }
  },
  created() {
    this.getData()
    this.getContractType()
  },
  methods: {
    getContractType() {
      window.$oAjax({
        url: `/systemController.do?typeGrid&field=id,typename,typecode,sourceFrom&typegroupid=99294034538790912`,
      }).then((res) => {
        if (res.rows && res.rows.length > 0) {
          const all = res.rows.map((item) => {
            item.name = item.typename
            item.value = item.typecode
            return item
          })
          this.contractType = all
        }
      })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.spinning = true
      this.data = []
      this.selectedRowKeys = []
      this.rowData = []
      this.expandedRow = []
      this.expandedRowKeys = []
      window.$oAjax({
        url: window.$oApi.testItem.contractUnit,
        params: {
          id: this.id,
        },
        timeout: 600 * 1000 * 1000,
      })
        .then((res) => {
          if (res && res.data) {
            this.spinning = false
            if (res.data.length > 0) {
              this.data = this.formatData(res.data)
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
        .catch((err) => {
          console.error(err)
          this.spinning = false
        })
    },
    // 查询
    getSearchData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.testItem.contractUnitSearch,
        params: {
          id: this.id,
          name: this.searchText,
        },
        timeout: 60 * 1000 * 1000,
      }).then((res) => {
        if (res.code === 20000 && res.data) {
          this.data = this.formatData(res.data)
          this.spinning = false
          this.selectedRowKeys = []
          this.rowData = []
        }
        else {
          this.spinning = false
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    // 整理获取的数据
    formatData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        const obj = {
          key: item.oid,
          name: item.name,
          approvePerson: item.approvePerson,
          approvePersonId: item.approvePersonId,
          auditPersons: item.auditPersons,
          auditPersonIds: item.auditPersonIds,
          testPersons: item.testPersons,
          testPersonIds: item.testPersonIds,
          reviewPersons: item.reviewPersons,
          reviewPersonIds: item.reviewPersonIds,
          description: item.description,
          type: item.type,
          needSync: item.needSync,
          contractType: item.contractPartType,
          unitType: item.unitProjectType,
          projectCode: item.projectCode,
          isLeaf: false,
          oid: item.oid,
          sid: item.sid,
          pid: item.pid,
          levelCode: item.levelCode,
          tableId: item.tableId,
          hasChildren: true,
          contractPartTypeName: item.contractPartTypeName,
        }
        let children = []
        if (item.children && item.children.length !== 0) {
          children = this.formatData(item.children)
        }

        obj.children = children
        arr.push(obj)
      })

      return arr
    },
    handleChange(value, key, column) {
      const newData = [...this.data]
      const target = newData.filter(item => key === item.key)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    // 编辑
    edit(data, e) {
      e.stopPropagation()
      e.preventDefault()
      if (`${data.type}` === '-2') {
        return
      }
      this.isAdd = false
      if (`${data.type}` === '-1') {
        this.$refs.AddContract.showModal(data)
      }
      else {
        this.$refs.AddUnit.showModal(data)
      }
    },
    // 删除
    deleteRow(data, e) {
      e.stopPropagation()
      e.preventDefault()
      if (`${data.type}` === '-2') {
        return
      }
      let url = window.$oApi.testItem.unit
      if (`${data.type}` === '-1') {
        url = window.$oApi.testItem.contract
      }
      Modal.confirm({
        title: '删除',
        content: `删除${data.name}，相关联的数据将被一起删除，您确定要删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax(`${url}/${data.oid}`, {
            method: 'delete',
          }).then((res) => {
            if (res && res.code) {
              window.$oAntdMessage.success(res.message)
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        },
      })
    },
    // 同步工程划分
    synchroRow(data, e) {
      e.stopPropagation()
      e.preventDefault()
      const url = window.$oApi.testItem.syncProject
      Modal.confirm({
        title: '同步工程划分',
        content: `此操作将与外部系统同步当前合同段的工程划分，是否继续？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax(`${url}/${data.oid}`, {
            method: 'post',
          }).then((res) => {
            if (res && res.code) {
              window.$oAntdMessage.success('同步成功')
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        },
      })
    },
    onLoadDataTab(expanded, record) {
      const treeNode = record
      return new Promise((resolve) => {
        if (treeNode.children.length > 0) {
          resolve()
          return
        }
        setTimeout(() => {
          this.spinning = true
          const data = {
            id: treeNode.type > 0 ? treeNode.sid : treeNode.oid,
            type: treeNode.type,
            levelCode: treeNode.levelCode || '',
          }
          // 树获取三个参数
          window.$oAjax(window.$oApi.testItem.contractUnit, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
            params: data,
            dataType: 'JSON',
            method: 'get',
          }).then((res) => {
            if (res.code === 20000) {
              treeNode.children = this.formatData(res.data)
              this.data = JSON.parse(JSON.stringify(this.data))
              window.$oForceUpdate()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })

          resolve()
        }, 1000)
      })
    },
    setPeople() {
      if (this.rowData.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择要设置流程人员的合同段'))
        return
      }
      this.$refs.SetPersonnel.showModal(this.rowData)
    },
    setMove(t) {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要移动的数据'))
        return
      }
      const type = `${this.rowData[0].type}`
      if (type === '-1' || type === '-2') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择工程划分'))
        return
      }
      // 选择的行oid
      const seloid = this.rowData[0].oid
      // 选择行的下标
      let selIndex = ''
      // 需要互换的下标
      let excIndex = ''
      // 选择行的所在层级数组
      let selP = []
      ;(function r(arr) {
        arr.forEach((item, index) => {
          // eslint-disable-next-line ts/no-unused-expressions
          item.children && item.children.length ? r(item.children) : ''
          if (item.oid === seloid) {
            selP = arr
            selIndex = index
          }
        })
      })(this.data)

      // 上移
      if (t === 1) {
        if (selIndex === 0) {
          window.$oAntdModal.warning(window.$oMsgTips.info('已到达最顶层'))
          return
        }
        excIndex = selIndex - 1
        // 下移
      }
      else {
        if (selIndex === selP.length - 1) {
          window.$oAntdModal.warning(window.$oMsgTips.info('已到达最底层'))
          return
        }
        excIndex = selIndex + 1
      }
      this.loadMove([selP[selIndex].oid, selP[excIndex].oid])
    },
    findChilds(data, sId) {
      if (!Array.isArray(data)) {
        return
      }
      let arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let obj = {}
        let children = []
        if (item.oid === sId) {
          obj = { ...item }
          arr = arr.concat(obj.children)
        }
        if (obj.children && obj.children.length > 0) {
          children = this.findChilds(obj.children, sId)
          arr = arr.concat(children)
        }
      })

      return arr
    },
    findParents(data, pId) {
      if (!Array.isArray(data)) {
        return
      }
      let arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let obj = {}
        let children = []
        if (item.oid === pId) {
          obj = item
          arr = arr.concat(obj)
        }
        if (obj.children && obj.children.length > 0) {
          children = this.findParents(obj.children, pId)
          arr = arr.concat(children)
        }
      })
      return arr
    },
    loadMove(idArr) {
      this.spinning = true
      window.$oAjax({
        method: 'post',
        params: {
          ids: idArr.toString(),
        },
        timeout: 60 * 1000 * 1000,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        url: window.$oApi.testItem.moveUrl,
      }).then(() => {
        const recordP = this.findParents(this.data, this.rowData[0].sid)

        if (recordP.length > 0) {
          recordP[0].children = []
          this.load(recordP[0])
        }
        else {
          this.spinning = false
        }
      })
    },
    setImport() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择合同段进行导入'))
        return
      }
      this.$refs.TreeImport.showModal(this.rowData[0].oid)
      //
    },
    addUnit() {
      this.isAdd = true
      this.$refs.AddUnit.showModal(false, this.rowData[0])
    },
    addContract() {
      this.isAdd = true
      this.$refs.AddContract.showModal()
    },
    onExpandRow(expanded, record) {
      const ind = this.expandedRowKeys.indexOf(record.oid)
      if (ind === -1) {
        this.expandedRowKeys.push(record.oid)
        this.expandedRow.push(record)
      }
      else {
        this.expandedRowKeys.splice(ind, 1)
        this.expandedRow.splice(ind, 1)
      }
      this.load(record, (child) => {
        record.children = child.length ? child : undefined
      })
    },
    load(expanded, resolve) {
      const treeNode = expanded
      if (treeNode.children.length > 0) {
        resolve && resolve(treeNode.children)
        return
      }

      this.spinning = true
      const data = {
        id: treeNode.type > 0 ? treeNode.sid : treeNode.oid,
        type: treeNode.type,
        levelCode: treeNode.levelCode || '',
      }
      // 树获取三个参数
      window.$oAjax(window.$oApi.testItem.contractUnit, {
        method: 'get',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        timeout: 600 * 1000 * 1000,
        params: data,
        dataType: 'JSON',
      }).then((res) => {
        if (res.code === 20000) {
          const newData = (treeNode.children = this.formatData(res.data))
          if (newData.length > 0) {
            const newData2 = this.newTreeData(this.data, newData, treeNode.oid)
            this.data = JSON.parse(JSON.stringify(newData2))
          }

          resolve && resolve(newData)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))

          resolve && resolve([])
        }
        this.spinning = false
      })
    },
    newTreeData(data, child, oid) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      if (!Array.isArray(child)) {
        return
      }

      data.forEach((item) => {
        const obj = item
        let children = []
        if (obj.children && obj.children.length > 0) {
          children = this.newTreeData(obj.children, child, oid)
        }
        if (item.oid === oid) {
          obj.children = child
        }
        else {
          obj.children = children
        }
        arr.push(obj)
      })
      return arr
    },
    formatterUnitProjectType(row, column, cellValue) {
      if (`${row.type}` === '-1') {
        cellValue = `${row.contractPartTypeName}（合同段）`
        return cellValue
      }
      else {
        cellValue = row.unitType
        return cellValue
      }
    },
    formatterPerson(row, column, cellValue) {
      return cellValue ? cellValue.toString() : ''
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
