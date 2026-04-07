<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div id="components-layout" class="body-box">
    <a-alert
      v-show="warningTextShow"
      :message="`样品层级已更新，请重新选择样品层级${
        level ? `，原所选样品为${level}` : ''
      }`"
      banner
    />
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="body-box-header">
          <a-row>
            <a-col :span="12">
              <a-input-group compact>
                <a-select v-model:value="queryType">
                  <a-select-option value="sample">
                    按样品查询
                  </a-select-option>
                  <a-select-option value="param">
                    按参数查询
                  </a-select-option>
                  <a-select-option value="standard">
                    按规程查询
                  </a-select-option>
                  <a-select-option value="note">
                    按附注查询
                  </a-select-option>
                </a-select>
                <!-- 输入样品/参数名称/附注后回车即可查询 -->
                <a-input-search
                  v-model:value="queryParam"
                  :placeholder="
                    queryTypeTip[queryType] || queryTypeTip.defatail
                  "
                  style="width: 320px; vertical-align: middle"
                  @press-enter="quickSearch"
                >
                  <template #enterButton>
                    <a-button
                      type="primary"

                      @click="quickSearch()"
                    >
                      查询
                    </a-button>
                  </template>
                </a-input-search>
              </a-input-group>
            </a-col>
            <a-col :span="4" style="padding-top: 2px">
              <a-switch
                v-model:checked="isSimpleMode"
                :style="`background: ${!isSimpleMode ? '#40a9ff' : '#1890ff'}`"
                checked-children="简易模式"
                un-checked-children="专业模式"
                @change="changeMode"
              />
            </a-col>
            <!-- <a-col :span="2" offset="1" style="margin: 8px 15px;">
              <a-button @click="okBtn()">确定</a-button>
              </a-col> -->
            <a-col :span="8">
              <a-tooltip
                placement="topLeft"
                title="没有查询到参数"
                :open="tooltipVisible"
                overlay-class-name="hitek-tooltip"
              >
                <a-input
                  v-model:value="rightName"
                  placeholder="检测参数名称后回车即可高亮显示"
                  @change="rightNameSearch"
                  @press-enter="rightNameSearch"
                />
              </a-tooltip>
            </a-col>
          </a-row>
        </div>
        <div
          class="body-box-content"
          :style="`height: calc(100% - ${warningTextShow ? 88 : 54}px);`"
        >
          <div
            ref="contentLeft"
            class="content-left pt-2"
            :style="`height: calc(100% - ${warningTextShow ? 88 : 54}px);`"
          >
            <a-tree
              id="treeBox"
              v-model:selected-keys="treeSelectedKeys"
              v-model:expanded-keys="expandedKeys"
              :load-data="onLoadData"
              :tree-data="treeData"
              show-icon
              @select="onSelect"
              @right-click="addNote"
            >
              <template #icon="{ dataRef }">
                <ApartmentOutlined v-if="dataRef.treeIcon === 'category'" title="检测大类" />
                <AppstoreOutlined v-else-if="dataRef.treeIcon === 'sampleCategory'" title="样品大类" />
                <InboxOutlined v-else-if="dataRef.treeIcon === 'sample'" title="样品" />
                <FileTextOutlined v-else-if="dataRef.treeIcon === 'sampleDetail'" title="样品详情" />
                <FileUnknownOutlined v-else-if="dataRef.treeIcon === 'other'" title="未定义" />
              </template>
            </a-tree>
            <p
              v-if="isShowTree"
              style="color: #999; text-align: center; padding-top: 50px"
            >
              暂无数据
            </p>
          </div>
          <div
            class="content-right"
            :style="`height: calc(100% - ${warningTextShow ? 88 : 54}px);padding: 10px;`"
          >
            <div class="content-tip">
              <a-button style="margin-right: 10px" @click="highlightSelect">
                选中高亮
              </a-button>当前选中
              <a
                href="javascript:;"
                title="点击查看"
                @click="onCheckParamsList"
              >{{ selectNumber }}</a>
              条
            </div>

            <div class="content-right-table" style="overflow: hidden">
              <a-table
                ref="paramsTable"
                bordered
                :columns="columns"
                :data-source="data"
                row-key="id"
                :row-class-name="rowClassName"
                :pagination="pagination"
                :locale="locale"
                :custom-row="customRow"
                :scroll="{ y: contentLeftHeight }"
              >
                <template #headerCell="{ column }">
                  <template v-if="column.dataIndex === 'checkboxTd'">
                    <input
                      v-model="checkboxAllVal"
                      class="param-checkbox"
                      type="checkbox"
                      :disabled="checkboxAllDisabled"
                      @change="onCheckAll"
                    />
                  </template>
                </template>
                <template #bodyCell="{ column, record, text }">
                  <template v-if="column.dataIndex === 'checkboxTd'">
                    <input
                      v-model="record._checked"
                      class="param-checkbox"
                      type="checkbox"
                    />
                  </template>
                  <template v-if="column.dataIndex === 'displayName'">
                    <span v-if="record.btn">
                      <a href="javascript:" @click="showAllParam">显示所有参数</a>
                    </span>
                    <span
                      v-else
                      :class="{ searchActive: record.isActive }"
                      v-html="replaceUdrChar(text)"
                    ></span>
                  </template>
                  <template v-if="column.dataIndex === 'testParamsSelect'">
                    <div v-if="record._children && record._children.length > 0">
                      <a-select
                        v-model:value="record.testParamsSelectId"
                        style="width: 100%"
                        @click.stop="customRow"
                        @change="handleSelectFun(record.id)"
                      >
                        <a-select-option :key="-1" value="">
                          暂不确定方法
                        </a-select-option>
                        <a-select-option
                          v-for="(item, index) in record._children"
                          :key="index"
                          :value="item.id"
                        >
                          {{ item.displayName }}
                        </a-select-option>
                      </a-select>
                    </div>
                    <div v-else-if="record.btn"></div>
                    <div v-else>
                      无
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'paramNote'">
                    <a-input
                      v-model:value="record.paramNote"
                      style="width: 100%"
                      @click.stop="customRow"
                      @blur="addParamNode(record)"
                    >
                      <template #suffix>
                        <a-tooltip v-if="record._loading">
                          <LoadingOutlined style="color: #1890ff" />
                        </a-tooltip>
                      </template>
                    </a-input>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </div>
      </div>
    </a-spin>

    <!-- <AddNode ref="AddNode" -->
    <!-- v-model="addNodeVisible" -->
    <!-- :record="addNodeRecord" -->
    <!-- @save-success="getNewNode" -->
    <!-- /> -->
    <AddNode
      ref="AddNode"
      v-model:value="addNodeVisible"
      @save-success="getNewNode"
    />

    <ParamsList ref="ParamsList" @on-submit="delSelectedRowKeys"></ParamsList>
  </div>
</template>

<script>
import { ApartmentOutlined, AppstoreOutlined, FileTextOutlined, FileUnknownOutlined, InboxOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import {
  ajaxRequest,
  downloadAccessory,
  replaceUdrChar,
} from '~/providers/common/utils.js'
import { insertTreeNode } from '~/providers/transformUtils/utils'
import AddNode from './addNote.vue'
import ParamsList from './paramsList.vue'

let toolTipTimer = null

// 从url获取指定参数
function getQueryVariable(variable) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1])
    }
  }
  return ''
}

const columns = [
  {
    title: 'checkboxTd',
    dataIndex: 'checkboxTd',
    scopedSlots: { customRender: 'checkboxTd' },
    width: 80,
    align: 'center',
  },
  {
    title: '检测参数',
    dataIndex: 'displayName',
    scopedSlots: { customRender: 'displayName' },
  },
  { title: '参数备注', dataIndex: 'remark', width: '30%' },
  {
    title: '附注',
    dataIndex: 'paramNote',
    width: '20%',
    scopedSlots: { customRender: 'paramNote' },
  },
]
export default {
  name: 'List',
  components: {
    AddNode,
    ParamsList,
    ApartmentOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    FileUnknownOutlined,
    InboxOutlined,
    LoadingOutlined,
  },
  data() {
    return {
      verifyLastlevel: '',
      // 是否是简易模式
      isSimpleMode: top.localStorage.getItem('isSimpleMode') === 'true',
      columns,
      bigCategoryId: getQueryVariable('bigCategoryId') || '', // 大类id
      bigCategoryNames: '', // 当前样品的大类名称拼接
      bigCategoryInfo: [], // 当前样品的大类节点信息
      systemTestSampleId: getQueryVariable('systemTestSampleId') || '', // 样品id
      preSampleId: '', // 上一次样品树id
      sampleId: '', // 本次样品树id
      testUnitTestSampleId: getQueryVariable('testUnitTestSampleId') || '',
      createTest: getQueryVariable('createTest'),
      selectedParamIds: getQueryVariable('selectedParamIds') || [], // 参数默认选中
      selectedRowKeys: getQueryVariable('selectedParamIds').split(',') || [], // 参数默认选中
      paramVersionId: getQueryVariable('paramVersionId') || '',
      level: getQueryVariable('level') || '',
      offlineDataId: getQueryVariable('offlineDataId') || '',
      currentSample: null, // 当前样品
      queryParam: '',
      treeSelectedKeys: [],
      isShowTree: false,
      isSearch: false,
      treeData: [],
      newTreeData: [],
      data: [],
      expandedKeys: [], // 默认展开父节点
      locale: { emptyText: '请选择左侧样品' },
      spinning: false,
      parentNode: {},
      rightName: '', // 右侧检测参数名称
      contentLeftHeight: 200,
      warningTextShow: false,
      testParamsShowAll: getQueryVariable('testParamsShowAll') || undefined, // 用于控制显示所有参数  改善性需求 #20396
      customRow: (record) => {
        return {
          onClick: () => {
            record._checked = !record._checked
            const index = this.selectedRowKeys.indexOf(record.id)

            index === -1
              ? this.selectedRowKeys.push(record.id)
              : this.selectedRowKeys.splice(index, 1)

            this.checkHasSelectAll()
          },
        }
      },
      addNodeVisible: false,
      addNodeRecord: {},
      tooltipVisible: false,
      queryType: 'sample',
      queryTypeTip: {
        sample: '输入样品名称后回车即可查询',
        param: '输入检测参数后回车即可查询',
        standard: '输入规程名称或颁布号后回车即可查询',
        note: '输入附注后回车即可查询',
        defatail: '输入样品/参数名称/附注后回车即可查询',
      },
      checkboxAllDisabled: true,
      checkboxAllVal: false,
      pagination: false,
    }
  },
  computed: {
    selectNumber() {
      const rows = this.getSelectedRow()
      return rows.length
    },
  },
  created() {
    this.getHeight()
    this.changeMode(this.isSimpleMode)

    window.$oAjax({
      url: 'tSBusinessParamController.do?getBusinessParam&key=SELECTED_SAMPLE_LAST_LAYER',
      method: 'get',
    }).then((res) => {
      this.verifyLastlevel = res.obj
    })
  },
  mounted() {
    // 将GetResult方法绑定到window下面，提供给外部调用\
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    window.GetResult = () => {
      return self.okBtn()
    }
  },
  methods: {
    highlightSelect() {
      this.data.forEach((item) => {
        if (item.isActive) {
          item._checked = true
          //  this.selectedParamIds.indexOf(item.id)=='-1'?  this.selectedParamIds.push(item.id):''
          // eslint-disable-next-line ts/no-unused-expressions
          this.selectedRowKeys.indexOf(item.id) == '-1'
            ? this.selectedRowKeys.push(item.id)
            : ''
        }
      })
    },
    replaceUdrChar,
    // 删除选中项
    delSelectedRowKeys(arr) {
      this.selectedRowKeys = this.selectedRowKeys.filter(
        item => !arr.includes(item),
      )
      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i]
        if (this.selectedRowKeys.includes(item.id)) {
          item._checked = true
        }
        else {
          item._checked = false
        }
      }
      this.checkHasSelectAll()
    },
    // 检查是否选中了所有
    checkHasSelectAll() {
      const f = this.data.filter(item => item._checked === false)
      if (f.length > 0) {
        this.checkboxAllVal = false
      }
      else {
        this.checkboxAllVal = true
      }
    },
    // 选中/取消全部
    onCheckAll(e) {
      const checked = e.target.checked
      for (let i = 0; i < this.data.length; i++) {
        this.data[i]._checked = checked
      }

      const curRowKeys = this.data.map(item => item.id)
      if (checked) {
        // eslint-disable-next-line array-callback-return
        curRowKeys.map((item) => {
          !this.selectedRowKeys.includes(item)
          && this.selectedRowKeys.push(item)
        })
      }
      else {
        this.selectedRowKeys = this.selectedRowKeys.filter(
          item => !curRowKeys.includes(item),
        )
      }
    },
    // 查看选择的参数列表
    onCheckParamsList() {
      if (this.selectNumber === 0) {
        return
      }
      const rows = this.data.filter(item =>
        this.selectedRowKeys.includes(item.id),
      )
      this.$refs.ParamsList.onOpen(rows)
    },
    handleSelectFun(val) {
      !this.selectedRowKeys.includes(val) && this.selectedRowKeys.push(val)
    },
    changeMode(mode) {
      // 将是否简易收样缓存在本地
      top.localStorage.setItem('isSimpleMode', mode)

      // 初始化页面信息
      this.data = []
      this.treeData = []

      this.bigCategoryId = getQueryVariable('bigCategoryId') || ''
      this.systemTestSampleId = getQueryVariable('systemTestSampleId') || ''
      this.preSampleId = ''
      this.sampleId = ''
      this.testUnitTestSampleId = getQueryVariable('testUnitTestSampleId') || ''
      this.createTest = getQueryVariable('createTest')
      this.selectedParamIds = getQueryVariable('selectedParamIds') || []
      this.selectedRowKeys
        = getQueryVariable('selectedParamIds').split(',') || []
      this.paramVersionId = getQueryVariable('paramVersionId') || ''
      this.currentSample = null
      this.queryParam = ''
      this.treeSelectedKeys = []
      this.isShowTree = false
      this.isSearch = false
      this.treeData = []
      this.newTreeData = []
      this.data = []
      this.expandedKeys = []

      if (mode === true) {
        this.isSimpleMode = true
        this.columns = [
          {
            dataIndex: 'checkboxTd',
            scopedSlots: { customRender: 'checkboxTd' },
            width: 60,
            align: 'center',
          },
          {
            title: '检测参数',
            dataIndex: 'displayName',
            scopedSlots: { customRender: 'displayName' },
          },
          {
            title: '检测参数方法',
            dataIndex: 'testParamsSelect',
            scopedSlots: { customRender: 'testParamsSelect' },
          },
          { title: '参数备注', dataIndex: 'remark', width: '30%' },
          {
            title: '附注',
            dataIndex: 'paramNote',
            width: '20%',
            scopedSlots: { customRender: 'paramNote' },
          },
        ]
      }
      else {
        this.isSimpleMode = false
        this.columns = [
          {
            dataIndex: 'checkboxTd',
            scopedSlots: { customRender: 'checkboxTd' },
            width: 60,
            align: 'center',
          },
          {
            title: '检测参数',
            dataIndex: 'displayName',
            scopedSlots: { customRender: 'displayName' },
          },
          { title: '参数备注', dataIndex: 'remark', width: '30%' },
          {
            title: '附注',
            dataIndex: 'paramNote',
            width: '20%',
            scopedSlots: { customRender: 'paramNote' },
          },
        ]
      }
      this.getTreeData()
    },
    // 添加附注
    addNote(data) {
      if (
        data
        && data.node
        && data.node
        && data.node.attributes
        && data.node.attributes.isSample == '1'
      ) {
        this.addNodeRecord = JSON.stringify(data.node)
        this.addNodeVisible = true
        this.$refs.AddNode.showModal(this.addNodeRecord)
      }
    },
    async addParamNode(row) {
      row._loading = true

      const res = await window.$oAjax({
        method: 'POST',
        url: window.$oApi.selectSample.addParamNode,
        data: {
          id: row.id,
          paramNote: row.paramNote,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.code !== 20000) {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
      row._loading = false
    },
    getNewNode(node) {
      this.setNodeInTree(node, this.treeData)
      window.$oForceUpdate()
    },
    setNodeInTree(node, data) {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (node.id === data[i].id) {
            data[i].title = node.sampleNote
              ? `${data[i].text}(${node.sampleNote})`
              : data[i].text
            if (data[i].attributes) {
              data[i].attributes.sampleNote = node.sampleNote
            }
            else {
              data[i].attributes = {
                sampleNote: node.sampleNote,
              }
            }
            break
          }

          if (data[i].children && data[i].children.length > 0) {
            this.setNodeInTree(node, data[i].children)
          }
        }
      }
    },
    ajaxRequest,
    downloadAccessory,
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getHeight() {
      window.$oNextTick(() => {
        this.contentLeftHeight
          = this.$refs.contentLeft.offsetHeight - 42 - 60 - 32
      })
    },
    expandedKeysFun(data) {
      if (!Array.isArray(data)) {
        return
      }
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let arr2 = []
        if (data[i].children && Array.isArray(data[i].children)) {
          arr2 = this.expandedKeysFun(data[i].children)
          arr = arr.concat(arr2)
        }
        arr.push(data[i].id)
      }
      return arr
    },
    storeCapable() {
      try {
        window.localStorage.setItem('localStorage', 'capable')
        window.localStorage.removeItem('localStorage')
        return true
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        return false
      }
    },

    // 提交数据
    okBtn() {
      if (
        !this.currentSample
        || document.getElementsByClassName('ant-tree-treenode-selected').length
        == 0
      ) {
        return null
      }
      const isLastStep = document
        .getElementsByClassName('ant-tree-treenode-selected')[0]
        .getElementsByClassName('ant-tree-switcher')[0]
        .getElementsByTagName('i')
        .length
      if (isLastStep && this.verifyLastlevel == 'Y') {
        // window.$oAntdModal.warning(window.$oMsgTips.info('当前样品未选择至样品最后一级'));
        return '1'
      }
      if (this.selectedRowKeys.join(',').length == 0) {
        return '2'
      }
      // 编辑时未作任何修改时与新增未选参数逻辑冲突（非空验证）， 故注释 - 不传样品、参数接口报错，故改为必选
      // if (
      //   this.currentSample.id === getQueryVariable('testUnitTestSampleId')
      //   && this.selectedRowKeys.join(',')
      //   === getQueryVariable('selectedParamIds')
      //   && !this.offlineDataId
      //   && !this.isSimpleMode
      // ) {
      //   return false
      // }
      if (this.storeCapable) {
        const localStorId = {
          '#bigCategory .tree-node-selected': {
            'node-id': this.currentSample.bigCategoryId,
          },
          '#sample .tree-node-selected': {
            'node-id': this.currentSample.sampleId,
          },
        }
        localStorage.setItem('consign-editSample', JSON.stringify(localStorId))
      }
      const res = {}
      res.bigCategoryId = this.bigCategoryId
      res.bigCategoryNames = this.bigCategoryNames
      res.bigCategoryInfo = this.bigCategoryInfo
      res.systemTestSampleId = this.currentSample.SystemId || ''
      res.testUnitTestSampleId = this.currentSample.id || ''
      res.Sample = this.currentSample
      // res.Sample = this.samplefun(this.currentSample);
      res.nodes = this.findSampleIds(
        this.currentSample.id,
        this.currentSample.ParentSampleList,
      )
      // res.selectedParamIds = this.selectedRowKeys;
      res.selectedParamIds = this.getSelectedRow()
      res.testItemIds = this.getSelectedParamTestItemId()
      res.rootNode = this.getRootSample()

      if (this.testParamsShowAll !== undefined) {
        res.testParamsShowAll = true
      }

      const rows = this.data.filter(item =>
        this.selectedRowKeys.includes(item.id),
      )
      if (this.isSimpleMode === true) {
        // eslint-disable-next-line array-callback-return
        rows.map((item) => {
          if (item._children && item._children.length > 0) {
            if (item.testParamsSelectId) {
              res.selectedParamIds.push(item.testParamsSelectId)
              res.selectedParamIds = res.selectedParamIds.filter(
                j => j !== item.id,
              )
            }
            // res.selectedParamIds.push(
            //   item.testParamsSelectId || item._children[0].id
            // );
          }
        })
      }

      return res
    },
    getSelectedRow() {
      const arr = []
      if (this.selectedRowKeys.length === 0) {
        return arr
      }
      // eslint-disable-next-line array-callback-return
      this.selectedRowKeys.map((item) => {
        const objIndex = this.data.findIndex(itemAll => itemAll.id === item)
        if (objIndex > -1) {
          arr.push(item)
        }
      })
      return arr
    },
    getSelectedParamTestItemId() {
      if (this.selectedRowKeys.length === 0) {
        return []
      }
      const testItemIds = this.selectedRowKeys.map((id) => {
        const param = this.data.find(param => param.id === id)
        if (param) {
          return param.testItemId
        }
        return null
      })
      return this.distinct(testItemIds)
    },
    distinct(arr) {
      const d = []
      arr
        .filter(a => !!a)
        .forEach((a) => {
          if (!d.includes(a)) {
            d.push(a)
          }
        })
      return d
    },
    getRootSample() {
      const rootNode = {}
      let root = {}
      if (
        this.currentSample.ParentSampleList
        && this.currentSample.ParentSampleList.length > 0
      ) {
        const sl = this.currentSample.ParentSampleList
        root = sl[sl.length - 1]
        rootNode.systemId = root.attributes.systemId
      }
      else {
        root = this.currentSample
        rootNode.systemId = this.currentSample.SystemId
      }
      rootNode.id = root.id
      rootNode.name = root.text
      return rootNode
    },
    showAllParam() {
      this.testParamsShowAll = true
      this.getData()
    },
    // 获取检测参数
    getData() {
      const isChangeSample = getQueryVariable('testUnitTestSampleId') !== this.sampleId
      const data = {
        sampleId: this.sampleId,
        bigCategoryId: this.bigCategoryId,
        testParamsId: isChangeSample ? '' : this.selectedParamIds,
      }
      this.spinning = true
      if (this.createTest === '1') {
        data.queryScope = 2
      }

      if (this.testParamsShowAll) {
        data.showAll = this.testParamsShowAll
      }

      // 是否简易模式
      if (this.isSimpleMode === true) {
        data.isTree = true
      }

      window.$oAjax
        .get(window.$oApi.selectSample.getParams, {
          params: {
            ...data,
          },
        })
        .then((res) => {
          this.spinning = false

          if (
            res.code === 20000
            && Array.isArray(res.data)
            && res.data.length > 0
          ) {
            // 数据超过200时，显示分页
            if (res.data.length >= 200) {
              this.pagination = {
                current: 1,
                onChange: (page) => {
                  this.pagination.current = page
                },
                pageSize: 50,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]} - ${range[1]} 共 ${total} 条`,
              }
            }
            else {
              this.pagination = false
            }

            this.checkboxAllDisabled = false
            // orderNum displayName
            const orderNumData = []
            const displayNameData = []
            const nameSort = res.data.sort((a, b) =>
              a.displayName.localeCompare(b.displayName, 'zh-Hans-CN', {
                sensitivity: 'accent',
              }),
            )
            // this.data = nameSort;
            // eslint-disable-next-line array-callback-return
            nameSort.map((item) => {
              const _obj = {
                ...item,
                _loading: false,
                _checked: this.selectedRowKeys.includes(item.id),
              }
              if (this.isSimpleMode === true) {
                if (_obj.children && _obj.children.length > 0) {
                  _obj.testParamsSelectAllIds = _obj.children.map(i => i.id)
                  if (getQueryVariable('selectedParamIds')) {
                    const key = this.selectedRowKeys.find(x =>
                      _obj.testParamsSelectAllIds.includes(x),
                    )
                    _obj.testParamsSelectId = key || ''
                  }
                  else {
                    _obj.testParamsSelectId = ''
                  }
                }
                _obj._children = [...(_obj.children || [])]
                _obj.children = null
              }

              if (_obj.orderNum) {
                orderNumData.push(_obj)
              }
              else {
                displayNameData.push(_obj)
              }
            })
            const orderSort = [...orderNumData].sort(this.compareObj('orderNum'))
            // 任务或新需求 #21152 屏蔽显示所有参数
            // let btnObj = {
            //   btn: true,
            //   displayName: "",
            //   disabled: true,
            //   _disabled: true,
            // }
            this.data = [...orderSort, ...displayNameData]
            // 任务或新需求 #21152 屏蔽显示所有参数
            // if (this.testParamsShowAll === undefined) {
            //   this.data.push(btnObj);
            //   window.$oNextTick(()=>{
            //     let eles = this.$refs.paramsTable.$el.getElementsByClassName("ant-checkbox-wrapper");
            //     eles[eles.length - 1].style.display = "none";
            //   });
            // }
            // 存在用户手动勾选的检测参数时也需要执行该逻辑，不然会导致新增时切换样品初始化参数列表后用户勾选的参数列表展示勾选状态，实则已经处于未勾选状态
            const flagSelected
              = getQueryVariable('selectedParamIds')
                || this.selectedRowKeys.length > 0
            if (flagSelected) {
              // eslint-disable-next-line array-callback-return
              this.data.map((j) => {
                // eslint-disable-next-line array-callback-return
                this.selectedRowKeys.map((k) => {
                  if (
                    j.testParamsSelectAllIds
                    && j.testParamsSelectAllIds.length > 0
                    && j.testParamsSelectAllIds.includes(k)
                    && !this.selectedRowKeys.includes(j.id)
                  ) {
                    this.selectedRowKeys.push(j.id)
                  }
                })
              })
            }

            // eslint-disable-next-line ts/no-unused-expressions
            flagSelected || this.testParamsShowAll
              ? ''
              : (this.selectedRowKeys = [])
          }
          else {
            this.pagination = false
            this.checkboxAllDisabled = true
            this.data = []
          }

          this.checkHasSelectAll()
        })
    },
    // 对象排序
    compareObj(prop) {
      return function (obj1, obj2) {
        let val1 = obj1[prop]
        let val2 = obj2[prop]
        // eslint-disable-next-line unicorn/prefer-number-properties
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          return -1
        }
        else if (val1 > val2) {
          return 1
        }
        else {
          return 0
        }
      }
    },
    // 获取样品树
    getSampleData() {
      const data = {
        bigCategoryId: this.bigCategoryId,
        sampleId: getQueryVariable('testUnitTestSampleId') || '',
      }
      if (this.createTest === '1') {
        data.queryScope = 2
      }
      if (this.isSearch) {
        data.queryName = this.queryParam
        data.queryType = this.queryType
      }
      this.spinning = true
      return new Promise((resolve) => {
        // 是否简易模式
        if (this.isSimpleMode === true) {
          data.isSimplePattern = true
        }
        const res = window.$oAjax.get(window.$oApi.testResultStatistic.getSampleData, {
          timeout: 8 * 60 * 1000,
          params: {
            ...data,
          },
        })
        resolve(res) // 返回值
      })
    },
    // 懒加载
    onLoadData(treeNode, isloadSample) {
      this.spinning = true
      const newTreeNode = isloadSample ? treeNode : treeNode
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      this.bigCategoryId = newTreeNode && newTreeNode.id
      return new Promise((resolve) => {
        if (getQueryVariable('bigCategoryId') && !this.bigCategoryId) {
          self.fristSampleData(self.newTreeData)
          this.spinning = false
          resolve()
          return
        }
        if (
          newTreeNode
          && newTreeNode.children
          && newTreeNode.children.length > 0
        ) {
          this.spinning = false
          resolve()
          return
        }
        // setTimeout(() => {
        self.getSampleData().then((data) => {
          top.getSampleComboTreeByBigCategory = data
          newTreeNode.children = self.renderTreeNodes(
            data,
            newTreeNode.id,
            'sampleId',
            'bigCategoryId',
          )
          insertTreeNode(self.treeData, treeNode.id, newTreeNode.children)

          // 回显时，加入展开key
          if (isloadSample && this.testUnitTestSampleId) {
            this.expandedKeys.push(...this.getAllParentIds([newTreeNode], this.testUnitTestSampleId))
          }

          if (getQueryVariable('bigCategoryId') && !this.isSearch) {
            self.fristSampleData(self.newTreeData)
          }
          else if (this.isSearch && this.queryParam) {
            const arr = this.expandedKeysFun(newTreeNode.children)
            this.expandedKeys.push(...arr)
          }
          else {
            self.treeData = [...self.treeData]
          }
          this.spinning = false
        })
        resolve()
        // }, 1000)
      })
    },
    // 获取大类树
    getTreeData() {
      const data = {
        page: 1,
        size: 9999,
        queryParam: this.queryParam,
        queryType: this.queryType,
      }
      this.treeData = []
      this.spinning = true
      let url = window.$oApi.selectSample.getTree
      if (this.queryParam) {
        url = 'bigCategoryController.do?comboTreeSyncByName'
        url += `&name=${encodeURI(encodeURI(this.queryParam))}`
      }
      // 是否简易模式
      if (this.isSimpleMode === true) {
        url += '&isSimplePattern=true'
      }
      if (this.createTest === '1') {
        data.queryScope = 2
      }
      if (this.paramVersionId) {
        url += `&paramVersionId=${this.paramVersionId}`
      }
      window.$oAjax
        .get(url, {
          params: {
            ...data,
          },
          timeout: 30000,
        })
        .then(async (res) => {
          this.spinning = false
          if (res && res.length > 0) {
            this.isShowTree = false
            // 默认展开 父节点 /*回显样品*/
            if (
              this.bigCategoryId
              && this.testUnitTestSampleId
              && !this.isSearch
            ) {
              this.sampleId = this.testUnitTestSampleId
              this.newTreeData = await this.renderTreeNodes(
                res,
                '',
                'bigCategoryId',
              )

              const data = this.findnode(this.newTreeData, this.bigCategoryId)
              this.expandedKeys.push(...this.getAllParentIds(this.newTreeData, this.bigCategoryId))
              this.onLoadData(data, true)
              this.getData()
            }
            else if (this.isSearch && this.queryParam) {
              const treeData = await this.renderTreeNodes(
                res,
                '',
                'bigCategoryId',
              )

              this.treeData = treeData
              const arr = this.expandedKeysFun(this.treeData)

              this.expandedKeys = arr
              // this.expandedKeys = [this.treeData[0].id];
            }
            else {
              this.treeData = this.renderTreeNodes(res, '', 'bigCategoryId')
            }
          }
          else {
            this.treeData = []
            this.isShowTree = true
            window.$oAntdModal.warning(window.$oMsgTips.info('暂无数据'))
            this.spinning = false
          }
        })
    },
    getAllParentIds(tree, targetId) {
      const path = [] // 保存当前遍历路径的ID
      let found = false // 标记是否找到目标节点

      // 递归遍历函数
      function traverse(nodes) {
        for (const node of nodes) {
          path.push(node.id)
          if (node.id === targetId) {
            found = true
            return true
          }
          // 递归遍历子节点
          if (node.children && traverse(node.children)) {
            return true
          }
          path.pop()
        }
        return false
      }

      traverse(tree)
      return found ? path.slice(0, -1) : []
    },
    // 数据渲染更改
    renderTreeNodes(data, Pid, treeTypeId, bigCategoryId) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const jsonObj = data
      jsonObj.forEach((item) => {
        Pid && (item.parentId = Pid)
        if (item.attributes && item.attributes.sampleNote) {
          item.text
          && (item.title = `${item.text}(${item.attributes.sampleNote})`)
        }
        else {
          item.text && (item.title = item.text)
        }
        if (item.attributes === null || !isDefined(item.attributes.infoType)) {
          item.treeIcon = 'category'
        }
        else if (
          item.attributes
          && item.attributes.infoType
          && item.attributes.infoType == 1
        ) {
          item.treeIcon = 'sampleCategory'
        }
        else if (
          item.attributes
          && item.attributes.infoType
          && item.attributes.infoType == 2
        ) {
          item.treeIcon = 'sample'
        }
        else if (
          item.attributes
          && item.attributes.infoType
          && item.attributes.infoType == 3
        ) {
          item.treeIcon = 'sampleDetail'
        }
        else {
          item.treeIcon = 'other'
        }

        item.id && (item.key = item.id)
        item[treeTypeId] = item.id

        bigCategoryId && (item[bigCategoryId] = self.bigCategoryId)
        if (
          item.children
          && Array.isArray(item.children)
          && item.children.length > 0
        ) {
          item.children = self.renderTreeNodes(
            item.children,
            item.id,
            treeTypeId,
            bigCategoryId,
          )
        }
        else {
          // 去掉样品树的展开父
          if (bigCategoryId) {
            item.isLeaf = true
          }
        }
      })
      return jsonObj
    },
    // 编辑样品和大类一起回显
    fristSampleData(treeData) {
      const treeRow = this.findnode(treeData, this.testUnitTestSampleId)
      this.warningTextShow = !treeRow
      this.treeData = [...treeData]
      this.treeSelectedKeys.push(this.testUnitTestSampleId)
      // eslint-disable-next-line ts/no-unused-expressions
      treeRow && treeRow.parentId
        ? this.expandedKeys.push(treeRow.parentId)
        : ''
      // eslint-disable-next-line ts/no-unused-expressions
      treeRow ? this.currentSampleData(treeRow) : ''
      this.initOfflineCategory()
    },
    // 组装样品数据
    currentSampleData(treeRow) {
      this.currentSample = treeRow
      this.testUnitTestSampleId = this.currentSample.id
      this.currentSample.SampleLevelStr = this.getSampleLevel()
      this.currentSample.SampleLevelArr = this.getSampleLevel()
      this.currentSample.ParentSampleList = this.getSampleList()
      this.currentSample.SystemId = this.currentSample.attributes
        ? this.currentSample.attributes.systemId
        : ''
      this.currentSample.testUnitTestSampleId = this.currentSample.id
    },
    // 离线数据创建任务时，初始化大类信息
    initOfflineCategory() {
      if (!this.offlineDataId)
        return
      const offlineData = JSON.parse(sessionStorage.getItem(this.offlineDataId))
      const categorys = offlineData.categoryIdTree || []
      const infos = []
      let n = 0
      ;(function _eatch(datas) {
        for (let i = 0; i < datas.length; i++) {
          const item = datas[i]
          if (item.id === categorys[n].id) {
            infos.push({
              id: item.id,
              title: item.title,
              level: n + 1,
            })
            if (n >= categorys.length - 1)
              return
            n++
            _eatch(item.children || [])
          }
        }
      })(this.treeData)
      this.bigCategoryInfo = infos
      this.bigCategoryNames = infos.map(d => d.title).join('-')
    },
    async onSelect(selectedKeys, info) {
      if (info.selected) {
        const treeRow = info.selectedNodes[0]
        const resRoot = await this.getBigCateRootId(treeRow)
        this.setBigCateRootName(info)
        this.bigCategoryId = resRoot.length > 0 ? resRoot[0].id : ''
        // this.bigCategoryId = treeRow.bigCategoryId;

        if (!this.expandedKeys.includes(treeRow.id)) {
          this.expandedKeys.push(treeRow.id)
        }

        if (treeRow.children && treeRow.children.length > 1) {
          const childId = treeRow.children[0].id
          if (!this.expandedKeys.includes(childId)) {
            this.expandedKeys.push(childId)
          }
        }

        if (treeRow.sampleId) {
          this.data = [] // 样品数据
          this.preSampleId = this.sampleId = treeRow.sampleId
          this.currentSampleData(treeRow)
          if (!getQueryVariable('selectedParamIds')) {
            this.testParamsShowAll = undefined
          }
          this.getData()
          // }
        }
        else {
          this.data = [] // 样品数据
          this.currentSample = []
        }
      }
      this.warningTextShow = false
    },
    // 获取样品对应的大类Id
    getBigCateRootId(obj) {
      const res = []
      let dataCru = obj
      let flag = true
      while (flag) {
        // if (dataCru.parentId) {
        if (dataCru.parentId && dataCru.sampleId) {
          dataCru = this.findnode(this.treeData, dataCru.parentId)
        }
        else {
          res.push(dataCru)
          flag = false
        }
      }
      return res
    },
    // 选择节点时，获取大类节点,拼接名称（从根级开始，到点击的节点）
    setBigCateRootName(info) {
      if (!info || !info.node) {
        this.bigCategoryNames = ''
        this.bigCategoryInfo = []
        return
      }
      const pos = info.node.pos
      const levels = pos.split('-')
      const treeData = this.treeData
      const nodes = []
      const count = 1
      ;(function _getNode(count, datas) {
        const level = levels[count]
        const node = datas[level]
        nodes.push(node)
        if (count < levels.length - 1) {
          _getNode(++count, node.children)
        }
      })(count, treeData)
      if (nodes.length === 0)
        return
      let str = ''
      const levelArr = []
      for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i]
        if (item.sampleId)
          continue
        str += str == '' ? item.title : `-${item.title}`
        levelArr.push({
          id: item.id,
          level: i + 1,
          title: item.title,
        })
      }
      this.bigCategoryNames = str
      this.bigCategoryInfo = levelArr
    },

    // 获取父级样品列表
    getSampleList() {
      if (!this.currentSample) {
        return
      }
      const res = []
      let parentNode = this.currentSample
      let flag = true
      while (flag) {
        if (parentNode.parentId) {
          parentNode = this.findPnode(this.treeData, parentNode.parentId)
          if (parentNode && parentNode.sampleId) {
            // 如果有父节点
            res.push(parentNode)
            continue
          }
          flag = false
        }
        else {
          flag = false
        }
      }

      return res
    },
    // 获取样品层级字符串：如 [钢筋-热轧带肋钢筋-HRB400]
    getSampleLevel() {
      if (!this.currentSample) {
        return
      }
      let level = this.currentSample.text
      let parentNode = this.currentSample
      let flag = true
      while (flag) {
        if (parentNode.parentId) {
          parentNode = this.findPnode(this.treeData, parentNode.parentId)
          if (parentNode && parentNode.sampleId) {
            // 如果有父节点并且样品存在
            level = `${parentNode.text}-${level}`
            this.parentNode = parentNode
          }
          else {
            flag = false
          }
        }
        else {
          flag = false
        }
      }
      return `[${level}]`
    },
    // 根据本节点id查找本节点数据
    findnode(data, nodeId) {
      let result
      if (!data) {
        return
      }
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (nodeId === item.id) {
          result = item
          return result
        }
        else if (
          item.children
          && Array.isArray(item.children)
          && item.children.length > 0
        ) {
          // 如果有子集，则把子集作为参数重新执行本方法
          result = this.findPnode(item.children, nodeId)
          // 关键，千万不要直接return本方法，不然即使没有返回值也会将返回return，导致最外层循环中断，直接返回undefined,要有返回值才return才对
          if (result) {
            return result
          }
        }
      }
      return result
    },
    // 根据父节点id查找当前元素数据
    findPnode(data, nodePId) {
      let result
      if (!data) {
        return
      }
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (nodePId === item.id) {
          result = item
          return result
        }
        else if (
          item.children
          && Array.isArray(item.children)
          && item.children.length > 0
        ) {
          // 如果有子集，则把子集作为参数重新执行本方法
          result = this.findPnode(item.children, nodePId)
          // 关键，千万不要直接return本方法，不然即使没有返回值也会将返回return，导致最外层循环中断，直接返回undefined,要有返回值才return才对
          if (result) {
            return result
          }
        }
      }
      return result
    },
    // 查找所有的父级id（样品）
    findSampleIds(id, data) {
      const result = [id]
      if (data && Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].sampleId) {
            result.push(data[i].id)
          }
        }
        return [...result]
      }
      else { /* empty */ }
    },
    quickSearch() {
      this.isSearch = true
      this.data = []
      this.preSampleId = ''
      this.treeSelectedKeys = []
      this.currentSample = null
      this.queryParam = this.queryParam.trim()
      this.expandedKeys = []
      // 快速查询
      this.getTreeData()
    },
    rightNameSearch() {
      this.rightName = this.rightName.trim()

      if (this.data.length > 0) {
        const newData = [...this.data]
        const fristData = []
        const lastData = []
        // eslint-disable-next-line array-callback-return
        newData.map((item) => {
          if (
            this.rightName
            && item.displayName
              .toUpperCase()
              .includes(this.rightName.toUpperCase())
          ) {
            fristData.push({ ...item, isActive: true })
          }
          else {
            lastData.push({ ...item, isActive: false })
          }
        })
        this.data = [...fristData, ...lastData]

        if (
          this.data.filter(item => item.isActive).length == 0
          && this.rightName
        ) {
          if (toolTipTimer) {
            this.tooltipVisible = true
            clearTimeout(toolTipTimer)
            toolTipTimer = null
            toolTipTimer = setTimeout(() => {
              this.tooltipVisible = false
            }, 2000)
          }
          else {
            this.tooltipVisible = true
            toolTipTimer = setTimeout(() => {
              this.tooltipVisible = false
            }, 2000)
          }
        }
        else {
          this.tooltipVisible = false
        }

        window.$oNextTick(() => {
          const dom = $('.content-right-table').find('.ant-table-body')[0]
          dom.scrollTop = 0
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择大类！'))
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
.searchActive {
  color: #f60;
}
.param-checkbox {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-bottom: 2px;
}
.content-tip {
  line-height: 32px;
  margin-bottom: 5px;
  a {
    text-decoration: underline;
  }
}
:deep(.ant-table-pagination.ant-pagination) {
  padding-left: 15px;
}
:deep(.ant-spin-nested-loading > div > .ant-spin) {
  top: 150px;
}
</style>
