<template>
  <div>
    <ht-modal
      :title="isDetail ? '出库详情' : '耗材出库'"
      centered
      :open="visible"
      width="520px"
      wrap-class-name="equipmentOutgo-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <div>
            <a-form v-if="data ? true : false" ref="formRef" :model="data">
              <a-form-item
                label="管理编号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <!-- <span> {{data.name}}</span> -->
                <a-input v-model:value="data.sn" disabled />
              </a-form-item>
              <a-form-item
                label="耗材名称"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <!-- <span> {{data.name}}</span> -->
                <a-input v-model:value="data.name" disabled />
              </a-form-item>
              <a-form-item
                label="型号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <!-- <span> {{data.standard}} </span> -->
                <a-input v-model:value="data.standard" disabled />
              </a-form-item>
              <a-form-item
                label="耗材类别"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <!-- <span> {{data.type}} </span> -->
                <a-input v-model:value="data.type" disabled />
              </a-form-item>
              <a-form-item
                label="库存数量"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <!-- <span> {{data.amount}} {{data.amountUnit}}</span> -->
                <div style="display: flex">
                  <a-input v-model:value="data.amount" disabled />
                  <a-input
                    v-model:value="data.amountUnit"
                    style="margin-left: 15px; width: 70px"
                    disabled
                  />
                </div>
              </a-form-item>
              <a-form-item
                label="出库类型"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="outType"
                :rules="[{ required: true, message: '出库类型不能为空!' }]"
              >
                <a-select
                  v-model:value="data.outType"
                  placeholder="请选择"
                  :disabled="isDetail"
                >
                  <a-select-option
                    v-for="(item, index) in outType"
                    :key="index"
                    :value="item.typename"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="本次出库数量"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="recordCount"
                :rules="[{ required: true, message: '本次出库数量不能为空!' }]"
              >
                <a-row :gutter="15">
                  <a-col :span="18">
                    <a-input
                      v-model:value="data.recordCount"
                      :disabled="isDetail"
                      style="width: 100%"
                      type="number"
                      min="0"
                      placeholder="请输入"
                      @change="
                        (e) => numberChange(e.target.value, 'recordCount')
                      "
                    />
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-input
                      v-model:value="data.amountUnit"
                      type="text"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                    />
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item
                label="出库日期"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-date-picker
                  v-model:value="data.recordDate"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  :disabled="isDetail"
                />
              </a-form-item>
              <a-form-item
                label="出库人"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="recordPersonId"
                :rules="[{ required: true, message: '出库人不能为空!' }]"
              >
                <a-row :gutter="15">
                  <a-col :span="18" style="font-size: 12px">
                    <a-input
                      v-model:value="data.recordPersonName"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                      placeholder="请选择"
                    />
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-button
                      :disabled="isDetail"
                      @click="
                        setPersonnels('radio', 'recordPersonId', '请选择出库人')
                      "
                    >
                      选择
                    </a-button>
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item
                label="经手人"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="operatorId"
                :rules="[{ required: true, message: '经手人不能为空!' }]"
              >
                <a-row :gutter="15">
                  <a-col :span="18" style="font-size: 12px">
                    <a-input
                      v-model:value="data.operatorName"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                      placeholder="请选择"
                    />
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <a-button
                      :disabled="isDetail"
                      @click="
                        setPersonnels('radio', 'operatorId', '请选择经手人')
                      "
                    >
                      选择
                    </a-button>
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item label="生产商" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
                <a-input
                  v-model:value="data.manufacturer"
                  :disabled="isDetail"
                  placeholder="请输入生产商"
                />
              </a-form-item>
              <a-form-item
                label="备注"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-textarea
                  v-model:value="data.remark"
                  :disabled="isDetail"
                  placeholder="请输入备注"
                />
              </a-form-item>
            </a-form>
          </div>
        </div>
      </a-spin>
    </ht-modal>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
  },
  props: ['callback'],
  data() {
    return {
      dayjs,
      visible: false,
      spinning: false,
      formLayout: 'horizontal',
      data: {},
      outType: [],
      isDetail: false,
      departDatas: [
        {
          id: '',
          name: '',
        },
      ],
      personDatas: {
        operatorId: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
        recordPersonId: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
      },
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    getStatus() {
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: 'f852d85d47ed64a40147ed70894c0005',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.outType = res.obj
        }
        else {
          this.outType = []
        }
        this.spinning = false
      })
      this.spinning = false
    },
    showModal(data, isDetail) {
      this.isDetail = isDetail
      this.data = data[0]

      if (this.data.recordDate) {
        this.data.recordDate = dayjs(this.data.recordDate).format('YYYY-MM-DD')
      }

      /** 经手人 operatorId, 出库人 recordPersonId */
      if (!isDetail) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        this.data.operatorId = userInfo.userId
        this.data.operatorName = userInfo.realName
        this.data.recordPersonId = userInfo.userId
        this.data.recordPersonName = userInfo.realName
        this.data.recordDate = dayjs().format('YYYY-MM-DD')
      }

      this.personDatas.operatorId = [
        {
          id: this.data.operatorId || '',
          name: this.data.operatorName || '',
        },
      ]
      this.personDatas.recordPersonId = [
        {
          id: this.data.recordPersonId || '',
          name: this.data.recordPersonName || '',
        },
      ]

      this.visible = true
    },
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData

      if (idsPerson === 'operatorId') {
        this.data.operatorId = acceptData[0].id
        this.data.operatorName = acceptData[0].name
      }

      if (idsPerson === 'recordPersonId') {
        this.data.recordPersonId = acceptData[0].id
        this.data.recordPersonName = acceptData[0].name
      }
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
    handleOk() {
      if (this.isDetail) {
        this.visible = false
        return
      }

      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.data }
        const data = {
          ...fieldsValue,
          'recordType': 2,
          'TEqConsumables.id': this.data ? this.data.id : '',
          'name': this.data ? this.data.name : '',
          'standard': this.data ? this.data.standard : '',
          'amount': this.data ? this.data.amount : '',
          'amountUnit': this.data ? this.data.amountUnit : '',
          'outType': fieldsValue.outType ? fieldsValue.outType : '',
          'type': this.data.type || '',
          'sn': this.data.sn || '',
          'recordDate': fieldsValue.recordDate
            ? dayjs(fieldsValue.recordDate).format('YYYY-MM-DD')
            : '出库日期无',
        }
        delete data.createDate
        delete data.updateDate
        this.spinning = true
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.consumablesList.addOutbound,
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
          this.spinning = false
        })
      })
    },
    handleCancel() {
      this.visible = false
      this.data = {}
    },
    isNumber(value) {
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const reg = /^\d+(?=\.?\d+$|$)/
      if (value && !reg.test(value)) {
        return false
      }
      return true
    },
    numberChange(value, column) {
      if (!this.isNumber(value)) {
        setTimeout(() => {
          this.data[column] = ''
        }, 0)
      }
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
}
</style>
