<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="详情"
      :mask-closable="false"
      width="90%"
      @ok="cancelModal"
    >
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px">
        {{ apiData.title }}
      </div>
      <a-table
        :columns="columns"
        :data-source="data"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ y: 300 }"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'attachment'">
            <a
              href="javascript:;"
              @click="downloadAccessory(text.attachmentId)"
            >{{ text.attachmentName }}</a>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { downloadAccessory } from '~/providers/common/utils'

export default {
  props: ['fieldsData', 'contentType'],
  data() {
    return {
      downloadAccessory,
      data: [],
      apiData: {},
      loading: false,
      visible: false,
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
          title: '上报人员',
          dataIndex: 'createName',
        },
        {
          title: '查看附件',
          dataIndex: 'attachment',
          key: 'attachment',
          scopedSlots: { customRender: 'attachment' },
        },
        {
          title: '上报时间',
          dataIndex: 'updateDate',
          key: 'updateDate',
        },
      ],
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // eslint-disable-next-line unused-imports/no-unused-vars
    getData(type, id) {
      this.loading = true

      const { page, size } = this

      window.$oRest({
        url: `${window.$oApi.testItem.progressDetail}/${this.apiData.type}/${this.apiData.id}`,
        params: {
          page,
          size,
        },
      }).then((res) => {
        if (res && res.data) {
          let columns = this.columns
          columns = columns.filter(item => !item._isCustom)
          columns.splice(
            2,
            0,
            ...this.fieldsData.map(item => ({
              title:
                item.isDelete == '0'
                  ? item.columnName
                  : `${item.columnName}(已删除)`,
              key: item.id,
              dataIndex: item.id,
              _isCustom: true,
              columnType: item.columnType,
            })),
          )

          this.columns = columns.map(item => ({
            ...item,
            width: `${100 / (columns.length + this.fieldsData.length)}%`,
          }))

          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.loading = false
          this.data = res.data.rows.map((item) => {
            const obj = {}
            if (item.keyValueList && item.keyValueList.length > 0) {
              // eslint-disable-next-line array-callback-return
              item.keyValueList.map((keyValueList) => {
                obj[keyValueList.customColumnId]
                  = keyValueList.customColumnValue
              })
            }
            return {
              ...item,
              ...obj,
            }
          })
        }
      })
    },
    showModal(data) {
      this.visible = true
      this.apiData = {
        type: data.type,
        id: data.key,
        title: data.name,
      }
      this.getData()
    },
    cancelModal() {
      this.visible = false
    },
  },
}
</script>

<style lang="less"></style>
