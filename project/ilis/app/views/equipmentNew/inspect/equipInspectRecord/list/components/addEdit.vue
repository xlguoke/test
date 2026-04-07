<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="dataObj">
          <a-form-item
            label="期间核查计划"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '期间核查计划不能为空!' }]"
            name="inspectPlanName"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.inspectPlanName"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="inspectPlanBtn()"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="选择设备"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '设备不能为空!' }]"
            name="equipmentName"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.equipmentName"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="inspectPlanEquipBtn"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="核查部门"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            name="departName"
          >
            <a-row :gutter="15">
              <a-col :span="18">
                <a-input
                  v-model:value="dataObj.departName"
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
          <a-form-item
            label="核查人员"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '核查人员不能为空!' }]"
            name="personId"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.personId"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setPersonnels('radio', 'personId', '请选择核查人员')"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="计划执行时间"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-range-picker
              v-model:value="dataObj.planTimes"
              value-format="YYYY-MM-DD"
              :disabled="isDetail"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item
            label="核查时间"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '核查时间不能为空!' }]"
            name="inspectTime"
          >
            <a-date-picker
              v-model:value="dataObj.inspectTime"
              :disabled="isDetail"
              style="width: 100%"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
          <a-form-item
            label="核查内容"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '核查内容不能为空!' }]"
            name="inspectContent"
          >
            <a-input
              v-model:value="dataObj.inspectContent"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="核查结果及评价"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '核查结果及评价不能为空!' }]"
            name="inspectResult"
          >
            <a-input
              v-model:value="dataObj.inspectResult"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="评价人"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '评价人不能为空!' }]"
            name="resultPersonId"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.resultPersonId"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="
                    setPersonnels('radio', 'resultPersonId', '请选择评价人')
                  "
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="说明"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-input
              v-model:value="dataObj.inspectExplain"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="附件材料"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-button v-if="!isDetail" @click="upload">
              上传文件
            </a-button>
            <div v-for="(item, index) in fileLists" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`"
              >{{ item.name }}</a>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
    <AddOrg ref="AddOrg" :callback="getOrg" />
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
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import InspectPlanDeviceSelector from '~/components/selectorViaMethodCall/InspectPlanDeviceSelector.vue'
import InspectPlanSelector from '~/components/selectorViaMethodCall/InspectPlanSelector.vue'
import { getQueryVariable } from '~/providers/common/utils'
import AddOrg from '~/providers/components/orgList.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    AddOrg,
    TableTreePersonnel,
    UploadComponent,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',

      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      inspectPlan: {
        inspectPlanId: '',
        inspectPlanName: '',
        inspectPlanDetailId: '',
        equipmentId: '',
        equipmentName: '',
      },
      cloneInspectPlan: {
        inspectPlanId: '',
        inspectPlanName: '',
        inspectPlanDetailId: '',
        equipmentId: '',
        equipmentName: '',
      },
      departmentData: [],
      departId: '',
      fileLists: [],
      dayjs,
      // isDisabled: false,
      isDetail: false,
      dataObj: {
        planTimes: [],
      },
      detailId: '',
      personDatas: {
        personId: [{ id: '', name: '' }],
        resultPersonId: [{ id: '', name: '' }],
      },
      clonePersonDatas: {
        personId: [{ id: '', name: '' }],
        resultPersonId: [{ id: '', name: '' }],
      },
      orgData: [{ id: '', name: '' }],
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, true)
    }
  },
  methods: {
    // 选择设备  inspectPlanEquipBtn
    async  inspectPlanEquipBtn() {
      const recordId = this.inspectPlan.inspectPlanId
      if (!recordId) {
        message.warning('请先选择核查计划')
        return
      }
      const [acceptObj] = await AnyDialogHelper.showSelector(InspectPlanDeviceSelector, {
        multiple: true,
        payload: {
          id: recordId,
        },
      })
      this.planEqVisible = false
      this.inspectPlan.inspectPlanDetailId = acceptObj.id
      this.inspectPlan.equipmentId = acceptObj.equipmentId
      this.inspectPlan.equipmentName = acceptObj.name

      this.dataObj.personId = acceptObj.inspectUserName
      this.dataObj.personName = acceptObj.inspectUserName
      this.personDatas.personId = [{ id: acceptObj.inspectUserId, name: acceptObj.inspectUserName }]

      this.dataObj.equipmentName = acceptObj.name
    },
    // 期间核查计划 选择
    async inspectPlanBtn() {
      const data = await AnyDialogHelper.showSelector(InspectPlanSelector)
      this.inspectPlan.inspectPlanDetailId = ''
      this.inspectPlan.equipmentId = ''
      this.inspectPlan.equipmentName = ''
      this.inspectPlan.inspectPlanId = data[0].id
      // xx部门2020年度计划，xx部门2020-05月度计划 planDepartName （planType=1年2月） planYear planMouth
      let inspectPlanName
      if (data[0].planType === '1') {
        inspectPlanName = `${data[0].planDepartName}${data[0].planYear}年度计划`
      }
      else {
        inspectPlanName = `${data[0].planDepartName}${data[0].planYear}-${data[0].planMouth}月度计划`
      }
      this.inspectPlan.inspectPlanName = inspectPlanName
      this.dataObj.inspectPlanName = inspectPlanName
    },

    // 部门
    setOrg() {
      this.$refs.AddOrg.showModal('radio', 'depart', this.orgData)
    },
    getOrg(ids, orgData) {
      this.orgData = orgData
      this.dataObj.departName = orgData[0].name
    },

    showModal(editId, isDetail) {
      this.isDetail = isDetail
      if (editId) {
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: window.$oApi.equipInspectRecord.detailById,
          params: { id: editId },
        }).then((res) => {
          if (res.success) {
            this.dataObj = res.obj
            this.dataObj.inspectTime = dayjs(this.dataObj.inspectTime).format('YYYY-MM-DD HH:mm:ss')
            this.dataObj.personId = this.dataObj.personName
            this.dataObj.resultPersonId = this.dataObj.resultPersonName
            this.dataObj.planTimes = this.dataObj?.planTimes?.split(',') || []
            this.orgData = [
              { id: this.dataObj.departId, name: this.dataObj.departName },
            ]
            this.personDatas.personId = [
              { id: this.dataObj.personId, name: this.dataObj.personName },
            ]
            this.personDatas.resultPersonId = [
              {
                id: this.dataObj.resultPersonId,
                name: this.dataObj.resultPersonName,
              },
            ]
            this.inspectPlan = {
              inspectPlanId: this.dataObj.inspectPlanId,
              inspectPlanName: this.dataObj.inspectPlanName,
              inspectPlanDetailId: this.dataObj.inspectPlanDetailId,
              equipmentId: this.dataObj.equipmentId,
              equipmentName: this.dataObj.equipmentName,
            }
            this.fileLists = this.dataObj.files.map(item => ({
              uid: item.attachmentId,
              name: item.name,
              url: item.url,
            }))
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = {}
          }
          this.spinning = false
        })
      }
      // this.getLaboratoryData();
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
    dataRequired() {
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.dataObj }
        const planTimes = fieldsValue.planTimes
        if (planTimes && planTimes.length > 0) {
          fieldsValue.planTimes = `${planTimes[0]},${planTimes[1]}`
        }

        const data = {
          ...fieldsValue,
          departId: fieldsValue.departName ? this.orgData[0].id : '',
          inspectPlanId: this.inspectPlan.inspectPlanId,
          inspectPlanDetailId: this.inspectPlan.inspectPlanDetailId,
          equipmentId: this.inspectPlan.equipmentId,
          attachmentIds: this.fileLists.length > 0 ? this.fileLists[0].uid : '',
          achievementName:
            this.fileLists.length > 0 ? this.fileLists[0].name : '',
          personId:
            this.personDatas.personId.length > 0
              ? this.personDatas.personId[0].id
              : '',
          personName:
            this.personDatas.personId.length > 0
              ? this.personDatas.personId[0].name
              : '',
          resultPersonId:
            this.personDatas.resultPersonId.length > 0
              ? this.personDatas.resultPersonId[0].id
              : '',
          resultPersonName:
            this.personDatas.resultPersonId.length > 0
              ? this.personDatas.resultPersonId[0].name
              : '',
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }
        delete data.createDate
        delete data.updateDate
        if (this.dataRequired(data)) {
          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.equipInspectRecord.saveInspect,
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
    handleCancel() {
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
      this.inspectPlan = JSON.parse(JSON.stringify(this.cloneInspectPlan))
      this.orgData = [{ id: '', name: '' }]
      this.dataObj = {}
      this.fileLists = []
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
