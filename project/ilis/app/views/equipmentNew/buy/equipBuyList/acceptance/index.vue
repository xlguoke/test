<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="dataObj">
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="验收类型"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <span class="ant-form-text"> 检测仪器-固定资产 </span>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol"></a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="验收人"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
                :rules="[{ required: true, message: '验收人不能为空!' }]"
                name="acceptor"
              >
                <a-row>
                  <a-col :span="18">
                    <a-input
                      v-model:value="dataObj.acceptor"
                      :disabled="isDetail"
                    />
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-button
                      :disabled="isDetail"
                      style="float: right"
                      @click="
                        setPersonnels('radio', 'acceptor', '请选择验收人')
                      "
                    >
                      选择
                    </a-button>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="验收编号"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.acceptanceSn"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="说明书(份)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-row>
                  <a-col :span="18">
                    <a-input
                      v-model:value="dataObj.specifications"
                      :disabled="isDetail"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-input-number
                      v-model:value="dataObj.specificationsAmount"
                      style="width: 100%"
                      :min="0"
                      :disabled="isDetail"
                    />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="说明书语种"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-auto-complete
                  v-model:value="dataObj.manualLanguage"
                  style="font-size: 12px;"
                  :data-source="['英语', '中文', '德语', '法语', '西班牙语', '日语', '韩语', '俄语', '意大利语', '葡萄牙语']"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="检验单(份)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-row>
                  <a-col :span="18">
                    <a-input
                      v-model:value="dataObj.inspectionSheet"
                      :disabled="isDetail"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-input-number
                      v-model:value="dataObj.inspectionSheetAmount"
                      style="width: 100%"
                      :min="0"
                      :disabled="isDetail"
                    />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="图纸资料(份)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-row>
                  <a-col :span="18">
                    <a-input
                      v-model:value="dataObj.pictures"
                      :disabled="isDetail"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-input-number
                      v-model:value="dataObj.picturesAmount"
                      style="width: 100%"
                      :min="0"
                      :disabled="isDetail"
                    />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="合格证(份)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-row>
                  <a-col :span="18">
                    <a-input
                      v-model:value="dataObj.certificate"
                      :disabled="isDetail"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-input-number
                      v-model:value="dataObj.certificateAmount"
                      style="width: 100%"
                      :min="0"
                      :disabled="isDetail"
                    />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="附件清单(份)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-row>
                  <a-col :span="18">
                    <a-input
                      v-model:value="dataObj.attachment"
                      :disabled="isDetail"
                    />
                  </a-col>
                  <a-col :span="6">
                    <a-input-number
                      v-model:value="dataObj.attachmentAmount"
                      style="width: 100%"
                      :min="0"
                      :disabled="isDetail"
                    />
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="验收日期"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.acceptanceDate"
                  style="width: 100%"
                  :disabled="isDetail"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="试车日期"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.testRunDate"
                  style="width: 100%"
                  :disabled="isDetail"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="到货日期"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.arrivalDate"
                  style="width: 100%"
                  :disabled="isDetail"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <div>
            <div class="row-header mb-2">
              检查情况
            </div>
            <a-row>
              <a-col :span="rowCol">
                <a-form-item label="包装外观" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <a-radio-group
                    v-model:value="dataObj.packagingAppearance"
                    :disabled="isDetail"
                    :options="[
                      { label: '完好', value: true },
                      { label: '缺损', value: false },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="rowCol">
                <a-form-item label="包装外观照片" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <HtUploadFile
                    v-if="dataId"
                    :business-id="dataId"
                    business-type="EQ_BUY_ACC_PACKAGE"
                    :is-reandonly="isDetail"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="rowCol">
                <a-form-item label="设备外观" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <a-radio-group
                    v-model:value="dataObj.equipmentAppearance"
                    :disabled="isDetail"
                    :options="[
                      { label: '完好', value: true },
                      { label: '缺损', value: false },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="rowCol">
                <a-form-item label="设备外观照片" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <HtUploadFile
                    v-if="dataId"
                    :business-id="dataId"
                    business-type="EQ_BUY_ACC"
                    :is-reandonly="isDetail"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="rowCol">
                <a-form-item label="规格型号" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <a-radio-group
                    v-model:value="dataObj.standard"
                    :disabled="isDetail"
                    :options="[
                      { label: '符合', value: true },
                      { label: '不符', value: false },
                    ]"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="rowCol">
                <a-form-item label="配件" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <a-radio-group
                    v-model:value="dataObj.accessorie"
                    :disabled="isDetail"
                    :options="[
                      { label: '齐全', value: true },
                      { label: '缺失', value: false },
                    ]"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="rowCol">
                <a-form-item label="资料齐全" :label-col="labelCol" :wrapper-col="wrapperCol">
                  <a-radio-group
                    v-model:value="dataObj.documentComplete"
                    :disabled="isDetail"
                    :options="[
                      { label: '是', value: true },
                      { label: '否', value: false },
                    ]"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <div class="textarea-box">
              <a-form-item
                label="开箱检查验收"
                :label-col="{ span: 4 }"
                :wrapper-col="wrapperCol"
              >
                <a-textarea
                  v-model:value="dataObj.unpackCheckInfo"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item
                label="安装质量及精度"
                :label-col="{ span: 4 }"
                :wrapper-col="wrapperCol"
              >
                <a-textarea
                  v-model:value="dataObj.installQuality"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item
                label="设备运转情况"
                :label-col="{ span: 4 }"
                :wrapper-col="wrapperCol"
              >
                <a-textarea
                  v-model:value="dataObj.runningStatus"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item
                label="试车检验情况"
                :label-col="{ span: 4 }"
                :wrapper-col="wrapperCol"
              >
                <a-textarea
                  v-model:value="dataObj.testRunStatus"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item label="设备接收意见" :label-col="{ span: 4 }" :wrapper-col="wrapperCol">
                <a-textarea
                  v-model:value="dataObj.acceptanceOpinion"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item label="备注" :label-col="{ span: 4 }" :wrapper-col="wrapperCol">
                <a-textarea
                  v-model:value="dataObj.remark"
                  :disabled="isDetail"
                />
              </a-form-item>
            </div>
          </div>
        </a-form>
      </div>
    </a-spin>
    <!-- <AddOrg ref="AddOrg" :callback="getOrg" /> -->
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { HtUploadFile } from '~/components/htUploadFile'
import { getQueryVariable } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
    HtUploadFile,
    // AddOrg
  },
  props: ['callback', 'dataId'],
  data() {
    return {
      spinning: false,
      isDetail: false,
      formLayout: 'horizontal',

      dayjs,
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
      rowCol: 12,
      personDatas: {
        acceptor: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        acceptor: [{ id: '', name: '' }],
      },
      dataObj: {
        packagingAppearance: true,
        equipmentAppearance: true,
        standard: true,
        accessorie: true,
        documentComplete: true,
      },
    }
  },
  created() {
    // this.getStatus()
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id = getQueryVariable('id') || '4028826372358837017236030137001f'
      this.showModal(id, true)
    }
  },
  methods: {
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData
      this.dataObj[idsPerson] = acceptData[0].name
    },
    setPersonnels(type, idsPerson, title) {
      const acceptData = this.personDatas[idsPerson]
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
    showModal(dataObj, isDetail) {
      this.isDetail = isDetail
      if (dataObj) {
        this.dataObj = dataObj

        const dateArr = ['acceptanceDate', 'testRunDate', 'arrivalDate']
        dateArr.forEach((item) => {
          if (this.dataObj[item]) {
            this.dataObj[item] = dayjs(this.dataObj[item]).format('YYYY-MM-DD')
          }
        })

        this.personDatas.acceptor = [
          { id: dataObj.acceptorId, name: dataObj.acceptor },
        ]
      }
    },
    dataRequired() {
      return true
    },
    validateFields() {
      let data
      return new Promise((resolve) => {
        this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.dataObj }

          data = {
            ...values,
            acceptorId:
        this.personDatas.acceptor.length > 0
        && values.acceptor === this.personDatas.acceptor[0].name
          ? this.personDatas.acceptor[0].id
          : '',
            acceptanceDate: values.acceptanceDate || '',
            testRunDate: values.testRunDate || '',
          }

          if (this.dataObj.id) {
            data.id = this.dataObj.id
          }
          resolve(data)
        })
      })
    },
    async handleOk() {
      const data = await this.validateFields()
      if (data && this.dataRequired(data)) {
        return data
      }
    },
    handleCancel() {
      this.dataObj = {}
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
    },
    // setOrg() {
    //   this.$refs.AddOrg.showModal('radio', 'depart', this.orgData);
    // },
    // getOrg(ids, orgData) {
    //   this.orgData = orgData;
    //
    // },
  },
}
</script>

<!-- <style lang="less">
.ant-input-number {
  height: 26.5px !important;
  vertical-align: initial !important;
}
.textarea-box {
  .ant-col-16 {
    width: 85%;
  }
  .ant-form-item-label {
    width: 95px;
  }
}
</style> -->
