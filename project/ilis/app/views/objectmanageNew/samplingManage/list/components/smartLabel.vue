<template>
  <div class="samplingManage-smartLabel">
    <a-table
      ref="labelTable"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :scroll="{ y: 240 }"
      row-key="key"
      :loading="loading"
    >
      <template #bodyCell="{ column, record, text, index }">
        <template v-if="column.dataIndex === 'storeId'">
          <div>
            <div v-if="record._new && !record._complete">
              <a-input
                v-model:value="record.storeId"
                :class="record.errorMsg ? 'samplingManage-smartLabel-error' : ''"
                :read-only="checkIdLoading"
                @change="changeLabelId(record)"
                @blur="checkId(record, 'storeId')"
              >
                <template #addonAfter>
                  <SyncOutlined v-if="checkIdLoading" spin @click="checkId(record, 'storeId')" />
                  <ReloadOutlined v-else @click="checkId(record, 'storeId')" />
                </template>
              </a-input>
              <div
                v-if="record.storeIdErrorMsg"
                class="samplingManage-smartLabel-errorMsg"
              >
                {{ record.storeIdErrorMsg }}
              </div>
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'barcodeId'">
          <div>
            <div v-if="record._new && !record._complete">
              <a-input
                v-model:value="record.barcodeId"
                :class="record.errorMsg ? 'samplingManage-smartLabel-error' : ''"
                :read-only="checkIdLoading"
                @change="changeLabelId(record)"
                @blur="checkId(record, 'barcodeId')"
              >
                <template #addonAfter>
                  <SyncOutlined v-if="checkIdLoading" spin @click="checkId(record, 'barcodeId')" />
                  <ReloadOutlined v-else @click="checkId(record, 'barcodeId')" />
                </template>
              </a-input>
              <div
                v-if="record.barcodeIdErrorMsg"
                class="samplingManage-smartLabel-errorMsg"
              >
                {{ record.barcodeIdErrorMsg }}
              </div>
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'rfid'">
          <div>
            <div v-if="record._new && !record._complete">
              <a-input
                v-model:value="record.rfid"
                :class="record.errorMsg ? 'samplingManage-smartLabel-error' : ''"
                :read-only="checkIdLoading"
                @change="changeLabelId(record)"
                @blur="checkId(record, 'rfid')"
              >
                <template #addonAfter>
                  <SyncOutlined v-if="checkIdLoading" spin @click="checkId(record, 'rfid')" />
                  <ReloadOutlined v-else @click="checkId(record, 'rfid')" />
                </template>
              </a-input>
              <div
                v-if="record.rfidErrorMsg"
                class="samplingManage-smartLabel-errorMsg"
              >
                {{ record.rfidErrorMsg }}
              </div>
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'periodCode'">
          <div>
            <div v-if="pageStatus !== 3">
              <a-input v-model:value="record.periodCode" placeholder="请输入" />
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'formingDate'">
          <div>
            <div v-if="pageStatus !== 3">
              <a-date-picker
                v-model:value="record.formingDate"
                placeholder="请选择"
              />
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'days'">
          <div>
            <div v-if="pageStatus !== 3">
              <a-input-number
                v-model:value="record.days"
                :min="0"
                style="width: 100%"
                placeholder="请输入"
              />
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'description'">
          <div>
            <div v-if="pageStatus !== 3">
              <a-input v-model:value="record.description" placeholder="请输入" />
            </div>
            <div v-else>
              {{ text }}
            </div>
          </div>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="pageStatus !== 3">
              <a
                v-if="!record._new"
                href="javascript:;"
                @click="changeSmartLabel(index)"
              >变更</a>
              <a
                v-if="record._new"
                href="javascript:;"
                @click="deleteRow(record, index)"
              >删除</a>
            </template>
          </div>
        </template>
      </template>
    </a-table>

    <ht-modal
      width="420px"
      centered
      title="智能标签编号变更"
      :open="changeVisible"
      :confirm-loading="spinning"
      :mask-closable="false"
      @cancel="cancelVisible"
      @ok="submitChange"
    >
      <a-spin :spinning="spinning">
        <a-radio-group
          v-model:value="labelChangeFormData.changeType"
          name="changeType"
        >
          <a-radio :value="1">
            变更
          </a-radio>
          <a-radio :value="2">
            作废
          </a-radio>
        </a-radio-group>
        <div v-if="labelChangeFormData.changeType === 1">
          <a-row :gutter="8" style="margin-top: 8px">
            <a-col span="10">
              <a-select
                v-model:value="labelChangeFormData.type"
                style="width: 100%"
                placeholder="请选择"
                @change="selectChangeType"
              >
                <a-select-option value="barcodeId">
                  二维码
                </a-select-option>
                <a-select-option value="rfid">
                  RFID
                </a-select-option>
                <a-select-option value="storeId">
                  标签编码
                </a-select-option>
              </a-select>
            </a-col>
            <a-col span="14">
              <a-input
                ref="CodeInput"
                v-model:value="labelChangeFormData.value"
                placeholder="请扫码或输入"
                @press-enter="checkCode"
                @change="changeLabelChangeFormData"
              >
                <template #addonAfter>
                  <ReloadOutlined v-if="labelChangeFormData.icon === 'reload'" :spin="labelChangeFormData.loading" @click="checkCode" />
                  <SyncOutlined v-else-if="labelChangeFormData.icon === 'sync'" :spin="labelChangeFormData.loading" @click="checkCode" />
                  <CheckCircleOutlined v-else style="color: green;" @click="checkCode" />
                </template>
              </a-input>
            </a-col>
          </a-row>
          <div
            v-if="labelChangeFormData.errorMsg"
            style="padding-top: 4px; text-align: right; color: red"
          >
            {{ labelChangeFormData.errorMsg }}
          </div>
        </div>
        <a-textarea
          v-model:value="labelChangeFormData.comment"
          :rows="6"
          placeholder="请填写变更原因"
          style="margin-top: 8px"
        ></a-textarea>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { CheckCircleOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons-vue'
import { formatTime } from '~/providers/common/utils'
import '~/providers/libs/jQuery.3.6.0.min'

export default {
  components: {
    ReloadOutlined,
    SyncOutlined,
    CheckCircleOutlined,
  },
  // viewType为2时，为标养类型样品，需补充标养信息
  // pageStatus 1新增 2编辑 3查看
  props: ['viewType', 'pageStatus'],
  data() {
    return {
      changeVisible: false,
      labelChangeFormData: {
        changeType: 1,
        loading: false,
        type: 'barcodeId',
        icon: 'reload',
      },
      data: [],
      columns: [],
      checkIdLoading: false,
      checkCodeloading: false,
      changeIndex: '',
      spinning: false,
      loading: false,
    }
  },
  watch: {
    viewType() {
      this.buildTableColumn()
    },
  },
  created() {
    this.buildTableColumn()
  },
  methods: {
    addLabel() {
      this.data.push({
        key: new Date().getTime(),
        storeId: '',
        barcodeId: '',
        rfid: '',
        days: '',
        description: '',
        formingDate: '',
        objectGroupNum: '1',
        periodCode: '',
        testParamId: '',
        testParamName: '',
        _new: true,
      })

      const ele = $(this.$refs.labelTable.$el)
      const body = ele.find('.ant-table-body')

      window.$oNextTick(() => {
        body.animate({ scrollTop: body.height() })
      })
    },
    changeSmartLabel(index) {
      this.changeIndex = index
      this.changeVisible = true
    },
    cancelVisible() {
      this.changeVisible = false
      window.$oNextTick(() => {
        this.changeIndex = ''
        this.labelChangeFormData = {
          changeType: 1,
          loading: false,
          type: 'barcodeId',
          icon: 'reload',
        }
      })
    },
    async submitChange() {
      if (this.labelChangeFormData.changeType === 1) {
        this.saveChangeLabel()
      }
      else if (this.labelChangeFormData.changeType === 2) {
        const res = await this.deleteLabel()
        if (res && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.data.splice(this.changeIndex, 1)
          this.cancelVisible()
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '操作失败'),
          )
        }
      }
    },
    async saveChangeLabel() {
      const { barcodeId, rfid, storeId } = this.labelChangeFormData
      if (!rfid || !barcodeId || !storeId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入编码并点击查询进行关联'))
        return
      }

      const res = await this.deleteLabel()
      if (res && res.code !== 20010) {
        this.data[this.changeIndex].barcodeId = barcodeId
        this.data[this.changeIndex].rfid = rfid
        this.data[this.changeIndex].storeId = storeId
        this.data[this.changeIndex]._complete = true
        window.$oAntdMessage.success('操作成功')
        this.cancelVisible()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message || '操作失败'))
      }
    },
    selectChangeType() {
      this.$refs.CodeInput.focus()
    },
    changeLabelChangeFormData() {
      this.labelChangeFormData.errorMsg = ''
      this.labelChangeFormData.icon = 'reload'
      this.labelChangeFormData.barcodeId = ''
      this.labelChangeFormData.rfid = ''
      this.labelChangeFormData.storeId = ''
    },
    checkCode() {
      if (!this.labelChangeFormData.loading) {
        if (!this.labelChangeFormData.value) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请输入编号后再进行查询'))
          return
        }

        this.labelChangeFormData.loading = true
        this.labelChangeFormData.icon = 'sync'

        window.$oAjax
          .get(window.$oApi.samplingManage.getLabelId, {
            params: {
              param: this.labelChangeFormData.value,
            },
          })
          .then((res) => {
            this.labelChangeFormData.loading = false
            if (res.code === 20000) {
              const { barcodeId, rfid, id } = res.data
              this.labelChangeFormData.barcodeId = barcodeId
              this.labelChangeFormData.rfid = rfid
              this.labelChangeFormData.storeId = id
              this.labelChangeFormData.icon = 'check-circle'
            }
            else {
              this.labelChangeFormData.errorMsg
                = res.msg || res.message || '查询失败'
              this.labelChangeFormData.icon = 'reload'
            }
          })
          .catch(() => {
            this.labelChangeFormData.loading = false
            this.labelChangeFormData.icon = 'reload'
            window.$oAntdModal.warning(window.$oMsgTips.info('查询失败'))
          })
      }
    },
    // 作废标签
    async deleteLabel() {
      const { comment } = this.labelChangeFormData
      const record = this.data[this.changeIndex]

      let res
      this.spinning = true
      // eslint-disable-next-line prefer-const
      res = await window.$oAjax({
        url: `${window.$oApi.samplingManage.deleteRfid}/${record.id}`,
        method: 'delete',
        params: {
          comment: `变更 ${comment}`,
        },
        headers: {
          'content-type': 'application/json',
        },
      })

      this.spinning = false
      return res
    },
    deleteRow(row, rowIndex) {
      window.$oAntdConfirm({
        title: '提示',
        content: '确认要删除吗?',
        onOk: () => {
          this.data = this.data.filter((item, index) => index !== rowIndex)
        },
      })
    },
    buildTableColumn() {
      const viewType = this.viewType || '0'
      if (viewType === '1') {
        this.columns = [
          {
            title: 'ID',
            dataIndex: 'storeId',
            width: '14%',
            scopedSlots: { customRender: 'storeId' },
          },
          {
            title: '二维码',
            dataIndex: 'barcodeId',
            width: '14%',
            scopedSlots: { customRender: 'barcodeId' },
          },
          {
            title: 'RFID码',
            dataIndex: 'rfid',
            width: '14%',
            scopedSlots: { customRender: 'rfid' },
          },
          {
            title: '试件编号',
            dataIndex: 'periodCode',
            width: '12.5%',
            scopedSlots: { customRender: 'periodCode' },
          },
          {
            title: '制件日期',
            dataIndex: 'formingDate',
            width: '13%',
            scopedSlots: { customRender: 'formingDate' },
          },
          {
            title: '龄期(天)',
            dataIndex: 'days',
            width: '10%',
            scopedSlots: { customRender: 'days' },
          },
          {
            title: '制样情况描述',
            dataIndex: 'description',
            width: '12.5%',
            scopedSlots: { customRender: 'description' },
          },
          {
            title: '操作',
            dataIndex: 'operation',
            width: '10%',
            scopedSlots: { customRender: 'operation' },
          },
        ]
      }
      else {
        this.columns = [
          {
            title: 'ID',
            dataIndex: 'storeId',
            width: '25%',
            scopedSlots: { customRender: 'storeId' },
          },
          {
            title: '二维码',
            dataIndex: 'barcodeId',
            width: '25%',
            scopedSlots: { customRender: 'barcodeId' },
          },
          {
            title: 'RFID码',
            dataIndex: 'rfid',
            width: '25%',
            scopedSlots: { customRender: 'rfid' },
          },
          {
            title: '操作',
            dataIndex: 'operation',
            width: '25%',
            scopedSlots: { customRender: 'operation' },
          },
        ]
      }
    },
    // 隐藏查询信息
    changeLabelId(record) {
      record.storeIdErrorMsg = ''
      record.barcodeIdErrorMsg = ''
      record.rfidErrorMsg = ''
    },
    checkId(record, field) {
      if (!this.checkIdLoading) {
        if (!record[field]) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请输入后再进行查询并关联'))
          return
        }

        this.checkIdLoading = true
        window.$oAjax
          .get(window.$oApi.samplingManage.getLabelId, {
            params: {
              param: record[field],
            },
          })
          .then((res) => {
            this.checkIdLoading = false
            if (res.code === 20000) {
              const { barcodeId, rfid, id } = res.data
              record.barcodeId = barcodeId
              record.rfid = rfid
              record.storeId = id
              record._complete = true
            }
            else {
              record[`${field}ErrorMsg`] = res.msg || res.message || '查询失败'
            }
          })
          .catch(() => {
            this.checkIdLoading = false
            window.$oAntdModal.warning(window.$oMsgTips.info('查询失败'))
          })
      }
    },
    getPeriods() {
      const periods = []
      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i]
        periods.push({
          ...item,
          formingDate: item.formingDate
            ? formatTime(new Date(item.formingDate), 'YYYY-MM-DD')
            : '',
          index: i,
          mark: this.broofa(),
        })
      }
      return periods
    },
    broofa() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        },
      )
    },
    resetComponentData() {
      this.data = []
    },
    setComponentData(id, periods) {
      this.loading = true
      window.$oAjax
        .get(window.$oApi.samplingManage.labelRecordList, {
          params: {
            param: id,
          },
        })
        .then((res) => {
          this.loading = false
          if (res.code === 20000) {
            const data = res.data.filter(item => !item.deprecated)

            const result = []
            for (let i = 0; i < periods.length; i++) {
              const period = data.find(
                item =>
                  item.storeId === periods[i].storeId
                  || item.storeId === periods[i].id,
              )
              if (period) {
                result.push({
                  ...periods[i],
                  ...period,
                  key: i,
                })
              }
            }

            this.data = result
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
.samplingManage-smartLabel {
  .anticon-reload {
    color: #999;
    font-size: 14px;
    margin-top: 2px;
    cursor: pointer;
  }

  .samplingManage-smartLabel-error {
    box-shadow: 0 0 0 2px rgb(245 34 45 / 20%) !important;
    border-color: #f31a24;
  }

  .samplingManage-smartLabel-errorMsg {
    color: red;
    line-height: 18px;
    margin-top: 5px;
  }

  :deep(.ant-table-tbody td a) {
    margin-right: 8px;
  }

  :deep(.ant-table-thead > tr > th i.anticon),
  :deep(.ant-table-tbody > tr > td i.anticon) {
    margin-right: 0;
  }

  :deep(.ant-input-group-addon) {
    font-size: 12px;
    padding: 0 5px;
  }

  :deep(.ant-table-tbody > tr > td) {
    vertical-align: top;
  }
}
</style>
