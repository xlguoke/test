<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div>
          <div class="title">
            {{ term('样品信息') }}
          </div>
          <div class="contentBox">
            <div v-if="saveData.length > 0" style="margin-top: 8px">
              <div
                v-for="(item, index) in saveData"
                :key="item.id"
                style="padding-top: 3px"
              >
                <span> {{ item.sampleName }} </span>
                <span v-if="item.sampleSn"> ({{ item.sampleSn }}) </span>
                <DeleteOutlined style="margin-left: 10px; color: red" @click="delSampleInfo(index)" />
              </div>
            </div>
            <div style="padding: 10px 0">
              <a-button @click="setConsign">
                选择已有委托数据
              </a-button>
              <a-button

                class="toolBtn-bar"
                @click="setAddRow"
              >
                新增
              </a-button>
            </div>
          </div>
        </div>
        <div>
          <div class="title">
            分包情况
          </div>
          <div style="padding-top: 15px">
            <a-form ref="formRef" :label-col="{ span: 4 }" :model="dataObj">
              <a-form-item
                label="分包单位"
                :rules="[{ required: true, message: '分包单位不能为空!' }]"
                name="unitSubcontractName"
              >
                <div style="display: flex">
                  <a-input
                    v-model:value="dataObj.unitSubcontractName"
                    style="flex: 1"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                    placeholder="请选择"
                  />
                  <a-button
                    :disabled="isDetail"
                    style="margin-left: 15px"
                    @click="setUnitSubcontract"
                  >
                    选择
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item
                label="分包日期"
                :rules="[{ required: true, message: '分包日期不能为空!' }]"
                name="subcontractDate"
              >
                <a-date-picker
                  v-model:value="dataObj.subcontractDate"
                  :disabled="isDetail"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
              <a-form-item
                label="分包费用(元)"
                name="fee"
              >
                <a-input-number
                  v-model:value="dataObj.fee"
                  :min="0"
                  :disabled="isDetail"
                  placeholder="请输入"
                />
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
    </a-spin>
    <ht-modal
      title="选择分包单位"
      centered
      :open="visibleUnit"
      :mask-closable="false"
      width="80%"
      class="selUnitBox"
      @cancel="handleCancelUnit"
    >
      <SelUnitSubcontract ref="SelUnitSubcontract" />
      <template #footer>
        <div>
          <a-button @click="handleCancelUnit">
            取消
          </a-button>
          <a-button type="primary" @click="handleOkUnit">
            确定
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
    <Add ref="Add" :callback="getAddRow" />
    <ht-modal
      title="选择已有委托数据"
      :open="eqVisible"
      :mask-closable="false"
      width="85%"
      @cancel="cancelConsign"
      @ok="getConsign"
    >
      <iframe
        id="eqVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="eqVisibleUrl"
      ></iframe>
    </ht-modal>
  </div>
</template>

