<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div
          style="
            margin: 10px 0px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <a-space>
            <a-select v-model:value="queryForm.trainYear" style="width: 120px">
              <a-select-option value="">
                全部
              </a-select-option>
              <a-select-option
                v-for="(item, index) in yearData"
                :key="index"
                :value="item"
              >
                {{ item }}
              </a-select-option>
            </a-select>

            <a-input
              v-model:value="queryForm.quickQry"
              placeholder="请输入培训项目/培训地点"
              class="container-search-all"
            />
            <a-button type="primary" @click="handleSearch()">
              查询
            </a-button>
          </a-space>
          <a-button type="primary" @click="openEditModal()">
            新增
          </a-button>
        </div>

        <div class="content-table">
          <a-table
            id="tableBox"
            :columns="columns"
            :pagination="data.length > 0 ? pagination : false"
            :data-source="data"
            :loading="loading"
            bordered
            row-key="id"
            :row-class-name="rowClassName"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'operation'">
                <span class="table-handle">
                  <a @click="editFormFun(record)">编辑</a>
                  <a style="color: red" @click="delRow(record)"> 删除 </a>
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>

    <ht-modal
      :title="isEdit ? '编辑继续教育' : '新增继续教育'"
      :mask-closable="false"
      :open="editVisible"
      :confirm-loading="confirmLoading"
      @ok="confirmFun"
      @cancel="
        () => {
          editVisible = false
        }
      "
    >
      <a-form
        :model="editForm"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
      >
        <a-form-item
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 17 }"
          label="培训项目："
          class="required"
        >
          <a-input v-model:value="editForm.trainProgram" placeholder="请输入" />
        </a-form-item>

        <a-form-item
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 17 }"
          label="培训地点："
        >
          <a-input v-model:value="editForm.trainAddress" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 17 }"
          label="年度："
          class="required"
        >
          <!-- <a-select v-model:value="editForm.trainYear" placeholder="请选择">
              <a-select-option
                v-for="item in yearData"
                :value="item"
                :key="item"
                >{{ item }}</a-select-option
              >
            </a-select> -->

          <a-input v-model:value="editForm.trainYear" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 17 }"
          label="培训时间："
        >
          <a-date-picker
            v-model:value="editForm.trainTime"
            show-time
            placeholder="请输入"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
          <!-- <a-input placeholder="请输入" v-model="editForm.trainTime" /> -->
        </a-form-item>
        <a-form-item
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 17 }"
          label="培训学时："
        >
          <a-input-number
            v-model:value="editForm.trainHour"
            style="width: 100%"
            min="1"
            placeholder="请输入"
          />
        </a-form-item>

        <a-form-item
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 17 }"
          label="备注："
        >
          <a-input v-model:value="editForm.remark" placeholder="请输入" />
        </a-form-item>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import message from 'ant-design-vue/lib/message/index'
import dayjs from 'dayjs'
import { formatTime, getQueryVariable } from '~/providers/common/utils'

const columns = [
  {
    title: '序号',
    dataIndex: 'id',
    key: 'id',
    width: 60,
    customRender: ({ index }) => {
      return index + 1
    },
  },
  {
    title: '培训项目',
    dataIndex: 'trainProgram',
  },
  {
    title: '培训地点',
    dataIndex: 'trainAddress',
    // customRender:({ text })=>(  egressStatusData.find(item=>item.value==text)?egressStatusData.find(item=>item.value==text).name:"" )
  },
  {
    title: '年度',
    dataIndex: 'trainYear',
  },
  {
    title: '培训时间',
    dataIndex: 'trainTime',
    customRender({ text }) {
      if (text) {
        return formatTime(text, 'YYYY-MM-DD HH:mm:ss')
      }
      else {
        return ''
      }
    },
  },
  {
    title: '学时',
    dataIndex: 'trainHour',
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
  },
]

export default {
  components: {},
  data() {
    return {
      editForm: {
        trainProgram: '',
        biddingPersonId: getQueryVariable('id'),
        trainProgram: '',
        trainAddress: '',
        trainYear: null,
        trainTime: '',
        trainHour: '',
        remark: '',
      },

      queryForm: {
        quickQry: '',
        trainYear: '',
        biddingPersonId: getQueryVariable('id'),
      },
      loading: false,

      yearData: [],
      selyear: '',
      editVisible: false,
      isEdit: false,
      confirmLoading: false,
      dayjs,
      data: [],
      visible: false,
      columns,
      spinning: false,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.pagination.current = page
          this.getData()
        },
        onShowSizeChange: (page, rows) => {
          this.pagination.current = page
          this.pagination.pageSize = rows
          this.getData()
        },
      },
    }
  },
  computed: {},
  created() {
    this.getYearData()
    this.getData()
  },
  methods: {
    delRow(row) {
      window.$oAntdConfirm({
        title: '提示',
        content: '删除后将不可恢复，是否继续?',
        onOk: () => {
          window.$oAjax
            .get('/rest/biddingPersonEducationController/delete', {
              params: {
                id: row.id,
              },
            })
            .then((res) => {
              if (res.success) {
                window.$oAntdMessage.success('删除成功！')
                this.getData()
                this.getYearData()
              }
              else {
                window.$oAntdMessage.warning('删除失败！')
              }
            })
            .catch(() => {
              window.$oAntdMessage.error('操作失败！')
            })
        },
      })
    },
    editFormFun(row) {
      const rowData = JSON.parse(JSON.stringify(row))
      this.editForm = rowData
      if (rowData.trainTime) {
        this.editForm.trainTime = dayjs(new Date(rowData.trainTime))
      }

      this.editVisible = true
    },
    async confirmFun() {
      if (!this.editForm.trainProgram) {
        message.warn('请输入培训项目！')
        return
      }
      if (!this.editForm.trainYear) {
        message.warn('请输入年度！')
        return
      }
      if (this.editForm.trainTime) {
        this.editForm.trainTime = dayjs(
          new Date(this.editForm.trainTime),
        ).format('YYYY-MM-DD HH:mm:ss')
      }
      this.loading = true
      await window.$oAjax({
        url: 'rest/biddingPersonEducationController/addOrUpdate',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        data: this.editForm,
      })
      this.loading = false
      this.editVisible = false
      message.success('操作成功')
      this.getData()
      this.getYearData()
    },
    getYearData() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax({
        method: 'GET',
        url: 'rest/biddingPersonEducationController/getTrainYear',
        params: {
          biddingPersonId: getQueryVariable('id'),
        },
      }).then((res) => {
        if (res.success) {
          that.yearData = res.obj
        }
      })
    },
    openEditModal() {
      this.editVisible = true
      this.editForm = {
        trainProgram: '',
        biddingPersonId: getQueryVariable('id'),
        trainProgram: '',
        trainAddress: '',
        trainYear: null,
        trainTime: '',
        trainHour: '',
        remark: '',
      }
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleSearch() {
      this.pagination.current = 1
      this.getData()
    },
    getData() {
      const p = {
        page: this.pagination.current,
        size: this.pagination.pageSize,
        ...this.queryForm,
      }
      this.loading = true
      window.$oAjax({
        method: 'GET',
        url: '/rest/biddingPersonEducationController/dataGrid',
        params: p,
      }).then((res) => {
        if (res.obj && res.obj.total > 0) {
          this.data = res.obj.rows
          this.pagination.total = res.obj.total || 0
        }
        else {
          this.data = []
        }

        this.loading = false
      })
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.content-table {
  height: 400px;
  overflow-y: auto;
}
.required label::before {
  content: '*';
  color: red;
}
</style>
