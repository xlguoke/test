<template>
  <div>
    <a-form ref="formRef" :model="dataObj">
      <a-form-item
        label="承修人"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :rules="[{ required: true, message: '承修人不能为空！' }]"
        name="repairMan"
      >
        <a-input
          v-model:value="dataObj.repairMan"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="承修单位"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input
          v-model:value="dataObj.repairUnit"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="材料费"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input-number
          v-model:value="dataObj.materialFee"
          style="width: 100%"
          :min="0"
          :disabled="isDetail"
          @change="(e) => handleChange(e, 'materialFee')"
        />
      </a-form-item>
      <a-form-item
        label="人工费"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input-number
          v-model:value="dataObj.laborFee"
          style="width: 100%"
          :min="0"
          :disabled="isDetail"
          @change="(e) => handleChange(e, 'laborFee')"
        />
      </a-form-item>
      <a-form-item
        label="其他费用"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input-number
          v-model:value="dataObj.otherFee"
          style="width: 100%"
          :min="0"
          :disabled="isDetail"
          @change="(e) => handleChange(e, 'otherFee')"
        />
      </a-form-item>
      <a-form-item
        label="费用合计"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-input
          v-model:value="dataObj.totalFee"
          :disabled="true"
          :class="{ readonlyCls: !isDetail }"
        />
      </a-form-item>
      <a-form-item
        label="维修简述"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-textarea
          v-model:value="dataObj.description"
          :disabled="isDetail"
          :class="{ readonlyCls: !isDetail }"
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
          @change="handleFileChange"
        >
          <a-button>选择文件</a-button><span style="font-size: 12px; margin-left: 20px; color: #5ab266">请上传小于500M的文件</span>
        </a-upload>
      </a-form-item>
    </a-form>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    TableTreePersonnel,
    // AddOrg
  },
  props: ['callback'],
  data() {
    return {
      fileList: [],
      attachmentIds: '',
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      isDetail: false,
      formLayout: 'horizontal',
      dayjs,
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      personDatas: {
        repairMan: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        repairMan: [{ id: '', name: '' }],
      },
      dataObj: {},
    }
  },
  created() {},
  methods: {
    handleFileChange({ fileList }) {
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
        this.personDatas.repairMan = [
          { id: this.dataObj.repairManId, name: this.dataObj.repairMan },
        ]
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
            attachmentIds: this.attachmentIds,
            repairManId:
              this.personDatas.repairMan.length > 0
              && values.repairMan === this.personDatas.repairMan[0].name
                ? this.personDatas.repairMan[0].id
                : '',
            repairMan: values.repairMan ? values.repairMan : '',
          }

          if (this.dataObj.id) {
            data.id = this.dataObj.id
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
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
    },
    handleChange(values, type) {
      const num = Number(values).toFixed(2)
      window.$oNextTick(() => {
        this.dataObj[type] = num
      })
      const materialFee
        = type === 'materialFee' ? values : (this.dataObj.materialFee || 0)
      const laborFee
        = type === 'laborFee' ? values : (this.dataObj.laborFee || 0)
      const otherFee
        = type === 'otherFee' ? values : (this.dataObj.otherFee || 0)
      const totalFee = (
        Number(materialFee)
        + Number(laborFee)
        + Number(otherFee)
      ).toFixed(2)
      this.dataObj.totalFee = totalFee
    },
  },
}
</script>

<style lang="less">
.textarea-box {
  .ant-col-16 {
    width: 85%;
  }
  .ant-form-item-label {
    width: 95px;
  }
}
</style>
