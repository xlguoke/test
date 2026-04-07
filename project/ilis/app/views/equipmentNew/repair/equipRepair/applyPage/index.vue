<template>
  <div>
    <a-form ref="formRef" :model="dataObj">
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
              v-model:value="dataObj.name"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
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

      <template v-if="eqObj && eqObj.name">
        <a-form-item
          label="设备编号"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <span style="font-size: 12px">{{ eqObj.equipmentSn }}</span>
        </a-form-item>
        <a-form-item
          label="规格型号"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <span style="font-size: 12px">{{ eqObj.standard }}</span>
        </a-form-item>
      </template>

      <a-form-item
        label="维修单号"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input
          v-model:value="dataObj.repairSn"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="保修时间"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-date-picker
          v-model:value="dataObj.repairServiceEndTime"
          style="width: 100%"
          :disabled="isDetail"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item
        label="维修费用"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input-number
          v-model:value="dataObj.totalFee"
          style="width: 100%"
          :disabled="isDetail"
          :min="0"
        ></a-input-number>
      </a-form-item>
      <a-form-item
        label="故障现象"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-textarea
          v-model:value="dataObj.phenomenon"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="故障原因分析"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-textarea
          v-model:value="dataObj.reason"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="损坏后的处理"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-auto-complete
          v-model:value="dataObj.disposeWay"
          :disabled="isDetail"
          :data-source="disposeWayDict"
          style="font-size: 12px;"
        />
      </a-form-item>
      <a-form-item label="备注" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-textarea
          v-model:value="dataObj.remark"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="附件上传"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-upload
          :multiple="true"
          :file-list="fileList"
          :action="uploadUrl"
          :disabled="isDetail"
          @change="handleChange"
        >
          <a-button>选择文件</a-button><span style="font-size: 12px; margin-left: 20px; color: #5ab266">请上传小于500M的文件</span>
        </a-upload>
      </a-form-item>
    </a-form>
    <SelectEquip ref="SelectEquip" :callback="getEquip" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import SelectEquip from '~/providers/components/equip/selectEquip.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    SelectEquip,
  },
  props: ['callback'],
  data() {
    return {
      fileList: [
        //  {
        //   uid: '1',
        //   name: 'xxx.png',
        //   status: 'done',
        //   response: {
        //     success:true,
        //     obj:[{
        //       id:12341231
        //     }]
        //   },
        //   url: 'http://www.baidu.com/xxx.png',
        // },
      ],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      spinning: false,
      isDetail: false,
      formLayout: 'horizontal',
      dayjs,
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dataObj: {
        totalFee: 0,
      },
      attachmentIds: '',
      eqObj: null,
      disposeWayDict: [],
    }
  },
  async created() {
    this.disposeWayDict = await this.getDictByCode('disposeWay')
  },
  methods: {
    async getDictByCode(dictCode) {
      const { data, code } = await window.$oAjax.get('rest/type/getTypesByGroupCode', { params: { groupCode: dictCode } })
      if (code !== 20010) {
        return data.map(i => i.typeName)
      }
    },
    handleChange({ fileList }) {
      this.fileList = fileList
      const idArr = []
      fileList.forEach((item) => {
        if (item.status == 'done') {
          if (item.response.success) {
            idArr.push(item.response.obj[0].id)
          }
          else {
            item.status = 'error'
          }
        }
      })
      this.attachmentIds = idArr.join(',')
    },
    showModal(dataObj, isDetail) {
      this.isDetail = isDetail
      if (dataObj) {
        this.dataObj = dataObj
        dataObj.name = dataObj.equipmentName
        this.eqObj = {
          id: dataObj.equipmentId,
          name: dataObj.equipmentName,
          equipmentSn: dataObj.equipmentSn,
          standard: dataObj.standard,
        }

        if (dataObj.repairServiceEndTime) {
          this.dataObj.repairServiceEndTime = dayjs(dataObj.repairServiceEndTime).format('YYYY-MM-DD')
        }

        if (dataObj.attachments && dataObj.attachments.length) {
          const idArr = []
          this.fileList = dataObj.attachments.map((item) => {
            idArr.push(item.id)
            return {
              uid: item.id,
              name: item.attachmenttitle,
              status: 'done',
              response: {
                success: true,
                obj: [
                  {
                    id: item.id,
                  },
                ],
              },
              url: item.realpath,
            }
          })
          this.attachmentIds = idArr.join(',')
        }
      }
    },
    dataRequired(values) {
      if (!values.name) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择设备'))
        return false
      }
      return true
    },
    validateFields() {
      let data
      return new Promise((resolve) => {
        this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.dataObj }
          data = {
            ...values,
            attachmentIds: this.attachmentIds,
            repairServiceEndTime: values.repairServiceEndTime || '',
          }

          if (this.dataObj.id) {
            data.id = this.dataObj.id
          }

          if (this.eqObj) {
            data.equipmentId = this.eqObj.id
            data.equipmentName = this.eqObj.name
          }
          resolve(data)
        }).catch(() => {
          resolve(null)
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
      this.eqObj = null
    },
    // 选择设备  setEquip
    setEquip() {
      const acceptData = this.eqObj ? [this.eqObj] : []
      this.$refs.SelectEquip.showModal('radio', acceptData)
    },
    // 选择设备 回显
    getEquip(acceptData) {
      this.eqObj = acceptData[0]
      this.dataObj.name = this.eqObj.name
    },
  },
}
</script>

<style lang="less"></style>
