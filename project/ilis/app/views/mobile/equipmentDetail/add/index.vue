<template>
  <div class="equipmentOutgo-detail equipmentOutgo-addDetail">
    <div>
      <div
        style="
          font-size: 14px;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: solid 1px #e2e2e2;
        "
      >
        {{ equipmentVoData.name }}
        <span class="equipmentOutgo-detail-tag">库存</span>
        <p class="text-xs">
          {{ equipmentVoData.equipmentSn }}
        </p>
      </div>
      <div>
        <div v-for="(item, index) in equipmentVo" :key="index">
          {{ item.name }}：{{ equipmentVoData[item.field] }}
        </div>
      </div>

      <div class="equipmentOutgo-dispose" style="padding: 0">
        <a-form :model="formState">
          <a-form-item
            label="借取人"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col v-if="person.name" :span="18" style="font-size: 12px">
                {{
                  person.name
                }}
              </a-col>
              <a-col v-else :span="18" style="font-size: 12px; color: #999">
                请选择借取人
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  style="margin-top: 0"
                  @click="
                    () => {
                      $refs.SelectPerson.showDrawer()
                    }
                  "
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="外出前状态"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-select
              v-if="statusData && statusData.length > 0"
              v-model="formState.beforeStatus"
              placeholder="请选择"
            >
              <a-select-option
                v-for="(item, index) in statusData"
                :key="index"
                :value="item.typecode"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="关联任务"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-flex gap="8">
              <a-textarea v-model:value="formState.testTaskSn" placeholder="请选择关联任务" disabled :auto-size="{ minRows: 1, maxRows: 6 }" :rows="1" />
              <a-button
                v-if="!!formState.testTaskSn"
                @click="() => {
                  formState.testTaskSn = ''
                  formState.projectName = ''
                  formState.qualificationType = []
                }"
              >
                清空
              </a-button>
              <a-button @click="$refs.SelectTask.showDrawer()">
                选择
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item
            label="工程项目"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-flex gap="8">
              <a-textarea v-model:value="formState.projectName" placeholder="请选择工程项目或输入（多个用逗号分隔）" :disabled="!!formState.testTaskSn" :auto-size="{ minRows: 1, maxRows: 6 }" :rows="1" />
              <a-button v-if="!formState.testTaskSn" @click="$refs.SelectProject.showDrawer()">
                选择
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item
            v-if="EQ_ENGINEERING_FIELD"
            label="资质类型"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-select
              v-model:value="formState.qualificationType"
              :options="formState.testTaskSn ? allQualificationData : qualificationTypeData"
              :field-names="{ label: 'name', value: 'id' }"
              placeholder="请选择资质类型"
              mode="multiple"
              :disabled="!!formState.testTaskSn"
              allow-clear
            >
            </a-select>
          </a-form-item>
          <a-form-item
            label="外出时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="formState.egressTime"
              readonly
              placeholder="请选择外出时间"
              @click="egressTimeOpen = true"
            />
          </a-form-item>
          <a-form-item
            label="预还时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input
              v-model:value="formState.expectReturnTime"
              readonly
              placeholder="请选择预还时间"
              @click="expectReturnTimeOpen = true"
            />
          </a-form-item>
          <a-form-item
            label="备注"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-textarea
              id="remark"
              v-model:value="remark"
              :rows="3"
              :max-length="500"
              placeholder="请输入备注内容"
            />
          </a-form-item>
          <a-form-item
            label="附件上传"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <!-- <a-upload
              :multiple="true"
              list-type="picture"
              :file-list="fileList"
              :action="uploadUrl"
              @change="handleChange"
            >
              <a-button style="margin-top: 0px">
                <UploadOutlined />上传附件
              </a-button>
            </a-upload> -->
            <AttachmentHandler
              ref="attachmentHandlerRef"
              business-type="EQ_EGRESS"
            ></AttachmentHandler>
          </a-form-item>
        </a-form>
      </div>
    </div>

    <div class="mt-4">
      <a-button block type="primary" :loading="submitLoading" @click="handleOk()">
        完成
      </a-button>
      <a-button class="mt-2" block @click="routeBack">
        取消
      </a-button>
    </div>

    <SelectPerson
      ref="SelectPerson"
      :callback="getPerson"
      :get-data-cb="getPersonData"
    />
    <SelectTask ref="SelectTask" :callback="getTask" />
    <SelectProject ref="SelectProject" :callback="getProject" />

    <DateSelector v-model:open="egressTimeOpen" enable-time @select="(val) => { formState.egressTime = val }" />

    <DateSelector v-model:open="expectReturnTimeOpen" enable-time @select="(val) => { formState.expectReturnTime = val }" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { getQueryVariable } from '~/providers-moblie/common/utils'
import DateSelector from '~/providers-moblie/components/DateSelector.vue'
import { usePermissionStore } from '~/store/permissionStore'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import AttachmentHandler from '~/views/mobile/components/AttachmentHandler.vue'
import SelectPerson from '../dispose/components/selectPerson.vue'
import SelectProject from './components/selectProject.vue'
import SelectTask from './components/selectTask.vue'

