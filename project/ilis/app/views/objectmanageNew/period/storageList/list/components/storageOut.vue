<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      ref="EditSample"
      title="出库"
      :open="visible"
      centered
      class="samplingManage-sample"
      :mask-closable="false"
      width="1000px"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form
            v-bind="layout"
            ref="ruleForm"
            :model="formData"
            :rules="rules"
            :hide-required-mark="false"
            style="width: 100%"
          >
            <a-row :gutter="15">
              <a-col span="8">
                <a-form-item label="出库日期" required prop="saveDate">
                  <a-date-picker
                    v-model:value="formData.saveDate"
                    type="date"
                    placeholder="请选择"
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
              <a-col span="8">
                <a-form-item label="领件人" required prop="user">
                  <a-auto-complete
                    v-model:value="formData.user"
                    :data-source="userData"
                    placeholder="请选择或输入"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <div class="scanBox">
            <div
              style="display: flex; border-top: 1px solid var(--colorSplit); padding: 10px 0"
            >
              <!-- <a-input style="width: 400px" ref="scanCode_" id="scanCode_" v-model="searchString" autocomplete="off"
                         placeholder="输入标签编码回车后即可添加" @pressEnter="byLabelFun"/>
                <a-button style="margin-left: 10px" type="primary" @click="byLabelFun">添加</a-button> -->
              <ScanCodeQuery1
                v-model:value="searchString"
                scan-type="example"
                @enter="scanCodeAddData"
              />
              <a-button
                style="margin-left: 10px"
                type="primary"
                @click="selected"
              >
                选择
              </a-button>
            </div>
            <a-table
              id="tableBox"
              :columns="columns"
              :pagination="data.length > 0 ? pagination : false"
              :data-source="data"
              bordered
              :custom-row="customRow"
              row-key="id"
              :row-class-name="rowClassName"
            >
              <template #bodyCell="{ column, record, text }">
                <template v-if="column.dataIndex === 'consignStatus'">
                  <span>
                    <span :style="`color:${record.color}`">{{ text }}</span>
                  </span>
                </template>

                <template v-if="column.dataIndex === 'operation'">
                  <a-popconfirm
                    v-if="data.length"
                    title="确定要删除?"
                    @confirm="() => deleteRow(record.id, record.uid)"
                  >
                    <a href="javascript:;"> 删除</a>
                  </a-popconfirm>
                </template>
              </template>
            </a-table>
          </div>
          <!-- <a-input style="visibility: hidden" ref="barCodeInput" v-model="barCode" size="small" @keyup.enter.native="payCode" /> -->
          <br />
          <!-- <a-button @click="okBtn()">okBtn</a-button> -->
        </div>
      </a-spin>
    </ht-modal>

    <WaitStorageOut ref="waitStorageOut" @success-ok="selectedComplete" />

    <RiskVerification
      ref="RiskVerification"
      content="出于风险考虑，请将滑块移动到最右侧控制设备关闭"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import RiskVerification from '~/providers/components/RiskVerification.vue'

import ScanCodeQuery1 from '~/providers/components/scanCodeQuery/index.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import waitStorageOut from './waitStorageOut.vue'

