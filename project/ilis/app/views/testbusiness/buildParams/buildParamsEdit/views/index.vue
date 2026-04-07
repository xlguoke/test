<template>
  <a-spin :spinning="spinning">
    <div
      class="build-con"
      :style="`height:${winHeight - (pageInto ? 30 : 240)}px;`"
    >
      <a-form ref="formRef" :model="formState">
        <a-form-item
          required
          label="检测大类"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 8 }"
          :rules="[{ required: true, message: '请选择大类' }]"
          name="categoryConcatName"
          class="mb-2"
        >
          <a-input
            v-model:value="formState.categoryConcatName"
            placeholder="请选择检测大类"
            disabled
            read-only
          />
        </a-form-item>
        <a-form-item
          required
          label="参数打包名称"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 8 }"
          :rules="[{ required: true, message: '请输入参数打包名称' }]"
          name="name"
          class="mb-2"
        >
          <a-input
            v-model:value="formState.name"
            placeholder="请输入参数打包名称"
            :disabled="showPage"
          />
        </a-form-item>
        <a-form-item
          label="对预委托可见"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 6 }"
          name="exposed"
          class="mb-2"
        >
          <a-switch
            v-model:checked="formState.exposed"
            checked-children="是"
            un-checked-children="否"
            :disabled="showPage"
          />
        </a-form-item>
      </a-form>
      <p class="hint-text">
        注：打包项应用到当前所选样品层级后，在委托收样中该层级及下级层级可使用该打包项
      </p>
      <a-layout style="width: 100%; height: calc(100% - 160px)">
        <a-layout-sider width="350" style="background-color: var(--colorBgContainer);">
          <div class="sample-box">
            <p class="sub-title">
              适用样品层级：
              <span
                v-if="!showPage"
                class="sample-name"
                @click="openSampleLevel"
              >
                选择
                <CaretDownOutlined />
              </span>
            </p>
            <div class="sample-list">
              <a-tree
                v-if="renderSampleTree.length > 0"
                :tree-data="renderSampleTree"
                :default-expand-all="true"
              />
            </div>
          </div>
        </a-layout-sider>

        <a-layout-content>
          <div id="rule-box" class="rule-box">
            <p class="sub-title">
              检测参数与规程：
            </p>
            <a-table
              :key="refreshTable"
              :pagination="false"
              :columns="columns"
              :data-source="tableData"
              bordered
              :scroll="{ y: 180 }"
            >
              <template #bodyCell="{ column, record, text, index }">
                <template v-if="column.dataIndex === 'basis'">
                  <EditCell
                    :list="text"
                    :is-edit="!showPage"
                    :show-clause-code="displayClauseCode"
                    @edit="
                      () => {
                        editParamsTable('basis', record, index)
                      }
                    "
                  />
                </template>
                <template v-if="column.dataIndex === 'standards'">
                  <EditCell
                    :list="text"
                    :is-edit="!showPage"
                    @edit="
                      () => {
                        editParamsTable('standards', record, index)
                      }
                    "
                  />
                </template>
                <template v-if="column.dataIndex === 'handle'">
                  <span v-if="showPage">-</span>
                  <a v-else href="#" class="text-red-500" title="删除" @click="deleteParamRow(index)">
                    删除
                  </a>
                </template>
              </template>
            </a-table>
            <p
              v-if="!showPage && sampleParamsObj.bigCategoryId"
              class="add-param-btn"
              title="选择参数"
              @click="$refs.paramList.showModal()"
            >
              <PlusCircleOutlined />
            </p>
          </div>
        </a-layout-content>
      </a-layout>
      <!-- 参数规程 -->
      <ht-modal
        v-model:open="visibleSample"
        width="80%"
        :dialog-style="{ top: '50px' }"
        :mask-closable="false"
        title="选择参数规程"
        @ok="chooseSample"
        @cancel="closeSample"
      >
        <div class="sample-wrap" :style="`height:${winHeight - 240}px;`">
          <SampleQuery
            :key="refresh"
            :category-id="sampleParamsObj.bigCategoryId"
            :params-keys="paramsKeys"
            :test-sample-id="sampleParamsObj.testUnitTestSampleId"
          />
        </div>
      </ht-modal>
      <!-- 应用到其他参数 -->
      <ht-modal
        v-model:open="otherParamsModal"
        :z-index="3000"
        width="400px"
        :mask-closable="false"
        title="应用到其他参数"
        class="sample-level"
        @cancel="closeOtherModal"
        @ok="onUseOther"
      >
        <div
          class="modal-warp other-params"
          :style="`height:${winHeight - (pageInto ? 300 : 350)}px`"
        >
          <template v-if="otherParams.length > 0">
            <a-checkbox
              :checked="otherIsAll"
              :indeterminate="indeterminate"
              @change="changeAll"
            >
              全选
            </a-checkbox>
            <a-checkbox-group
              v-model:value="otherKeys"
              style="margin-left: 20px"
              name="checkboxgroup"
              :options="otherParams"
              @change="changeParams"
            />
          </template>
          <p v-else class="no-other-param">
            暂无待应用的其他参数
          </p>
        </div>
      </ht-modal>
      <!-- 样品层级 -->
      <SampleLevel
        ref="sampleLevel"
        :sample-tree="sampleTree"
        :sample-default-keys="sampleDefaultKeys"
        @get-sample="initSampleLevel"
      />
      <!-- 参数 -->
      <ParamList
        v-if="sampleParamsObj.bigCategoryId || tableData.length > 0"
        ref="paramList"
        :keys="paramsKeys"
        :big-category-id="sampleParamsObj.bigCategoryId"
        @get-params="getParamsDatas"
      />
      <!-- 试验依据和评定标准 -->
      <TestParams
        v-if="tableData.length > 0"
        ref="testParams"
        :edit-type="rowEditType"
        :row-edit-row="rowEditRow"
        @get-test-params="getTestParamsDatas"
        @use-ther-params="useTherParams"
      />
    </div>
  </a-spin>
