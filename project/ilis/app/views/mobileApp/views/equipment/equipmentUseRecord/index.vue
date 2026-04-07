<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div>
      <div
        v-for="(item, index) in eqDetailList"
        :key="index"
        class="px-4 py-2 font-bold"
      >
        {{ item.name }}({{ item.equipmentSn }})
      </div>
      <van-form ref="form">
        <FormItemDate
          v-model:value="formData.startUseTime"
          label="开始使用时间"
          required
          :rules="[{ required: true, message: '请选择开始时间' }]"
          placeholder="请选择"
          enable-time
          v-bind="formItemAttrs"
        />

        <FormItemSelect
          v-model:value="formData.startUseState"
          label="使用前状态"
          :options="useStateOptions"
          allow-clear
          v-bind="formItemAttrs"
        />

        <FormItemDate
          v-model:value="formData.endUseTime"
          label="结束使用时间"
          placeholder="请选择"
          enable-time
          v-bind="formItemAttrs"
        />

        <FormItemSelect
          v-model:value="formData.endUseState"
          label="使用后状态"
          :options="useStateOptions"
          allow-clear
          v-bind="formItemAttrs"
        />

        <FormItemInput
          v-model:value.trim="formData.testTaskCode"
          autosize
          clearable
          label="检测任务"
          placeholder="请选择或输入"
          v-bind="formItemAttrs"
          @blur="onChangeTestTask"
        >
          <template #button>
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
        </FormItemInput>

        <FormItemInput
          v-if="EQ_ENGINEERING_FIELD"
          v-model:value="qualificationTypeDisplay"
          label="资质类型"
          placeholder="请选择资质类型"
          clearable
          readonly
          autosize
        >
          <template v-if="!isSystemTestTask" #button>
            <van-button
              size="small"
              plain
              hairline
              type="primary"
              native-type="button"
              @click="qualificationVsibile = true"
            >
              选择
            </van-button>
          </template>
        </FormItemInput>

        <FormItemInput
          v-model:value="formData.projectName"
          label="工程项目"
          :readonly="isSystemTestTask"
          placeholder="请输入"
          v-bind="formItemAttrs"
        />

        <FormItemInput
          v-model:value="formData.testObjectCode"
          label="样品编号"
          :readonly="isSystemTestTask"
          placeholder="请输入"
          v-bind="formItemAttrs"
        />

        <van-field
          v-if="isSystemTestTask"
          v-model="formData.testTaskParamName"
          readonly
          autosize
          label="检测参数"
          placeholder="请选择"
          required
          :rules="[{ required: true, message: '请选择检测参数' }]"
          v-bind="formItemAttrs"
        >
          <template #button>
            <van-button
              size="small"
              plain
              hairline
              type="primary"
              native-type="button"
              @click="openSelectParam"
            >
              选择
            </van-button>
          </template>
        </van-field>

        <FormItemInput
          v-else
          v-model:value="formData.testTaskParamName"
          label="检测参数"
          placeholder="请输入"
          v-bind="formItemAttrs"
        />

        <van-field
          v-if="EQUIPMENT_USE_RECORD_USER && formData.testTaskId"
          v-model="formData.userName"
          required
          :rules="[{ required: true, message: '请选择使用人' }]"
          rows="1"
          autosize
          readonly
          label="使用人"
          v-bind="formItemAttrs"
        >
          <template #button>
            <van-button
              size="small"
              plain
              hairline
              type="primary"
              native-type="button"
              @click="openSelectPerson"
            >
              选择
            </van-button>
          </template>
        </van-field>

        <FormItemInput
          v-else
          v-model:value="formData.userName"
          label="使用人"
          placeholder="请输入"
          required
          :rules="[{ required: true, message: '请输入使用人' }]"
          v-bind="formItemAttrs"
        />

        <FormItemInput
          v-model:value="formData.usePlace"
          label="使用地点"
          placeholder="请输入"
          v-bind="formItemAttrs"
        />

        <FormItemInput
          v-model:value="formData.remark"
          label="备注"
          placeholder="请输入"
          type="textarea"
          autosize
          :maxlength="500"
          v-bind="formItemAttrs"
        />
      </van-form>
    </div>

    <ActionBar>
      <van-button
        block
        square
        @click="
          () => {
            $router.go(-1)
          }
        "
      >
        取消
      </van-button>
      <van-button block type="primary" square @click="submit">
        确定
      </van-button>
    </ActionBar>

    <!-- 选择检测任务 -->
    <MobileTestTaskSelector
      v-model:open="testTaskVsibile"
      @select="getTestTask"
    />

    <SelectQua
      v-model:value="qualificationVsibile" :is-multiple="true"
      :init-selected="selectedQualification"
      @selected-ok="getQualification"
    />

    <SelectPerson
      v-model:value="selectPersonVsibile"
      :test-task-id="formData.testTaskId"
      :equipment-ids="ids"
      @selected-ok="getPerson"
    />

    <!-- 选择检测参数 -->
    <MobileStaticListSelector
      v-model:open="paramVisible"
      title="选择检测参数"
      :data-source="getTaskParamData"
      @select="getTestParam"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import { showDialog, showLoadingToast, showNotify } from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileStaticListSelector from '~/views/mobileApp/components/MobileSelector/MobileStaticListSelector.vue'
