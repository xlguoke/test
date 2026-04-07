<template>
  <div style="padding-bottom: 50px">
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        :title="title"
        left-arrow
        @click-left="$router.go(-1)"
      ></MobileTitleBar>
    </van-sticky>
    <div v-if="id" class="audit-status">
      <div v-if="detail.applyStatus === '12'">
        <img :src="waitPng" />
        <div>待提交</div>
      </div>
      <div v-if="detail.applyStatus === '14'">
        <img :src="auditPng" />
        <div>审批中</div>
      </div>
      <div v-if="detail.applyStatus === '16'">
        <img :src="refusePng" />
        <div>审批拒绝</div>
      </div>
      <div v-if="detail.applyStatus === '20'">
        <img :src="passPng" />
        <div>审批通过</div>
      </div>
    </div>
    <SubTitle>
      设备信息
      <template v-if="!readonly" #right>
        <div class="flex">
          <span class="add-btn" @click="selectEquipmentVisible = true">
            <van-icon name="plus" />
            列表添加
          </span>
          <span class="add-btn" @click="handleAddByScan">
            <van-icon name="scan" />
            扫码添加
          </span>
        </div>
      </template>
    </SubTitle>
    <div class="device-list">
      <div v-if="deviceList.length">
        <div
          v-for="item in computedDeviceList"
          :key="item.id"
          class="device-list-item"
        >
          <div class="l">
            <div>
              <span class="name">{{ item.name }}</span>
              <span class="code">{{ item.archiveSn }}</span>
            </div>
            <div>
              <span class="label">规格型号：</span>
              <span>{{ item.standard }}</span>
            </div>
          </div>
          <div class="r">
            <van-icon
              v-if="!readonly"
              name="clear"
              @click="handleRemove(item)"
            />
          </div>
        </div>
        <div
          v-if="deviceList.length > 2"
          class="switch-btn"
          @click="isShowMore = !isShowMore"
        >
          <div v-if="!isShowMore">
            查看更多
            <van-icon name="arrow-down" />
          </div>
          <div v-else>
            收起
            <van-icon name="arrow-up" />
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无设备"></van-empty>
    </div>
    <SubTitle>外出信息</SubTitle>
    <van-form :disabled="readonly" label-width="130">
      <van-cell-group>
        <van-field
          v-model="formData.testTaskSn"
          label="关联任务："
          type="textarea"
          :placeholder="placeholder"
          rows="1"
          autosize
          readonly
        >
          <template v-if="!readonly" #button>
            <van-button
              v-if="!!formData.testTaskSn"
              size="small"
              plain
              hairline
              type="primary"
              native-type="button"
              class="mr-2"
              @click="
                () => {
                  formData.testTaskSn = ''
                  formData.projectName = ''
                  taskList = []
                  projectList = []
                  formData.qualificationType = ''
                  qualificationTypeDisplay = ''
                  qualification = []
                }
              "
            >
              清空
            </van-button>
            <van-button
              size="small"
              plain
              hairline
              type="primary"
              native-type="button"
              @click="testTaskVsibile = true"
            >
              选择
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="formData.projectName"
          clearable
          type="textarea"
          label="关联工程项目："
          :placeholder="readonly ? '' : '请选择或输入（多个用逗号分隔）'"
          rows="1"
          autosize
          :disabled="readonly || !!formData.testTaskSn"
          :required="OUT_EQUIPMENT_LIMIT_SELECT"
          @blur="syncProjectData"
        >
          <template v-if="!readonly" #button>
            <van-button
              v-if="!formData.testTaskSn"
              size="small"
              plain
              hairline
              type="primary"
              native-type="button"
              @click="projectVsibile = true"
            >
              选择
            </van-button>
          </template>
        </van-field>

        <FormItemInput
          v-if="EQ_ENGINEERING_FIELD"
          v-model:value="qualificationTypeDisplay"
          label="资质类型"
          placeholder="请选择资质类型"
          readonly
          :disabled="!!formData.testTaskSn"
          clearable
          autosize
          type="textarea"
        >
          <template v-if="!formData.testTaskSn" #button>
            <van-button
              size="small"
              plain
              hairline
              type="info"
              native-type="button"
              @click="qualificationVsibile = true"
            >
              选择
            </van-button>
          </template>
        </FormItemInput>

        <FormItemPerson
          v-model:value="borrowUser"
          label="借用人："
          :placeholder="placeholder"
          :disabled="readonly"
        />

        <van-field
          v-model.trim="formData.location"
          label="使用地点："
          :placeholder="!readonly ? '请填写' : ''"
          :rows="1"
          autosize
          type="textarea"
          input-align="right"
          :readonly="readonly"
        />

        <FormItemDate
          v-model:value="formData.egressTime"
          label="外出时间："
          enable-time
          :placeholder="placeholder"
        />

        <FormItemDate
          v-model:value="formData.expectReturnTime"
          label="预还时间："
          enable-time
          :required="EQUIPMENT_EGRESS_DATE"
          :placeholder="placeholder"
        />

        <FormItemDate
          v-model:value="formData.requiredDate"
          label="需求日期："
          :placeholder="placeholder"
        />

        <van-field
          v-model.trim="formData.reason"
          label="申请理由："
          :placeholder="!readonly ? '请填写' : ''"
          :rows="1"
          autosize
          type="textarea"
          :maxlength="500"
          required
          input-align="right"
          :readonly="readonly"
        />
        <van-field
          v-model.trim="formData.remark"
          label="备注："
          :placeholder="!readonly ? '请填写' : ''"
          :rows="1"
          autosize
          :maxlength="500"
          type="textarea"
          input-align="right"
          :readonly="readonly"
        />
        <div style="padding: 10px 16px; color: #646566">
          附件上传：<span style="font-size: 12px; color: #999">（仅支持图片格式文件上传）</span>
        </div>
        <van-field name="uploader" label="" input-align="left">
          <template #input>
            <AttachmentHandler
              ref="attachmentHandlerRef"
              business-type="EQ_EGRESS"
              :business-id="id"
              :readonly="readonly"
              :fixed-qr-url="qrUrl"
              @init="qrUrl = $event.qrUrl"
            />
          </template>
        </van-field>
      </van-cell-group>
    </van-form>
    <div class="fixed-btn-box">
      <van-button
        v-if="id && ['12'].includes(detail.applyStatus)"
        size="small"
        type="danger"
        style="width: 100%"
        @click="handleDelete"
      >
        删除
      </van-button>
      <van-button
        v-if="id && ['14'].includes(detail.applyStatus)"
        size="small"
        type="danger"
        style="width: 100%"
        @click="showRevoke = true"
      >
        撤回
      </van-button>
      <van-button
        v-if="(id && ['12'].includes(detail.applyStatus)) || !id"
        size="small"
        type="primary"
        style="width: 100%"
        @click="handleSave"
      >
        保存
      </van-button>
      <van-button
        v-if="(id && ['12'].includes(detail.applyStatus))"
        size="small"
        type="primary"
        style="width: 100%"
        @click="beforeSubmit"
      >
        提交
      </van-button>
    </div>

    <van-dialog
      v-model:show="showRevoke"
      title="确认撤回？"
      show-cancel-button
      @confirm="handleRecall"
    >
      <van-field
        v-model="recallDesc"
        placeholder="请输入撤回原因"
      ></van-field>
    </van-dialog>

    <SelectTask
      v-model:value="testTaskVsibile"
      :is-multiple="true"
      :payload="{ testTaskStatus: 20 }"
      :init-selected="taskList"
      @selected-ok="getTask"
    />

    <SelectProject
      v-model:value="projectVsibile"
      :is-multiple="true"
      :init-selected="projectList"
      @selected-ok="getProject"
    />

    <SelectQua
      v-model:value="qualificationVsibile"
      :is-multiple="true"
      :init-selected="qualification"
      @selected-ok="getQualification"
    />

    <SelectEquipment
      :key="JSON.stringify(payload)"
      v-model:value="selectEquipmentVisible"
      :is-multiple="true"
      :show-sub-eq="true"
      :filter="[
        'quickQryParam',
        'eqDepartId',
        'eqLaboratoryName',
        'nextCheckDate',
      ]"
      :payload="payload"
      :init-selected="[]"
      @selected-ok="getEquipment"
    />

    <CommonAudit
      v-model:value="auditVisible"
      :audit-type-id="detail.type === EqGoOutAuditType.TRANSITION ? ProcessType.EQ_EGRESS_TRANSITION_APPLY : ProcessType.EQ_EGRESS_APPLY"
      @on-submit="onAuditSubmit"
    >
    </CommonAudit>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapState } from 'pinia'
