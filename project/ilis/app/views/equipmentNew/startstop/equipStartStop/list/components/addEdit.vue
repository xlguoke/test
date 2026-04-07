<!-- eslint-disable vue/v-on-event-hyphenation -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="dataObj">
          <a-form-item
            label="操作类型"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-radio-group
              v-model:value="dataObj.ssType"
              :disabled="isDetail"
            >
              <a-radio value="1">
                启用
              </a-radio>
              <a-radio value="0">
                停用
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="选择设备"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '设备不能为空!' }]"
            name="name"
          >
            <a-row :gutter="15">
              <a-col :span="18">
                <a-input
                  v-model:value="eqDisplayName"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                  placeholder="请选择"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setEquip"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="保管人"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '保管人不能为空!' }]"
            name="keeper"
          >
            <a-row :gutter="15">
              <a-col :span="18">
                <a-input
                  v-model:value="dataObj.keeper"
                  placeholder="请选择"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setPersonnels('radio', 'keeper', '请选择保管人')"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="地点"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.site"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="日期"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '日期不能为空!' }]"
            name="ssTime"
          >
            <a-date-picker
              v-model:value="dataObj.ssTime"
              :disabled="isDetail"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
          <a-form-item label="申请理由" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="[{ required: true, message: '申请理由不能为空!' }]" name="reason">
            <a-input v-if="isDetail" v-model:value="dataObj.reason" disabled />
            <a-auto-complete
              v-else
              v-model:value="dataObj.reason"
              :data-source="resonDataList()"
              style="width: 100%"
              placeholder="请选择或输入"
            />
          </a-form-item>
          <a-form-item
            label="申请说明"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.applyExplain"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="技术状况说明"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.technicalStatus"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item label="检校证书" :label-col="labelCol" :wrapper-col="wrapperCol">
            <!-- <a-button v-if="!isDetail" icon="upload" @click="upload">上传文件</a-button>
              <div v-for="(item, index) in fileLists" :key="index">
                <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
              </div> -->
            <HtUploadFile
              :key="htUploadFileKey"
              :business-id="editId"
              business-type="EQ_START_STOP_CHECK_FILE"
              :is-reandonly="isDetail"
              @getQrCodeKey="getCheckFileData"
            />
          </a-form-item>
          <a-form-item label="其他附件材料" :label-col="labelCol" :wrapper-col="wrapperCol">
            <!-- <a-button v-if="!isDetail" icon="upload" @click="upload">上传文件</a-button>
            <div v-for="(item, index) in fileLists" :key="index">
              <a :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`">{{ item.name }}</a>
            </div> -->
            <HtUploadFile
              :key="htUploadFileKey"
              :business-id="editId"
              business-type="EQ_START_STOP_OTHER_FILE"
              :is-reandonly="isDetail"
              @getQrCodeKey="getOtherFileData"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
    <SelectEquip ref="SelectEquip" :callback="getEquip" />
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <UploadComponent
      ref="UploadComponent"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { getQueryVariable } from '~/providers/common/utils'
import SelectEquip from '~/providers/components/equip/selectEquip.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    TableTreePersonnel,
    UploadComponent,
    SelectEquip,
    HtUploadFile,
  },
  props: ['callback'],
  data() {
    return {
      seType: 'radio',
      selEqArr: [],
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      isDetail: false,
      dataObj: {
        ssType: '1',
      },
      eqObj: null,
      fileLists: [],
      personDatas: { keeper: [{ id: '', name: '' }] },
      clonepersonDatas: { keeper: [{ id: '', name: '' }] },
      eqStartReasonType: [],
      eqStopReasonType: [],
      editId: undefined,
      otherFile: '',
      checkFile: '',
      htUploadFileKey: 0,
    }
  },
  computed: {
    eqDisplayName() {
      const { name, eqSn } = this.dataObj
      return `${name || ''}${eqSn ? `（${eqSn}）` : ''}`
    },
  },
  async created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, true)
    }
    const startData = await this.getDictByCode('eqStartReasonType')
    const stopData = await this.getDictByCode('eqStopReasonType')
    this.eqStartReasonType = startData.map(i => i.typeName)
    this.eqStopReasonType = stopData.map(i => i.typeName)
  },
  methods: {
    getOtherFileData(data) {
      this.otherFile = data
    },
    getCheckFileData(data) {
      this.checkFile = data
    },

    resonDataList() {
      if (this.dataObj.ssType === '1') {
        return this.eqStartReasonType
      }
      return this.eqStopReasonType
    },
    // 选择设备  setEquip
    setEquip() {
      const acceptData = this.selEqArr
      this.$refs.SelectEquip.showModal(this.seType, acceptData)
    },
    async getDictByCode(dictCode) {
      const { data, code } = await window.$oAjax.get('rest/type/getTypesByGroupCode', { params: { groupCode: dictCode } })
      if (code === 20000) {
        return data
      }
    },
    // 选择设备 回显
    getEquip(acceptData) {
      this.personDatas.keeper = [
        { id: acceptData[0]?.keeperId, name: acceptData[0]?.keeperName },
      ]
      this.dataObj.name = acceptData?.map(i => i.name)?.join(',')
      this.dataObj.keeper = acceptData[0]?.keeperName
      this.dataObj.eqSn = acceptData?.map(i => i.equipmentSn)?.join(',')

      this.eqObj = {
        eqSn: this.dataObj.eqSn,
        id: acceptData?.map(i => i.id)?.join(','),
        name: acceptData?.map(i => i.name)?.join(','),
      }
      this.selEqArr = acceptData
    },
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
    showModal(editId, isDetail) {
      this.isDetail = isDetail
      this.htUploadFileKey++
      if (editId) {
        this.editId = editId
        this.seType = 'radio'
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: window.$oApi.equipStartStop.getById,
          params: { id: editId },
        }).then((res) => {
          if (res.success) {
            this.dataObj = res.obj
            this.dataObj.ssTime = AnyDateTimeHelper.format(this.dataObj.ssTime, EDateFormatType.YYYY_MM_DD)
            this.dataObj.name = this.dataObj.equipmentName
            this.dataObj.eqSn = this.dataObj.equipmentVo?.equipmentSn || ''
            this.eqObj = {
              id: this.dataObj.equipmentId,
              name: this.dataObj.equipmentName,
              eqSn: this.dataObj.equipmentVo?.equipmentSn || '',
            }
            this.selEqArr = [
              {
                id: this.dataObj.equipmentId,
                name: this.dataObj.equipmentName,
              },
            ]

            this.personDatas.keeper = [
              { id: this.dataObj.keeperId, name: this.dataObj.keeper },
            ]
            this.fileLists = this.dataObj.files.map(item => ({
              uid: item.attachmentId,
              name: item.name,
              url: item.url,
            }))
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = null
          }
          this.spinning = false
        })
        this.spinning = false
      }
      else {
        // this.seType = 'checkbox'
        this.editId = undefined
      }
    },
    upload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
    },
    dataRequired() {
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.dataObj }
        const data = {
          ...fieldsValue,
          ssTime: AnyDateTimeHelper.format(fieldsValue.ssTime, EDateFormatType.YYYY_MM_DD) || '',
          keeperId: fieldsValue.keeper ? this.personDatas.keeper[0].id : '',
          otherFile: this.otherFile,
          checkFile: this.checkFile,
        }
        delete data.applyTime
        delete data.createDate
        delete data.updateDate
        if (this.eqObj) {
          data.equipmentId = this.eqObj.id
          data.equipmentName = this.eqObj.name // 设备名称
          // data.equipmentSn = this.eqObj.equipmentSn;
          // data.type = this.eqObj.type; // 设备类别
          // data.standard = this.eqObj.standard; // 规格型号
          // data.laboratoryName =this.eqObj.laboratoryName;
          // data.laboratoryId =this.eqObj.laboratoryId;
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }

        if (this.dataRequired(data)) {
          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.equipStartStop.saveUrl,
            data: qs.stringify(data),
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          }).then((res) => {
            if (res.success) {
              window.$oAntdMessage.success('操作成功')
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          }).finally(() => {
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.dataObj = {
        ssType: '1',
      }
      this.eqObj = null
      this.selEqArr = []
      this.fileLists = []
      this.personDatas = JSON.parse(JSON.stringify(this.clonepersonDatas))
      // 清除表单验证状态
      this.$nextTick(() => {
        this.$refs.formRef.clearValidate()
      })
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: 450px;
    overflow-y: auto;
  }
  .text-right {
    text-align: right;
  }
}
</style>