const columns = [
  {
    title: '样品名称',
    dataIndex: 'testSampleDisplayName',
    width: '10%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: '10%',
  },
  {
    title: '试样数量',
    dataIndex: 'sampleNum',
    width: '10%',
  },
  {
    title: '试件编号',
    dataIndex: 'periodCode',
    width: '10%',
  },
  {
    title: '龄期',
    dataIndex: 'periodDays',
    width: '10%',
  },
  {
    title: '预计试验时间',
    dataIndex: 'planTestTime',
    sorter: true,
    width: '10%',
    customRender: ({ text }) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
  },
  {
    title: '龄期状态',
    dataIndex: 'consignStatus',
    width: '10%',
    scopedSlots: { customRender: 'consignStatus' },
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
    WaitStorageOut: waitStorageOut,
    ScanCodeQuery1,
    RiskVerification,
  },
  emits: ['success-ok'],
  data() {
    return {
      data: [],
      dayjs,
      columns,
      spinning: false,
      visible: false,

      formData: {
        issaveDate: '0',
        saveDate: dayjs(new Date()) || undefined,
        user: '',
      },
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        saveDate: [
          { required: true, message: '出库日期不能为空', trigger: 'change' },
        ],
        user: [
          { required: true, message: '领件人不能为空', trigger: 'change' },
        ],
      },
      numberUnit: [],
      userData: [],
      searchString: '',
      barCode: '',
      queryParam: null,
      type: '',
      periodIds: getQueryVariable('periodIds') || '',
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData(this.data)
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
          this.getData(this.data)
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
                'hitek-tableRow-active',
              )
              const arr = this.selectedRowKeys
              arr.splice(
                arr.findIndex(item => item === record.id),
                1,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              $(`#tableBox tr[data-row-key="${record.id}"]`)
                .addClass('hitek-tableRow-active')
                .siblings()
                .removeClass('hitek-tableRow-active')
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
          },
        }
      },
    }
  },
  computed: {},
  created() {
    // this.testData();
    // localStorage.removeItem("storageOutUser");
  },
  mounted() {
    // 将GetResult方法绑定到window下面，提供给外部调用\
    // document.getElementById('scanCode_').focus();
    // this.$refs["barCodeInput"].focus();
    window.GetResult = this.okBtn
  },
  methods: {
    selectedComplete(data) {
      this.data = data
    },

    selected() {
      this.$refs.waitStorageOut.showModal(this.data)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取数量单位下
    getData(data, isAdd) {
      const newData = [...this.data]
      const errData = []
      let type = this.type === 'QRcode' ? 'qrCode' : 'rfid'
      if (isAdd) {
        type = 'labelId'
      }
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        const target = newData.filter(itemJ => item.id === itemJ.id)[0]
        if (!target) {
          if (item.error === '0') {
            newData.push({ ...item, ...this.timeShowHtml(item) })
          }
          else {
            errData.push(`编号 ${item[type]},${item.error}`)
          }
        }
      })
      this.data = newData
      this.pagination.pageSize = this.size
      this.pagination.current = this.page
      this.pagination.total = newData.length
      this.spinning = false
      if (errData.length > 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${errData.join('；\n')}`))
      }
    },
    deleteRow(did) {
      if (did) {
        const newData = [...this.data]
        this.data = newData.filter(item => item.id !== did)
        this.getData(this.data)
      }
    },
    scanCodeAddData(res) {
      const { err, data } = res
      if (err) {
        return window.$oAntdMessage.error(err.message || '添加失败')
      }
      else if (data.length === 0) {
        return window.$oAntdMessage.warning('未查询到样品入库信息')
      }
      const ids = this.data.map(d => d.id)
      const repeats = []
      const unValidStatus = []
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        const sn = d.testObjectCode ? `（${d.testObjectCode}）` : ''
        const msg = `${d.testSampleDisplayName}${sn}`
        if (ids.includes(d.id)) {
          repeats.push(msg)
        }
        else if (d.storageStatus != '1') {
          unValidStatus.push(msg)
        }
        else {
          this.data.unshift(d)
        }
      }
      this.pagination.total = this.data.length
      if (repeats.length > 0 || unValidStatus.length > 0) {
        const repeatStr = repeats.join(',')
        const unValidStr = unValidStatus.join(',')
        let str = ''
        if (repeatStr)
          str = `【${repeatStr}】已存在，无需重复添加！`
        if (unValidStr)
          str += `【${unValidStr}】当前状态无法出库！`
        window.$oAntdMessage.warning(str)
      }
    },
    // 样品出库 检测存放标养室是否存在空置情况
    async checkEmptyLab() {
      const res = await window.$oAjax.post('rest/humiture/res/period/out')

      if (res.code !== 20010) {
        if (res.data.length > 0) {
          const labNames = res.data.map(i => i.name).join(',')

          window.$oAntdConfirm({
            title: '提示',
            content: `系统检测到${labNames}无样品养护，是否需要关闭温湿度设备？`,
            okText: '关闭设备',
            cancelText: '不做控制',
            onOk: () => {
              this.$refs.RiskVerification.open(async () => {
                const hide = window.$oAntdMessage.loading('数据处理中...', 0)
                const res2 = await window.$oAjax
                  .post(
                    'rest/humiture/display/batch/close',
                    res.data.map(i => i.id).join(','),
                    {
                      headers: {
                        'content-type': 'application/json',
                      },
                    },
                  )
                  .finally(() => {
                    hide()
                  })

                if (res2.code !== 20010) {
                  window.$oAntdMessage.success('操作成功！')
                }
              })
            },
          })
        }
      }
    },
    // 保存提交数据
    async handleOk() {
      let result = false
      await this.$refs.ruleForm.validateFields().then(() => {
        result = true
      })
      if (!result) {
        return
      }
      const newData = [...this.data]
      this.spinning = true
      // periodIds
      const obj = {
        inOut: '2', // 1,2
        periodIds: '',
        user: this.formData.user,
      }
      if (this.formData.saveDate) {
        obj.date = this.formData.saveDate.format('YYYY-MM-DD')
      }
      obj.periodIds = newData.map(item => item.id).join(',')

      window.$oAjax({
        url: window.$oApi.storageList.storageInOut,
        data: window.$oQs.stringify(obj),
        method: 'post',
      }).then((res) => {
        if (res.code === 20000) {
          this.checkEmptyLab()
          this.storageOutUserFun(this.formData.user)
          this.handleCancel()
          $emit(this, 'success-ok')
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleCancel() {
      this.formData.user = ''
      this.searchString = ''
      this.data = []
      this.visible = false
    },
    showModal() {
      this.visible = true
      const samplesRow = localStorage.getItem('storageOutUser')
      this.userData = samplesRow ? JSON.parse(samplesRow) : []
      // window.$oNextTick(() => {
      //   this.$refs["barCodeInput"].focus();
      // });
    },
    storageOutUserFun(name) {
      if (!this.userData.toString().includes(name)) {
        this.userData.unshift(name)
        if (this.userData.length > 10) {
          this.userData.length = 10
        }
      }
      localStorage.setItem('storageOutUser', JSON.stringify(this.userData))
    },
    timeShowHtml(record) {
      const isTested = record.isTested
      const obj = {
        consignStatus: '已完成',
        color: '#ACACAC',
      }
      // 0 1-3 3 3+ 已完成

      if (isTested === '1') {
        obj.consignStatus = '已完成'
      }
      else {
        const end = record.planTestTime
        const start = new Date().getTime()
        const utc = end - start
        const day = Math.floor(utc / (24 * 60 * 60 * 1000)) // 天
        const H = Math.floor(utc / (60 * 60 * 1000) - 24 * day) // 小时
        // eslint-disable-next-line unused-imports/no-unused-vars
        const M = utc / (60 * 1000) // 分
        if (day < 0) {
          obj.consignStatus = '已超期'
          obj.color = '#DA0722'
        }
        else if (day >= 0 && day < 1) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#1890FF'
        }
        else if (day > 1 && day <= 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#F59D29'
        }
        else if (day > 4) {
          obj.consignStatus = `${day}天${H}小时后过期`
          obj.color = '#74B80A'
        }
      }
      return obj
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
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
