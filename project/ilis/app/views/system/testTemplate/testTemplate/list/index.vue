<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="projectManageList">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="formState">
          <a-row :gutter="15">
            <a-col span="8">
              <a-form-item
                label="任务编号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }"
              >
                <a-input
                  v-model:value="formState.testTaskCode"
                  placeholder="请输入任务编号"
                />
              </a-form-item>
            </a-col>
            <a-col span="8">
              <a-form-item
                label="记录编号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }"
              >
                <a-input
                  v-model:value="formState.testRecordCode"
                  placeholder="请输入记录编号"
                />
              </a-form-item>
            </a-col>
            <a-col span="8">
              <a-form-item
                label="样品编号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }"
              >
                <a-input
                  v-model:value="formState.testObjectCode"
                  placeholder="请输入样品编号"
                />
              </a-form-item>
            </a-col>
            <a-col span="8">
              <a-form-item
                label="委托日期"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }"
              >
                <a-range-picker v-model:value="formState.consignDates" value-format="YYYY-MM-DD" />
              </a-form-item>
            </a-col>
            <a-col span="8">
              <a-form-item
                label="模板类型"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 19 }"
              >
                <a-select
                  v-model:value="formState.templateType"
                  @change="handleSelectChange"
                >
                  <a-select-option value="1">
                    录入模板
                  </a-select-option>
                  <a-select-option value="2">
                    记录模板
                  </a-select-option>
                  <a-select-option value="3">
                    报告模板
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span="8">
              <a-row>
                <a-col span="19" offset="5">
                  <a-button @click="search">
                    查询
                  </a-button>
                  <a-button @click="reset">
                    重置
                  </a-button>
                </a-col>
              </a-row>
            </a-col>
          </a-row>
        </a-form>
        <div class="projectManageList-btn">
          <a-button @click="updateVersionFun">
            修改模板版本
          </a-button>
          <a-button @click="updateHeadTailFun">
            修改表头表尾
          </a-button>
          <a-button @click="synInfoListFun">
            同步数据中心表头定制信息
          </a-button>
          <a-button @click="goDataSet">
            查看数据集
          </a-button>
          <a-button @click="clearTemplateCache">
            清除单据类模板缓存
          </a-button>
        </div>
        <div>
          <div style="text-align: left">
            <span style="color: #6e6f71">数据中心单位ID:</span>
            <span style="color: #6e6f71; margin-left: 10px">{{ unitId }}</span>
          </div>
          <div style="text-align: left">
            <span style="color: #6e6f71">数据中心单位名称:</span>
            <span style="color: #6e6f71; margin-left: 10px">{{
              unitName
            }}</span>
          </div>
        </div>
        <div v-show="data.length > 0">
          <div style="color: green; text-align: right">
            注：录入模板没有表头表尾；记录模板的表尾只有横向；已经生成了PDF的表单，更新数据后需要重新生成PDF！
          </div>
          <a-table
            :columns="columns"
            :data-source="data"
            bordered
            :scroll="{ x: 2000 }"
            :row-selection="rowSelection"
            :pagination="data.length > 0 ? pagination : false"
            :row-class-name="rowClassName"
            :loadind="spinning"
            row-key="key"
            :custom-row="customRow"
          ></a-table>
        </div>
      </div>
    </a-spin>
    <UpdateVersion ref="UpdateVersion" :callback="refreshData" />
    <UpdateHeadTail ref="UpdateHeadTail" :callback="refreshData" />
    <ht-modal
      title="数据集"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="700px"
      @cancel="handleCancel"
    >
      <DataSet ref="DataSet" :callback="refreshData" />
      <template #footer>
        <div>
          <a-button type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>

    <ClearTemplateCache
      v-model:value="clearTemplateCacheVisible"
      @on-submit="search"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ClearTemplateCache from './components/clearTemplateCache.vue'
