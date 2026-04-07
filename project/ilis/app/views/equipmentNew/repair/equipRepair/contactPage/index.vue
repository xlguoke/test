<template>
  <div>
    <a-form ref="formRef" :model="dataObj">
      <a-form-item
        label="联系人"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :rules="[{ required: true, message: '联系人不能为空！' }]"
        name="repairContacts"
      >
        <a-row>
          <a-col :span="18">
            <a-input
              v-model:value="dataObj.repairContacts"
              :disabled="isDetail"
            />
          </a-col>
          <a-col :span="6" style="text-align: right">
            <a-button
              :disabled="isDetail"
              style="float: right"
              @click="setPersonnels('radio', 'repairContacts', '请选择联系人')"
            >
              选择
            </a-button>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        label="维修联系时间"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-date-picker
          v-model:value="dataObj.contactTime"
          style="width: 100%"
          :disabled="isDetail"
          value-format="YYYY-MM-DD"
        />
      </a-form-item>
      <a-form-item
        label="维修联系情况"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-textarea
          v-model:value="dataObj.contactDetail"
          :disabled="isDetail"
        />
      </a-form-item>
    </a-form>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
    // AddOrg
  },
  props: ['callback'],
  data() {
    return {
      isDetail: false,
      formLayout: 'horizontal',

      dayjs,
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      rowCol: 12,
      personDatas: {
        repairContacts: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        repairContacts: [{ id: '', name: '' }],
      },
      dataObj: {},
    }
  },
  created() {},
  methods: {
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData
      this.dataObj.repairContacts = acceptData?.[0]?.name
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

        if (dataObj.contactTime) {
          this.dataObj.contactTime = dayjs(dataObj.contactTime).format('YYYY-MM-DD')
        }

        this.personDatas.repairContacts = [
          {
            id: this.dataObj.repairContactsId,
            name: this.dataObj.repairContacts,
          },
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
            repairContactsId: values.repairContacts
              ? this.personDatas.repairContacts[0].id
              : '',
            contactTime: values.contactTime || '',
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

<style lang="less">
/*!*.ant-form-item-label {*!*/ /*!*width: 80px;*!*/ /*!*}*!*/
</style>
