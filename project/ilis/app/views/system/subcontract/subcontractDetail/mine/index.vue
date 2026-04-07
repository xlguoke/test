<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div style="padding-top: 10px">
    <a-spin :spinning="spinning">
      <div>
        <a-form ref="formRef" :model="formState">
          <div style="padding-bottom: 10px; border-bottom: solid 1px #e2e2e2">
            <div class="title">
              分包情况
            </div>
            <div class="contentBox">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="hitek-form-layout">
                    <div class="hitek-form-layout-label">
                      分包单位
                    </div>
                    <div class="hitek-form-layout-con">
                      <a-form-item
                        :rules="[{ required: true, message: '分包单位不能为空!' }]"
                        name="unitSubcontractName"
                      >
                        <div style="display: flex">
                          <a-input
                            v-model:value="formState.unitSubcontractName"
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
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="hitek-form-layout">
                    <div class="hitek-form-layout-label">
                      分包日期
                    </div>
                    <div class="hitek-form-layout-con">
                      <a-form-item
                        :rules="[{ required: true, message: '分包日期不能为空!' }]"
                        name="subcontractDate"
                      >
                        <a-date-picker
                          v-model:value="formState.subcontractDate"
                          :disabled="isDetail"
                          :allow-clear="false"
                          style="width: 100%"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          @change="
                            (val) => {
                              saveSubcontract(val, 'date')
                            }
                          "
                        />
                      </a-form-item>
                    </div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="hitek-form-layout">
                    <div class="hitek-form-layout-label">
                      分包费用(元)
                    </div>
                    <div class="hitek-form-layout-con">
                      <a-form-item
                        :rules="[{ pattern: RegExp, message: '请输入正确的分包费用！' }]"
                        name="fee"
                      >
                        <a-input
                          v-model:value="formState.fee"
                          :disabled="isDetail"
                          placeholder="请输入"
                          @blur="saveSubcontract"
                        />
                      </a-form-item>
                    </div>
                  </div>
                </a-col>
              </a-row>
            </div>
          </div>
          <div
            style="
              padding-bottom: 25px;
              border-bottom: solid 1px #e2e2e2;
              padding-top: 10px;
            "
          >
            <div class="title">
              报告信息
            </div>
            <div>
              <div
                v-for="(item, index) in reportData"
                :key="item.id"
                class="subcontractDetail-report"
              >
                <div class="subcontractDetail-delete">
                  <CloseCircleFilled
                    @click="deleteReport(item)"
                  />
                </div>
                <a-row>
                  <a-col :span="12">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        报告编号
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-input
                            v-model:value="item.reportSn"
                            :disabled="isDetail"
                            placeholder="请输入"
                            @blur="saveRreport(false, index)"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                  <a-col :span="12">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        是否合格
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-select
                            v-model:value="item.qualified"
                            placeholder="请选择"
                            @blur="saveRreport(false, index)"
                          >
                            <a-select-option value="合格">
                              合格
                            </a-select-option>
                            <a-select-option value="不合格">
                              不合格
                            </a-select-option>
                            <a-select-option value="不判定">
                              不判定
                            </a-select-option>
                          </a-select>
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                  <a-col :span="12">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        批准人
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-input
                            v-model:value="item.approver"
                            :disabled="isDetail"
                            placeholder="请输入"
                            @blur="saveRreport(false, index)"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                  <a-col :span="12">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        报告日期
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-date-picker
                            v-model:value="item.reportDate"
                            type="date"
                            :disabled="isDetail"
                            :allow-clear="false"
                            style="width: 100%"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            @change="saveRreport(false, index, $event)"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                  <a-col :span="24">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        检测结果
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-input
                            v-model:value="item.testResult"
                            :disabled="isDetail"
                            placeholder="请输入"
                            @blur="saveRreport(false, index)"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                  <a-col :span="24">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        检测结论
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-textarea
                            v-model:value="item.verdict"
                            :disabled="isDetail"
                            placeholder="请输入"
                            @blur="saveRreport(false, index)"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                  <a-col :span="24">
                    <div class="hitek-form-layout">
                      <div class="hitek-form-layout-label">
                        备注
                      </div>
                      <div class="hitek-form-layout-con">
                        <a-form-item>
                          <a-textarea
                            v-model:value="item.remark"
                            :disabled="isDetail"
                            placeholder="请输入"
                            @blur="saveRreport(false, index)"
                          />
                        </a-form-item>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </div>
              <a-button
                type="primary"
                :loading="btnLoading"
                @click="saveRreport(true)"
              >
                添加
              </a-button>
            </div>
          </div>
          <div style="padding-bottom: 10px; padding-top: 10px">
            <div class="title">
              附件
            </div>
            <div class="contentBox">
              <FolderManage ref="FolderManage" />
            </div>
          </div>
        </a-form>
      </div>
    </a-spin>
    <ht-modal
      title="选择分包单位"
      centered
      :open="visibleUnit"
      :mask-closable="false"
      width="80%"
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
  </div>
