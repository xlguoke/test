<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="dataObj">
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="资产编号"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.assetSn"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="档案编号"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
                :rules="[{ required: true, message: '档案编号不能为空！' }]"
                name="archiveSn"
              >
                <a-input
                  v-model:value="dataObj.archiveSn"
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
                :rules="[{ required: true, message: '设备类别不能为空！' }]"
                name="type"
              >
                <a-select
                  v-model:value="dataObj.type"
                  :disabled="isDetail"
                  placeholder="请选择设备类别"
                >
                  <a-select-option value="undefined">
                    全部
                  </a-select-option>
                  <a-select-option
                    v-for="(item, index) in eqType"
                    :key="index"
                    :value="item.typename"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="设备名称"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
                :rules="[{ required: true, message: '设备名称不能为空！' }]"
                name="name"
              >
                <a-input
                  v-model:value="dataObj.name"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
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
            <a-col :span="rowCol">
              <a-form-item
                label="配置位置"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.storageSite"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="生产厂家"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.factory"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="制造编号"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.factorySn"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="出厂日期"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.productionDate"
                  style="width: 100%"
                  :disabled="isDetail"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="出厂价"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input-number
                  v-model:value="dataObj.factoryPrice"
                  style="width: 100%"
                  :min="0"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="安装费"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input-number
                  v-model:value="dataObj.installFee"
                  style="width: 100%"
                  :min="0"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="运杂费"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input-number
                  v-model:value="dataObj.transportFee"
                  style="width: 100%"
                  :min="0"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="购置日期"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.buyDate"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="投产时间"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.operationDate"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <div class="row-header"></div>
          <a-row>
            <a-col :span="rowCol">
              <a-form-item
                label="精度"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.accuracy"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="量程"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.eqRange"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="总功率"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.power"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="外型尺寸"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.size"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="复杂系数(机)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.coefficientMachine"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="复杂系数(电)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.coefficientElectronic"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="复杂系数(热)"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.coefficientHot"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="管理方式"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.managementWay"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="纳入设备授权管理:"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-radio-group
                  v-model:value="dataObj.isIot"
                  name="radioGroup"
                  :disabled="isDetail"
                >
                  <a-radio value="1">
                    是
                  </a-radio>
                  <a-radio value="0">
                    否
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="公路水运设备:"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-radio-group
                  v-model:value="dataObj.isGlsy"
                  name="radioGroup"
                  :disabled="isDetail"
                >
                  <a-radio value="1">
                    是
                  </a-radio>
                  <a-radio value="0">
                    否
                  </a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="单位管理员:"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.managerName"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-input
                  v-show="false"
                  v-model:value="dataObj.managerId"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="
                    setPersonnels('radio', 'managerPerson', '请选择单位管理员')
                  "
                >
                  选择
                </a-button>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="部门保管人:"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.keeperName"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-input
                  v-show="false"
                  v-model:value="dataObj.keeperId"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setPersonnels('radio', 'keeper', '请选择单位管理员')"
                >
                  选择
                </a-button>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="所属功能室"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-select
                  v-model:value="dataObj.laboratoryId"
                  :disabled="isDetail"
                  placeholder="请选择所属功能室"
                  @change="selectOmnipotenceList"
                >
                  <a-select-option
                    v-for="(item, index) in omnipotenceList"
                    :key="index"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="检校周期"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-flex>
                  <a-input-number
                    v-model:value="dataObj.checkPeriod"
                    :disabled="isDetail"
                    class="mr-2 flex-1"
                  />
                  <a-select
                    v-model:value="dataObj.checkPeriodUnit"
                    :disabled="isDetail"
                    style="width: auto;"
                  >
                    <a-select-option key="1" value="年">
                      年
                    </a-select-option>
                    <a-select-option key="2" value="月">
                      月
                    </a-select-option>
                    <a-select-option key="3" value="日">
                      日
                    </a-select-option>
                  </a-select>
                </a-flex>
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="检校单位"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.checkUnit"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="所属单位"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.unitName"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="所属部门"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.departName"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-input
                  v-show="false"
                  v-model:value="dataObj.departId"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setOrg()"
                >
                  选择
                </a-button>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="管理类别"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-select
                  v-model:value="dataObj.manageType"
                  :disabled="isDetail"
                  placeholder="请选择类别"
                  @change="selectManagementClass"
                >
                  <a-select-option
                    v-for="(item, index) in managementClassList"
                    :key="index"
                    :value="item.id"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="使用人:"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.userName"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-input
                  v-show="false"
                  v-model:value="dataObj.userId"
                  :disabled="true"
                  style="width: 165px"
                />
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="
                    setPersonnels('checkbox', 'selOperator', '选择使用人')
                  "
                >
                  选择
                </a-button>
              </a-form-item>
            </a-col>

            <a-col :span="rowCol">
              <a-form-item
                label="下次校验时间"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-date-picker
                  v-model:value="dataObj.nextCheckDate"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
            <a-col :span="rowCol">
              <a-form-item
                label="存放位置"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-input
                  v-model:value="dataObj.storageSite"
                  :disabled="isDetail"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-spin>
    <AddOrg ref="AddOrg" :callback="getOrg" />
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
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
      add: true,
      spinning: false,
      isDetail: false,
      formLayout: 'horizontal',

      dayjs,
      labelCol: { span: 7 },
      wrapperCol: { span: 16 },
      rowCol: 12,
      dataObj: {
        isIot: '0',
        isGlsy: '0',
      },
      eqType: [],
      // orgData: [{id: "", name: ""}]
      omnipotenceList: [],
      managementClassList: [],
    }
  },
  created() {
    // this.getStatus()
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id = getQueryVariable('id') || '4028826372358837017236030137001f'
      this.showModal(id, true)
    }
    this.getTypeData()
    this.getOmnipotenceRoom()
    this.getManagementClass()
  },
  methods: {
    getDefaultUnitName() {
      window.$oAjax({
        method: 'GET',
        url: 'unitVersionController.do?getEnabledVersion',
      }).then((res) => {
        if (res && res.success) {
          this.dataObj.unitName = res.obj.departname
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getOrg(ids, orgData) {
      this.dataObj.departId = orgData[0].id
      this.dataObj.departName = orgData[0].name
      // this.dataObj.departId = orgData[0].id;
      // this.dataObj.departName = orgData[0].name;
    },
    setOrg() {
      this.$refs.AddOrg.showModal('radio', 'depart', this.orgData)
    },
    selectOmnipotenceList(v) {
      this.omnipotenceList.forEach((item) => {
        if (item.id == v) {
          this.dataObj.laboratoryName = item.name
          this.dataObj.laboratoryId = item.id
        }
      })
    },
    selectManagementClass(v) {
      this.managementClassList.forEach((item) => {
        if (item.id == v) {
          this.dataObj.manageType = item.typename
        }
      })
    },
    setPersonnels(type, idsPerson, title) {
      // let acceptData = this.personDatas[idsPerson];
      let defaultSel = []
      if (idsPerson == 'keeper') {
        defaultSel = [
          { id: this.dataObj.keeperId, name: this.dataObj.keeperName },
        ]
      }
      else if (idsPerson == 'managerPerson') {
        defaultSel = [
          { id: this.dataObj.managerId, name: this.dataObj.managerName },
        ]
      }
      else if (idsPerson == 'selOperator') {
        if (this.dataObj.userName) {
          defaultSel = this.dataObj.userName.split(',').map((item, index) => {
            const idarr = this.dataObj.userId.split(',')
            return { name: item, id: idarr[index] }
          })
        }
      }

      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        defaultSel,
        title,
      )
    },
    // setOperator(type, idsPerson, title){
    //   this.$refs.TableTreePersonnel.showModal(type, idsPerson, "", title);
    // },
    getPerson(idsPerson, acceptData) {
      // this[idsPerson] = acceptData;

      if (idsPerson == 'selOperator') {
        this.dataObj.userId = acceptData
          .map((item) => {
            return item.id
          })
          .join(',')

        this.dataObj.userName = acceptData
          .map((item) => {
            return item.name
          })
          .join(',')
      }
      else if (idsPerson == 'managerPerson') {
        this.dataObj.managerId = acceptData[0].id
        this.dataObj.managerName = acceptData[0].name
      }
      else if (idsPerson == 'keeper') {
        this.dataObj.keeperId = acceptData[0].id
        this.dataObj.keeperName = acceptData[0].name
      }
    },
    // setPersonnels(type, idsPerson, title) {
    //   let acceptData = this.personDatas[idsPerson];
    //   this.$refs.TableTreePersonnel.showModal(type, idsPerson, acceptData, title);
    // },
    getTypeData() {
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '402882206b72e01e016b72f8bfd80001' }),
        // headers: {
        //   "X-Requested-With": "XMLHttpRequest"
        // }
      }).then((res) => {
        if (res && res.success) {
          this.eqType = res.obj
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    getOmnipotenceRoom() {
      // 获取多功能室
      window.$oAjax({
        method: 'GET',
        url: 'laboratoryController.do?listLaboratory',
      }).then((res) => {
        if (res && res.success) {
          this.omnipotenceList = res.obj
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getManagementClass() {
      // 获取管理类别
      window.$oAjax({
        method: 'GET',
        url: 'dictionaryController.do?getListByGroupId',
        params: { dictGroupId: '402882cd5f998a58015f9991d359000d' },
      }).then((res) => {
        if (res && res.success) {
          this.managementClassList = res.obj
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },

    showModal(dataObj, isDetail) {
      this.isDetail = isDetail
      if (dataObj) {
        this.dataObj = dataObj

        const dateArr = ['buyDate', 'productionDate', 'operationDate', 'nextCheckDate']
        dateArr.forEach((item) => {
          if (this.dataObj[item]) {
            this.dataObj[item] = dayjs(this.dataObj[item]).format('YYYY-MM-DD')
          }
        })
      }
      else {
        this.getDefaultUnitName()
        this.spinning = false
      }
    },
    dataRequired() {
      return true
    },
    async validateFields() {
      let data

      return new Promise((resolve) => {
        this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.dataObj }
          data = {
            ...values,
            // applyDepartId: values['applyDepart'] ? this.orgData[0].id : "",
            // buyPersonId: (this.personDatas.buyPerson.length > 0 && values['buyPerson'] === this.personDatas.buyPerson[0].name) ? this.personDatas.buyPerson[0].id : "",
            // buyPerson: values['buyPerson'] ? values['buyPerson'] : "",
            productionDate: values.productionDate || '',
            buyDate: values.buyDate || '',
            nextCheckDate: values.nextCheckDate || '',
            operationDate: values.operationDate || '',
          }
          if (this.dataObj.id) {
            data.id = this.dataObj.id
          }

          resolve(data)
        }).catch(() => {
          resolve(false)
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
      // this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas));
      this.orgData = []
    },
    // setOrg() {
    //   this.$refs.AddOrg.showModal('radio', 'depart', this.orgData);
    // },
  },
}
</script>

<style lang="less">
/*.ant-form-item-label {*/
/*width: 80px;*/
/*}*/
</style>