</template>

<script>
import { CaretDownOutlined, PlusCircleOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import SampleQuery from '~/providers/components/sampleQuery/index.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import EditCell from './components/EditCell.vue'
import ParamList from './components/ParamList.vue'
import SampleLevel from './components/SampleLevel.vue'
import TestParams from './components/TestParams.vue'

export default {
  name: 'BuildParamsEdit',
  components: {
    SampleQuery,
    SampleLevel,
    ParamList,
    EditCell,
    TestParams,
    CaretDownOutlined,
    PlusCircleOutlined,
  },
  props: ['editId', 'showPage'],
  emits: ['closeEdit'],
  data() {
    return {
      visibleSample: false,
      otherParamsModal: false,
      refresh: '',
      refreshTable: '',
      spinning: false,
      winHeight: document.body.clientHeight,
      pageInto: false,
      fields: ['categoryConcatName', 'name'],
      columns: [
        { title: '检测参数', dataIndex: 'displayName', key: 'displayName' },
        { title: '参数备注', dataIndex: 'remark', key: 'remark' },
        {
          title: '试验依据',
          dataIndex: 'basis',
          key: 'basis',
        },
        {
          title: '评定标准',
          dataIndex: 'standards',
          key: 'standards',
        },
        {
          title: '操作',
          key: 'handle',
          dataIndex: 'handle',
          width: 70,
        },
      ],
      scroll: { y: this.winHeight - (this.pageInto ? 350 : 500) },
      tableData: [],
      formState: {},
      sampleTree: [], // 样品数据
      renderSampleKey: '',
      renderSampleTree: [], // 适用样品层级显示的样品数据
      sampleDefaultKeys: [], // 默认选中的样品
      paramsKeys: [], // 选择的参数ids
      sampleParamsObj: {}, // 选择的大类和参数数据
      rowEditType: 'basis', // basis-试验依据 standards-评定标准
      rowEditRow: {}, // 当前编辑规程对应的行数据
      otherParams: [], // 其他参数的数据
      otherIsAll: false,
      otherKeys: [], // 已勾选的其他参数
      useOtherStandard: [], // 待应用到其他参数的规程数据
      indeterminate: false,
      displayClauseCode: true, // 选择规程时是否显示条款号
    }
  },
  mounted() {
    // 获取系统控制参数，选择规程时是否显示条款号
    window.$oAjax({
      url: 'tSBusinessParamController.do?getBusinessParam&key=OTHER_9',
      method: 'get',
    }).then((res) => {
      this.displayClauseCode = res.obj === 'Y'
    })
    this.initPageData()
    window.SaveParams = callback => this.save(callback)
  },
  methods: {
    initPageData() {
      const pageInto = getQueryVariable('pageInto')
      window.pageInfo = this.pageInto = pageInto == 1
      if (pageInto == 1) {
        this.getEditSamplePageData()
        return
      }
      if (this.editId) {
        this.getDataSource()
      }
      else {
        this.visibleSample = true
      }
    },
    // 从添加(编辑)收样信息页面打开
    getEditSamplePageData() {
      let buildParamsObj = sessionStorage.getItem('buildParamsObj')
      buildParamsObj = buildParamsObj ? JSON.parse(buildParamsObj) : {}
      // 表单
      if (buildParamsObj.categoryConcatName) {
        this.formState.categoryConcatName = buildParamsObj.categoryConcatName
      }
      else {
        this.getBigCategoryTree(buildParamsObj.bigCategoryId)
      }
      // 大类ID
      this.sampleParamsObj.bigCategoryId = buildParamsObj.bigCategoryId
      // 样品
      this.sampleDefaultKeys = [buildParamsObj.sampleId]
      this.getSampleTree(true)
      // 参数
      this.formatParamsOrStandard(buildParamsObj.params)
    },
    // 获取大类树
    getBigCategoryTree(bigCategoryId) {
      window.$oAjax
        .get('bigCategoryController.do?comboTreeSyncByName&name=', {
          params: {
            page: 1,
            size: 9999,
            queryParam: '',
            queryType: 'sample',
          },
        })
        .then((res) => {
          const tree = res && res.length > 0 ? res : []
          const path = ''
          let pathStr = ''
          ;(function findById(tree, id, path) {
            for (let i = 0; i < tree.length; i++) {
              let tempPath = path
              tempPath = tempPath ? `${tempPath}-${tree[i].text}` : tree[i].text
              if (tree[i].id == id) {
                pathStr = tempPath
                return tempPath
              }
              else {
                if (!tree[i].children || tree[i].children.length == 0)
                  continue
                const result = findById(tree[i].children, id, tempPath)
                if (result)
                  return result
              }
            }
          })(tree, bigCategoryId, path)

          this.formState.categoryConcatName = pathStr
        })
    },
    // 整理“收样信息”页面获取的检测参数与规程数据
    formatParamsOrStandard(dataList) {
      if (dataList.length === 0)
        return
      const mapData = (list, _type) => {
        const newList = list.filter(
          d => d.baseStandardUseType == '3' || d.baseStandardUseType == _type,
        )
        if (newList.length == 0)
          return []
        return newList.map((d) => {
          return {
            // baseStandardId: d.baseStandardId,
            // 后端调整：该字段使用id进行处理
            baseStandardId: d.id,
            name: d.baseStandardName,
            publishCode: d.publishCode,
            executeDate: d.executeDate,
            type: _type,
            uniqKey: d.uniqKey || d.uniqueKey,
            clauseCode: d.clauseCode,
          }
        })
      }
      for (let i = 0; i < dataList.length; i++) {
        const item = dataList[i]
        const basis = mapData(item.useStandards, '1')
        const standards = mapData(item.useStandards, '2')
        item.key = item.id
        // eslint-disable-next-line no-self-assign
        item.id = item.id
        // eslint-disable-next-line no-self-assign
        item.displayName = item.displayName
        // eslint-disable-next-line no-self-assign
        item.remark = item.remark
        item.basis = basis
        item.standards = standards
        this.paramsKeys.push(item.id)
      }
      this.tableData = dataList
    },
    // 编辑时，获取详情数据
    getDataSource() {
      this.spinning = true
      window.$oAjax
        .get(`${window.$oApi.buildParams.editById}/${this.editId}`)
        .then((res) => {
          const data = res.data
          this.sampleParamsObj.bigCategoryId = data.categoryId
          // 大类名称
          this.formState.categoryConcatName = data.categoryConcatName
          this.formState.name = data.name
          this.formState.exposed = data.exposed
          // 样品层级keys
          this.sampleDefaultKeys = data.samples.map(d => d.sampleId)
          this.initParamsDatas(data.entries)
          this.getSampleTree(true)
          this.spinning = false
        })
    },
    // 初始化检测参数与规程数据
    initParamsDatas(dataList) {
      if (dataList.length === 0)
        return
      const mapData = (list) => {
        if (!list || list.length == 0)
          return []
        return list.map((d) => {
          return {
            baseStandardId: d.baseStandard.standardId,
            name: d.baseStandard.standardName,
            publishCode: d.baseStandard.publishCode,
            executeDate: d.baseStandard.executeDate,
            type: d.type,
            clauseCode: d.clauseCode,
          }
        })
      }
      for (let i = 0; i < dataList.length; i++) {
        const item = dataList[i]
        const basis = mapData(item.basis)
        const standards = mapData(item.standards)
        item.key = item.id
        item.id = item.param.id
        item.displayName = item.param.displayName
        item.remark = item.param.remark
        item.basis = basis
        item.standards = standards
        this.paramsKeys.push(item.param.id)
      }
      this.tableData = dataList
    },
    openSampleModal() {
      if (this.editId)
        return
      this.visibleSample = true
      // this.refresh = new Date().getTime()
    },
    // 获取样品层级数据
    getSampleTree(load) {
      return new Promise((resolve) => {
        const bigCategoryId = this.sampleParamsObj.bigCategoryId
        window.$oAjax({
          url: window.$oApi.selectSample.getSampleData,
          method: 'GET',
          params: {
            bigCategoryId,
          },
        }).then((res) => {
          if (!res || res.length === 0) {
            this.sampleTree = []
            return
          }
          ;(function _initTree(list) {
            for (let i = 0; i < list.length; i++) {
              list[i].title = list[i].text
              list[i].key = list[i].id
              if (list[i].children && list[i].children.length > 0) {
                _initTree(list[i].children)
                continue
              }
              list[i].children = undefined
            }
          })(res)
          this.sampleTree = res

          load && this.initSampleLevel()
          resolve(res)
        })
      })
    },
    // 选择大类及参数
    chooseSample() {
      const data = window.GetResult()
      if (!data) {
        window.$oAntdMessage.warning('请选择大类')
        return
      }
      if (data.selectedParamIds.length === 0) {
        window.$oAntdMessage.warning('请选择参数')
        return
      }

      // 大类名称
      this.formState.categoryConcatName = data.bigCategoryNames
      this.sampleDefaultKeys = [data.testUnitTestSampleId]
      this.sampleParamsObj = data
      this.visibleSample = false
      this.getParamsList()
      this.getSampleTree(true)
    },
    closeSample() {
      $emit(this, 'closeEdit')
    },
    // 加载参数数据
    getParamsList() {
      const { bigCategoryId, testUnitTestSampleId, selectedParamIds }
        = this.sampleParamsObj
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.consignList.getParams,
        method: 'GET',
        params: {
          sampleId: testUnitTestSampleId,
          bigCategoryId,
        },
      }).then((res) => {
        this.spinning = false
        let list = res || []
        if (list.length > 0) {
          list = this.formatParamsData(selectedParamIds, list)
        }
        this.tableData = list
      })
    },
    /*
     *   检测参数与规程表格数据处理
     *   @params
     *       keys    Array    选中参数的id集合
     *       datas   Array    参数列表数据
     *   @return  Array   检测参数与规程表格数据
     * */
    formatParamsData(keys, datas) {
      const list = datas.filter(d => keys.includes(d.id))
      for (let i = 0; i < list.length; i++) {
        const useStandards = list[i].useStandards
        list[i].key = list[i].id
        list[i].basis = []
        list[i].standards = []
        if (!useStandards || useStandards.length === 0)
          continue
        for (let j = 0; j < useStandards.length; j++) {
          const item = useStandards[j]
          if (item.baseStandardUseType == '0')
            continue
          if (
            item.baseStandardUseType == '1'
            || item.baseStandardUseType == '3'
          ) {
            list[i].basis.push({
              baseStandardId: item.baseStandardId,
              name: item.baseStandardName,
              type: '1',
              publishCode: item.publishCode,
              clauseCode: item.clauseCode,
            })
          }
          else if (
            item.baseStandardUseType == '2'
            || item.baseStandardUseType == '3'
          ) {
            list[i].standards.push({
              baseStandardId: item.baseStandardId,
              name: item.baseStandardName,
              type: '2',
              publishCode: item.publishCode,
              clauseCode: item.clauseCode,
            })
          }
        }
        this.paramsKeys.push(list[i].id)
      }
      return list
    },
    // 根据大类选择参数
    getParamsDatas(obj) {
      const oldList = this.tableData
      const oIds = oldList.map(d => d.id)
      const list = obj.datas.filter(d => !oIds.includes(d.id))
      if (list.length === 0)
        return
      for (let i = 0; i < list.length; i++) {
        list[i].key = list[i].id
        list[i].basis = []
        list[i].standards = []
      }
      this.paramsKeys = oIds.concat(obj.ids)
      this.tableData = oldList.concat(list)
    },
    // 处理需要显示的样品层级【只显示选择的样品层级】
    initSampleLevel(keys) {
      keys && (this.sampleDefaultKeys = keys)
      const cKeys = [...this.sampleDefaultKeys]
      if (cKeys.length === 0)
        return
      const renderTree = JSON.parse(JSON.stringify(this.sampleTree))
      ;(function _findNode(treeData) {
        for (let i = treeData.length - 1; i >= 0; i--) {
          const item = treeData[i]
          if (item.children) {
            _findNode(item.children)
          }
          const isCheck = cKeys.includes(item.id)
          item.checked = isCheck
          if (!isCheck && (!item.children || item.children.length === 0)) {
            treeData.splice(i, 1)
          }
        }
      })(renderTree)
      this.renderSampleTree = renderTree
      this.renderSampleKey = new Date().getTime()
    },
    // 选择样品层级
    openSampleLevel() {
      const formObj = { ...this.formState }
      if (!formObj.categoryConcatName) {
        return window.$oAntdMessage.warning('请先选择大类')
      }
      this.$refs.sampleLevel.showModal()
    },
    // 保存
    save(callback, completeCallback) {
      this.$refs.formRef.validateFields().then(() => {
        const _form = { ...this.formState }
        if (!_form.name || !_form.categoryConcatName)
          return
        _form.exposed = !!_form.exposed
        _form.categoryId = this.sampleParamsObj.bigCategoryId
        // 参数打包详情
        _form.entries = this.formatEntries()
        // 适用样品
        _form.samples = this.formatSamples()
        if (_form.samples.length === 0) {
          return window.$oAntdMessage.warning('请选择至少选择一个样品层级')
        }
        if (this.tableData.length === 0) {
          return window.$oAntdMessage.warning('请选择至少选择一个参数')
        }
        const method = this.editId ? 'put' : 'post'

        if (this.editId) {
          _form.id = this.editId
        }

        window.$oAjax[method](window.$oApi.buildParams.update, _form, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(
          (res) => {
            if (res.code !== 20010) {
              if (callback) {
                callback()
              }
            }
            else {
              Modal.error({
                title: '提示',
                content: res.message,
              })
            }
          },
        ).finally(() => {
          if (completeCallback) {
            completeCallback()
          }
        })
      }).catch(() => {
        if (completeCallback) {
          completeCallback()
        }
      })
    },
    // 组装参数—— 参数打包详情
    formatEntries() {
      const parList = []
      for (let i = 0; i < this.tableData.length; i++) {
        const item = this.tableData[i]
        parList.push({
          paramId: item.id,
          name: item.displayName,
          basis: item.basis,
          standards: item.standards,
        })
      }
      return parList
    },
    // 组装参数—— 打包适用样品
    formatSamples() {
      const parList = []
      ;(function findChild(datas) {
        for (let i = 0; i < datas.length; i++) {
          const item = datas[i]
          if (item.checked) {
            parList.push({
              sampleId: item.id,
              sampleName: item.title,
              systemId: item.attributes.systemId,
            })
          }
          if (item.children && item.children.length > 0) {
            findChild(item.children)
          }
        }
      })(this.renderSampleTree)
      return parList
    },
    // 删除参数
    deleteParamRow(index) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAntdConfirm({
        title: '提示',
        content: '删除参数后无法在当前打包项中恢复，是否删除该参数？',
        onOk() {
          const id = that.tableData[index].id
          const n = that.paramsKeys.indexOf(id)
          that.paramsKeys.splice(n, 1)
          that.tableData.splice(index, 1)
        },
      })
    },
    // 编辑试验依据（评定标准）
    editParamsTable(type, tags, index) {
      this.rowEditType = type
      tags.index = index
      this.rowEditRow = tags
      window.$oNextTick(() => {
        this.$refs.testParams.showModal()
      })
    },
    // 编辑试验依据（评定标准） - 确认
    getTestParamsDatas(list) {
      const { rowEditType, rowEditRow } = this
      rowEditRow[rowEditType] = list
      this.tableData[rowEditRow.index] = rowEditRow
    },
    // 应用到其他参数 - 初始化列表数据
    useTherParams(standardList) {
      const paramList = []
      for (let i = 0; i < this.tableData.length; i++) {
        const item = this.tableData[i]
        if (item.key == this.rowEditRow.key)
          continue
        paramList.push({
          value: item.key,
          label: item.displayName,
          checked: false,
        })
      }
      this.otherParams = paramList
      this.useOtherStandard = standardList
      this.otherParamsModal = true
    },
    // 应用到其他参数 - 全选
    changeAll(e) {
      Object.assign(this, {
        otherKeys: e.target.checked ? this.otherParams.map(d => d.value) : [],
        indeterminate: false,
        otherIsAll: e.target.checked,
      })
    },
    // 应用到其他参数 - 勾选选项
    changeParams(e) {
      const n = this.otherParams.length
      const k = this.otherKeys.length
      this.indeterminate = !!k && k < n
      this.otherIsAll = e.length === n
    },
    // 应用到其他参数 - 确认
    onUseOther() {
      const { otherKeys, useOtherStandard, tableData, rowEditType } = this
      for (let i = 0; i < tableData.length; i++) {
        const row = tableData[i]
        if (otherKeys.includes(row.key)) {
          const standard = row[rowEditType]
          if (standard.length === 0) {
            tableData[i][rowEditType] = useOtherStandard
          }
          else {
            const standardIds = standard.map(d => d.baseStandardId)
            const filterStandard = useOtherStandard.filter(
              d => !standardIds.includes(d.baseStandardId),
            )
            if (filterStandard.length === 0)
              continue
            tableData[i][rowEditType].push(...filterStandard)
          }
        }
      }
      this.tableData = tableData
      this.otherParamsModal = false
      this.refreshTable = new Date().getTime()
      window.$oAntdMessage.success('已应用到其他参数')
      this.closeOtherModal()
    },
    closeOtherModal() {
      this.indeterminate = false
      this.otherKeys = []
      this.otherIsAll = false
    },
  },
}
</script>

