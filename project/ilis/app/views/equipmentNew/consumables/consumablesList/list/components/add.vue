<template>
  <div>
    <ht-modal
      :title="isDetail ? '入库详情' : '耗材入库'"
      centered
      :open="visible"
      :mask-closable="false"
      width="520px"
      wrap-class-name="equipmentOutgo-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="data">
            <a-form-item
              label="管理编号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-row :gutter="15">
                <a-col :span="18" style="font-size: 12px">
                  <a-input
                    v-model:value.trim="numberForm.sn"
                    :disabled="isNumberDisabled || isDetail"
                    placeholder="请输入获取编号"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isNumberDisabled || isDetail"
                    :loading="isloadingNumber"
                    @click="getNumber"
                  >
                    获取编号
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="耗材名称"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="data.name"
                :disabled="isDisabled || isDetail"
                placeholder="请输入耗材名称"
              />
            </a-form-item>
            <a-form-item
              label="规格型号"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="data.standard"
                :disabled="isDisabled || isDetail"
                placeholder="请输入规格型号"
              />
            </a-form-item>
            <a-form-item
              label="耗材类别"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              name="type"
              :rules="[
                { required: true, message: '耗材类别不能为空!' },
                {
                  validator: typeValidator,
                  trigger: 'blur',
                },
              ]"
            >
              <a-select
                v-model:value="data.type"
                :disabled="isDisabled || isDetail"
                placeholder="请选择耗材类别"
              >
                <a-select-option
                  v-for="consumable in consumables"
                  :key="consumable.key"
                  :value="consumable.key"
                >
                  {{ consumable.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              v-if="isDisabled"
              label="库存数量"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              name="amount"
              :rules="[{ required: true, message: '库存数量不能为空!' }]"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="data.amount"
                    style="width: 100%"
                    :disabled="isDisabled || isDetail"
                    placeholder="请输入"
                    @change="(e) => numberChange(e.target.value, 'amount')"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-select
                    v-model:value="data.amountUnit"
                    :disabled="isDisabled || isDetail"
                  >
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="本次入库数量"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              name="recordCount"
              :rules="[
                { required: true, message: '本次入库数量不能为空!' },
              ]"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="data.recordCount"
                    style="width: 100%"
                    type="number"
                    min="0"
                    :disabled="isDetail"
                    placeholder="请输入"
                    @change="(e) => numberChange(e.target.value, 'recordCount')"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-input
                    v-if="isDisabled"
                    v-model:value="data.amountUnit"
                    type="text"
                    :disabled="isDisabled || isDetail"
                  />
                  <a-select
                    v-else
                    v-model:value="data.amountUnit"
                    :disabled="isDisabled || isDetail"
                  >
                    <a-select-option
                      v-for="(item) in statusData"
                      :key="item.id"
                      :value="item.typename"
                    >
                      {{ item.typename }}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="验收入库日期"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-date-picker
                v-model:value="data.recordDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabled="isDetail"
              />
            </a-form-item>
            <a-form-item
              label="存放地点"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-input
                v-model:value="data.site"
                :disabled="isDisabled || isDetail"
                placeholder="请输入存放地点"
              />
            </a-form-item>
            <a-form-item
              label="所属部门"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              name="depart"
              :rules="[
                {
                  required:
                    !data
                    || !data.id
                    || (data && data.id && !!data.depart),
                  message: '所属部门不能为空!',
                },
              ]"
            >
              <a-row :gutter="15">
                <a-col :span="18" style="font-size: 12px">
                  <a-input
                    v-model:value="data.depart"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                    placeholder="请选择"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail || (data && data.id && !!data.depart)"
                    @click="setDepart"
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
                <a-col :span="18">
                  <a-input
                    v-model:value="data.operatorId"
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
            <a-form-item
              label="保管人"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              name="operatorId"
              :rules="[{ required: true, message: '保管人不能为空!' }]"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="data.managerId"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                    placeholder="请选择"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    @click="setPersonnels('radio', 'managerId', '请选择保管人')"
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="核查人"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              name="auditPersonId"
              :rules="[{ required: true, message: '核查人不能为空!' }]"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="data.auditPersonId"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                    placeholder="请选择"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    @click="
                      setPersonnels('radio', 'auditPersonId', '请选择核查人')
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
                :disabled="isDetail" placeholder="请输入生产商"
                :maxlength="200"
              />
            </a-form-item>
            <a-form-item label="供应商" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
              <a-input
                v-model:value="data.supplier"
                :disabled="isDetail" placeholder="请输入供应商"
                :maxlength="200"
              />
            </a-form-item>
            <a-form-item label="批次号" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
              <a-input
                v-model:value="data.batchSn"
                :disabled="isDetail" placeholder="请输入批次号"
                :maxlength="200"
              />
            </a-form-item>
            <a-form-item label="生产日期" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
              <a-date-picker
                v-model:value="data.productionDate"
                style="width:100%"
                value-format="YYYY-MM-DD"
                :disabled="isDetail"
              />
            </a-form-item>
            <a-form-item label="到货日期" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
              <a-date-picker
                v-model:value="data.arrivalDate"
                style="width:100%"
                value-format="YYYY-MM-DD"
                :disabled="isDetail"
              />
            </a-form-item>
            <a-form-item label="有效期（天）" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
              <a-input-number
                v-model:value="data.validDays"
                :min="0"
                :disabled="isDetail"
                placeholder="请输入有效期"
                style="width: 100%;"
                @blur="handleBlur"
              />
            </a-form-item>
            <a-form-item label="备注" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
              <a-textarea
                v-model:value="data.remark"
                :disabled="isDetail"
                placeholder="请输入备注"
                :maxlength="200"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <OrgList ref="orgListRef" :callback="getOrg" />
  </div>
