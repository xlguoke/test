<template>
  <div class="reportApproval">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div>
      <div
        class="reportApproval-code"
        style="background: #f2f2f2; border-bottom: 1px solid #e4e4e4"
      >
        {{ detailObj && detailObj.testSampleDisplayName }}
        <span v-if="detailObj.standard">{{ detailObj.standard }}</span>
      </div>

      <FormItemInput
        :value="detailObj.consignCode"
        rows="1"
        autosize
        label="委托编号"
        type="textarea"
        disabled
        v-bind="fieldAttrs"
      />

      <FormItemInput
        :value="detailObj.testObjectCode"
        rows="1"
        autosize
        :label="term('样品编号')"
        type="textarea"
        disabled
        v-bind="fieldAttrs"
      />

      <FormItemInput
        v-if="enableProjectPartAndUse"
        :value="detailObj.projectPartAndUse"
        label-width="5.4em"
        rows="1"
        autosize
        label="工程部位/用途"
        type="textarea"
        disabled
        v-bind="fieldAttrs"
      />

      <FormItemPerson
        v-model:value="perSonObj.testPersonIds"
        label="检测"
        required
        placeholder="请选择"
        enable-multiple
        :person-data-source="() => getSelectPerson('testPersonIds', '222211')"
        v-bind="fieldAttrs"
        @select="checkTestPersonDepartment"
      />

      <FormItemPerson
        v-model:value="perSonObj.recorderPersonIds"
        label="记录人"
        placeholder="请选择"
        enable-multiple
        :person-data-source="() => getSelectPerson('recorderPersonIds', '')"
        v-bind="fieldAttrs"
      />

      <FormItemPerson
        v-model:value="perSonObj.assistPersonIds"
        label="协助人"
        placeholder="请选择"
        enable-multiple
        :person-data-source="() => getSelectPerson('assistPersonIds', '222215')"
        v-bind="fieldAttrs"
      />

      <FormItemPerson
        v-model:value="perSonObj.reportPersonIds"
        label="报告编写"
        placeholder="请选择"
        enable-multiple
        :person-data-source="() => getSelectPerson('reportPersonIds', '')"
        v-bind="fieldAttrs"
      />

      <FormItemPerson
        v-model:value="perSonObj.recheckPersonIds"
        label="复核"
        placeholder="请选择"
        required
        enable-multiple
        :person-data-source="() => getSelectPerson('recheckPersonIds', '222212')"
        v-bind="fieldAttrs"
      />

      <FormItemPerson
        v-model:value="perSonObj.auditPersonIds"
        label="审核"
        placeholder="请选择"
        enable-multiple
        :person-data-source="() => getSelectPerson('auditPersonIds', '222213')"
        v-bind="fieldAttrs"
      />

      <FormItemPerson
        v-model:value="perSonObj.approverIds"
        label="批准"
        placeholder="请选择"
        :person-data-source="() => getSelectPerson('approverIds', '222214')"
        v-bind="fieldAttrs"
      />

      <FormItemDate
        v-model:value="taskAssignDate"
        label="分配日期"
        required
        placeholder="请选择"
        v-bind="fieldAttrs"
      />
    </div>

    <div class="reportApproval-btns">
      <van-row>
        <van-col span="12">
          <van-button block type="primary" square @click="ok">
            确定
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button block square @click="onCancel">
            取消
          </van-button>
        </van-col>
      </van-row>
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
  showLoadingToast,
  showNotify,
} from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { useAppIndustryHooks } from '~/views/mobileApp/hooks/useAppIndustryHooks'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useTaskAssignStore } from '~/views/mobileApp/store/useTaskAssignStore'