import UpdateHeadTail from './components/updateHeadTail.vue'
import UpdateVersion from './components/updateVersion.vue'
import DataSet from './dataSetList.vue'

const columnsBase = [
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
    width: '150px',
    fixed: 'left',
  },
  {
    title: '记录编号',
    dataIndex: 'testRecordCode',
    width: '150px',
    fixed: 'left',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: '150px',
    fixed: 'left',
  },
  {
    title: '委托日期',
    dataIndex: 'consignDate',
    width: '120px',
    align: 'center',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '检测项目名称',
    dataIndex: 'itemName',
  },
  {
    title: '系统模板名称',
    dataIndex: 'templateName',
  },
  {
    title: '系统模板ID',
    dataIndex: 'templateId',
  },
]
const columns1 = []
const columns2 = [
  {
    title: '模板横向表头名称',
    dataIndex: 'headHorizontalName',
  },
  {
    title: '模板横向表头ID',
    dataIndex: 'headHorizontalId',
  },
  {
    title: '模板纵向表头名称',
    dataIndex: 'headVerticalName',
  },
  {
    title: '模板纵向表头ID',
    dataIndex: 'headVerticalId',
  },
  {
    title: '模板横向表尾名称',
    dataIndex: 'tailHorizontalName',
  },
  {
    title: '模板横向表尾ID',
    dataIndex: 'tailHorizontalId',
  },
]
const columns0 = [
  {
    title: '模板纵向表尾名称',
    dataIndex: 'tailVerticalName',
  },
  {
    title: '模板纵向表尾ID',
    dataIndex: 'tailVerticalId',
  },
]