</template>

<!-- eslint-disable ts/no-unused-expressions -->
<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { cancelNumber, getEqumipt } from '~/providers/api/consumablesList'
import OrgList from '~/providers/components/orgList.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
    OrgList,
  },
  props: ['callback'],
  data() {
    return {
      visible: false,
      spinning: false,
      formLayout: 'horizontal',

      dayjs,
      isDisabled: false,
      isDetail: false,
      data: {
        recordDate: dayjs(new Date()).format('YYYY-MM-DD'),
        operatorId: this?.personDatas?.operatorId?.[0]?.name,
        managerId: this?.personDatas?.managerId?.[0]?.name,
        auditPersonId: this?.personDatas?.auditPersonId?.[0]?.name,
      },
      consumables: [],
      detailId: '',
      statusData: [],
      departDatas: [
        {
          id: '',
          name: '',
        },
      ],
      numberForm: { id: 1, sn: undefined }, // 编号数据
      isloadingNumber: false,
      isNumberDisabled: false,
      personDatas: {
        operatorId: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
        managerId: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
        auditPersonId: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        operatorId: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
        managerId: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
        auditPersonId: [{ id: '', name: '' }],
      },
    }
  },
  watch: {
    personDatas: {
      handler(val) {
        val.operatorId && (this.data.operatorId = val.operatorId[0].name)
        val.managerId && (this.data.managerId = val.managerId[0].name)
        val.auditPersonId && (this.data.auditPersonId = val.auditPersonId[0].name)
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getStatus()
    this.getConsumables()
  },
  methods: {
    handleBlur() {
      const val = this.data.validDays
      // eslint-disable-next-line prefer-regex-literals
      if (val && !new RegExp(/^\d+$/).test(val)) {
        this.data.validDays = ''
      }
    },
    getStatus() {
      window.$oAjax({
        method: 'POST',
        // url: `${window.$oApi.eqEgressList.status}`,
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: 'f852d85d47ed64a40147ed70894c0006',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
        else {
          this.statusData = []
        }
      })
    },
    /**
     *获取耗材组
     */
    getConsumables() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: 'fcc166c7340845a8ad97d7014e6b565f',
        }),
      }).then((res) => {
        if (res && res.success) {
          // eslint-disable-next-line array-callback-return
          res.obj.map((v) => {
            _this.consumables.push({ key: v.typecode, label: v.typename })
          })
        }
      })
    },
    typeValidator(rule, value, callback) {
      if (value === '请选择') {
        callback(new Error('请选择耗材类型!'))
      }
      else {
        callback()
      }
    },
    showModal(data, isDetail) {
      this.isDetail = isDetail
      if (data && data.length > 0) {
        this.isNumberDisabled = true
        this.data = data[0]
        if (!this.data?.recordDate) {
          this.data.recordDate = dayjs(new Date()).format('YYYY-MM-DD')
        }

        const dateArr = ['productionDate', 'arrivalDate', 'recordDate']
        dateArr.forEach((item) => {
          if (this.data[item]) {
            this.data[item] = dayjs(this.data[item]).format('YYYY-MM-DD')
          }
        })

        /** 经手人 operatorId,部门保管人managerId,核查人auditPersonId */
        // if (isDetail) {
        this.personDatas.operatorId = [
          { id: this.data.operatorId, name: this.data.operatorName },
        ]
        this.personDatas.managerId = [
          { id: this.data.managerId, name: this.data.managerName },
        ]
        this.personDatas.auditPersonId = [
          { id: this.data.auditPersonId, name: this.data.auditPersonName },
        ]
        // }
        this.departDatas = [
          { id: this.data.departId || '', name: this.data.depart || '' },
        ]
        this.isDisabled = true
        // 修改入库回显编号
        this.numberForm.sn = this.data.sn
      }
      else {
        this.isDisabled = false
        this.isNumberDisabled = false
        // 调佣编号
        this.getNumber()
      }
      this.visible = true
    },
    showModalDetail() {
      this.visible = true
    },
    getPerson(idsPerson, acceptData) {
      this.data[idsPerson] = ''
      this.personDatas[idsPerson] = acceptData
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
    setDepart() {
      this.$refs.orgListRef.showModal('radio', 'depart', this.departDatas)
    },
    // 选择部门
    getOrg(key, data) {
      this.data[key] = ''
      this.departDatas = data
      this.data.depart = data?.[0]?.name
    },
    // 获取编号
    async getNumber() {
      const generatedPlaceholderId = this.numberForm.id
      try {
        const result = await getEqumipt(
          generatedPlaceholderId ? { generatedPlaceholderId } : '',
        )
        if (result.code === 20000) {
          this.numberForm = result.data || {}
        }
        else {
          // window.$oAntdMessage.info('管理编号获取失败')
        }
      }
      catch (err) {
        // eslint-disable-next-line no-console
        console.log(err)
      }
    },
    dataRequired(fieldsValue) {
      if (fieldsValue.recordCount && !fieldsValue.amountUnit) {
        window.$oAntdModal.warning(window.$oMsgTips.info('本次入库数量单位不能为空'))
        return false
      }
      return true
    },
    handleOk() {
      if (this.isDetail) {
        this.visible = false
        return
      }

      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.data }

        // 新增管理编号逻辑
        const body = {}
        if (this.numberForm.id) {
          body.snPlaceholderId = this.numberForm.id
        }
        if (this.numberForm.sn) {
          body.sn = this.numberForm.sn
        }
        const data = {
          ...fieldsValue,
          'recordType': 1,
          'amountUnit':
            fieldsValue.amountUnit === '选择' ? '' : fieldsValue.amountUnit,
          'TEqConsumables.id': this.data ? this.data.id : '',
          'recordDate': fieldsValue.recordDate
            ? dayjs(fieldsValue.recordDate).format('YYYY-MM-DD')
            : '入库日期无',
          'operatorId':
            this.personDatas.operatorId.length > 0
              ? this.personDatas.operatorId[0].id
              : '',
          'managerId':
            this.personDatas.managerId.length > 0
              ? this.personDatas.managerId[0].id
              : '',
          'auditPersonId':
            this.personDatas.auditPersonId.length > 0
              ? this.personDatas.auditPersonId[0].id
              : '',
          'operatorName':
            this.personDatas.operatorId.length > 0
              ? this.personDatas.operatorId[0].name
              : '',
          'managerName':
            this.personDatas.managerId.length > 0
              ? this.personDatas.managerId[0].name
              : '',
          'auditPersonName':
            this.personDatas.auditPersonId.length > 0
              ? this.personDatas.auditPersonId[0].name
              : '',
          'departId': this.departDatas.length > 0 ? this.departDatas[0].id : '',
          'depart': this.departDatas.length > 0 ? this.departDatas[0].name : '',
          ...body,
        }
        delete data.createDate
        delete data.updateDate
        if (!data.recordCount) {
          data.amountUnit = ''
        }
        if (this.dataRequired(data)) {
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
        }
      })
    },
    async handleCancel() {
      this.visible = false
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
      this.departDatas = [{ id: '', name: '' }]
      this.data = {}
      this.isDetail = false
      this.data = {
        recordDate: dayjs(new Date()).format('YYYY-MM-DD'),
        operatorId: this?.personDatas?.operatorId?.[0]?.name,
        managerId: this?.personDatas?.managerId?.[0]?.name,
        auditPersonId: this?.personDatas?.auditPersonId?.[0]?.name,
      }
      const { id } = this.numberForm
      this.numberForm = {}
      // 有id就去销毁
      if (id) {
        await cancelNumber({
          snPlaceholderId: id,
        })
      }
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