export default {
  components: {
    MobileTitleBar,
    FormItemInput,
    FormItemDate,
    FormItemPerson,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true) {
      if (this.isSetRoute === true) {
        next()
      }
      else {
        const toPageState = useAppPageStateStore().getPage(to.name)

        toPageState.resetPage = true
        const routerObj = { name: to.name, params: { ...to.params } }
        if (to.name === 'reportDetail') {
          toPageState.isSubmit = true
        }
        this.isSetRoute = true
        this.$router.replace(routerObj)
      }
    }
    else {
      next()
    }
  },
  setup() {
    const { term, getIndustryField } = useAppIndustryHooks()

    return { term, getIndustryField }
  },
  data() {
    return {
      id: this.$route.params.id || '',
      sampleIds: '',
      departmentId: '',
      consignId: '',
      comment: '',
      taskAssignDate: dayjs().format(EDateFormatType.YYYY_MM_DD),
      isSubmit: false,
      isSetRoute: false,
      approvalData: {},
      perSonObj: {
        testPersonIds: [],
        reportPersonIds: [],
        recheckPersonIds: [],
        auditPersonIds: [],
        approverIds: [],
        recorderPersonIds: [],
        assistPersonIds: [],
      },
      submitData: {
        sampleIds: '',
        testPersonIds: '', // 检测人 222211
        reportPersonIds: '', // 报告编写  ''
        recheckPersonIds: '', // 复核 222212
        auditPersonIds: '', // 审核 222213
        recorderPersonIds: '', // 记录人 ''
        assistPersonIds: '', //  协助人 222215
        approverIds: '', // 批准 222214
        // testTaskId: "",
        departmentId: '',
        department: '',
      },
      testTaskId: '',
      url: '',
      personParams: {},
      typePerson: '',
      visible: false,
      department: [],
      detailObj: {},
      submitEnd: false,
      submitComplete: false,
    }
  },
  computed: {
    ...mapState(useTaskAssignStore, ['taskAssignData']),
    fieldAttrs() {
      return {
        labelWidth: '100px',
      }
    },
    enableProjectPartAndUse() {
      const item = this.getIndustryField('projectPartAndUse')
      return item ? item.selected : false
    },
  },
  created() {
    this.sampleIds = this.taskAssignData.sampleIds
    this.departmentId = this.taskAssignData.departmentId
    this.consignId = this.taskAssignData.consignId

    const department = this.taskAssignData.department

    this.department.push({
      departId: this.departmentId,
      departName: department,
    })
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.post(
        api.testManage.getObjectTrees,
        qs.stringify({
          objectIds: this.id,
        }),
      ).finally(() => {
        toast.close()
      })

      this.detailObj = res.obj[0]
      this.taskAssignDate = dayjs(this.detailObj.taskAssignDate || new Date()).format(EDateFormatType.YYYY_MM_DD)

      // 获取基本信息
      const resInfo = await mRequest.post(
        api.testManage.getObjectUrl,
        qs.stringify({
          testObjectId: this.id,
        }),
      )
      if (resInfo && resInfo.success) {
        const newObj = resInfo.obj.length > 0 ? resInfo.obj[0] : {}
        this.testTaskId = newObj.testTaskId ? newObj.testTaskId : ''
        if (newObj.approverIds) {
          this.detailDataFun(
            'approverIds',
            newObj.approverIds,
            newObj.approverNames,
          )
        }
        if (newObj.assistPersonIds) {
          this.detailDataFun(
            'assistPersonIds',
            newObj.assistPersonIds,
            newObj.assistPersonNames,
          )
        }
        if (newObj.auditPersonIds) {
          this.detailDataFun(
            'auditPersonIds',
            newObj.auditPersonIds,
            newObj.auditPersonNames,
          )
        }
        if (newObj.recheckPersonIds) {
          this.detailDataFun(
            'recheckPersonIds',
            newObj.recheckPersonIds,
            newObj.recheckPersonNames,
          )
        }
        if (newObj.recorderPersonIds) {
          this.detailDataFun(
            'recorderPersonIds',
            newObj.recorderPersonIds,
            newObj.recorderPersonNames,
          )
        }
        if (newObj.reportPersonIds) {
          this.detailDataFun(
            'reportPersonIds',
            newObj.reportPersonIds,
            newObj.reportPersonNames,
          )
        }
        if (newObj.testPersonIds) {
          this.detailDataFun(
            'testPersonIds',
            newObj.testPersonIds,
            newObj.testPersonNames,
          )
        }
      }
      else {
        // this.pageRequestError = res.msg || res.message || "数据异常";
      }
    },
    detailDataFun(ids, typeIds, typeNames) {
      const nameArr = typeNames.split(',')
      const idArr = typeIds.split(',')
      const newData = []
      for (let i = 0; i < nameArr.length; i++) {
        newData.push({ id: idArr[i], name: nameArr[i] })
      }
      this.perSonObj[ids] = newData
    },
    async ok() {
      if (this.perSonObj.testPersonIds.length === 0) {
        showNotify({
          type: 'warning',
          message: '请选择检测人员',
        })
        return
      }
      if (this.perSonObj.recheckPersonIds.length === 0) {
        showNotify({
          type: 'warning',
          message: '请选择复核人员',
        })
        return
      }
      if (!this.taskAssignDate) {
        showNotify({
          type: 'warning',
          message: '请选择分配日期',
        })
        return
      }

      const params = {
        sampleIds: this.sampleIds,
        // 检测人 222211
        testPersonIds:
            this.perSonObj.testPersonIds.length > 0
              ? this.perSonObj.testPersonIds.map(item => item.id).toString()
              : '',
        // 报告编写  ''
        reportPersonIds:
            this.perSonObj.reportPersonIds.length > 0
              ? this.perSonObj.reportPersonIds.map(item => item.id).toString()
              : '',
        // 复核 222212
        recheckPersonIds:
            this.perSonObj.recheckPersonIds.length > 0
              ? this.perSonObj.recheckPersonIds
                  .map(item => item.id)
                  .toString()
              : '',
        // 审核 222213
        auditPersonIds:
            this.perSonObj.auditPersonIds.length > 0
              ? this.perSonObj.auditPersonIds.map(item => item.id).toString()
              : '',
        // 记录人 ''
        recorderPersonIds:
            this.perSonObj.recorderPersonIds.length > 0
              ? this.perSonObj.recorderPersonIds
                  .map(item => item.id)
                  .toString()
              : '',
        //  协助人 222215
        assistPersonIds:
            this.perSonObj.assistPersonIds.length > 0
              ? this.perSonObj.assistPersonIds.map(item => item.id).toString()
              : '',
        // 批准 222214
        approverIds:
            this.perSonObj.approverIds.length > 0
              ? this.perSonObj.approverIds.map(item => item.id).toString()
              : '',
        testTaskId: this.testTaskId,
        departmentId: this.department[0].departId,
        department: this.department[0].departName,
        taskAssignDate: this.taskAssignDate,
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '数据处理中...',
      })

      this.submitEnd = false
      this.submitComplete = false

      await mRequest
        .post(
          api.testManage.saveObjectUrl,
          qs.stringify({ ...params }),
          {
            headers: {
              Accept: 'text/event-stream',
            },
            onDownloadProgress: (res) => {
              this.sseOnMessage(res.event.target.responseText)
            },
          },
        )
        .finally(() => {
          toast.close()
        })

      this.submitEnd = true
      this.checkComplete()
    },
    /**
     * 说明：为什么要这样判断提交成功
     * 正常情况：发起接口请求后，很快就有了响应，我们只需要关注sse中返回complete为true就表示处理完毕
     * 异常情况：发起接口请求后，接口还没响应（没返回200），sse中先返回了complete为true，此时前端立马返回列表刷新，数据在后端应该还没处理完毕，导致依旧能查询到
     */
    checkComplete() {
      if (this.submitEnd === true && this.submitComplete === true) {
        showNotify({ type: 'success', message: '操作成功' })
        this.isSubmit = true
        this.$router.go(-1)
      }
    },
    parseEventMap(arr) {
      const map = {}
      for (let i = 0; i < arr.length; i++) {
        const d = arr[i]
        if (!d)
          continue
        const ind = d.indexOf(':')
        if (ind !== -1) {
          const key = d.substring(0, ind)
          const value = d.substring(ind + 1)
          map[key] = value
        }
      }
      return map
    },
    parseResData(dataStr) {
      if (!dataStr)
        return {}
      if (typeof dataStr !== 'string')
        return dataStr

      try {
        return JSON.parse(dataStr)
      }
      catch (err) {
        console.error('SSE数据解析错误：', err)
        showDialog({
          title: '提示',
          message: err,
        })
        return {}
      }
    },
    sseOnMessage(res) {
      let events = res ? res.split('\n\n') : []
      events = events.filter(d => !!d)

      if (events.length === 0) {
        return
      }

      const lastItem = events.pop()
      // 通过axios方式存在获取到不完整数据的情况
      if (!lastItem || lastItem === 'data:') {
        return
      }

      const evArr = lastItem.split('\n')
      try {
        const evMap = this.parseEventMap(evArr)

        // 获取进度信息错误
        if (evMap.event === 'error') {
          showDialog({
            title: '提示',
            message: evMap.data,
          })
          return
        }

        const data = this.parseResData(evMap.data)
        if (data.code && data.code !== '20000') {
          console.error('业务错误：', res)
          showDialog({
            title: '提示',
            message: data,
          })
          return
        }

        // 进度执行完成
        if (data.complete) {
          this.submitComplete = true
          this.checkComplete()
        }
      }
      catch (err) {
        console.error('SSE数据解析错误：', err)
      }
    },
    onCancel() {
      this.$router.go(-1)
    },
    async getSelectPerson(typePerson, type) {
      if (typePerson === 'testPersonIds') {
        const res = await mRequest.get(
          'taskAssignedController/getDepartUsers.do',
          {
            params: {
              testObjectIds: this.sampleIds,
              departmentId: '',
            },
          },
        )
        return res.data
      }

      const res = await mRequest.post(
        'taskAssignedController.do?usersInfo',
        qs.stringify({
          consignId: this.consignId,
          type,
        }),
      )

      return res.rows
    },
    checkTestPersonDepartment() {
      const department = []
      const obj = {}

      this.perSonObj.testPersonIds.forEach((item) => {
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
    },
    async orgSelect() {
      const department = this.department.find(
        item => item.departId === this.departmentId,
      )
      this.department = [{ ...department }]
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