</template>

<script>
import { CloseCircleFilled } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import FolderManage from '~/providers/components/folderManage/folderList.vue'
import { useVue2MigrationStore } from '~/store/vue2MigrationStore'
import SelUnitSubcontract from '~/views/system/subcontract/unitSubcontract/list/index.vue'

export default {
  components: {
    SelUnitSubcontract,
    FolderManage,
    CloseCircleFilled,
  },
  setup() {
    const vue2MigrationStore = useVue2MigrationStore()
    return { vue2MigrationStore }
  },
  data() {
    return {
      id: getQueryVariable('id'),
      spinning: false,
      dayjs,
      formLayout: 'horizontal',
      formState: {},
      unitSubcontractData: [],
      visibleUnit: false,
      // eslint-disable-next-line regexp/no-useless-assertions
      RegExp: /@"(^(0\.0*[1-9]\d*$|[1-9]\d*\.\d+$|[1-9]\d*$)|^0$)"/,
      isDetail: false,
      dataObj: {},
      reportData: [],
      sampleName: '', // 保存分包信息时必须传递
      btnLoading: false,
      storeDataObj: {},
    }
  },
  computed: {
    dataObjP() {
      return this.vue2MigrationStore.dataObj
    },
    test() {
      return JSON.stringify(this.reportData.map(item => item.remark))
    },
  },
  watch: {
    dataObjP: {
      handler(newVal) {
        const obj = newVal
        this.unitSubcontractData = [
          { id: obj.subcontractUnitId, name: obj.subcontractUnit },
        ]

        this.reportData = JSON.parse(JSON.stringify(newVal.subcontractReports))

        this.sampleName = obj.sampleName
        this.id = obj.id

        this.formState = newVal || {}
        this.formState.unitSubcontractName = obj.subcontractUnit
      },
      deep: true, // true 深度监听
    },
  },
  created() {
    window.$oNextTick(() => {
      this.$refs.FolderManage.showModal(this.id)
    })
  },
  methods: {
    // 删除报告
    deleteReport(item) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除此报告信息吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax
            .post(
              window.$oApi.subcontractManage.delScReport,
              qs.stringify({
                subcontractReportId: item.id,
              }),
            )
            .then((res) => {
              this.spinning = false
              if (res.code === 20000) {
                window._getDetailInfo()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
              }
            })
            .catch((err) => {
              this.spinning = false
              // eslint-disable-next-line no-console
              console.log(err)
            })
        },
      })
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
      this.formState.unitSubcontractName = acceptData[0].name
      this.visibleUnit = false
      this.saveSubcontract()
    },
    handleCancelUnit() {
      this.visibleUnit = false
    },
    // 保存分包
    saveSubcontract(val, type) {
      const values = { ...this.formState }

      let subcontractDate
      if (type === 'date' && val) {
        subcontractDate = val
      }
      else {
        subcontractDate = values.subcontractDate || null
      }

      const data = {
        subcontractDate,
        fee: values.fee || '',
        sampleName: this.sampleName,
        id: this.id,
        subcontractUnit: this.unitSubcontractData[0].name,
        subcontractUnitId: this.unitSubcontractData[0].id,
      }

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.subcontractManage.saveUrl,
        data: [data],
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window._getDetailInfo()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    // 保存报告
    saveRreport(isAdd, index, event) {
      const newData = this.reportData[index]
      let data
      if (!isAdd) {
        data = {
          subcontractId: this.id,
          reportSn: newData.reportSn || '',
          approver: newData.approver || '',
          qualified: newData.qualified || '',
          reportDate: event ? dayjs(event).format('YYYY-MM-DD') : null,
          testResult: newData.testResult || '',
          verdict: newData.verdict || '',
          remark: newData.remark || '',
        }
        // eslint-disable-next-line ts/no-unused-expressions
        this.reportData[index].id ? (data.id = this.reportData[index].id) : ''
      }
      else {
        data = {
          subcontractId: this.id,
        }
      }

      if (isAdd) {
        this.spinning = true
        this.btnLoading = true
      }

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.subcontractManage.saveScReport,
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          this.spinning = false
          this.btnLoading = false
          if (res.code === 20000) {
            window._getDetailInfo()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
        .catch(() => {
          this.btnLoading = false
          this.spinning = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
