<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="false">
      <a-layout class="hitek-height-full" :style="{ background: 'var(--colorBgContainer)' }">
        <a-layout style="background-color: var(--colorBgContainer);">
          <a-layout-sider
            width="340"
            :style="{
              overflow: 'auto',
              padding: '10px',
              height: '100vh',
              position: 'fixed',
              left: 0,
              background: 'var(--colorBgContainer)',
            }"
          >
            <div>
              <a-button type="primary" @click="addPayType">
                添加
              </a-button>

              <a-button class="toolBtn-bar" @click="editRow">
                编辑
              </a-button>
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delPayType"
              >
                <a-button class="toolBtn-bar">
                  删除
                </a-button>
              </a-popconfirm>
            </div>
            <a-table
              style="margin-top: 10px"
              :columns="leftColumns"
              :loading="loading"
              :data-source="payTableData"
              :row-selection="rowSelection"
              :bordered="true"
              :pagination="false"
              :custom-row="setRow"
              row-key="customizeType"
            >
              <template #bodyCell="{ column, record, text }">
                <template v-if="column.dataIndex === 'selected'">
                  <div>
                    <a-switch
                      :checked="text"
                      size="small"
                      :disabled="
                        record.customizeType === 'FeeDetailContract'
                          || record.customizeType === 'FeeDetailCredit'
                      "
                      @change="(selected) => setDefPayType(selected, record)"
                    />
                  </div>
                </template>
              </template>
            </a-table>
          </a-layout-sider>

          <a-layout style="margin-left: 340px; padding: 0px 10px; background-color: var(--colorBgContainer)">
            <a-layout-content
              :style="{
                background: 'var(--colorBgContainer)',
                padding: '10px',
                margin: 0,
                minHeight: '280px',
                overflow: 'initial',
              }"
            >
              <CustomProperty
                v-if="selRow.length > 0"
                ref="custom"
                :key="selRow[0].customizeType"
                :customize-type="selRow[0].customizeType"
              />
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>

    <ht-modal
      title="支付方式"
      :mask-closable="true"
      :open="editPayTypeBoxVb"
      @ok="editPayTypeOk"
      @cancel="editPayTypeBoxVb = false"
    >
      <a-form-item
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 12 }"
        label="支付方式："
      >
        <a-input v-model:value="payTypeName" placeholder="请输入支付方式名称" />
      </a-form-item>
    </ht-modal>
  </div>
</template>

<script>
import CustomProperty from '~/providers/components/CustomProperty.vue'

const leftColumns = [
  {
    title: '支付方式',
    dataIndex: 'payMethod',
    key: 'payMethod',
    align: 'center',
  },
  {
    title: '是否默认',
    dataIndex: 'selected',
    key: 'selected',
    align: 'center',
  },
]

const columns = [
  {
    title: '排序号',
    dataIndex: 'standardName',
    scopedSlots: { customRender: 'standardName' },
  },
  {
    title: '属性名称',
    dataIndex: 'publishCode',
    scopedSlots: { customRender: 'publishCode' },
  },
  {
    title: '属性类型',
    dataIndex: 'executeDate',
    scopedSlots: { customRender: 'executeDate' },
  },
  {
    title: '侯选值',
    dataIndex: 'expireDate',
    scopedSlots: { customRender: 'expireDate' },
  },
]
export default {
  name: 'List',
  components: {
    CustomProperty,
  },
  data() {
    return {
      leftColumns,
      payTableData: [],
      loading: false,
      columns,
      tabledata: [],
      propertyProfileVisible: false,
      editPayTypeBoxVb: false,
      payTypeName: '',
      selRow: [],
      isSelData: false,
      handleType: 'add',
      selRowKey: [],
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selRowKey,
        columnTitle: '选择',
        type: 'radio',
        columnWidth: '80px',
        getCheckboxProps: () => {
          return record => ({
            props: {
              defaultChecked: record.customizeType === this.selRowKey[0],
            },
          })
        },
        onChange: (selRowKey, selRow) => {
          this.selRow = selRow
          this.selRowKey = selRowKey
        },
      }
    },
  },
  beforeCreate() {},
  mounted() {},
  created() {
    this.getPayList()
  },
  methods: {
    setRow(record) {
      return {
        onClick: () => {
          if (this.selRow[0].id !== record.id) {
            this.selRow = [record]
            this.selRowKey = [record.customizeType]
          }
        },
      }
    },
    getPayList() {
      this.loading = true
      window.$oAjax.get(`rest/method-payment/list`).then((res) => {
        this.loading = false
        if (Number.parseInt(res.code) === 20000) {
          this.payTableData = res.data
          if (res.data.length > 0 && this.selRow.length === 0) {
            this.selRow = [res.data[0]]
            this.selRowKey = [res.data[0].customizeType]
          }
        }
        else {
          window.$oAntdMessage.error('获取列表支付方式失败')
        }
      })
    },

    addPayAttribute() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请选择一条数据')
        return
      }
      this.propertyProfileVisible = true
    },
    editRow() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请选择一条数据')
        return
      }
      this.handleType = 'edit'
      this.payTypeName = this.selRow[0].payMethod
      this.editPayTypeBoxVb = true
    },

    addPayType() {
      this.handleType = 'add'
      this.payTypeName = ''
      this.editPayTypeBoxVb = true
    },
    setDefPayType(selected, row) {
      if (!selected) {
        return false
      }
      this.loading = true
      window.$oAjax({
        url: `/rest/method-payment/set-default`,
        method: 'put',
        data: {
          id: row.id,
        },
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => {
        this.loading = false
        if (Number.parseInt(res.code) === 20000) {
          this.getPayList()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },

    editPayTypeOk() {
      if (!this.payTypeName) {
        window.$oAntdMessage.warning('请输入支付名称')
        return
      }
      this.loading = true
      // 新增
      if (this.handleType == 'add') {
        window.$oAjax({
          url: `/rest/method-payment/save`,
          method: 'post',
          data: {
            payMethod: this.payTypeName,
          },
          headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
          this.loading = false
          if (Number.parseInt(res.code) === 20000) {
            window.$oAntdMessage.success('添加成功')
            this.editPayTypeBoxVb = false
            this.getPayList()
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
        // 编辑
      }
      else {
        // eslint-disable-next-line ts/no-this-alias
        const this_ = this
        window.$oAjax({
          url: `/rest/method-payment/update`,
          method: 'PUT',
          data: {
            id: this_.selRow[0].id,
            payMethod: this.payTypeName,
          },
          headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
          this.loading = false
          if (Number.parseInt(res.code) === 20000) {
            this.selRow[0].payMethod = this.payTypeName
            this.getPayList()
            this.editPayTypeBoxVb = false
            window.$oAntdMessage.success('编辑成功')
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
      }
    },
    delPayType() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请选择一条数据')
        return
      }
      this.loading = true
      window.$oAjax({
        url: `/rest/method-payment/delete/${this.selRow[0].id}`,
        method: 'DELETE',
      }).then((res) => {
        this.loading = false
        if (Number.parseInt(res.code) === 20000) {
          this.getPayList()
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
