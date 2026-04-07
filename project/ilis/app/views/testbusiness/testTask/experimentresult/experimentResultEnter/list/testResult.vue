<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="spinning">
      <a-layout class="hitek-height-full">
        <a-layout>
          <a-layout-sider
            width="300"
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
              show-icon
              :default-expand-all="true"
              :selected-keys="selTreeRow"
              :tree-data="treeData"
              :replace-fields="replaceFields"
              @select="onSelect"
            >
              <template #selIcon>
                <SelectOutlined />
              </template>
            </a-tree>
          </a-layout-sider>

          <a-layout style="margin-left: 300px; padding: 0px 10px">
            <a-layout-content
              :style="{
                background: '#fff',
                padding: '10px',
                margin: 0,
                minHeight: '280px',
                overflow: 'initial',
              }"
            >
              <div style="height: calc(100vh - 120px); overflow: auto">
                <a-table
                  :columns="columns"
                  :data-source="tabledata"
                  :pagination="false"
                  row-key="id"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'detectionValue'">
                      <a-select
                        v-if="record.detectionValueType === 'fit'"
                        v-model:value="record.detectionValue"
                        style="width: 120px"
                      >
                        <a-select-option value="是">
                          是
                        </a-select-option>
                        <a-select-option value="否">
                          否
                        </a-select-option>
                      </a-select>
                      <a-input
                        v-else
                        v-model:value="record.detectionValue"
                        :disabled="disabled"
                        style="width: 120px"
                        placeholder="请输入单项检测值"
                        @blur="setConclusion(record)"
                      />
                    </template>

                    <template v-if="column.dataIndex === 'conclusionName'">
                      <a-select
                        v-if="record.conclusionType === 'eligibility' && !disabled"
                        v-model:value="record.conclusionName"
                        style="width: 120px"
                        @blur="conclusionChange(record)"
                      >
                        <a-select-option value="合格">
                          合格
                        </a-select-option>
                        <a-select-option value="不合格">
                          不合格
                        </a-select-option>
                      </a-select>
                      <a-input
                        v-else
                        v-model:value="record.conclusionName"
                        :disabled="disabled"
                        style="width: 120px"
                        @blur="conclusionChange(record)"
                      />
                    </template>
                  </template>
                </a-table>

                <div class="from_list">
                  <div class="from_item">
                    <span class="inputName">试验时间：</span>
                    <a-range-picker
                      v-if="defaultDateValue.length"
                      :disabled="disabled"
                      :default-value="defaultDateValue"
                      @change="onChange"
                    />
                  </div>

                  <div class="from_item">
                    <span class="inputName">环境条件：</span>
                    <a-input
                      v-model:value="fromSubmit.testConditions"
                      :disabled="disabled"
                      placeholder="请输入环境条件"
                    />
                  </div>
                  <div class="from_item">
                    <span class="inputName">是否合格：</span>
                    <a-radio-group
                      v-model:value="fromSubmit.isQualified"
                      :disabled="disabled"
                    >
                      <a-radio value="1">
                        合格
                      </a-radio>
                      <a-radio value="0">
                        不合格
                      </a-radio>
                      <a-radio value="2">
                        不判定
                      </a-radio>
                    </a-radio-group>
                  </div>
                  <div class="from_item">
                    <span class="inputName" style="vertical-align: top">备注：</span>
                    <a-textarea
                      v-model:value="fromSubmit.testConclusionRemark"
                      :disabled="disabled"
                      placeholder="请输入备注"
                      :auto-size="{ minRows: 2, maxRows: 6 }"
                    />
                  </div>
                  <div class="from_item">
                    <span class="inputName" style="vertical-align: top">检验结论：</span>
                    <a-textarea
                      v-model:value="fromSubmit.testValue"
                      :disabled="disabled"
                      placeholder="请输入检验结论"
                      :auto-size="{ minRows: 2, maxRows: 6 }"
                    />
                  </div>
                </div>
              </div>
              <!-- 报告页面不显示编辑 -->
              <div
                v-if="!disabled"
                style="
                  padding-top: 12px;
                  text-align: right;
                  border-top: 1px solid #eee;
                "
              >
                <a-button
                  style="width: 70px; margin-right: 10px"
                  type="primary"
                  @click="save"
                >
                  保 存
                </a-button>
                <a-button
                  style="margin-right: 10px"
                  @click="getTreeAndList(true)"
                >
                  获取最新指标
                </a-button>
                <a-button style="margin-right: 10px" @click="closeParentLayer">
                  关 闭
                </a-button>
              </div>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>
  </div>
