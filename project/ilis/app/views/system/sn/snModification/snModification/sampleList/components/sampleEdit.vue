<template>
  <ht-modal
    v-model:open="visible"
    title="设置样品编号"
    centered
    :confirm-loading="confirmLoading"
    :mask-closable="false"
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
            <template v-if="column.dataIndex === 'objectCodeMainBody'">
              <div>
                <a-input
                  :value="text"
                  @change="(e) => handleChange(e.target.value, record)"
                />
              </div>
            </template>
          </template>
        </a-table>
      </div>
      <SnRepeatHint :datas="repeatDatas" />
    </a-spin>
  </ht-modal>
</template>

<script>
// import { getQueryVariable } from "~/providers/common/utils";

import SnRepeatHint from '../../components/SnRepeatHint.vue'

const columns = [
  {
    title: '序号',
    dataIndex: 'sortNum',
  },
  {
    title: '样品编号',
    dataIndex: 'objectCodeMainBody',
    scopedSlots: { customRender: 'objectCodeMainBody' },
  },
  {
    title: '自定义后缀',
    dataIndex: 'objectCodeSuffix',
    width: 150,
    scopedSlots: { customRender: 'objectCodeSuffix' },
  },
]
export default {
  components: {
    SnRepeatHint,
  },
  props: ['callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      editData: null,
      data: [],
      columns,
      spinning: false,
      repeatDatas: [],
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
        url: window.$oApi.snModification.sampleUrl,
        method: 'GET',
        params: {
          testObjectCodes: data.testObjectCode,
          sampleAmount: data.sampleAmount,
          id: data.objectId,
        },
      }).then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const filterData = res.data.map((item, index) => ({
            sortNum: index + 1,
            ...item,
            objectCodeMainBody:
              item.testObjectCode && !item.objectCodeMainBody
                ? item.testObjectCode
                : item.objectCodeMainBody,
          }))
          this.data = filterData
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleChange(values, record) {
      const newData = [...this.data]
      const target = newData.filter(
        item => record.sortNum === item.sortNum,
      )[0]
      if (target) {
        target.testObjectCode = values
          ? values + (record.objectCodeSuffix || '')
          : ''
        target.objectCodeMainBody = values
        this.data = newData
      }
    },
    handleOk() {
      const realArr = this.data.map(item => item.testObjectCode)
      const data = {
        testObjectVoList: this.data,
        realValue: realArr.join(';').trim(),
        modelId: this.editData.modelId ? this.editData.modelId : '',
        snType: 'sample',
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
      })
        .then((res) => {
          if (res.code === 20000) {
            this.handleCancel()
            this.callback()
          }
          else if (res.code === -10000) {
            this.repeatDatas = res.data
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.confirmLoading = false
        })
        .catch(() => {
          window.$oAntdMessage.warning('网络异常, 请稍后重试')
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
