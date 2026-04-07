<template>
  <ht-modal
    title="设置来样编号"
    centered
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-table
          :columns="columns"
          :pagination="false"
          :data-source="data"
          bordered
          row-key="sortNum"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'provideToCustomerSampleCode'">
              <div>
                <a-input
                  :value="text"
                  @change="
                    (e) =>
                      handleChange(
                        e.target.value,
                        record,
                        'provideToCustomerSampleCode',
                      )
                  "
                />
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </ht-modal>
</template>

<script>
// import { getQueryVariable } from "~/providers/common/utils";

const columns = [
  {
    title: '序号',
    dataIndex: 'sortNum',
  },
  {
    title: '操作',
    dataIndex: 'provideToCustomerSampleCode',
    scopedSlots: { customRender: 'provideToCustomerSampleCode' },
  },
]
export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      editData: null,
      data: [],
      columns,
      spinning: false,
    }
  },
  computed: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(data) {
      this.spinning = true
      this.visible = true
      this.editData = data
      window.$oAjax({
        url: window.$oApi.snModification.ptcSampleUrl,
        method: 'GET',
        params: {
          provideToCustomerSampleCodes: data.provideToCustomerSampleCode,
          sampleAmount: data.sampleAmount,
        },
      }).then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          this.data = res.data.map((item, index) => ({
            sortNum: index + 1,
            provideToCustomerSampleCode: item.provideToCustomerSampleCode,
          }))
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleChange(values, record, column) {
      const newData = [...this.data]
      const target = newData.filter(
        item => record.sortNum === item.sortNum,
      )[0]
      if (target) {
        target[column] = values
        this.data = newData
      }
    },
    handleOk() {
      const realArr = this.data.map(item => item.provideToCustomerSampleCode)
      const data = {
        realValue: realArr.join(';').trim(),
        modelId: this.editData.modelId ? this.editData.modelId : '',
        snType: 'provideToCustomerSample',
        objectId: this.editData.objectId ? this.editData.objectId : '',
      }
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
          this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.editData = null
      this.visible = false
    },
  },
}
</script>

<style scoped></style>
