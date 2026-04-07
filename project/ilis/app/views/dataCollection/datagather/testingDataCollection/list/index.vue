<template>
  <div>
    <div>
      <a-form :model="formState">
        <a-row :gutter="15">
          <a-col span="8" style="height: 26px">
            <a-form-item
              label="采集项目"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-tree-select
                v-model:value="formState.testTypeCode"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择采集项目"
                :tree-data="collectionData"
                tree-default-expand-all
                show-search
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="设备编号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-input
                v-model:value="formState.sbbianhao"
                style="width: 100%"
                placeholder="请输入设备编号"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="设备名称"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-input
                v-model:value="formState.sbmingcheng"
                style="width: 100%"
                placeholder="请输入设备名称"
              />
            </a-form-item>
          </a-col>
          <a-col span="8">
            <a-form-item
              label="上传时间"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-range-picker
                v-model:value="formState.stamp"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :show-time="{
                  defaultValue: [
                    dayjs('00:00:00', 'HH:mm:ss'),
                    dayjs('23:59:59', 'HH:mm:ss'),
                  ],
                }"
              />
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
    </div>
    <a-table
      :row-class-name="rowClassName"
      style="margin-top: 15px"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'operation'">
          <span v-if="record.attachList.length !== 0" class="table-handle">
            <a href="javascript:;" title="编辑文件名称" @click="editRow(record)">
              编辑
            </a>
          </span>
        </template>

        <template v-if="column.dataIndex === 'attachList'">
          <span v-if="text.length > 0">
            <a href="javascript:;" @click="downloadAccessory(text[0])">{{
              text[0].name
            }}</a>
          </span>
        </template>
      </template>
    </a-table>

    <ht-modal
      v-model:open="visible"
      title="编辑文件名称"
      :width="600"
      :mask-closable="false"
      @ok="submitSave"
    >
      <a-input v-model:value="editData.name" placeholder="请输入文件名称" />
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '设备编号',
    dataIndex: 'sbbianhao',
    width: '10%',
  },
  {
    title: '设备名称',
    dataIndex: 'sbmingcheng',
    width: '15%',
  },
  {
    title: '工程部位',
    dataIndex: 'gongcbw',
    width: '15%',
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
    width: '15%',
    customRender: ({ text }) =>
      text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '',
  },
  {
    title: '唯一标识',
    dataIndex: 'uuid',
    width: '15%',
  },
  {
    title: '文件名称',
    dataIndex: 'attachList',
    width: '20%',
    scopedSlots: { customRender: 'attachList' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  data() {
    return {
      dayjs,
      formState: {},
      visible: false,
      columns,
      page: 1,
      size: 10,
      loading: false,
      data: [],
      collectionData: [],
      query: {},
      radioData: [
        { name: '全部', value: undefined },
        { name: '已出', value: '1' },
        { name: '未出', value: '0' },
      ],
      editData: {},
      editId: '',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData(this.query)
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData(this.query)
        },
      },
    }
  },
  created() {
    this.getLaboratoryData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取采集项目的默认值
    getInitalTestTypeCode() {
      if (this.collectionData.length > 0) {
        const item = this.collectionData[0]
        if (item.children && item.children.length > 0) {
          return item.children[0].value
        }
        else {
          return item.value
        }
      }
      else {
        return undefined
      }
    },
    getLaboratoryData() {
      window.$oAjax
        .get(window.$oApi.mechanicsDataCollection.getTypeData, {
          params: { testType: 'file' },
        })
        .then((res) => {
          if (res.success) {
            this.collectionData = this.formatDepartmentData(res.obj || [])
            if (this.collectionData.length !== 0) {
              this.formState.testTypeCode = this.getInitalTestTypeCode()
              this.getData()
            }
          }
        })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        const obj = {}
        if (item.children && item.children.length > 0) {
          obj.disabled = true
          children = this.formatDepartmentData(item.children)
        }
        arr.push({
          ...obj,
          title: item.typeName,
          value: item.testTypeCode,
          key: item.testTypeCode,
          children,
        })
      })

      return arr
    },
    getData(params) {
      if (this.collectionData.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请配置采集项目后再操作'))
        return
      }

      if (!params) {
        params = {}
      }

      const { page, size } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.testingDataCollection.list, {
          params: {
            ...params,
            testTypeCode: params.testTypeCode || this.getInitalTestTypeCode(),
            page,
            size,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.success) {
            this.data = res.obj.rows
            this.pagination.pageSize = size
            this.pagination.current = page
            this.pagination.total = res.obj.count
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err)
          this.loading = false
        })
    },
    search() {
      this.page = 1
      const data = { ...this.formState }
      if (data.stamp && data.stamp.length == 2) {
        data.uploadTimeStart = dayjs(data.stamp[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        )
        data.uploadTimeEnd = dayjs(data.stamp[1]).format('YYYY-MM-DD HH:mm:ss')
        delete data.stamp
      }

      this.query = data
      this.getData(data)
    },
    reset() {
      this.page = 1
      this.formState = {}
      this.query = {}
      this.getData()
    },
    editRow(data) {
      this.editData = { ...data.attachList[0] }
      this.editId = data.id
      this.visible = true
    },
    submitSave() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.testingDataCollection.update,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: {
          id: this.editId,
          attachList: [
            {
              id: this.editData.id,
              attachmentId: this.editData.attachmentId,
              name: this.editData.name,
            },
          ],
        },
      }).then((res) => {
        if (res.success) {
          window.$oAntdMessage.success(res.msg || res.message)
          this.getData()
          this.visible = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    downloadAccessory(data) {
      window.open(
        data.url,
      )
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
