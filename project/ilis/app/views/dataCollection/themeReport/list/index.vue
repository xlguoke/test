<template>
  <div>
    <div class="dataCollection-search">
      <div v-if="allSearch">
        <a-form ref="formRef" :model="formState">
          <a-form-item
            label="主题类型"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-select v-model:value="formState.themeType" placeholder="请选择主题类型">
              <a-select-option value="undefined">
                全部
              </a-select-option>
              <a-select-option
                v-for="(item, index) in type"
                :key="index"
                :value="item.typename"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="主题名称"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.queryParam"
              placeholder="请输入主题名称"
            />
          </a-form-item>
          <a-form-item
            label="状态"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-select v-model:value="formState.themeStatus" placeholder="请选择状态">
              <a-select-option value="undefined">
                全部
              </a-select-option>
              <a-select-option
                v-for="(item, index) in themeStatusData"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="当前时间节点"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-date-picker
              v-model:value="formState.stamp"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item
            label="负责人名称"
            :label-col="{ span: 2 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.chargeName"
              placeholder="请输入负责人名称"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 20, offset: 2 }">
            <a-button @click="search(true)">
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
                  getData()
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
          v-model:value="queryParam"
          placeholder="请输入主题名称"
          class="dataCollection-search-all"
          @press-enter="search(true)"
        />
        <a-button @click="search(true)">
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
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :pagination="pagination"
      :row-class-name="rowClassName"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'isComplete'">
          <span v-if="text === '已完成'" style="color: green">
            <span class="dataCollection-ball" style="background: green"></span>
            {{ text }}
          </span>
          <span v-else-if="text === '未设置周期'" style="color: gray">
            <span class="dataCollection-ball" style="background: gray"></span>
            {{ text }}
          </span>
          <span v-else-if="text === '未完成'" style="color: red">
            <span class="dataCollection-ball" style="background: red"></span>
            {{ text }}
          </span>
        </template>

        <template v-if="column.dataIndex === 'contentList'">
          <div v-if="text">
            <div v-for="(item, index) in text" :key="index">
              <span v-if="item.contentNotice === '10'" style="color: red">[待上报]</span>
              <span v-if="item.contentNotice === '11'" style="color: green">[已上报]</span>
              <span v-if="item.contentNotice === '12'" style="color: red">[已超期待上报]</span>
              {{ item.content }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a href="javascript:;" @click="viewDetail(record.id)">查看</a>
          </div>
        </template>
      </template>
    </a-table>

    <ConfigComponent ref="ConfigComponent" :get-data="search" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'
import ConfigComponent from './components/config.vue'

const columns = [
  {
    title: '主题类型',
    dataIndex: 'themeType',
    width: '15%',
  },
  {
    title: '主题名称',
    dataIndex: 'themeName',
    width: '15%',
  },
  {
    title: '状态',
    dataIndex: 'themeStatus',
    width: '10%',
    customRender: ({ text }) => {
      return text === '1' ? '结束' : '进行中'
    },
  },
  {
    title: '负责人',
    dataIndex: 'chargeName',
    width: '15%',
  },
  {
    title: '当前时间节点',
    dataIndex: 'currentDate',
    width: '10%',
    customRender: ({ text }) => {
      return text ? formatTime(text, 'YYYY-MM-DD') : ''
    },
  },
  {
    title: '当前需我上报的资料',
    dataIndex: 'contentList',
    width: '25%',
    scopedSlots: { customRender: 'contentList' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    ConfigComponent,
  },
  data() {
    return {
      modalType: 'add',
      data: [],
      columns,
      configVisible: false,
      queryParam: '',
      formLayout: 'horizontal',
      formState: {},
      allSearch: false,
      loading: false,
      spinning: false,
      page: 1,
      size: 10,
      type: [],
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
      themeStatusData: [
        { name: '进行中', value: '0' },
        { name: '已结束', value: '1' },
      ],
    }
  },
  created() {
    this.getTypeData()
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getTypeData() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '402882846e7c792d016e7c8606340005' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.type = res.obj
        }
        else {
          message.error(res.msg)
        }
      })
    },
    getData(data) {
      const { page, size } = this
      this.loading = true
      window.$oRest
        .get(window.$oApi.dataCollection.reportList, {
          params: {
            page,
            size,
            ...data,
          },
        })
        .then((res) => {
          this.data = res.obj.rows
          this.pagination.total = res.obj.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
        })
    },
    // 搜索
    async search(flag) {
      if (flag) {
        this.page = 1
      }
      let data = {}
      if (this.allSearch) {
        await this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.formState }
          data = {
            ...values,
          }
          if (values.stamp) {
            data.nodeDate = values.stamp
          }

          if (data.themeType === 'undefined') {
            delete data.themeType
          }
          if (data.themeStatus === 'undefined') {
            delete data.themeStatus
          }

          delete data.stamp
        })
      }
      else {
        data.queryParam = this.queryParam.trim()
      }

      this.getData(data)
    },
    // 切换搜索类型
    searchType(bool) {
      this.allSearch = bool
    },
    viewDetail(id) {
      this.$refs.ConfigComponent.showModal(id)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