<script>
import { DeleteOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import { useIndustryStore } from '~/store/industryStore'
import SelUnitSubcontract from '~/views/system/subcontract/unitSubcontract/list/index.vue'
import Add from './add.vue'

export default {
  components: {
    SelUnitSubcontract,
    Add,
    DeleteOutlined,
  },
  props: ['callback'],
  setup() {
    const { term } = useIndustryStore()

    return { term }
  },
  data() {
    return {
      id: getQueryVariable('id') || null, // 用于任务分配的分包登记回显数据
      spinning: false,
      rootUrl,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      dayjs,
      // eslint-disable-next-line regexp/no-useless-assertions
      RegExp: /@"(^(0\.0*[1-9]\d*$|[1-9]\d*\.\d+$|[1-9]\d*$)|^0$)"/,
      isDetail: false,
      dataObj: {},
      unitSubcontractData: [],
      addSourceData: [],
      visibleUnit: false,
      eqVisible: false,
      saveData: [],
      eqVisibleUrl: `${rootUrl}/unAssignedTaskController.do?goListUnAssignedPage&onlySelect=1&model=subcontractManage`,
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, true)
      // 获取传递数据直接调 getConsign
    }

    if (this.id) {
      this.getData()
    }
  },
  mounted() {
    window.layerOkCallback = this.handleOk
  },
  methods: {
    async getData() {
      const res = await window.$oAjax.get(window.$oApi.common.getTemporaryData, {
        params: {
          id: this.id,
        },
      })

      let data = []
      if (res && res.code === 20000 && res.data) {
        try {
          const result = JSON.parse(res.data)
          data = result.data
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (error) {

        }
      }

      this.saveData = data.map(item => this.getConsignObj(item))
    },
    // 分包单位  下方显示
    setUnitSubcontract() {
      const acceptData = this.unitSubcontractData
      this.visibleUnit = true
      window.$oNextTick(() => {
        this.$refs.SelUnitSubcontract.showModal('1', acceptData)
      })
    },
    // 分包单位 回显
    handleOkUnit() {
      const acceptData = this.$refs.SelUnitSubcontract.handleOk()
      this.unitSubcontractData = acceptData.map(item => ({
        id: item.id,
        name: item.unitName,
      }))
      this.dataObj.unitSubcontractName = this.unitSubcontractData[0].name
      this.visibleUnit = false
    },
    handleCancelUnit() {
      this.visibleUnit = false
    },
    showModal(editId, isDetail) {
      this.isDetail = isDetail
      if (editId) {
        this.spinning = true
        window.$oAjax({
          method: 'get',
          // url: window.$oApi.equipStartStop.getById,
          params: { id: editId },
        }).then((res) => {
          if (res.success) {
            this.dataObj = res.obj

            this.unitSubcontractData = {
              id: this.dataObj.equipmentId,
              name: this.dataObj.equipmentName,
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = null
          }
          this.spinning = false
        })
        this.spinning = false
      }
    },
    dataRequired() {
      if (this.unitSubcontractData.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择分包单位'))
        return false
      }
      if (this.saveData.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`请选择${this.term('样品信息')}`))
        return false
      }
      return true
    },
    handleOk(cbFun) {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.dataObj }
        const values = {
          ...fieldsValue,
          subcontractDate: fieldsValue.subcontractDate || '',
        }

        if (this.dataRequired(values)) {
          const data = this.saveData.map(item => ({
            sourceType: item.sourceType || '',
            subcontractUnit: this.unitSubcontractData[0].name,
            subcontractUnitId: this.unitSubcontractData[0].id,
            status: '',
            fee: values.fee || '',
            subcontractDate: values.subcontractDate || '',
            sampleName: item.sampleName || '',
            sampleSn: item.sampleSn || '',
            testObjectId: item.testObjectId || '',
            standard: item.standard || '',
            projectPartAndUse: item.projectPartAndUse || '',
            consignSn: item.consignSn || '',
            consignId: item.consignId || '',
            consignDate: item.consignDate || '',
            requireReportDate: item.requireReportDate || '',
            consignUnit: item.consignUnit || '',
            consignUnitId: item.consignUnitId || '',
            consignProject: item.consignProject || '',
            consignProjectId: item.consignProjectId || '',
          }))

          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.subcontractManage.saveUrl,
            data,
            headers: {
              'Content-Type': 'application/json',
            },
          })
            .then((res) => {
              if (res.code === 20000) {
                window.$oAntdMessage.success('操作成功')
                this.handleCancel()
                if (cbFun) {
                  cbFun(res)
                }
                if (this.callback) {
                  this.callback()
                }
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
              this.spinning = false
            })
            .catch(() => {
              this.spinning = false
            })
        }
      })
    },
    handleCancel() {
      this.dataObj = {}
      this.unitSubcontractData = []
      this.addSourceData = []
      this.saveData = []
    },
    // 新增,上方显示
    setAddRow() {
      this.$refs.Add.showModal()
    },
    getAddRow(data) {
      this.addSourceData = [data]
      if (this.saveData.length > 0) {
        const oldObj = this.saveData.filter(itemJ => itemJ.id === data.id)[0]
        if (!oldObj) {
          this.saveData.push({ ...data })
        }
      }
      else {
        this.saveData.push({ ...data })
      }
    },
    // 选择已有委托数据
    setConsign() {
      this.eqVisible = true
      if (this.saveData.length === 0) {
        this.eqVisibleUrl += '&new'
      }
    },
    cancelConsign() {
      this.eqVisible = false
    },
    // 获取已有委托数据,上方显示
    getConsign() {
      const data
        = (document.getElementById('eqVisible')
          && document.getElementById('eqVisible').contentWindow
          && document.getElementById('eqVisible').contentWindow.$('#dataGrid')
          && document
            .getElementById('eqVisible')
            .contentWindow
            .$('#dataGrid')
            .datagrid('getSelections'))
          || []

      if (data.length > 0) {
        if (this.saveData.length > 0) {
          // eslint-disable-next-line array-callback-return
          data.map((item) => {
            const oldObj = this.saveData.filter(
              itemJ => itemJ.id === item.id,
            )[0]
            if (!oldObj) {
              this.saveData.push(this.getConsignObj(item))
            }
          })
        }
        else {
          this.saveData = data.map(item => this.getConsignObj(item))
        }
      }

      window.$oNextTick(() => {
        this.eqVisible = false
      })
    },
    getConsignObj(item) {
      return {
        id: item.id || '',
        sourceType: '1',
        sampleName: item.testSampleDisplayName || '',
        sampleSn: item.testObjectCode || '',
        testObjectId: item.sampleId || '',
        projectPartAndUse: item.partAndUse || '',
        consignSn: item.consignCode || '',
        standard: item.standard || '',
        consignId: item.consignId || '',
        consignDate: item.consignDate || '',
        requireReportDate: item.requireReportDate || null,
        consignUnit: item.consignUnitName || '',
        consignUnitId: item.consignUnitId || '',
        consignProject: item.projectName || '',
        consignProjectId: item.projectId || '',
      }
    },
    delSampleInfo(index) {
      this.saveData.splice(index, 1)
    },
  },
}
</script>

<style lang="less">
.title {
  background: #eee;
  padding: 5px 10px;
  color: #000;
  font-size: 14px;
}
.selUnitBox {
  .ant-modal-body {
    height: 464px;
    overflow-y: auto;
  }
}
</style>
