<template>
  <div class="taskAssignedDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div v-if="!pageRequestError">
      <div class="taskAssignedDetail-baseInfo">
        <div
          class="reportApproval-code"
          style="background: #f2f2f2; border-bottom: 1px solid #e4e4e4"
        >
          <span>{{ testObjects.testSampleDisplayName }}</span>
          <span v-if="testObjects.standard">（{{ testObjects.standard }}）</span>
          <span
            v-if="testObjects.testTaskStatus"
            style="float: right; color: #a7a4a4; font-weight: lighter"
          >{{ testTaskTitle[testObjects.testTaskStatus] }}
          </span>
          <div style="clear: both"></div>
        </div>

        <FormItemInput
          v-model:value="testObjects.testObjectCode"
          label="样品编号"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="testObjects.projectPartAndUse"
          label="工程部位/用途"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="testObjects.testTaskCode"
          label="任务编号"
          v-bind="fieldAttrs"
        />

        <FormItemPerson
          v-for="(item, index) in baseInfo"
          :key="index"
          v-model:value="item.data"
          :label="item.name"
          :readonly="!isVisibleTest"
          :person-data-source="() => getSelectPerson(item.field, item.type)"
          :required="['testPersonIds', 'recheckPersonIds'].includes(item.field)"
          :enable-multiple="!['approverIds'].includes(item.field)"
          @select="() => {
            if (['testPersonIds'].includes(item.field)) {
              checkTestPersonDepartment()
            }
          }"
        />

        <FormItemDate
          v-model:value="testObjects.allocDate"
          label="分配日期"
          required
          :readonly="!isVisibleTest"
        />
      </div>
      <div
        v-if="isVisibleTest"
        class="equipmentSearch-btns taskAssignedDetail-btns"
      >
        <van-row>
          <van-col span="12">
            <van-button block type="primary" square @click="ok">
              确定
            </van-button>
          </van-col>
          <van-col span="12">
            <van-button block square @click="isVisibleTest = false">
              取消
            </van-button>
          </van-col>
        </van-row>
      </div>
      <div v-if="!isVisibleTest" class="taskAssignedDetail-btns">
        <div class="reAssignTask">
          分配有问题?
          <a v-if="testObjects.testTaskStatus === '20'" @click="reAssignTaskFun">重新分配任务</a>
        </div>
      </div>
    </div>
    <div v-else>
      <van-empty :description="pageRequestError" />
    </div>

    <van-dialog
      v-model:show="visible"
      title="请选择组织机构"
      show-cancel-button
      class="login-department"
      @confirm="orgSelect"
    >
      <div class="p-4">
        <van-radio-group v-model="departmentId">
          <van-radio
            v-for="item in department"
            :key="item.departId"
            :name="item.departId"
          >
            {{ item.departName }}
          </van-radio>
        </van-radio-group>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapState } from 'pinia'
import qs from 'qs'
import {
  showDialog,
  showLoadingToast,
  showNotify,
} from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useTaskAssignStore } from '~/views/mobileApp/store/useTaskAssignStore'

