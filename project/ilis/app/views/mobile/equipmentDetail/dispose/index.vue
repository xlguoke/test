<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="equipmentOutgo-dispose equipmentOutgo-detail">
    <div>
      <div>
        <div
          style="
            font-size: 14px;
            padding-bottom: 10px;
            margin-bottom: 10px;
            border-bottom: solid 1px #e2e2e2;
          "
        >
          {{ dataSource.equipmentVo.name }}
          <span v-if="dataSource.equipmentVo.egressStatus" class="equipmentOutgo-detail-tag">
            {{ egressStatusData.find((data) => data.value == dataSource.equipmentVo.egressStatus).name }}
          </span>
          <p class="text-xs">
            {{ dataSource.equipmentVo.equipmentSn }}
          </p>
        </div>
        <div>
          <div v-for="(item, index) in equipmentVo" :key="index">
            {{ item.name }}：{{ dataSource.equipmentVo[item.field] }}
          </div>
        </div>

        <div style="padding-top: 15px">
          <div v-for="(item, index) in filteredBase" :key="index">
            {{ item.name }}：
            <span
              v-if="
                item.field == 'borrowTime'
                  || item.field == 'egressTime'
                  || item.field == 'expectReturnTime'
              "
            >
              {{
                dataSource[item.field]
                  ? formatTime(dataSource[item.field], 'YYYY-MM-DD HH:mm:ss')
                  : ''
              }}
            </span>
            <span v-else-if="item.field == 'beforeStatus'">
              {{
                dataSource[item.field]
                  ? statusData.find(
                    (status) => status.typecode == dataSource[item.field],
                  ).typename
                  : ''
              }}
            </span>
            <span v-else-if="item.field == 'attachments'">
              <!-- <span v-for="(fitem, i) in dataSource[item.field]" :key="i">
                <a
                  style="margin-right: 10px"
                  :href="fitem.realpath"
                  target="_blank"
                  class="text-blue-500"
                >{{ fitem.attachmenttitle }}</a>
              </span> -->
              <AttachmentHandler
                v-if="dataSource.id"
                :business-id="dataSource.id"
                business-type="EQ_EGRESS"
                readonly
              />
            </span>
            <span v-else-if="item.field == 'qualificationType'">
              {{
                getQuaDisplayName(dataSource[item.field])
              }}
            </span>
            <span v-else>{{ dataSource[item.field] }}</span>
          </div>
        </div>

        <div
          v-for="(item, index) in dataSource.operationVos"
          :key="index"
          style="padding-top: 15px"
        >
          <div
            v-for="(item2, index2) in operationVos[item.operationType]"
            :key="index2"
          >
            {{ item2.name }}：
            <span v-if="item2.field == 'operationTime'">
              {{
                item[item2.field]
                  ? formatTime(item[item2.field], 'YYYY-MM-DD HH:mm:ss')
                  : ''
              }}
            </span>
            <span v-else-if="item2.field == 'operationType'">
              {{
                item[item2.field]
                  ? egressStatusData.find(
                    (status) => status.value == item[item2.field],
                  ).name
                  : ''
              }}
            </span>
            <span v-else-if="item2.field == 'equipmentStatus'">
              {{
                item[item2.field]
                  ? statusData.find(
                    (status) => status.typecode == item[item2.field],
                  ).typename
                  : ''
              }}
            </span>
            <span v-else-if="item2.field == 'extensionReturnTime'">
              {{ item.eqEgressExtension && item.eqEgressExtension[item2.field] }}
            </span>
            <span v-else-if="item2.name == '确认结果' || item2.name == '操作' ">{{ item2.field }}</span>
            <span v-else-if="item2.field == 'testTaskSn'">
              {{ item.eqEgressExtension && item.eqEgressExtension[item2.field] }}
            </span>
            <span v-else-if="item2.field == 'project'">
              {{ item.eqEgressExtension && item.eqEgressExtension[item2.field] }}
            </span>
            <span v-else-if="item2.field == 'attachments'">
              <!-- <span v-for="(fitem, i) in item[item2.field]" :key="i">
                <a
                  style="margin-right: 10px"
                  :href="fitem.realpath"
                  target="_blank"
                  class="text-blue-500"
                >{{ fitem.attachmenttitle }}</a>
              </span> -->
              <AttachmentHandler
                :business-id="item.id"
                business-type="EQ_EGRESS"
                readonly
              />
            </span>
            <span v-else>{{ item[item2.field] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="status == '40'">
      <a-form :model="formState">
        <a-form-item
          label="归还时状态"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <select
            v-model="formState.equipmentStatus"
            placeholder="请选择"
          >
            <option
              v-for="(item, index) in statusData"
              :key="index"
              :value="item.typecode"
            >
              {{ item.typename }}
            </option>
          </select>
        </a-form-item>
        <a-form-item
          label="归还人"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-flex align="center">
            <div v-if="person.name" class="flex-1 mr-2 text-xs">
              {{ person.name }}
            </div>
            <div v-else class="flex-1 mr-2 text-xs" style="color: #999">
              请选择归还人
            </div>
            <a-button class="w-[64px]" @click="showDrawer">
              选择
            </a-button>
          </a-flex>
        </a-form-item>
        <a-form-item
          label="归还时间"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-input
            v-model:value="formState.operationTime"
            placeholder="请选择归还时间"
            readonly
            @click="operationTimeOpen = true"
          />
        </a-form-item>
        <a-form-item
          label="备注"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-textarea
            v-model:value="formState.remark"
            :row="4"
            placeholder="请输入备注"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </div>
    <div v-else style="padding-top: 15px">
      <a-textarea
        v-model:value="remark"
        :row="4"
        placeholder="请输入备注"
      ></a-textarea>
    </div>
    <div style="padding-top: 15px">
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
        ref="attachmentHandler"
        :business-id="formState.id"
        business-type="EQ_EGRESS"
      />
    </div>

    <div class="pt-4">
      <a-button block type="primary" :loading="submitLoading" @click="submitData()">
        完成
      </a-button>
      <a-button class="mt-2" block @click="routeBack">
        取消
      </a-button>
    </div>
    <SelectPerson
      ref="SelectPerson"
      :get-data-cb="getPersonData"
      :callback="getPerson"
    />

    <DateSelector v-model:open="operationTimeOpen" enable-time @select="(val) => { formState.operationTime = val }" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime } from '~/providers-moblie/common/utils'
import DateSelector from '~/providers-moblie/components/DateSelector.vue'
import { usePermissionStore } from '~/store/permissionStore'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import AttachmentHandler from '../../components/AttachmentHandler.vue'
import SelectPerson from './components/selectPerson.vue'

export default {
  components: {
    SelectPerson,
    DateSelector,
    AttachmentHandler,
  },
  props: ['callback'],
  data() {
    return {
      /** 系统控制参数：控制资质类型显示 */
      EQ_ENGINEERING_FIELD: false,
      formatTime,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      id: this.$route.params.id,
      status: this.$route.params.status,
      base: [
        { name: '借取日期', field: 'borrowTime' },
        { name: '借取人', field: 'borrowUser' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联工程项目', field: 'projectNames' },
        { name: '资质类型', field: 'qualificationType' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
        { name: '附件资料', field: 'attachments' },
      ],
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
      operationVos: {
        20: [
          { name: '外出确认日期', field: 'operationTime' },
          { name: '确认结果', field: '通过' },
          { name: '外出确认人', field: 'operator' },
          { name: '备注', field: 'remark' },
          { name: '附件资料', field: 'attachments' },
        ],
        40: [
          { name: '归还时间', field: 'operationTime' },
          { name: '归还人', field: 'operator' },
          { name: '归还时设备状态', field: 'equipmentStatus' },
          { name: '备注', field: 'remark' },
          { name: '附件资料', field: 'attachments' },
        ],
        60: [
          { name: '归还确认时间', field: 'operationTime' },
          { name: '确认结果', field: '拒绝' },
          { name: '归还确认人', field: 'operator' },
          { name: '备注', field: 'remark' },
          { name: '附件资料', field: 'attachments' },
        ],
        80: [
          /** "80"  延期 */
          { name: '关联项目', field: 'project' },
          { name: '关联任务', field: 'testTaskSn' },
          { name: '延期申请人', field: 'createName' },
          { name: '延期前状态', field: 'equipmentStatus' },
          { name: '延期归还时间', field: 'extensionReturnTime' },
          { name: '延期申请时间', field: 'operationTime' },
          // { name: '附件材料', field: 'attachments' },
          { name: '操作', field: '延期申请' },
          { name: '备注', field: 'remark' },
        ],
        90: [
          /** "90"  延期确认 */
          { name: '延期确认时间', field: 'operationTime' },
          { name: '延期确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        95: [
          /** "95"  延期拒绝 */
          { name: '延期确认时间', field: 'operationTime' },
          { name: '延期确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
      },
      fields: [
        [
          { name: '外出确认日期', field: 'operationTime' },
          { name: '外出确认人', field: 'operator' },
          { name: '备注', field: 'remark' },
          { name: '附件资料', field: 'attachments' },
        ],
        [
          { name: '归还时间', field: 'operationTime' },
          { name: '归还人', field: 'operator' },
          { name: '归还时设备状态', field: 'equipmentStatus' },
          { name: '附件资料', field: 'attachments' },
        ],
        [
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '备注', field: 'remark' },
          { name: '附件资料', field: 'attachments' },
        ],
      ],
      person: {},
      remark: '',
      statusData: [],
      data: {
        equipmentName: '',
      },
      dataSource: {
        equipmentVo: {},
      },
      egressStatusData: [
        { name: '全部', value: 0 },
        { name: '库存', value: 10 },
        { name: '外出待确认', value: 20 },
        { name: '外出被拒绝', value: 30 },
        { name: '外出', value: 40 },
        { name: '归还待确认', value: 50 },
        { name: '归还被拒绝', value: 60 },
        { name: '外出延期', value: 70 },
        { name: '延期待确认', value: 80 },
        { name: '延期被拒绝', value: 90 },
      ],
      unitCode: '',
      formState: {},
      operationTimeOpen: false,
      submitLoading: false,
      qualificationTypeData: [],
      allQualificationData: [],
    }
  },
  computed: {
    // 根据EQ_ENGINEERING_FIELD的值动态过滤base数组
    filteredBase() {
      if (this.EQ_ENGINEERING_FIELD) {
        return this.base
      }
      else {
        return this.base.filter(item => item.field !== 'qualificationType')
      }
    },
  },
  async created() {
    // 登录后的路由转发
    const { hasPermission } = usePermissionStore()
    let isAuth = false
    if (this.status == 20 || this.status == 30) { // [确认外出，拒绝外出]
      isAuth = hasPermission('mobile_equipmentEgressConfirm')
    }
    else if (this.status == 50 || this.status == 60) { // [确认归还，拒绝归还]
      isAuth = hasPermission('mobile_equipmentReturnConfirm')
    }
    else if (this.status == 40) { // [归还]
      isAuth = hasPermission('mobile_equipmentReturn')
    }
    else if (this.status == 10 || !this.status) { // [外出]
      isAuth = hasPermission('mobile_equipmentReturn')
    }
    else if (this.status == 70) { // [延期]
      isAuth = hasPermission('mobile_equipmentPostpone')
      if (isAuth) {
        this.$router.push({ name: 'postponeEq', params: { id: this.id, status: this.status, isLogin: this.$route.params.isLogin } }) // 独立的延期界面
      }
      return
    }
    else if (this.status == 90) { // [延期确认]
      isAuth = hasPermission('mobile_equipmentDeferredConfirmation')
    }
    else if (this.status == 95) { // [延期拒绝]
      isAuth = hasPermission('mobile_equipmentDeferredReject')
    }
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
    try {
      await Promise.all([
        this.getqualificationTypeData(),
        this.getqualificationTypeDataAll(),
      ])
    }
    catch (error) {
      console.error(error)
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
    getQuaDisplayName(ids) { // id字符串
      if (!ids) {
        return ''
      }
      const idArr = ids.split(',')
      return idArr.map((id) => {
        const qua = this.allQualificationData.find(item => item.id === id)
        return qua ? qua.name : id
      }).join(',')
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
        url: `${mApi.eqEgressList.getEgressInfo}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data.egressVo
          this.unitCode = res.data.unitCode
        }
        else {
          message.error(res.msg)
        }
      })
      this.visible = true
    },
    showModal(record, status) {
      this.data = record
      this.status = status
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.formState = {}
    },
    getPerson(data) {
      this.person = data || {}
    },
    submitData() {
      let data = {
        'operationType': this.status,
        'eqEgress.id': this.dataSource.id,
        'qrKey': this.$refs.attachmentHandler.qrKey,
      }

      if (this.status == '40') {
        data = {
          ...data,
          ...this.formState,
        }
        data.operator = this.person.name
        data.operatorId = this.person.id
        data.operationType = this.status
      }
      else {
        data.remark = this.remark
      }

      let url = ''
      if (this.status == '20' || this.status == '30') {
        url = mApi.eqEgressList.egressConfirm
      }
      else if (this.status == '40') {
        url = mApi.eqEgressList.equipmentReturn
      }
      else if (this.status == '50' || this.status == '60') {
        url = mApi.eqEgressList.returnConfirm
      }
      else if (this.status == '90' || this.status == '95') { // 延期[确认，拒绝]
        url = mApi.eqEgressList.batchOperation // 使用app通用操作接口（设置对应的operationType）
        const data = {}
        data.operationType = this.status
        data.operator = this.person.name
        data.remark = this.remark
        data.operationTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
        data.qrKey = this.$refs.attachmentHandler.qrKey
        const ids = [this.dataSource.id] // 记录id
        this.submitLoading = true
        mAjax({
          method: 'PUT',
          url,
          data: {
            ids,
            operation: data,
          },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }).then((res) => {
          if (res.code && res.code !== 20010) {
            message.success('操作成功')
            this.formState = {}
            this.person = {}
            this.remark = ''
            this.routeBack()
          }
          else {
            message.error(res.message)
          }
        }).finally(() => {
          this.submitLoading = false
        })
        return
      }

      this.submitLoading = true
      mAjax({
        method: 'POST',
        url,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          message.success('操作成功')
          this.formState = {}
          this.person = {}
          this.remark = ''
          this.routeBack()
        }
        else {
          message.error(res.message)
        }
      }).finally(() => {
        this.submitLoading = false
      })
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
    showDrawer() {
      this.$refs.SelectPerson.showDrawer()
    },
    getPersonData(data) {
      const userId = localStorage.getItem('userId')
      const person = data.find(item => item.id === userId)
      if (person) {
        this.person = person
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '../list/index.less';
</style>
