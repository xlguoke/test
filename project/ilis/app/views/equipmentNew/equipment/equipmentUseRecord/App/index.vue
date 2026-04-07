<!-- eslint-disable vue/no-unused-refs -->
<template>
  <IlisContainer app-id="equipmentUseRecord">
    <div class="form-div">
      <div class="c-container-search">
        <div class="c-container-search-warapper">
          <div>
            <a-input
              v-model:value="quickSearch"
              placeholder="请输入设备编号"
              class="c-container-search-all"
            />
            <a-button @click="handleSearch()">
              查询
            </a-button>
            <a-button @click="advancedQueryVisible = true">
              高级查询
            </a-button>
          </div>
          <div>
            <a-checkbox v-model:checked="notBindTask" @change="handleSearch()">
              无关联任务
            </a-checkbox>
          </div>
        </div>
      </div>
    </div>
    <div style="padding-bottom: 10px">
      <a-button type="primary" @click="printBook">
        打印
      </a-button>
      <a-button
        type="primary"
        style="margin-left: 10px"
        @click="comfirmExport"
      >
        导出查询数据
      </a-button>
    </div>
    <a-table
      :loading="loading"
      bordered
      :data-source="data"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      @change="sorterChange"
    />
    <div>
      <ht-modal
        width="45%"
        :open="advancedQueryVisible"
        title="高级查询"
        :closable="false"
        :mask-closable="false"
      >
        <a-form
          ref="formRef"
          :layout="formLayout"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :model="formState"
        >
          <a-form-item label="查询内容">
            <a-input
              v-model:value="formState.equip"
              placeholder="请输入设备编号"
              style="width: 50%; margin-right: 6px"
            />
            <a-radio-group v-model:value="value">
              <a-radio value="0">
                模糊
              </a-radio>
              <a-radio value="1">
                精准
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="使用时间筛选">
            <a-radio-group
              v-model:value="formState.onlyUseTime"
            >
              <a-radio value="">
                全部
              </a-radio>
              <a-radio value="1">
                已录入使用时间
              </a-radio>
              <a-radio value="0">
                未录入使用时间
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="使用时间">
            <a-range-picker
              v-model:value="formState.stamp"
              style="width: 100%"
              :allow-clear="false"
              :placeholder="['开始时间', '结束时间']"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :show-time="{
                defaultValue: [
                  dayjs('00:00:00', 'HH:mm:ss'),
                  dayjs('23:59:59', 'HH:mm:ss'),
                ],
              }"
            />
          </a-form-item>
          <a-form-item label="使用人员">
            <a-input v-model:value="formState.user" placeholder="请输入" />
          </a-form-item>
          <a-form-item label="设备科室">
            <a-tree-select
              v-model:value="formState.depart"
              placeholder="请选择"
              :dropdown-style="{ maxHeight: '300px' }"
              :tree-data="treeData"
            >
            </a-tree-select>
          </a-form-item>
          <a-form-item label="功能室">
            <a-select
              v-model:value="formState.laboratoryId"
              placeholder="请选择功能室"
            >
              <a-select-option
                v-for="laboratory in laboratoryArr"
                :key="laboratory.id"
                :value="laboratory.id"
              >
                {{ laboratory.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="任务编号">
            <a-input v-model:value="formState.test" placeholder="请输入任务编号" />
          </a-form-item>
          <a-form-item label="报告编号">
            <a-input
              v-model:value="formState.reportNumber"
              placeholder="请输入报告编号"
            />
          </a-form-item>
          <a-form-item label="检测参数">
            <a-input
              v-model:value="formState.testParamName"
              placeholder="请输入检测参数名称"
            />
          </a-form-item>
        </a-form>

        <template #footer>
          <div class="modal-footer">
            <a-button type="primary" @click="advancedQueryOk">
              确定
            </a-button>
            <a-button type="default" @click="advancedQueryRefresh">
              重置
            </a-button>
            <a-button type="default" @click="advancedQueryCancel">
              取消
            </a-button>
          </div>
        </template>
      </ht-modal>
    </div>

    <ht-modal
      :open="exportVisible"
      title="导出"
      :closable="false"
      :mask-closable="false"
      :confirm-loading="exportLoading"
      @cancel="cancelExport"
      @ok="comfirmExport"
    >
      <a-form
        ref="exportFormRef"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        :model="exportFormState"
      >
        <a-form-item label="统计起止日期" :rules="[{ required: true, message: '请选择统计起止日期' }]" name="date">
          <a-range-picker
            v-model:value="exportFormState.date"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item
          label="台账名称"
          :rules="[{ required: true, message: '请选择台账名称' }]"
          name="type"
        >
          <a-select v-model:value="exportFormState.type">
            <a-select-option value="1">
              未使用室内设备
            </a-select-option>
            <a-select-option value="2">
              未使用室外设备
            </a-select-option>
            <a-select-option value="3">
              未出库室外设备
            </a-select-option>
            <a-select-option value="4">
              出库未使用设备
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </ht-modal>
  </IlisContainer>
</template>

<script>
import dayjs from 'dayjs'
import {
  exportUseRecord,
  getDepartment,
  getEquipmentUseRecord,
  getLaboratoryApi,
} from '~/providers/api/equipment'
import { downloadFile } from '~/providers/common/utils'

const columns = [
  {
    title: '使用时间（起~止）',
    sorter: true,
    dataIndex: 'ranger',
    customRender: ({ record: row }) => {
      return row.startUseTime
        ? `${row.startUseTime}~${row.endUseTime ? row.endUseTime : ''}`
        : ''
    },
    scopedSlots: { customRender: 'ranger' },
    width: '16%',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentCode',
    width: '10%',
  },
  {
    title: '档案编号',
    dataIndex: 'archiveSn',
    width: '10%',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: '10%',
  },
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    width: '8%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: '8%',
  },
  {
    title: '使用人',
    dataIndex: 'userName',
    width: '8%',
  },
  {
    title: '任务编号',
    dataIndex: 'testTaskCode',
    width: '10%',
  },
  {
    title: '报告编号',
    dataIndex: 'reportNumber',
    width: '10%',
  },
  {
    title: '检测参数',
    dataIndex: 'testParamDisplayName',
    width: '10%',
  },
]

export default {
  name: 'Index',
  data() {
    return {
      dayjs,
      exportVisible: false,
      notBindTask: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      advancedQueryVisible: false,
      formState: {},
      exportFormState: {},
      formLayout: 'horizontal',
      data: [],
      quickSearch: '',
      allSearch: false,
      loading: false,
      sort: '',
      order: '',
      columns,
      query: {
        page: 1,
        size: 10,
        testTaskCode: '',
        departmentId: '',
        username: '',
        q: '',
        equipmentCode: '',
        onlyUseTime: '',
        testParamName: '',
        reportNumber: '',
        laboratoryId: '',
      },
      treeData: [],
      laboratoryArr: [],
      exportTypes: {
        1: '未使用室内设备',
        2: '未使用室外设备',
        3: '未出库室外设备',
        4: '出库未使用设备',
      },
      exportLoading: false,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.query.page = page
          // this.fetch();
        },
        onShowSizeChange: (page, size) => {
          this.query.size = size
          this.query.page = 1
          this.fetch()
        },
      },
      value: '0', // 高级查询判断
    }
  },
  mounted() {
    this.fetch()
    this.getDepartmentTree()
    this.getLaboratory()
  },
  methods: {
    sorterChange(pagination, filters, sorter) {
      if (sorter) {
        this.sort = 'startUseTime'
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
        this.fetch()
      }
    },
    fetch(flag) {
      if (flag) {
        this.query.page = 1
      }

      this.loading = true
      let data = {
        q: this.quickSearch,
        page: this.query.page,
        size: this.query.size,
        sort: this.sort,
        order: this.order,
      }

      if (this.allSearch) {
        data = this.query
        data.sort = this.sort
        data.order = this.order
      }
      data.notBindTask = this.notBindTask

      getEquipmentUseRecord(data).then((res) => {
        this.loading = false
        this.data = res.data.rows
        this.pagination.total = res.data.count
        this.pagination.current = this.query.page
        this.pagination.pageSize = this.query.size
      })
    },
    getDepartmentTree() {
      getDepartment().then((res) => {
        this.treeData = this.getTreeData([res[1]])
      })
    },
    getTreeData(data) {
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let obj = {}
        let children = []
        if (data[i].children && data[i].children.length > 0) {
          children = this.getTreeData(data[i].children)
        }
        const { id, text } = data[i]
        obj = {
          ...data[i],
          key: id,
          value: id,
          title: text,
          children,
        }
        arr.push(obj)
      }
      return arr
    },
    /**
     * 获取功能室
     */
    getLaboratory() {
      this.laboratoryArr = getLaboratoryApi().then((res) => {
        this.laboratoryArr = res.rows
      })
    },
    /**
     * 高级查询确定按键
     */
    advancedQueryOk() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.allSearch = true
      _this.quickSearch = ''

      this.$refs.formRef.validateFields().then(() => {
        const value = { ...this.formState }
        _this.query.page = 1
        _this.query.size = 10
        const {
          user,
          depart,
          test,
          equip,
          stamp,
          onlyUseTime,
          testParamName,
          reportNumber,
          laboratoryId,
        } = value
        _this.query.departmentId = depart
        // 模糊查询
        if (_this.value == '0') {
          _this.query.q = equip
          _this.query.equipmentCode = ''
        }
        else {
          _this.query.equipmentCode = equip
          _this.query.q = ''
        }
        // _this.query.equipmentCode = equip;
        _this.query.username = user
        _this.query.testTaskCode = test
        _this.query.onlyUseTime = onlyUseTime
        _this.query.testParamName = testParamName
        _this.query.reportNumber = reportNumber
        _this.query.laboratoryId = laboratoryId

        if (value.stamp) {
          const from = stamp[0].format('X') * 1000
          const to = stamp[1].format('X') * 1000
          _this.query.stamp = `${from},${to}`
        }
        else {
          _this.query.stamp = undefined
        }
        _this.fetch(true)
        this.advancedQueryVisible = false
      })
    },
    /**
     * 高级查询取消
     */
    advancedQueryCancel() {
      this.advancedQueryVisible = false
    },
    /**
     *  高级查询刷新
     */
    advancedQueryRefresh() {
      this.formState = {}
      this.advancedQueryOk()
      this.advancedQueryVisible = false
    },
    handleSearch() {
      this.allSearch = false
      this.fetch(true)
    },
    // 打印台账
    printBook() {
      const queryParams = {}
      if (this.allSearch) {
        // eslint-disable-next-line ts/no-unused-expressions
        this.query.testTaskCode
          ? (queryParams.testTaskCode = this.query.testTaskCode)
          : ''
        // eslint-disable-next-line ts/no-unused-expressions
        this.query.departmentId
          ? (queryParams.departmentId = this.query.departmentId)
          : ''
        // eslint-disable-next-line ts/no-unused-expressions
        this.query.username ? (queryParams.username = this.query.username) : ''
        // this.query.equipmentCode ? queryParams.equipmentCode = this.query.equipmentCode : "";
        // 模糊查询 精准查询
        if (this.value == '0') {
          queryParams.q = this.query.q
          queryParams.equipmentCode = ''
        }
        else {
          queryParams.equipmentCode = this.query.equipmentCode
          queryParams.q = ''
        }
        // eslint-disable-next-line ts/no-unused-expressions
        this.query.stamp ? (queryParams.stamp = this.query.stamp) : ''
        queryParams.onlyUseTime = this.query.onlyUseTime || ''
        queryParams.reportNumber = this.query.reportNumber || ''
        queryParams.testParamName = this.query.testParamName || ''
      }
      else {
        // eslint-disable-next-line ts/no-unused-expressions
        this.quickSearch ? (queryParams.q = this.quickSearch) : ''
      }

      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('EquipmentUseLedger', { ...queryParams })
    },
    // 导出台账
    exportFun() {
      this.exportVisible = true
    },
    cancelExport() {
      this.exportVisible = false
      this.exportFormState = {}
    },
    comfirmExport() {
      let params = {
        q: this.quickSearch,
        page: this.query.page,
        size: this.query.size,
        sort: this.sort,
        order: this.order,
      }

      if (this.allSearch) {
        params = this.query
        params.sort = this.sort
        params.order = this.order
      }
      params.notBindTask = this.notBindTask
      this.loading = true
      exportUseRecord(params)
        .then((res) => {
          window.$oAntdMessage.success('导出成功')
          const blob = new Blob([res])
          const href = window.URL.createObjectURL(blob)
          const fileName = '设备使用记录.xlsx'
          downloadFile(href, fileName)
          this.cancelExport()
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
          window.$oAntdMessage.error((err && err.message) || '导出失败')
        })
    },
  },
}
</script>

<style lang="less" scoped>
.c-container {
  margin: 10px;
}
.c-container-search {
  padding-bottom: 10px;
  &-warapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .c-container-search-all {
    width: 300px;
    margin-right: 5px;
  }

  button {
    margin-right: 5px;
  }

  .ant-form-item {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .ant-calendar-picker {
    width: 100%;
  }

  .ant-form-item-label label {
    font-size: 14px;
  }
}
</style>
