<template>
  <div>
    <a-form ref="formRef" :model="dataObj">
      <a-form-item
        label="检验人"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :rules="[{ required: true, message: '检验人不能为空！' }]"
        name="person"
      >
        <a-row>
          <a-col :span="18" style="font-size: 12px">
            <a-input
              v-model:value="dataObj.person"
              :disabled="isDetail"
            />
          </a-col>
          <a-col :span="6" style="text-align: right">
            <a-button
              :disabled="isDetail"
              style="float: right"
              @click="setPersonnels('radio', 'person', '请选择检验人')"
            >
              选择
            </a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        label="检验时间"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-date-picker
          v-model:value="dataObj.verifyTime"
          style="width: 100%"
          :disabled="isDetail"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item
        label="修复程度检验"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-textarea
          v-model:value="dataObj.content"
          :disabled="isDetail"
        />
      </a-form-item>
      <a-form-item
        label="满足使用要求"
        required
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-radio-group
          v-model:value="dataObj.useRequirements"
          :disabled="isDetail"
          :options="[
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ]"
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
        person: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        person: [{ id: '', name: '' }],
      },
      dataObj: {
        useRequirements: '1',
      },
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
      this.dataObj.person = acceptData[0].name
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
        this.dataObj.person = dataObj.personName

        this.personDatas.person = [
          { id: this.dataObj.personId, name: this.dataObj.personName },
        ]

        if (dataObj.verifyTime) {
          this.dataObj.verifyTime = dayjs(dataObj.verifyTime).format('YYYY-MM-DD')
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
    dataRequired() {
      return true
    },
    validateFields() {
      return new Promise((resolve) => {
        this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.dataObj }
          const data = {
            ...values,
            attachmentIds: this.attachmentIds,
            personId: values.person ? this.personDatas.person[0].id : '',
            personName: values.person ? this.personDatas.person[0].name : '',
            verifyTime: values.verifyTime || '',
          }
          delete values.person

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
    // setOrg() {
    //   this.$refs.AddOrg.showModal('radio', 'depart', this.orgData);
    // },
    // getOrg(ids, orgData) {
    //
    //   this.orgData = orgData;
    //
    // },
  },
}
</script>

<style lang="less"></style>
