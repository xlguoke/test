<template>
  <ht-modal
    v-model:open="visibleSample"
    :dialog-style="{ top: '60px' }"
    width="1000px"
    :mask-closable="false"
    title="选择参数"
    @ok="okBtn"
  >
    <div
      class="modal-warp build-params-list mt-2"
      :style="`height:${modalWarpHeight}px`"
    >
      <a-form layout="inline" style="margin-bottom: 5px">
        <a-form-item label="参数名称">
          <a-input v-model:value="searchName" />
        </a-form-item>
        <a-form-item label="参数显示名称">
          <a-input v-model:value="displayName" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="searchList">
            查询
          </a-button>
          <a-button @click="resetList">
            重置
          </a-button>
        </a-form-item>
      </a-form>
      <a-table
        :key="refresh"
        class="mt-2"
        :row-selection="{
          selectedRowKeys,
          onChange: (_selectedRowKeys, _selectedRows) => {
            selectedRows = _selectedRows
            selectedRowKeys = _selectedRowKeys
          },
          getCheckboxProps: (record) => ({
            props: {
              disabled: keys.includes(record.id),
              defaultChecked: defaultChecked.includes(record.id),
            },
          }),
        }"
        :custom-row="customRow"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        :scroll="scroll"
        :pagination="pagination"
        bordered
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'isTempParam'">
            <span>{{ text == '0' ? '否' : '是' }}</span>
          </template>
          <template v-if="column.dataIndex === 'isHaveUdr'">
            <span>{{ text ? '是' : '否' }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </ht-modal>
</template>

<script>
import qs from 'qs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'ParamList',
  props: ['bigCategoryId', 'keys'],
  emits: ['getParams'],
  data() {
    return {
      visibleSample: false,
      loading: false,
      refresh: '',
      modalWarpHeight:
        document.body.clientHeight - (window.pageInto ? 300 : 280),
      scroll: { y: document.body.clientHeight - (window.pageInto ? 450 : 420) },
      columns: [
        { title: '检测项目', dataIndex: 'testItemName', key: 'testItemName' },
        { title: '参数系统名称', dataIndex: 'name', dataIndex: 'name' },
        {
          title: '参数显示名称',
          dataIndex: 'displayName',
        },
        {
          title: '是否临时参数',
          dataIndex: 'isTempParam',
          width: '95px',
        },
        {
          title: '系统模板',
          dataIndex: 'isHaveUdr',
          width: '70px',
        },
        { title: '备注', dataIndex: 'remark', dataIndex: 'remark' },
      ],
      data: [],
      checkboxAllVal: false,
      selectedRows: [],
      selectedRowKeys: [],
      defaultChecked: [],
      page: 1,
      size: 20,
      searchName: '',
      displayName: '',
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getParamsData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getParamsData()
        },
      },
      customRow: (record) => {
        return {
          onClick: () => {
            record._checked = !record._checked
            const index = this.selectedRowKeys.indexOf(record.id)

            index === -1
              ? this.selectedRowKeys.push(record.id)
              : this.selectedRowKeys.splice(index, 1)

            index === -1
              ? this.selectedRows.push(record)
              : this.selectedRows.splice(index, 1)
          },
        }
      },
    }
  },
  methods: {
    showModal() {
      this.visibleSample = true
      this.refresh = new Date().getTime()
      this.getParamsData(true)
    },
    // 获取参数列表
    getParamsData(load) {
      load && (this.page = 1)
      this.loading = true
      window.$oAjax
        .post(
          window.$oApi.consignList.getParamsList,
          qs.stringify({
            'bigCategory.id': this.bigCategoryId,
            'page': this.page,
            'rows': this.size,
            'name': this.searchName,
            'displayName': this.displayName,
          }),
        )
        .then((res) => {
          const list = res.rows || []
          const checked = []
          list.forEach((d) => {
            d.key = d.id
            d._checked = false
            if (this.keys.length > 0 && this.keys.includes(d.id)) {
              checked.push(d.id)
            }
          })
          this.defaultChecked = checked
          this.selectedRows = []
          this.selectedRowKeys = []
          this.loading = false
          this.data = list
          this.pagination.current = this.page
          this.pagination.pageSize = this.size
          this.pagination.total = res.total
        })
    },
    // 查询
    searchList() {
      this.getParamsData(true)
    },
    // 重置
    resetList() {
      this.searchName = ''
      this.displayName = ''
      this.getParamsData(true)
    },
    // 选择参数
    okBtn() {
      const ids = JSON.parse(JSON.stringify(this.selectedRowKeys))
      const datas = JSON.parse(JSON.stringify(this.selectedRows))
      if (ids.length === 0) {
        return window.$oAntdMessage.warning('请选择参数')
      }
      this.visibleSample = false
      $emit(this, 'getParams', { ids, datas })
    },
  },
}
</script>

<style lang="less">
.modal-warp {
  overflow: auto;
  &.build-params-list .ant-table-pagination.ant-pagination {
    margin-bottom: 0;
  }
}
</style>