import MobileTestTaskSelector from '~/views/mobileApp/components/MobileSelector/MobileTestTaskSelector.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import SelectQua from '~/views/mobileApp/components/selectQualification.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import SelectPerson from './components/selectPerson.vue'

export default {
  components: {
    SelectPerson,
    MobileTitleBar,
    FormItemDate,
    FormItemInput,
    FormItemSelect,
    MobileTestTaskSelector,
    MobileStaticListSelector,
    SelectQua,
    ActionBar,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true && to.name === 'equipmentDetail') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.reloadUseRcord = true
    }
    next()
  },
  data() {
    return {
      isMultiple: true,
      type: this.$route.query.type,
      ids: '',
      storage: '',
      data: this.$route.query.data || undefined,
      useid: this.$route.query.useid || undefined,
      formData: {
        startUseTime: '',
        endUseTime: '',
        userName: '',
        userId: null,
        usePlace: '',
        remark: '',
        testTaskCode: '',
        testTaskId: '',
        testObjectCode: '',
        projectName: '',
        testTaskParamId: '',
        testTaskParamName: '',
        startUseState: '',
        endUseState: '',
      },
      equipmentIds: '',
      testTaskVsibile: false,
      selectPersonVsibile: false,
      paramVisible: false,
      eqDetailList: [],
      isSubmit: false,
      EQUIPMENT_USE_RECORD_USER: null,
      formItemAttrs: {
        labelWidth: '120px',
        inputAlign: 'right',
      },
      qualificationVsibile: false,
      /** 业务控制参数：控制表单属性-资质类型是否显示 */
      EQ_ENGINEERING_FIELD: false,
      allQualificationData: [],
      selectedQualification: [],
      TASK_PERFORMANCE_MODE: null,
      isSystemTestTask: false,
      selectUserList: [],
      useStateOptions: [
        { name: '正常', value: '正常' },
        { name: '不正常', value: '不正常' },
      ],
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
    userName() {
      return this.userInfo.username
    },
    qualificationTypeDisplay() {
      return this.selectedQualification.map(i => i.name).join(',')
    },
  },
  async created() {
    await this.getqualificationTypeDataAll()
    await this.getSysParamEQSign()

    const parms = this.$route.query
    // 判断如果为新增 设备使用登记的情况，默认添加当前登录人员为使用人
    if (parms.id && !('useid' in parms)) {
      this.formData.userName = this.realName || ''
    }

    this.init()
  },
  unmounted() {
    sessionStorage.removeItem('paramsEq')
  },
  methods: {
    init() {
      // type：2 代表编辑状态  3：缓存取值
      this.storage = JSON.parse(sessionStorage.getItem('paramsEq'))
      if (this.storage && Number(this.storage.type) === 2) {
        const selEqList = this.storage.selEqList
        this.setFormData(selEqList[0])

        const eqId = selEqList.map((item) => {
          return item.equipmentId
        })
        this.ids = eqId.join(',')
      }
      else if (this.storage && Number(this.storage.type) === 3) {
        const a = localStorage.getItem('equipmentStore')
        let storeEq = ''
        if (a && a !== 'undefined') {
          storeEq = JSON.parse(localStorage.getItem('equipmentStore'))
        }

        this.isMultiple = storeEq.equipmentIds.length > 1
        this.setFormData(storeEq)
        this.ids = storeEq.equipmentIds.join(',')
      }
      else {
        this.isMultiple = !!this.$route.query.id.includes(',')
        this.ids = this.$route.query.id
      }

      this.getDetailData()
      sessionStorage.removeItem('paramsEq')
    },
    // 设置表单数据（回显）
    setFormData(data) {
      this.formData.startUseTime = data.startUseTime
      this.formData.endUseTime = data.endUseTime
      this.formData.startUseState = data.startUseState
      this.formData.endUseState = data.endUseState
      if (!this.EQUIPMENT_USE_RECORD_USER || (this.EQUIPMENT_USE_RECORD_USER && !data.testTaskId)) {
        this.formData.userName = data.userName
      }
      this.formData.usePlace = data.usePlace
      this.formData.remark = data.remark
      this.formData.testTaskId = data.testTaskId || ''
      this.formData.oTestTaskId = data.testTaskId || ''
      this.formData.testTaskCode = data.testTaskCode
      this.formData.projectName = data.projectName
      this.formData.testObjectCode = data.testObjectCode
      this.formData.testTaskParamId = data.taskParamId || ''
      this.formData.oTestTaskParamId = data.taskParamId || ''
      this.formData.testTaskParamName = data.testParamDisplayName
      const quaIdArr = data.qualificationType ? data.qualificationType.split(',') : []
      this.getQualification(quaIdArr)
      this.isSystemTestTask = !!data.testTaskId
    },
    // 设置是否为系统测试任务
    setIsSystemTestTask(val) {
      if (val === false) {
        this.formData.testTaskId = ''
        this.formData.testObjectCode = ''
        this.formData.projectName = ''
        this.formData.testTaskParamId = ''
        this.formData.testTaskParamName = ''
        if (this.EQUIPMENT_USE_RECORD_USER) {
          this.formData.userId = null
          this.formData.userName = ''
        }
        this.getQualification([])
      }

      this.isSystemTestTask = val
    },
    // 手动输入检测编号
    async onChangeTestTask() {
      if (!this.formData.testTaskCode) {
        this.setIsSystemTestTask(false)
        return
      }

      const loading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const { rows } = await mRequest.post(
        'testTaskController.do?datagrid',
        qs.stringify({
          page: 1,
          rows: 999,
          quickQryParam: this.formData.testTaskCode,
        }),
        {
          params: {
            type: 1,
            queryScope: 'user',
            dataType: 1,
          },
        },
      ).finally(() => {
        loading.close()
      })

      if (rows && rows.length > 0) {
        const item = rows.find(i => i.testTaskCode === this.formData.testTaskCode)
        if (item) {
          this.getTestTask([item], () => {
            this.formData.testTaskCode = ''
          })
          return
        }
      }

      this.setIsSystemTestTask(false)
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
    async getTaskParamData() {
      const res = await mRequest.post(
        api.common.getTestTaskParams,
        qs.stringify({
          testTaskId: this.formData.testTaskId,
        }),
      )

      return (res.obj || []).map(item => ({
        ...item,
        label: item.displayName,
        value: item.id,
      }))
    },
    async getSysParamEQSign() {
      if (this.EQUIPMENT_USE_RECORD_USER !== null) {
        return
      }

      const res = await mRequest.get(
        '/tSBusinessParamController.do?getBusinessParam',
        {
          params: {
            key: 'EQUIPMENT_USE_RECORD_USER',
          },
        },
      )
      this.EQUIPMENT_USE_RECORD_USER = res.obj === 'Y'

      const res1 = await mRequest.get('/tSBusinessParamController.do?getBusinessParam', {
        params: {
          key: 'EQ_ENGINEERING_FIELD',
        },
      })
      this.EQ_ENGINEERING_FIELD = res1.obj === 'Y'
    },
    async getDetailData() {
      const res = await mRequest.get(api.equipment.moreDetail, {
        params: {
          ids: this.ids,
        },
      })
      this.eqDetailList = res.data
      this.equipmentIds
        = this.eqDetailList && this.eqDetailList.length > 0
          ? res.data
              .map((eq) => {
                return eq.id
              })
              .join(',')
          : this.ids
    },
    checkTestTask() {
      return new Promise((resolve) => {
        if (
          this.storage
          && ['2', '3'].includes(this.storage.type)
          && (this.formData.oTestTaskId !== this.formData.testTaskId || this.formData.oTestTaskParamId !== this.formData.testTaskParamId)
        ) {
          showConfirmDialog({
            title: '您正在编辑设备使用记录！',
            message: '试验任务或检测参数发生变化，将同步删除关联任务中对应参数的设备使用数据，您确定吗？',
          }).then(() => {
            resolve(true)
          }).catch(() => {
            resolve(false)
          })
        }
        else {
          resolve(true)
        }
      })
    },
    // 保存操作
    async submit() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      if (!await this.checkTestTask()) {
        return
      }

      const data = {
        startUseTime: this.formData.startUseTime,
        endUseTime: this.formData.endUseTime,
        startUseState: this.formData.startUseState,
        endUseState: this.formData.endUseState,
        userName: this.formData.userName,
        userId: this.formData.userId,
        usePlace: this.formData.usePlace,
        remark: this.formData.remark,
        testTaskId: this.formData.testTaskId,
        testTaskCode: this.formData.testTaskCode,
        testObjectCode: this.formData.testObjectCode,
        projectName: this.formData.projectName,
        testTaskParamId: this.formData.testTaskParamId,
        testTaskParamName: this.formData.testTaskParamName,
        qualificationType: this.formData.qualificationType,
      }
      // 如果是更新操作id为设备记录id
      let method
      if (this.storage && Number(this.storage.type) === 2) {
        const recordIds = this.storage.selEqList.map((item) => {
          return item.id
        })
        data.ids = recordIds
        method = 'put'
      }
      else if (this.storage && Number(this.storage.type) === 3) {
        const storeEq = JSON.parse(localStorage.getItem('equipmentStore'))
        data.ids = storeEq.ids
        method = 'put'
      }
      else {
        data.equipmentIds = this.ids.split(',')
        method = 'post'
      }
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest({
        url: api.equipment.eqSaveUse,
        headers: { 'Content-Type': ' application/json' },
        method,
        data,
      }).finally(() => {
        toast.close()
      })

      if (res.code === 20000) {
        showNotify({ type: 'success', message: '操作成功' })
        this.isSubmit = true
        this.$router.go(-1)

        let judge = true
        for (const key in data) {
          if (
            key === 'userId'
            && (
              !this.EQUIPMENT_USE_RECORD_USER
              || (this.EQUIPMENT_USE_RECORD_USER && !data.testTaskId)
            )
          ) {
            continue
          }
          if (['testTaskId', 'testTaskParamId'].includes(key)) {
            continue
          }

          if (!data[key]) {
            const eqData = { ...res.data }
            eqData.testTaskCode = this.formData.testTaskCode
            eqData.testParamDisplayName = this.formData.testTaskParamName
            localStorage.setItem('equipmentStore', JSON.stringify(eqData))
            judge = false
            return
          }
        }
        if (judge && Number(this.storage.type) === 3) {
          localStorage.removeItem('equipmentStore')
        }
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
    openSelectPerson() {
      if (!this.formData.testTaskId) {
        showDialog({ message: '请先选择检测任务' })
        return
      }

      this.selectPersonVsibile = true
    },
    openSelectParam() {
      if (!this.formData.testTaskId) {
        showDialog({ message: '请先选择检测任务' })
        return
      }
      this.paramVisible = true
    },
    async getTestTaskDetail(id) {
      const loading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.get('testTaskController.do?getTestTaskDetail', {
        params: {
          id,
        },
      }).finally(() => {
        loading.close()
      })
      return res
    },
    async getTestTask(data, authErrorCb) {
      const row = data[0]
      const testTaskDetail = await this.getTestTaskDetail(row.id)
      const qualificationTypeId = testTaskDetail.consignInfo.qualificationTypeId
      const testTaskPersons = testTaskDetail.testTaskPersons.filter(i => i.type === '0')

      if (!await this.checkEqAuthUser(testTaskPersons)) {
        if (authErrorCb) {
          authErrorCb()
        }
        return
      }

      this.setIsSystemTestTask(true)

      this.formData.projectName = row.projectNames
      this.formData.testTaskId = row.id
      this.formData.testTaskCode = row.testTaskCode
      this.formData.testObjectCode = row.testObjectCode
      this.formData.testTaskParamName = ''
      this.formData.testTaskParamId = ''

      if (this.EQUIPMENT_USE_RECORD_USER) {
        this.formData.userId = null
        this.formData.userName = null
      }

      this.getQualification(qualificationTypeId ? [qualificationTypeId] : [])
    },
    // 根据资质id数组，转换为文本或id字符串
    getQualification(data) {
      if (!Array.isArray(data) && !data.length) {
        this.selectedQualification = []
        this.formData.qualificationType = ''
        return
      }

      this.selectedQualification = this.allQualificationData.filter(i => data.includes(i.id)).map(i => ({
        id: i.id,
        name: i.name,
      }))
      this.formData.qualificationType = Array.from(new Set(data)).join(',')
    },
    getPerson(data) {
      const userIds = []
      const userNames = []

      data.forEach((i) => {
        if (!userIds.includes(i.userId)) {
          userIds.push(i.userId)
          userNames.push(i.name)
        }
      })

      this.formData.userId = userIds.join(',') || null
      this.formData.userName = userNames.join(',') || null
    },
    getTestParam(rows) {
      const data = rows[0]
      this.formData.testTaskParamName = data.displayName
      this.formData.testTaskParamId = data.taskParamId
    },
    // 检查设备授权人员
    async checkEqAuthUser(testPerson) {
      if (!this.EQUIPMENT_USE_RECORD_USER) {
        return true
      }

      const loading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest.get(`rest/eq/auth/sys/user?ids=${this.ids}`).finally(() => {
        loading.close()
      })

      const data = res.data

      if (!data.auth) {
        return true
      }

      const authTestUser = testPerson.filter((i) => {
        return (data.authUserList || []).includes(i.userId)
      })

      if (authTestUser.length === 0) {
        showDialog({
          title: '添加检测任务失败',
          message: `当前任务检测人员没有设备操作授权，请联系部门管理员完成授权后再尝试！`,
        })
        return false
      }

      return true
    },
  },
}
</script>
