<template>
  <div class="contacts">
    <div class="contacts-search">
      <a-input
        v-model:value="searchText"
        placeholder="请输入工程名称"
        class="contacts-search-all"
      />
      <a-button @click="getFields">
        查询
      </a-button>
      <a-button
        :disabled="isDetail"
        type="primary"
        @click="() => (propertyProfileVisible = true)"
      >
        设置上报字段
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :pagination="false"
      :data-source="data"
      :loading="loading"
      bordered
      :row-class-name="rowClassName"
      row-key="key"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-space>
            <a-button
              v-permission="'update:progress'"
              type="link"
              :disabled="isDetail"
              @click="updateProgress(record)"
            >
              更新进度
            </a-button>
            <a-button type="link" @click="viewDetail(record)">
              查看详情
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <ht-modal
      v-model:open="propertyProfileVisible"
      title="上报字段设置"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="item-report-property" />
    </ht-modal>
    <UpdateProgressModal
      ref="UpdateProgressModal"
      :fields-data="fieldsData"
      :callback="getFields"
    />
    <DetailModal
      ref="DetailModal"
      :fields-data="fieldsData"
      :content-type="contentType"
    />
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import DetailModal from './components/detailModal.vue'
import UpdateProgressModal from './components/updateProgressModal.vue'

export default {
  components: {
    CustomProperty,
    UpdateProgressModal,
    DetailModal,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      isDetail: getQueryVariable('status') === '1',
      data: [],
      fieldsData: [],
      searchText: '',
      columns: [
        {
          title: '工程名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '进度比例',
          dataIndex: 'rateOfProgress',
          key: 'rateOfProgress',
          customRender: ({ text, record }) =>
            `${text || 0}% (+${record.rateIncrease || 0})`,
        },
        {
          title: '最近更新人员',
          dataIndex: 'createName',
        },
        {
          title: '最近更新时间',
          dataIndex: 'updateDate',
          key: 'updateDate',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      contentType: [
        { name: '数字', value: '1' },
        { name: '文本', value: '2' },
        { name: '是/否', value: '3' },
      ],
      loading: false,
      propertyProfileVisible: false,
    }
  },
  created() {
    this.getFields()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取自定义字段
    getFields() {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'item-report-property',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.fieldsData = res.data
            this.getData()
          }
        })
    },
    getData() {
      this.loading = true
      window.$oRest({
        method: 'get',
        url: `${window.$oApi.testItem.progressList}/${this.id}`,
        params: {
          name: this.searchText || null,
        },
      }).then((res) => {
        if (res && res.data) {
          this.columns = this.columns.filter(item => !item._isCustom)
          this.columns.splice(
            2,
            0,
            ...this.fieldsData.map(item => ({
              title:
                !item.isDelete
                  ? item.columnName
                  : `${item.columnName}(已删除)`,
              key: item.id,
              dataIndex: item.id,
              _isCustom: true,
              columnType: item.columnType,
            })),
          )
          this.data = this.formatData(res.data)
          this.loading = false
        }
      })
    },
    // 整理获取的数据
    formatData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        const obj = {
          key: item.id,
          name: item.name,
          createName: item.progressInfo.createName,
          updateDate: item.progressInfo.updateDate,
          rateIncrease: item.progressInfo.rateIncrease,
          rateOfProgress: item.progressInfo.rateOfProgress,
          attachment: item.progressInfo.attachment || {},
          type: item.type,
          isLeaf: false,
        }
        let children = null

        if (
          item.progressInfo.keyValueList
          && item.progressInfo.keyValueList.length !== 0
        ) {
          // eslint-disable-next-line array-callback-return
          item.progressInfo.keyValueList.map((field) => {
            obj[field.customColumnId] = field.customColumnValue
          })
        }

        if (item.children && item.children.length !== 0) {
          children = this.formatData(item.children)
        }

        obj.children = children
        arr.push(obj)
      })

      return arr
    },
    // 更新进度
    updateProgress(data) {
      this.$refs.UpdateProgressModal.showModal(data)
    },
    viewDetail(data) {
      this.$refs.DetailModal.showModal(data)
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getFields()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