<style lang="less">
.build-con {
  .ant-layout {
    border-top: 1px solid var(--colorBorder);
  }

  .ant-layout-sider,
  .ant-layout-content {
    background-color: var(--colorBgContainer);
  }

  .sample-box,
  .rule-box {
    padding: 10px;
    height: 100%;
    color: #111;
    font-size: 14px;
  }

  .sub-title {
    line-height: 30px;
  }

  .sample-box {
    border-right: 10px solid var(--colorBorder);
  }

  .sample-name {
    display: inline-block;
    color: var(--colorPrimary);
    cursor: pointer;
  }

  .sample-list {
    height: calc(100% - 30px);
    overflow: auto;
  }

  .add-param-btn {
    margin-top: 8px;
    margin-bottom: 8px;
    display: inline-block;
    color: var(--colorPrimary);
    font-size: 26px;
    cursor: pointer;
    transition: 0.2s;
    &:hover {
      opacity: 0.8;
    }
  }
}
.sample-wrap {
  color: var(--colorText);
  .search-sample {
    display: flex;
    align-items: center;
    .label {
      width: 90px;
    }
  }
  .tree-box {
    padding-right: 20px;
    padding-left: 10px;
    margin-top: 10px;
    height: calc(100% - 40px);
    overflow: auto;
  }
}
.other-params {
  padding: 10px;
  .ant-checkbox-group {
    display: block;
  }
  .ant-checkbox-group-item {
    display: block;
    margin-top: 10px;
  }
  .no-other-param {
    line-height: 50px;
    text-align: center;
    color: #999;
    font-size: 16px;
  }
}
.hint-text {
  margin-left: 10px;
  height: 20px;
  color: #039d12;
}
</style>