export default {
  components: {
    FormItemInput,
    FormItemPerson,
    FormItemDate,
    MobileTitleBar,
  },
  data() {
    return {
      id: undefined,
      consignId: undefined,
      testObjects: { allocDate: dayjs().format(EDateFormatType.YYYY_MM_DD) },
      testTaskTitle: {
        10: '待分配',
        20: '试验检测中',
        30: '复核确认中',
        40: '已提交正式报告',
      },
      sampleIds: '',
      typePerson: '',
      departmentId: '',
      department: [],
      visible: false,
      isVisibleTest: false,
      baseInfo: [
        {
          name: '检测',
          field: 'testPersonIds',
          data: [],
          showType: '0',
          type: '222211',
          selType: 'checkbox',
        },
        {
          name: '记录人',
          field: 'recorderPersonIds',
          data: [],
          showType: '5',
          type: '',
          selType: 'checkbox',
        },
        {
          name: '协助人',
          field: 'assistPersonIds',
          data: [],
          showType: '6',
          type: '222215',
          selType: 'checkbox',
        },
        {
          name: '报告编写',
          field: 'reportPersonIds',
          data: [],
          showType: '2',
          type: '',
          selType: 'checkbox',
        },
        {
          name: '复核',
          field: 'recheckPersonIds',
          data: [],
          showType: '1',
          type: '222213',
          selType: 'checkbox',
        },
        {
          name: '审核',
          field: 'auditPersonIds',
          data: [],
          showType: '3',
          type: '222211',
          selType: 'checkbox',
        },
        {
          name: '批准',
          field: 'approverIds',
          data: [],
          showType: '4',
          type: '222214',
          selType: '',
        },
      ],
      pageRequestError: null,
    }
  },
  computed: {
    fieldAttrs() {
      return {
        labelWidth: '100px',
        readonly: true,
        type: 'textarea',
        rows: 1,
        autosize: true,
      }
    },
    ...mapState(useTaskAssignStore, ['taskAssignData']),
  },
  async created() {
    this.departmentId = this.taskAssignData.departmentId
    this.id = this.taskAssignData.id
    this.consignId = this.taskAssignData.consignId
    this.department.push({
      departId: this.taskAssignData.departmentId,
      departName: this.taskAssignData.department,
    })
    this.isVisibleTest = false
    await this.getDetail()
  },
  methods: {
    // 获取基本信息
    async getDetail() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        api.testManage.assignedDetail,
        qs.stringify({
          testTaskId: this.id,
        }),
      ).finally(() => {
        toast.close()
      })

      if (res) {
        if (res.testTaskPersons && res.testTaskPersons.length > 0) {
          res.testTaskPersons.forEach((item) => {
            const index = this.baseInfo.findIndex(
              itemI => itemI.showType === item.type,
            )
            if (index > -1) {
              this.baseInfo[index].data.push({
                name: item.name,
                id: item.userId,
              })
            }
          })
        }
        this.testObjects = {
          testSampleDisplayName: res.testObjects[0].testSampleDisplayName,
          testTaskStatus: res.status,
          standard: res.testObjects[0].standard,
          testObjectCode: res.testObjects[0].testObjectCode,
          projectPartAndUse: res.testObjects[0].projectPartAndUse,
          testTaskCode: res.testTaskCode,
          allocDate: res.allocDate
            ? formatDate(res.allocDate, 'YYYY-MM-DD')
            : null,
        }
        this.sampleIds = res.testObjects[0].id
      }
      else {
        this.pageRequestError = res.msg || res.message || '数据异常'
      }
    },
    // 重新分配任务
    reAssignTaskFun() {
      this.isVisibleTest = true
    },
    async getSelectPerson(typePerson, type) {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })

      if (typePerson === 'testPersonIds') {
        const res = await mRequest.get(
          'taskAssignedController/getDepartUsers.do',
          {
            params: {
              testObjectIds: this.sampleIds,
              departmentId: '',
            },
          },
        ).finally(() => {
          toast.close()
        })
        return res.data || []
      }

      const res = await mRequest.post(
        'taskAssignedController.do?usersInfo',
        qs.stringify({
          consignId: this.consignId,
          type,
        }),
      ).finally(() => {
        toast.close()
      })

      return res.rows || []
    },
    checkTestPersonDepartment() {
      const data = this.baseInfo[0].data
      const department = []
      const obj = {}

      data.forEach((item) => {
        if (!obj[item.pId]) {
          obj[item.pId] = true
          department.push({ departId: item.pId, departName: item.pName })
        }
      })

      this.department = department
      if (department.length > 1) {
        this.visible = true
      }
      else if (department.length === 1) {
        this.departmentId = department[0].departId
      }
    }, // 选择部门并登录
    async orgSelect() {
      const department = this.department.find(
        item => item.departId === this.departmentId,
      )
      this.department = [...department]
    },
    async ok() {
      let res = {}
      const params = {
        testTaskId: this.id,
        // // 检测人 222211
        // testPersonIds: this.perSonObj.testPersonIds.length > 0 ?
        //   this.perSonObj.testPersonIds.map(item => item.id).toString() : "",
        // // 报告编写  ''
        // reportPersonIds: this.perSonObj.reportPersonIds.length > 0 ?
        //   this.perSonObj.reportPersonIds.map(item => item.id).toString() : "",
        // // 复核 222212
        // recheckPersonIds: this.perSonObj.recheckPersonIds.length > 0 ?
        //   this.perSonObj.recheckPersonIds.map(item => item.id).toString() : "",
        // // 审核 222213
        // auditPersonIds: this.perSonObj.auditPersonIds.length > 0 ?
        //   this.perSonObj.auditPersonIds.map(item => item.id).toString() : "",
        // //记录人 ''
        // recorderPersonIds: this.perSonObj.recorderPersonIds.length > 0 ?
        //   this.perSonObj.recorderPersonIds.map(item => item.id).toString() : "",
        // //  协助人 222215
        // assistPersonIds: this.perSonObj.assistPersonIds.length > 0 ?
        //   this.perSonObj.assistPersonIds.map(item => item.id).toString() : "",
        // // 批准 222214
        // approverIds: this.perSonObj.approverIds.length > 0 ?
        //   this.perSonObj.approverIds.map(item => item.id).toString() : "",
        departmentId: this.department[0].departId,
        department: this.department[0].departName,
        taskAssignDate: this.testObjects.allocDate,
        jspWhereFrom: '',
      }
      for (let i = 0; i < this.baseInfo.length; i++) {
        if (
          this.baseInfo[i].field === 'testPersonIds'
          && this.baseInfo[i].data.length === 0
        ) {
          showNotify({
            type: 'warning',
            message: '请选择检测人员',
          })
          return
        }
        if (
          this.baseInfo[i].field === 'recheckPersonIds'
          && this.baseInfo[i].data.length === 0
        ) {
          showNotify({
            type: 'warning',
            message: '请选择复核人员',
          })
          return
        }
        if (this.baseInfo[i].data.length) {
          params[this.baseInfo[i].field] = this.baseInfo[i].data
            .map(item => item.id)
            .toString()
        }
        else {
          params[this.baseInfo[i].field] = ''
        }
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      res = await mRequest.post(
        api.testManage.reAssignTaskUrl,
        qs.stringify({ ...params }),
      ).finally(() => {
        toast.close()
      })
      if (res.success) {
        showNotify({ type: 'success', message: '操作成功' })
        this.$router.go(-1)
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
:deep(.van-cell--required)::before {
  display: none;
}
:deep(.van-cell--required) .van-field__label span {
  position: relative;
  &::before {
    position: absolute;
    left: -10px;
    color: #ee0a24;
    font-size: 3.733vw;
    content: '*';
  }
}
</style>
