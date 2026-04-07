<template>
  <ht-modal
    v-model:open="_value"
    title="用户"
    centered
    :mask-closable="false"
    width="960px"
    @ok="onOK"
    @cancel="onCancel"
  >
    <div class="w-[99%]">
      <a-row :gutter="15" type="flex">
        <a-col style="width: 240px">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              用户账号
            </div>
            <div class="hitek-form-layout-con">
              <a-input
                v-model:value="query.userName"
                style="width: 100%"
                placeholder="请输入用户账号"
                @press-enter="onSearch"
              ></a-input>
            </div>
          </div>
        </a-col>
        <a-col style="width: 240px">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              用户名称
            </div>
            <div class="hitek-form-layout-con">
              <a-input
                v-model:value="query.realName"
                style="width: 100%"
                placeholder="请输入用户名称"
                @press-enter="onSearch"
              ></a-input>
            </div>
          </div>
        </a-col>
        <a-col style="width: 240px">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              部门
            </div>
            <div class="hitek-form-layout-con">
              <a-tree-select
                v-model:value="query['TSDepart.id']"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择部门"
                allow-clear
                :tree-data="departmentData"
                tree-default-expand-all
                show-search
              />
            </div>
          </div>
        </a-col>
        <a-col>
          <a-button @click="onSearch">
            查询
          </a-button>
          <a-button class="toolBtn-bar" @click="onReset">
            重置
          </a-button>
        </a-col>
      </a-row>
      <a-table
        id="tableBox"
        :columns="columns"
        :pagination="data.length > 0 ? pagination : false"
        :data-source="data"
        :row-class-name="rowClassName"
        bordered
        :custom-row="customRow"
        :row-selection="rowSelection"
        row-key="id"
        :loading="loading"
        :scroll="{ y: 320 }"
      />
    </div>
    <template #footer>
      <a-button @click="onCancel">
        取消
      </a-button>
      <a-button type="primary" @click="onOK">
        确定
      </a-button>
      <div style="clear: both"></div>
    </template>
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
// 获取部门
import getDepartmentData from '~/providers/api/getDepartment'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '用户账号',
    dataIndex: 'userName',
    width: '15%',
  },
  {
    title: '用户名称',
    dataIndex: 'realName',
    width: '15%',
  },
  {
    title: '部门',
    dataIndex: 'userOrgList.tsDepart.departname',
    width: '20%',
  },
  {
    title: '角色',
    dataIndex: 'userKey',
    width: '20%',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }) => (text ? dayjs(text).format(EDateFormatType.YYYY_MM_DD_HH_MM_SS) : ''),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '10%',
    customRender: ({ text }) => (text === '1' ? '激活' : '未激活'),
  },
]

export default {
  props: ['value'],
  emits: ['on-change', 'update:value'],
  data() {
    return {
      data: [],
      columns,
      query: {
        'userName': undefined,
        'realName': undefined,
        'TSDepart.id': undefined,
      },
      loading: false,
      page: 1,
      size: 10,
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
      selectedRowKeys: [],
      selectedRows: [],
      departmentData: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.type === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
              if (this.selectedRowKeys.includes(record.id)) {
                this.selectedRowKeys = this.selectedRowKeys.filter(
                  item => item !== record.id,
                )
                this.selectedRows = this.selectedRows.filter(
                  item => item.id !== record.id,
                )
              }
              else {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
            }
          },
        }
      },
    }
  },
  computed: {
    _value() { return this.value },
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
  },
  watch: {
    value(val) {
      if (val === true) {
        this.getData()
      }
    },
  },
  async created() {
    // 获取部门选择数据
    this.departmentData = await getDepartmentData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 确定事件
    onOK() {
      if (this.selectedRowKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择人员'))
        return
      }
      $emit(this, 'on-change', this.selectedRowKeys, this.selectedRows)
      this.onCancel()
    },
    // 重置
    onReset() {
      this.page = 1
      this.query = {
        'userName': undefined,
        'realName': undefined,
        'TSDepart.id': undefined,
      }
      this.onSearch()
    },
    // 搜索
    onSearch() {
      this.page = 1
      this.getData()
    },
    // 关闭事件
    onCancel() {
      $emit(this, 'update:value', false)
    },
    // 请求数据
    async getData() {
      this.selectedRows = []
      this.selectedRowKeys = []
      const { page, size, query } = this

      this.loading = true
      try {
        const res = await window.$oAjax.post(
          'userController.do?datagrid',
          qs.stringify({
            ...query,
            rows: size,
            page,
          }),
          {
            params: {
              field:
                'id,userName,realName,TSDepart_id,userOrgList.tsDepart.departname,userKey,createBy,createDate,updateBy,updateDate,status,deleteFlag,',
            },
          },
        )

        if (res && res.total > 0) {
          // this.selectedRows = JSON.parse(JSON.stringify(this.acceptData));
          // this.selectedRowKeys = this.selectedRows.map(item => item.id);
          this.data = res.rows
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请求异常，请稍后再试'))
      }
      this.loading = false
    },
  },
}
</script>

<style lang="less" scoped>
.hitek-form-layout {
  padding-bottom: 15px;
  .hitek-form-layout-label {
    width: 65px;
  }
}
</style>