export default {
  components: {
    UpdateVersion,
    UpdateHeadTail,
    DataSet,
    ClearTemplateCache,
  },
  data() {
    return {
      clearTemplateCacheVisible: false,
      formState: {
        templateType: '1',
      },
      data: [],
      columns: [],
      unitName: '',
      unitId: '',
      selectedRowKeys: [],
      selectedRows: [],
      page: 1,
      size: 10,
      queryParams: null,
      spinning: false,
      templateType: '1',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.clearRows()
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.clearRows()
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.key)) {
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.key),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.key !== record.key,
              )
            }
            else {
              this.selectedRowKeys.push(record.key)
              this.selectedRows.push(record)
            }
          },
        }
      },
      visible: false,
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        // type: 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    this.getUnitInfo()
  },
  methods: {
    dayjs,
    clearTemplateCache() {
      this.clearTemplateCacheVisible = true
    },
    handleSelectChange(value) {
      this.templateType = value
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { page, size } = this
      this.visible = false
      this.data = []
      this.spinning = true
      window.$oAjax({
        method: 'GET',
        params: {
          page,
          size,
          ...this.queryParams,
        },
        url: window.$oApi.testTemplate.list,
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000 && res.data && res.data.count > 0) {
          this.data = res.data.rows.map((d, i) => {
            return {
              ...d,
              key: Date.now() + i,
            }
          })
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
        }
      })
    },
    search() {
      this.page = 1
      this.clearRows()
      const fieldsValue = { ...this.formState }
      const rangeTimeValue = fieldsValue.consignDates
      if (rangeTimeValue && rangeTimeValue.length > 0) {
        fieldsValue.consignDates = `${rangeTimeValue[0]} ~ ${rangeTimeValue[1]}`
      }
      this.queryParams = {
        testTaskCode: fieldsValue.testTaskCode
          ? fieldsValue.testTaskCode.trim()
          : '',
        testRecordCode: fieldsValue.testRecordCode
          ? fieldsValue.testRecordCode.trim()
          : '',
        testObjectCode: fieldsValue.testObjectCode
          ? fieldsValue.testObjectCode.trim()
          : '',
        templateType: this.templateType,
        consignDates: fieldsValue.consignDates
          ? fieldsValue.consignDates
          : '',
      }
      if (this.queryParams.templateType) {
        const obj = {
          1: columnsBase.concat(columns1),
          2: columnsBase.concat(columns2),
        }
        this.columns
          = obj[this.queryParams.templateType]
            || columnsBase.concat(columns2).concat(columns0)

        if (this.queryParams) {
          this.getData()
        }
      }
    },
    clearRows() {
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    reset() {
      this.formState = {
        templateType: '1',
      }
      this.clearRows()
      this.page = 1
      this.templateType = '1'
      this.queryParams = { templateType: this.templateType }
      this.columns = columnsBase.concat(columns1)
      this.getData()
    },
    refreshData() {
      this.clearRows()
      this.getData()
    },
    // 同步数据中心表头定制信息
    synInfoListFun() {
      const rows = this.selectedRows
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      if (rows.length == 0) {
        window.$oAntdConfirm({
          title: '未勾选数据默认同步当前模板类型全部数据,确认进行操作?',
          onOk() {
            self.synInfoListAct(rows)
          },
          onCancel() {},
        })
      }
      else {
        self.synInfoListAct(rows)
      }
    },
    synInfoListAct(rows) {
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        data: rows.map(d => d.testObjectId),
        headers: {
          'content-type': 'application/json',
        },
        timeout: 60 * 60000, // 查询时间较长，后端建议设置1小时
        url: window.$oApi.testTemplate.synInfoList,
      })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
            this.selectedRowKeys = []
            this.selectedRows = []
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || '操作失败'))
          }
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdModal.warning(window.$oMsgTips.info(err.message || '操作失败'))
        })
    },
    // 修改模板版本
    updateVersionFun() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
      }
      else {
        const myArray = this.selectedRows.map(item => item.templateId)
        const myArray2 = [...new Set(myArray)]
        if (myArray.length === myArray2.length && myArray.length !== 1) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择系统模板ID相同的数据'))
        }
        else {
          const rows = this.selectedRows.filter(d =>
            this.selectedRowKeys.includes(d.key),
          )
          const useUdrIds = rows.map(d => d.useUdrId).join(',')
          this.$refs.UpdateVersion.showModal(
            useUdrIds,
            this.selectedRows[0].templateId,
          )
        }
      }
    },
    // 修改表头表尾
    updateHeadTailFun() {
      if (this.templateType === '1') {
        window.$oAntdModal.warning(window.$oMsgTips.info('录入模板没有表头表尾，不需要更新!'))
        return
      }
      if (this.selectedRowKeys.length === 0) {
        // eslint-disable-next-line ts/no-this-alias
        const self = this
        self.$confirm({
          title: '未勾选数据默认更新所有数据表头表尾,确认进行操作?',
          onOk() {
            self.$refs.UpdateHeadTail.showModal('', self.templateType, true)
          },
          onCancel() {},
        })
      }
      else {
        const rows = this.selectedRows.filter(d =>
          this.selectedRowKeys.includes(d.key),
        )
        const useUdrIds = rows.map(d => d.useUdrId).join(',')
        this.$refs.UpdateHeadTail.showModal(useUdrIds, this.templateType)
      }
    },
    // 查看数据集
    goDataSet() {
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一条数据'))
        return
      }
      const testObjectIds = this.selectedRows
        .map(item => item.testObjectId)
        .join(',')
      const groupKeys = this.selectedRows.map(item => item.groupKey).join(',')
      if (testObjectIds) {
        this.visible = true
        window.$oNextTick(() => {
          this.$refs.DataSet.showModal(testObjectIds, groupKeys)
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择其他数据'))
      }
    },
    // 获取数据中心单位信息
    getUnitInfo() {
      window.$oAjax({
        method: 'get',
        url: window.$oApi.testTemplate.getUnitInfo,
      }).then((res) => {
        if (res.code === 20000) {
          this.unitId = res.data.testCenterId
          this.unitName = res.data.testCenterName
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