import qs from 'qs'
import { showConfirmDialog, showDialog, showLoadingToast } from 'vant'
import { ProcessType } from '~/components/commonProcess'
import { EqGoOutAuditType } from '~/views/equipment/eqGoOutAudit'
import { removeEquipmentApi } from '~/views/equipment/eqGoOutAudit/api'
import { EgressStatus } from '~/views/equipmentNew/egress/eqEgressList/list/OperationEntity'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import SelectEquipment from '~/views/mobileApp/components/selectEquipment.vue'
import SelectProject from '~/views/mobileApp/components/selectProject.vue'
import SelectQua from '~/views/mobileApp/components/selectQualification.vue'
import SelectTask from '~/views/mobileApp/components/selectTestTask.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

const DEFAULT_CACHE_KEY = 'equipmentOutwardApplicationCache'

export default {
  components: {
    FormItemInput,
    FormItemPerson,
    FormItemDate,
    SelectEquipment,
    SelectTask,
    SelectProject,
    SubTitle,
    CommonAudit,
    MobileTitleBar,
    SelectQua,
    AttachmentHandler,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'equipmentScanAdd') {
      sessionStorage.setItem(DEFAULT_CACHE_KEY, JSON.stringify(this.$data))
    }
    else {
      sessionStorage.removeItem(DEFAULT_CACHE_KEY)
    }
    next()
  },
  data() {
    return {
      EqGoOutAuditType,
      ProcessType,
      qrUrl: '',
      waitPng: new URL(`~/views/mobileApp/assets/wait.png`, import.meta.url).href,
      auditPng: new URL(`~/views/mobileApp/assets/audit.png`, import.meta.url).href,
      refusePng: new URL(`~/views/mobileApp/assets/refuse.png`, import.meta.url).href,
      passPng: new URL(`~/views/mobileApp/assets/pass.png`, import.meta.url).href,
      testTaskVsibile: false,
      projectVsibile: false,
      selectEquipmentVisible: false,
      qualificationVsibile: false,
      auditVisible: false,
      showRevoke: false,
      isShowMore: false,
      deviceList: [],
      borrowUser: [],
      formData: {
        testTaskSn: '',
        projectName: '',
      },
      detail: {},
      recallDesc: '',
      addId: '',
      taskList: [],
      projectList: [],
      qualification: [],
      /** 业务控制参数：控制预还时间是否必填 */
      EQUIPMENT_EGRESS_DATE: false,
      /** 业务控制参数：设备外出工程项目作为必填项 */
      OUT_EQUIPMENT_LIMIT_SELECT: false,
      /** 业务控制参数：控制表单属性-资质类型是否显示 */
      EQ_ENGINEERING_FIELD: false,
      /** 业务控制参数：是否允许向外出的设备发起转交申请 */
      isAllowedOutsideDevice: false,
      allowedStatus: [],
      qualificationTypeData: [],
      allQualificationData: [],
      qualificationTypeDisplay: '',
    }
  },
  computed: {
    id() {
      return this.$route.params.id || this.addId
    },
    ...mapState(useAppUserStore, {
      currentUser: 'userInfo',
    }),
    ...mapState(useEquipmentStore, ['eqDataList']),
    /** # 状态： 1：新增 2：编辑 3：详情 */
    status() {
      return this.$route.params.status
    },
    title() {
      switch (this.status) {
        case '1':
          return '新增设备外出申请'
        case '2':
          return '编辑设备外出申请'
        case '3':
          return '设备外出申请详情'
        default:
          return '新增设备外出申请'
      }
    },
    readonly() {
      return (
        this.status === 3
        || (this.id && this.detail && this.detail.applyStatus !== '12')
        || false
      )
    },
    placeholder() {
      return !this.readonly ? '请选择' : ''
    },
    computedDeviceList() {
      if (this.isShowMore) {
        return this.deviceList
      }
      else {
        return this.deviceList.slice(0, 2)
      }
    },
    payload() {
      if (this.status === '1' || !this.status) {
        return { egressStatus: '10,30', transitionQuery: 1 }
      }
      else {
        return this.detail?.type === EqGoOutAuditType.EGRESS
          ? { egressStatus: this.allowedStatus.join(',') }
          : { egressStatus: '40,60,70,80,90,120', transitionUserId: this.detail?.transitionUserId }
      }
    },
  },
  watch: {},
  async created() {
    // 从缓存中获取数据
    const cache = sessionStorage.getItem(DEFAULT_CACHE_KEY)
    if (cache) {
      Object.assign(this.$data, JSON.parse(cache))
      this.currentDate = new Date()
      return
    }

    try {
      await Promise.all([
        this.getqualificationTypeData(),
        this.getqualificationTypeDataAll(),
      ])
    }
    catch (error) {
      console.error(error)
    }

    if (this.status === '2' || this.status === '3') {
      this.getDetail()
    }
    else {
      this.borrowUser = [{
        id: this.currentUser.id,
        name: this.currentUser.realName,
      }]
    }
    this.EQUIPMENT_EGRESS_DATE = await this.getBusinessParams(
      'EQUIPMENT_EGRESS_DATE',
    )
    this.OUT_EQUIPMENT_LIMIT_SELECT = await this.getBusinessParams(
      'OUT_EQUIPMENT_LIMIT_SELECT',
    )
    this.EQ_ENGINEERING_FIELD = await this.getBusinessParams('EQ_ENGINEERING_FIELD')
    this.isAllowedOutsideDevice = await this.getBusinessParams('EQ_EGRESS_TRANSITION')
    if (this.isAllowedOutsideDevice) {
      this.allowedStatus = [
        EgressStatus.IN_LIBRARY,
        EgressStatus.IN_LIBRARY_30,
        EgressStatus.OUTGOING,
        EgressStatus.RETURN_REJECTED,
        EgressStatus.OUTGOING_DELAY,
        EgressStatus.DELAY_REJECTED,
        EgressStatus.TRANSFER_REJECTED,
      ]
    }
    else {
      this.allowedStatus = [
        EgressStatus.IN_LIBRARY,
        EgressStatus.IN_LIBRARY_30,
      ]
    }
    sessionStorage.setItem('allowedStatus_outward', JSON.stringify(this.allowedStatus))
  },
  mounted() {
    // 将页面的滚动条位置重置为0
    window.scrollTo(0, 0)

    if (this.eqDataList && this.eqDataList.length) {
      this.getEquipment(this.eqDataList)
    }
  },
  beforeUnmount() {
    useEquipmentStore().clearEqData()
  },
  methods: {
    async getBusinessParams(key) {
      try {
        const res = await mRequest.get(
          'tSBusinessParamController.do?getBusinessParam',
          {
            params: {
              key,
            },
          },
        )
        return res.obj === 'Y'
      }
      catch (err) {
        console.error(err)
        return false
      }
    },
    async getqualificationTypeData() {
      const res = await mRequest.get(`common-body/qualification/pagination`, {
        params: {
          size: 999,
        },
      })
      this.qualificationTypeData = res.rows || []
    },
    async getqualificationTypeDataAll() {
      const res = await mRequest.get(`common-body/qualification/pagination`, {
        params: {
          isDeleted: 1,
          size: 999,
        },
      })
      this.allQualificationData = res.rows || []
    },
    async getDetail() {
      const { data, code, msg, message } = await mRequest.get(
        `/rest/eq/egress/apply/detail/${this.id}`,
      )
      if (code === 20000) {
        this.detail = data
        this.initData()
      }
      else {
        showDialog({ message: msg || message || '获取详情失败' })
      }
    },
    initData() {
      this.formData = { ...this.detail }

      if (this.formData.qualificationType) {
        const quaIdArr = this.formData.qualificationType.split(',')
        this.getQualification(quaIdArr)
      }
      else {
        this.getQualification([])
      }

      if (this.formData.borrowUserId) {
        this.borrowUser = [{
          id: this.formData.borrowUserId,
          name: this.formData.borrowUser,
        }]
      }

      if (this.formData.requiredDate) {
        this.formData.requiredDate = dayjs(this.formData.requiredDate).format('YYYY-MM-DD')
      }

      if (this.detail.projects && this.detail.projects.length) {
        this.projectList = this.detail.projects.map((i) => {
          return {
            id: i.projectId,
            name: i.projectName,
          }
        })
      }

      if (this.detail.testTaskSn) {
        this.taskList = this.detail.testTaskSn.split(',').map((i) => {
          return {
            testTaskCode: i,
          }
        })
      }
      this.deviceList = this.detail.equipments || []
    },
    getTask(data) {
      this.taskList = data
      this.projectList = data
        .map(i => ({ id: i.projectId, name: i.projectName }))
        .filter(i => i.id)
      this.qualification = data.map(i => ({ id: i.qualificationTypeId, name: i.name }))
      this.formData.testTaskSn = data.map(i => i.testTaskCode).join(',')
      this.formData.projectName = this.handleProjectName(
        this.projectList.map(i => i.name).join(','),
      )

      // 更新资质
      const uniqueQualificationIds = Array.from(
        new Set(
          data.flatMap((task) => {
            const idStr = task.qualificationTypeId || ''
            return idStr.split(',').map(id => id.trim()).filter(id => id)
          }),
        ),
      )
      this.getQualification(uniqueQualificationIds)
    },
    handleAddByScan() {
      this.$router.push({
        name: 'equipmentScanAdd',
        params: {
          status: '70',
          name: '外出申请',
        },
      })
    },
    getProject(data) {
      const pNameArr = []

      data.forEach((item) => {
        if (!this.projectList.find(i => i.id && i.id === item.id)) {
          this.projectList.push({
            id: item.id,
            name: item.name,
          })
        }

        if (!pNameArr.includes(item.name)) {
          pNameArr.push(item.name)
        }
      })

      this.formData.projectName = pNameArr.join(',')
    },
    getQualification(data) { // 字符串数组
      if (!Array.isArray(data) && !data.length) {
        this.qualificationTypeDisplay = ''
        this.formData.qualificationType = ''
      }
      const uniqueData = Array.from(new Set(data))
      this.qualificationTypeDisplay = uniqueData.map((id) => {
        const qua = this.allQualificationData.find(item => item.id === id)
        return qua ? qua.name : id
      }).join(',')
      this.formData.qualificationType = uniqueData.join(',')
    },
    handleProjectName(val) {
      if (val) {
        const arr = val.split(',')
        return Array.from(new Set(arr)).join(',')
      }
      return val
    },
    syncProjectData() {
      const pName = this.formData.projectName
      if (pName) {
        const pArr = pName.split(',')
        this.projectList = this.projectList.filter(p => pArr.includes(p.name))
      }
    },
    async beforeSubmit() {
      await this.handleSave()
      this.auditVisible = true
    },
    async onAuditSubmit(processUserTaskList, formPropertyJson) {
      const api = 'rest/eq/egress/apply/submit/audit'

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post(
          api,
          qs.stringify({
            id: this.id,
            presetAuditors: JSON.stringify(processUserTaskList),
            formPropertyJson: JSON.stringify(formPropertyJson),
          }),
        )
        .finally(() => {
          toast.close()
        })

      if (res.code === 20000) {
        showSuccessToast('提交成功！')
        this.getDetail()
        this.auditVisible = false
      }
      else {
        showDialog({ message: res.message })
      }
    },
    async handleSave() {
      if (!this.deviceList || !this.deviceList.length) {
        showFailToast('请选择设备！')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      if (this.OUT_EQUIPMENT_LIMIT_SELECT && !this.formData.projectName) {
        showFailToast('请选择关联工程项目！')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      if (!this.formData.egressTime) {
        showFailToast('请选择外出时间！')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      if (this.EQUIPMENT_EGRESS_DATE && !this.formData.expectReturnTime) {
        showFailToast('请选择预还时间！')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      if (!this.formData.requiredDate) {
        showFailToast('请选择需求日期！')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      if (!this.formData.reason) {
        showFailToast('请输入申请理由！')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      if (this.formData.expectReturnTime) {
        if (
          new Date(this.formData.egressTime).valueOf()
            >= new Date(this.formData.expectReturnTime).valueOf()
        ) {
          showDialog({ message: '预还时间必须大于外出时间' })
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject()
        }
      }

      if (this.borrowUser.length > 0) {
        this.formData.borrowUser = this.borrowUser[0].name
        this.formData.borrowUserId = this.borrowUser[0].id
      }

      const params = {
        egressApplySn: '',
        ...this.formData,
        id: this.id,
        projectName: this.handleProjectName((this.formData.projectName || '').replaceAll('，', ',')),
        equipmentIds: this.deviceList.map(i => i.id),
        qrKey: this.$refs.attachmentHandlerRef.qrKey,
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const method = this.id ? 'put' : 'post'
      const { code, msg, data } = await mRequest[method](
        '/rest/eq/egress/apply',
        params,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ).finally(() => {
        toast.close()
      })
      if (code === 20000) {
        showSuccessToast('保存成功！')
        if (method === 'post') {
          this.addId = data
        }
        setTimeout(() => {
          // 现在申请单会拆分，所以这里不刷新详情，改为返回列表
          // this.getDetail()
          this.$router.back()
        }, 200)
      }
      else {
        showDialog({ message: msg })
        return Promise.reject(msg)
      }
    },
    async handleRecall() {
      if (!this.recallDesc) {
        showToast({ message: '请填写撤回原因！' })
        return
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const { code, msg, message } = await mRequest
        .post(
          '/rest/eq/egress/apply/recall',
          {
            id: this.id,
            recallDesc: this.recallDesc,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .finally(() => {
          toast.close()
        })
      if (code === 20000) {
        showToast({ message: '撤回成功！' })
        this.getDetail()
      }
      else {
        showDialog({ message: msg || message || '撤回失败！' })
      }
    },
    async handleDelete() {
      showConfirmDialog({
        title: '提示',
        message: `确认要删除该数据吗?`,
      })
        .then(async () => {
          const toast = showLoadingToast({
            duration: 0,
            forbidClick: true,
          })
          const { code, msg, message } = await mRequest
            .delete(`/rest/eq/egress/apply/${this.id}`)
            .finally(() => {
              toast.close()
            })
          if (code === 20000) {
            showSuccessToast('删除成功！')
            setTimeout(() => {
              this.$router.back()
            }, 200)
          }
          else {
            showDialog({ message: msg || message })
          }
        })
        .catch(() => {})
    },
    getEquipment(rows) {
      if (this.isAllowedOutsideDevice) {
        const allowed = rows.filter(d => this.allowedStatus.includes(d.egressStatus))
        if (!allowed?.length) {
          showDialog({ message: `仅允许选择${this.allowedStatus.map(s => EgressStatusDict.getLabelByKey(s)).join('、')}的设备` })
          return
        }
      }
      else {
        const allowed = rows.filter(d => this.allowedStatus.includes(d.egressStatus))
        if (!allowed?.length) {
          showDialog({ message: `仅允许选择${this.allowedStatus.map(s => EgressStatusDict.getLabelByKey(s)).join('、')}的设备` })
          return
        }
      }
      const addArr = []
      rows.forEach((item) => {
        const i = this.deviceList.findIndex(i => i.id === item.id)
        if (i === -1) {
          addArr.push(item)
        }
      })
      this.deviceList.unshift(...addArr)
    },
    async handleRemove(row) {
      this.deviceList = this.deviceList.filter(item => item.id !== row.id)
      if (this.id) {
        await removeEquipmentApi({
          id: this.id,
          equipmentIds: [row.id],
        })
      }
    },
    closeTask(row) {
      this.taskList = this.taskList.filter(
        i => i.testTaskCode !== row.testTaskCode,
      )
    },
    closeProject(row) {
      this.projectList = this.projectList.filter(i => i.id !== row.id)
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.van-tag--default) {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #e2e2e2;
}
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-size: 14px;
  color: #0066ec;
}
.switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #0066ec;
}
.audit-status {
  > div {
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #fff;
    background-color: #154bd0;
    font-size: 16px;
  }
}
.device-list {
  background-color: #fff;
  padding: 12px 16px;
  .device-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-radius: 9px;
    background: #ffffff;
    box-shadow: 0px 0px 10px 0px rgba(0, 102, 236, 0.06);
    margin-bottom: 8px;

    .l {
      flex: 1;

      .code {
        color: #666;
      }

      .label {
        color: #666;
      }
    }

    .r {
      color: #fe6550;
      padding: 20px;
    }
  }
}
.fixed-btn-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 20px;
  background-color: #fff;
}
</style>
