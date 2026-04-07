<template>
  <div>
    <!-- <a-spin :spinning="spinning"> -->
    <!-- <div class="spin-content"> -->
    <a-form ref="formRef" :model="dataObj">
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="申请部门"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.applyDepart"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setOrg()"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="设备名称"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '设备名称不能为空!' }]"
            name="equipmentName"
          >
            <a-input
              v-model:value="dataObj.equipmentName"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="合同编号"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.contractSn"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="规格型号"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.standard"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="设备类别"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-select
              v-model:value="dataObj.type"
              :disabled="isDetail"
              :options="typeOptions"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="购买人"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '购买人不能为空!' }]"
            name="buyPerson"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.buyPerson"
                  :disabled="isDetail"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setPersonnels('radio', 'buyPerson', '请选择购买人')"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="购买时间"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-date-picker
              v-model:value="dataObj.buyTime"
              style="width: 100%"
              :disabled="isDetail"
              value-format="YYYY-MM-DD"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="单价"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '单价不能为空!' }]"
            name="price"
          >
            <a-input-number
              v-model:value="dataObj.price"
              style="width: 100%"
              :disabled="isDetail"
              @change="(e) => handleChange(e, 'price')"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="rowCol">
          <a-form-item
            label="数量"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '数量不能为空!' }]"
            name="amount"
          >
            <a-input-number
              v-model:value="dataObj.amount"
              style="width: 100%"
              :disabled="isDetail"
              @change="(e) => handleChange(e, 'amount')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="金额"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input-number
              v-model:value="dataObj.totalFee"
              style="width: 100%"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="remark-row">
        <a-col :span="rowCol">
          <a-form-item label="折旧年限" :label-col="labelCol" :wrapper-col="wrapperCol" name="usefulLife">
            <a-input-number
              v-model:value="dataObj.usefulLife"
              style="width: 100%;"
              :disabled="isDetail"
              :min="0"
              :class="{ readonlyCls: !isDetail }"
              @blur="handleBlur"
            />
          </a-form-item>
        </a-col>
        <a-col :span="rowCol">
          <a-form-item
            label="备注"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-textarea
              v-model:value="dataObj.remark"
              :disabled="isDetail"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <!-- </div> -->
    <!-- </a-spin> -->
    <AddOrg ref="AddOrg" :callback="getOrg" />
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import AddOrg from '~/providers/components//orgList.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
    AddOrg,
  },
  props: ['callback'],
  data() {
    return {
      typeOptions: [],
      isDetail: false,
      formLayout: 'horizontal',
      dayjs,
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      rowCol: 12,
      personDatas: {
        buyPerson: [
          {
            id: localStorage.getItem('userId'),
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
          },
        ],
      },
      clonePersonDatas: {
        buyPerson: [
          {
            id: localStorage.getItem('userId'),
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
          },
        ],
      },
      orgData: [{ id: '', name: '' }],
      dataObj: {
        type: undefined,
        buyTime: dayjs().format('YYYY-MM-DD'),
        buyPerson: localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')).realName,
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

    this.getTypeOptions()
  },
  methods: {
    async getTypeOptions() {
      const res = await window.$oAjax.get('dictionaryController.do?getListByGroupId&dictGroupId=402882206b72e01e016b72f8bfd80001')

      if (res.success) {
        this.typeOptions = res.obj.map(i => ({
          label: i.typename,
          value: i.typename,
        }))
      }
    },
    handleBlur() {
      const val = this.dataObj.usefulLife
      // eslint-disable-next-line prefer-regex-literals
      if (val && !new RegExp(/^\d+$/).test(val)) {
        this.dataObj.usefulLife = ''
      }
    },
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData
      this.dataObj.buyPerson = acceptData[0].name
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
        if (dataObj.buyTime) {
          this.dataObj.buyTime = dayjs(dataObj.buyTime).format('YYYY-MM-DD')
        }
        this.orgData = [
          { id: dataObj.applyDepartId, name: dataObj.applyDepart },
        ]
        this.personDatas.buyPerson = [
          { id: dataObj.buyPersonId, name: dataObj.buyPerson },
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
            applyDepartId: values.applyDepart ? this.orgData[0].id : '',
            buyPersonId:
              this.personDatas.buyPerson.length > 0
              && values.buyPerson === this.personDatas.buyPerson[0].name
                ? this.personDatas.buyPerson[0].id
                : '',
            buyPerson: values.buyPerson || '',
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
      this.orgData = []
    },
    setOrg() {
      this.$refs.AddOrg.showModal('radio', 'depart', this.orgData)
    },
    getOrg(ids, orgData) {
      this.orgData = orgData
      this.dataObj.applyDepart = orgData[0].name
    },
    handleChange(values, type) {
      if (type === 'price') {
        const num = Number(values).toFixed(2)
        window.$oNextTick(() => {
          this.dataObj[type] = num
        })
      }
      const price = type === 'price' ? values : this.dataObj.price
      const amount
        = type === 'amount' ? values : this.dataObj.amount
      const totalFee = (
        Number(Number(price).toFixed(2)) * Number(amount)
      ).toFixed(2)
      this.dataObj.totalFee = totalFee
    },
  },
}
</script>

<style lang="less">
.remark-row {
  .ant-col-16 {
    width: 85.9%;
  }
}
</style>
