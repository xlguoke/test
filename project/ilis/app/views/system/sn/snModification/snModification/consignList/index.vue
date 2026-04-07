<template>
  <div class="testReport">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="testReport-search">
          <div v-if="allSearch">
            <a-form style="width: 520px" :model="formState">
              <a-form-item
                label="委托编号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-input v-model:value="formState.consignCode" placeholder="请输入委托编号" />
              </a-form-item>
              <a-form-item
                label="委托编号生成时间"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-range-picker v-model:value="formState.createDates" value-format="YYYY-MM-DD" />
              </a-form-item>
              <a-form-item
                label="委托日期"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-range-picker v-model:value="formState.consignDates" value-format="YYYY-MM-DD" />
              </a-form-item>
              <a-form-item
                label="编号格式类型"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-select
                  v-model:value="formState.categoryId"
                  placeholder="请选择编号格式类型"
                >
                  <a-select-option
                    v-for="(item, index) in categoryData"
                    :key="index"
                    :value="item.value"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item :wrapper-col="{ span: 18, offset: 5 }">
                <a-button type="primary" @click="getData(true)">
                  查询
                </a-button>
                <a-button
                  @click="
                    () => {
                      searchType(false)
                    }
                  "
                >
                  切换普通查询
                </a-button>
                <a-button
                  @click="
                    () => {
                      formState = {}
                      getData(true)
                    }
                  "
                >
                  重置
                </a-button>
              </a-form-item>
            </a-form>
          </div>
          <div v-else>
            <a-input
              v-model:value="queryCode"
              placeholder="输入委托编号后回车即可查询"
              class="testReport-search-all"
              @press-enter="getData(true)"
            />
            <a-button type="primary" @click="getData(true)">
              查询
            </a-button>
            <a-button
              @click="
                () => {
                  searchType(true)
                }
              "
            >
              切换高级查询
            </a-button>
          </div>
        </div>
        <div id="tipsMsg">
          注意：修改编号后需要重新打印相关表单，已生成PDF的需要重新生成PDF!
        </div>
        <a-table
          :columns="columns"
          :pagination="pagination"
          :data-source="data"
          bordered
          row-key="objectId"
          :row-class-name="rowClassName"
          @change="sorterChange"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'reportCode'">
              <span>{{ text }}</span>
            </template>

            <template v-if="column.dataIndex === 'snType'">
              <span>{{ text }}</span>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a @click="(e) => editCode(e, record)">编辑</a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <ht-modal
      v-model:open="visible"
      title="设置委托编号"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form>
        <a-form-item
          label="原委托编号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <span class="form-item-span">
            {{ editData ? editData.consignCode : '' }}
          </span>
        </a-form-item>
        <a-form-item
          label="新委托编号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input v-model:value="realValue" autocomplete="off" />
        </a-form-item>
      </a-form>
      <SnRepeatHint :datas="repeatDatas" />
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import SnRepeatHint from '../components/SnRepeatHint.vue'

const columns = [
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: '20%',
    sorter: true,
  },
  {
    title: '编号生成时间',
    dataIndex: 'createDate',
    width: '20%',
    sorter: true,
  },
  {
    title: '委托日期',
    dataIndex: 'consignDate',
    width: '20%',
    sorter: true,
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '编号格式类型',
    dataIndex: 'categoryName',
  },
  {
    title: '收样人',
    dataIndex: 'sampleAcceptorName',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    align: 'center',
    fixed: 'right',
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {
    SnRepeatHint,
  },
  data() {
    return {
      queryParams: null,
      visible: false,
      confirmLoading: false,
      editData: null,
      realValue: '', // 新编号的值
      id: getQueryVariable('id'),
      name: getQueryVariable('name'),
      data: [],
      repeatDatas: [], // 重复编号数据
      dayjs,
      columns,
      queryCode: '',
      formLayout: 'horizontal',
      formState: {},
      allSearch: false,
      spinning: false,
      page: 1,
      size: 10,
      categoryData: [],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      sortParams: null,
      formState: {},
    }
  },
  computed: {},
  created() {
    this.getData()
    this.getSnType()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getSnType() {
      window.$oAjax({
        url: window.$oApi.snModification.snType,
        method: 'GET',
      }).then((res) => {
        if (res.success && Array.isArray(res.obj) && res.obj.length > 0) {
          this.categoryData = res.obj.map(item => ({
            value: item.id,
            name: item.name,
          }))
        }
        else {
          if (res.success === false) {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        }
      })
    },
    editCode(e, record) {
      e.stopPropagation()
      e.preventDefault()
      this.editData = record
      this.visible = true
    },
    handleOk() {
      const data = {
        realValue: this.realValue.trim(),
        modelId: this.editData.modelId ? this.editData.modelId : '',
        snType: 'consign',
        objectId: this.editData.objectId ? this.editData.objectId : '',
      }
      this.repeatDatas = []
      this.confirmLoading = true
      window.$oAjax({
        url: window.$oApi.snModification.editUrl,
        method: 'POST',
        data: JSON.stringify(data),
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.handleCancel()
          this.getData()
        }
        else if (res.code === -10000) {
          this.repeatDatas = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.editData = null
      this.realValue = ''
      this.visible = false
    },
    getData(flag) {
      let data = {}

      if (flag) {
        this.page = 1
      }

      if (this.allSearch) {
        const fieldsValue = { ...this.formState }
        const createDatesValue = fieldsValue.createDates
        const consignDatesValue = fieldsValue.consignDates
        if (consignDatesValue && consignDatesValue.length > 0) {
          fieldsValue.consignDates = `${consignDatesValue[0]} ~ ${consignDatesValue[1]}`
        }
        if (createDatesValue && createDatesValue.length > 0) {
          fieldsValue.createDates = `${createDatesValue[0]} ~ ${createDatesValue[1]}`
        }
        data = {
          ...fieldsValue,
          consignDates: fieldsValue.consignDates
            ? fieldsValue.consignDates
            : '',
          createDates: fieldsValue.createDates
            ? fieldsValue.createDates
            : '',
        }
      }
      else {
        data.queryCode = this.queryCode
      }

      const { page, size } = this
      const params = {
        page,
        size,
        snType: 'consign',
        ...this.sortParams,
        ...data,
      }

      this.spinning = true
      window.$oAjax({
        url: window.$oApi.snModification.list,
        params,
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data.rows
          this.pagination.total = res.data.count || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          this.data = []
        }
        this.spinning = false
      })
    },
    searchType(bool) {
      this.allSearch = bool
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter) {
        const sorterObj = { ascend: 'asc', descend: 'desc' }
        if (sorter.field === 'consignCode') {
          this.sortParams = { snOrder: sorterObj[sorter.order] }
        }
        if (sorter.field === 'createDate') {
          this.sortParams = { snCreateDateOrder: sorterObj[sorter.order] }
        }
        if (sorter.field === 'consignDate') {
          this.sortParams = { consignDateOrder: sorterObj[sorter.order] }
        }
        this.getData()
      }
    },
  },
}
</script>

<style lang="less">
/*@import "./index.less";*/
</style>