export default {
  components: {
    SelectPerson,
    SelectTask,
    SelectProject,
    DateSelector,
    AttachmentHandler,
  },
  data() {
    return {
      /** 系统控制参数：控制表单中资质类型显示 */
      EQ_ENGINEERING_FIELD: false,
      qualificationTypeData: [],
      allQualificationData: [],
      visible: false,
      formLayout: 'horizontal',
      statusData: [],
      person: {},
      equipmentVoData: {},
      equipmentVo: [
        // { name:"设备名称", field:"name" },
        { name: '档案编号', field: 'archiveSn' },
        { name: '资产编号', field: 'assetSn' },
        { name: '设备状态', field: 'status' },
        { name: '规格型号', field: 'standard' },
        { name: '量程', field: 'eqRange' },
        { name: '精度', field: 'accuracy' },
        { name: '下次检校日期', field: 'nextCheckDate' },
        { name: '存放位置', field: 'storageSite' },
      ],
      id: getQueryVariable('id'),
      remark: '',
      unitCode: this.$route.params.unitCode,
      formState: {
        beforeStatus: '1',
        testTaskSn: '',
        projectName: '',
      },
      egressTimeOpen: false,
      expectReturnTimeOpen: false,
      submitLoading: false,
    }
  },
  async created() {
    try {
      await Promise.all([
        this.getqualificationTypeData(),
        this.getqualificationTypeDataAll(),
      ])
    }
    catch (error) {
      console.error(error)
    }
    const { hasPermission } = usePermissionStore()
    // 外出操作，单独设置 url，进入到 add.vue，需单独处理无权限跳转
    const isAuth = hasPermission('mobile_equipmentEgress')
    if (!isAuth) {
      message.warning('您没有该操作的权限！')
      this.$router.push({
        name: 'detail',
      })
      return
    }
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
      this.person = { id: userInfo.userId, name: userInfo.realName }
    }
    this.getStatus()
    this.EQ_ENGINEERING_FIELD = await getBusinessParam('EQ_ENGINEERING_FIELD')
  },
  methods: {

    async getqualificationTypeData() {
      await mAjax({
        method: 'GET',
        url: `common-body/qualification/pagination`,
        params: {
          size: 999,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        this.qualificationTypeData = res.rows || []
      })
    },
    async getqualificationTypeDataAll() {
      await mAjax({
        method: 'GET',
        url: `common-body/qualification/pagination`,
        params: {
          size: 999,
          isDeleted: 1,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        this.allQualificationData = res.rows || []
      })
    },
    getStatus() {
      mAjax({
        method: 'POST',
        url: `${mApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
          this.getData()
        }
      })
    },
    getData() {
      mAjax({
        method: 'GET',
        url: `${mApi.eqEgressList.getDetailById}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.equipmentVoData = res.data
        }
      })
    },
    showModal() {
      this.visible = true
    },
    routeBack() {
      if (this.$route.params.isLogin == 1) {
        const url = top.location.href.split(top.location.hash)
        if (url.length) {
          top.location.replace(url[0])
        }
        else {
          this.$router.go(-1)
        }
      }
      else {
        this.$router.go(-1)
      }
    },
    handleOk() {
      const data = {
        ...this.formState,
        projectName: this.handleProjectName((this.formState.projectName || '').replace(/，/g, ',')),
      }
      data.remark = this.remark
      data.equipmentId = this.equipmentVoData.id
      data.equipmentName = this.equipmentVoData.name
      data.assetSn = this.equipmentVoData.assetSn
      data.qrKey = this.$refs.attachmentHandlerRef.qrKey
      data.borrowUser = this.person.name
      data.borrowUserId = this.person.id
      if (Array.isArray(data.qualificationType) && data.qualificationType.length) {
        data.qualificationType = data.qualificationType.join(',')
      }
      else {
        data.qualificationType = ''
      }

      if (!data.projectName) {
        if (this.unitCode === 'hxcd') {
          message.error('请关联工程项目')
          return
        }
      }

      this.submitLoading = true
      mAjax({
        method: 'POST',
        url: mApi.eqEgressList.add,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          message.success('操作成功')
          this.formState = {
            beforeStatus: '1',
          }
          this.equipmentVoData = {}
          // this.person= {}
          this.visible = false
          this.remark = ''
          this.routeBack()
        }
        else {
          message.error(res.message || res.msg)
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    getPersonData(data) {
      const userId = localStorage.getItem('userId')
      const person = data.find(item => item.id == userId)
      if (person) {
        this.person = person
      }
    },
    getPerson(data) {
      this.person = data || {}
    },
    getTask(tasks) {
      if (tasks.length === 0) {
        this.formState.testTaskSn = ''
        this.formState.projectName = ''
        return
      }

      const testTaskSnArr = []
      const projectNameArr = []

      tasks.forEach((item) => {
        if (!testTaskSnArr.includes(item.testTaskCode)) {
          testTaskSnArr.push(item.testTaskCode)
        }

        if (!projectNameArr.includes(item.projectName)) {
          projectNameArr.push(item.projectName)
        }
      })

      this.formState.testTaskSn = testTaskSnArr.join(',')
      this.formState.projectName = projectNameArr.join(',')

      const uniqueQualificationIds = Array.from(
        new Set(
          tasks.flatMap((task) => {
            const idStr = task.qualificationTypeId || ''
            return idStr.split(',').map(id => id.trim()).filter(id => id)
          }),
        ),
      )
      this.formState.qualificationType = uniqueQualificationIds
      this.$refs.SelectTask.selectedRows = []
    },
    getProject(datas) {
      if (datas.length === 0) {
        this.formState.projectName = ''
        return
      }

      const pNameArr = this.formState.projectName ? this.formState.projectName.replace(/，/g, ',').split(',') : []
      datas.forEach((item) => {
        if (!pNameArr.includes(item.name)) {
          pNameArr.push(item.name)
        }
      })

      this.formState.projectName = pNameArr.join(',')

      this.$refs.SelectProject.selectedRows = []
    },
    handleProjectName(val) {
      if (val) {
        const arr = val.split(',')
        return Array.from(new Set(arr)).join(',')
      }
      return val
    },
  },
}
</script>

<style lang="less" scoped>
@import '../list/index.less';
</style>