</template>

<script>
import { SelectOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'

const columns = [
  {
    title: '序号',
    dataIndex: 'sort',
    key: 'sort',
    sorter: (a, b) => {
      return a.sort - b.sort
    },
    width: 80,
  },
  {
    title: '指标编码',
    dataIndex: 'code',
    key: 'code',
    width: '12%',
  },
  {
    title: '检测指标名称',
    dataIndex: 'name',
    key: 'name',
    width: '15%',
  },
  {
    title: '技术要求说明',
    dataIndex: 'technicalRequirements',
    key: 'technicalRequirements',
    width: '20%',
  },
  {
    title: '填写说明',
    dataIndex: 'entryInstructions',
    key: 'entryInstructions',
    width: '15%',
  },
  {
    title: '判定公式',
    dataIndex: 'expression',
    key: 'expression',
    width: '12%',
  },
  {
    title: '检测值',
    dataIndex: 'detectionValue',
    key: 'detectionValue',
  },
  {
    title: '单项结论',
    dataIndex: 'conclusionName',
    key: 'conclusionName',
  },
]

export default {
  name: 'List',
  components: { SelectOutlined },
  data() {
    return {
      isFirst: false,
      dataSource: [],
      spinning: false,
      disabled: false,
      defaultDateValue: [],
      testTaskId: '',
      reportId: '',
      conclusion: {},
      treeData: [],
      cacheTreeData: [],
      selTreeRow: [],
      columns,
      reportPage: false,
      tabledata: [],
      selRow: '',
      fromSubmit: {
        testStartDate: '',
        testEndDate: '',
        testConditions: '',
        isQualified: '',
        testConclusionRemark: '',
        testValue: '',
      },
    }
  },
  // watch:{
  //     tabledata:{
  //       deep:true,
  //       handler:function(newV,oldV){
  //
  //         this.dataSource=newV
  //        }
  //     }
  //   },
  computed: {
    rowSelection() {
      return {}
    },

    replaceFields() {
      return {
        children: 'children',
        title: 'name',
        key: 'id',
      }
    },
  },
  mounted() {},
  created() {
    const status = getQueryVariable('status')
    const reportReviseStatus = getQueryVariable('reportReviseStatus')
    this.testTaskId = getQueryVariable('testTaskId')
    this.reportId = getQueryVariable('reportId')
    this.reportPage = getQueryVariable('type') === 'report'
    this.disabled
      = this.reportPage
        || (status !== '20'
          && !(reportReviseStatus === '10' || reportReviseStatus === '30'))
    this.getTreeAndList()
  },
  methods: {
    save() {
      for (const i in this.tabledata) {
        for (const j in this.dataSource) {
          if (this.tabledata[i].id === this.dataSource[j].id) {
            this.dataSource[j] = JSON.parse(JSON.stringify(this.tabledata[i]))
          }
        }
      }
      const list = this.dataSource.map((item) => {
        return {
          indicatorId: item.id,
          detectionValue: item.detectionValue,
          conclusionValue: item.conclusionName,
          conclusion: item.conclusion,
          id: item.resultId || null,
          type: item.type,
        }
      })
      const data = { ...this.fromSubmit }
      data.taskId = this.testTaskId
      data.allResult = list
      data.testStartDate = dayjs(data.testStartDate).format('YYYY-MM-DD')
      data.testEndDate = dayjs(data.testEndDate).format('YYYY-MM-DD')
      if (this.isFirst) {
        this.addList(data)
      }
      else {
        this.etidList(data)
      }
    },
    addList(data) {
      this.spinning = true
      window.$oAjax({
        method: 'post',
        url: `/rest/indicator-result/save`,
        data,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            this.getTreeAndList()
            window.$oAntdMessage.success('操作成功')
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.message)
        })
    },
    etidList(data) {
      this.spinning = true
      window.$oAjax({
        method: 'put',
        url: `/rest/indicator-result/update`,
        data,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            this.getTreeAndList()
            window.$oAntdMessage.success('操作成功')
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.message)
        })
    },

    onChange(v) {
      this.fromSubmit.testStartDate = v[0]
      this.fromSubmit.testEndDate = v[1]
    },

    /**
     * 检测结论被手动改变后检测结论设置为合格
     */
    conclusionChange(row) {
      row.conclusion = 1
      window.$oNextTick(() => {
        this.checkQualified()
      })
    },

    /**
     * 判定当前参数下所有结论是否满足需求
     */
    checkQualified() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      // 将当前列表中的值刷新到数据集中
      _this.tabledata.forEach((t) => {
        _this.dataSource.forEach((v, i, a) => {
          if (t.id === v.id) {
            a[i] = JSON.parse(JSON.stringify(t))
          }
        })
      })
      // 判断整个数据集的单项检测结论是否都合格，只要有一项不合格，整体结论就默认不合格
      const all = _this.dataSource
      const every = all.some((a) => {
        return a.conclusion === 0
      })
      if (!every) {
        _this.fromSubmit.isQualified = '1'
      }
      else {
        _this.fromSubmit.isQualified = '0'
      }
    },

    setConclusion(row) {
      const val = row.detectionValue
      if (val == null || val == '') {
        return
      }
      window.$oAjax({
        method: 'POST',
        url: `/rest/indicator-result/judgment`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: {
          indicatorId: row.id,
          detectionValue: val,
        },
      })
        .then((res) => {
          // eslint-disable-next-line eqeqeq
          if (res.code == '20000') {
            row.conclusion = res.data.conclusion
            if (res.data.conclusionType === 'eligibility') {
              // eslint-disable-next-line eqeqeq
              if (res.data.conclusion == 1) {
                row.conclusionName = '合格'
              }
              else {
                row.conclusionName = '不合格'
              }
            }
            else {
              // eslint-disable-next-line eqeqeq
              if (res.data.conclusion == 1) {
                row.conclusionName = res.data.conclusionValue
              }
              else {
                if (
                  row.expression != null
                  && row.expression !== ''
                  && row.expression !== undefined
                ) {
                  window.$oAntdMessage.warn('检测值不满足预期结论')
                }
                else {
                  window.$oAntdMessage.info('没有设定预期结论的判定公式')
                }
                row.conclusionName = null
              }
            }
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
        .then(() => this.checkQualified())
    },

    onSelect(sel) {
      // 已经编辑的数据备份
      for (const i in this.tabledata) {
        for (const j in this.dataSource) {
          if (this.tabledata[i].id === this.dataSource[j].id) {
            this.dataSource[j] = JSON.parse(JSON.stringify(this.tabledata[i]))
          }
        }
      }
      this.selectedRowKeys = []
      this.selRow = []
      this.selTreeRow = sel
      this.tileTreeData()

      // 从备份数据拿已经编辑的数据到table
      for (const i in this.tabledata) {
        for (const j in this.dataSource) {
          if (this.tabledata[i].id === this.dataSource[j].id) {
            this.tabledata[i] = JSON.parse(JSON.stringify(this.dataSource[j]))
          }
        }
      }
    },
    // 根据树渲染列表
    tileTreeData() {
      let selNode = []
      // 获取选中节点
      if (this.selTreeRow.length > 0) {
        const fu = (arr) => {
          arr.forEach((item) => {
            if (item.id === this.selTreeRow[0]) {
              selNode.push(item)
            }
            if (item.children && item.children.length > 0) {
              fu(item.children)
            }
          })
        }
        fu(this.cacheTreeData)
      }
      else {
        selNode = this.treeData
      }
      // 递归平铺，
      const dataT = []
      const fu2 = (arr) => {
        arr.forEach((item) => {
          dataT.push(item)
          if (item.children && item.children.length > 0) {
            fu2(item.children)
          }
        })
      }
      fu2(selNode)
      // 循环去掉children和根节点
      // eslint-disable-next-line array-callback-return
      const d = JSON.parse(JSON.stringify(dataT)).filter((item) => {
        if (item.parentId && item.enableInput === 1) {
          item.children = ''
          item.edit = false
          return item
        }
      })
      this.tabledata = d
    },

    // 获取表格和树数据  re:通过点击刷新按钮发起的请求
    getTreeAndList(re) {
      this.spinning = true
      let url
      let message = ''
      if (this.reportPage) {
        // 报告页面
        url = `/rest/indicator-result/list?reportId=${this.reportId}`
      }
      else {
        if (re) {
          url = `/rest/indicator-result/refresh/${this.testTaskId}`
          message = '已经获取到最新指标列表'
        }
        else {
          url = `/rest/indicator-result/list/${this.testTaskId}`
        }
      }
      window.$oAjax.get(url).then((res) => {
        this.spinning = false
        if (Number.parseInt(res.code) === 20000) {
          if (message !== '') {
            window.$oAntdMessage.success(message)
          }
          if (res.data.testStartDate && res.data.testEndDate) {
            this.defaultDateValue = [
              dayjs(res.data.testStartDate),
              dayjs(res.data.testEndDate),
            ]
            res.data.testStartDate = dayjs(res.data.testStartDate)
            res.data.testEndDate = dayjs(res.data.testEndDate)
          }
          else {
            this.defaultDateValue = [dayjs(new Date()), dayjs(new Date())]
            res.data.testStartDate = dayjs(new Date())
            res.data.testEndDate = dayjs(new Date())
          }
          const trees = res.data.tree || []
          this.cacheTreeData = JSON.parse(JSON.stringify(trees))
          this.delNode(trees)
          this.treeData = trees
          this.dataSource = res.data.allIndicator
          this.fromSubmit.testStartDate = res.data.testStartDate
          this.fromSubmit.testEndDate = res.data.testEndDate
          this.fromSubmit.testConditions = res.data.testConditions
          this.fromSubmit.isQualified = res.data.isQualified
          this.fromSubmit.testConclusionRemark = res.data.testConclusionRemark
          this.fromSubmit.testValue = res.data.testValue
          this.isFirst = res.data.first
          this.tileTreeData()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    // 删除可编辑节点（右侧表格展示，节点不展示）
    delNode(datas) {
      for (let i = 0; i < datas.length; i++) {
        const d = datas[i]
        if (d.children && d.children.length > 0) {
          this.delNode(d.children)
        }
        if (d.enableInput) {
          datas.splice(i, 1)
          i--
        }
        if (d.children && d.children.length === 0) {
          d.children = undefined
        }
      }
    },
    // 关闭父级弹窗
    closeParentLayer() {
      window.parent.layer && window.parent.layer.closeAll()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>

<style>
.formula_item {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 10px 0;
}
.from_list {
  margin: 20px 0;
  border: 1px solid #eaeaea;
}
.from_item {
  display: inline-flex;
  margin-top: 20px;
  width: 33%;
  &:last-child {
    margin-bottom: 20px;
  }
  @media screen and (max-width: 1150px) {
    width: 46%;
  }
  .ant-input,
  .ant-calendar-picker {
    flex: 1;
  }
}
.from_item .inputName {
  min-width: 90px;
  text-align: right;
  display: inline-block;
  margin-right: 4px;
}
</style>
