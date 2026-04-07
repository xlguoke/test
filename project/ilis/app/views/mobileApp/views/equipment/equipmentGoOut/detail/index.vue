<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="equipmentOutgo">
    <div class="equipmentOutgo-detail">
      <div>
        <van-sticky>
          <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
          <div
            class="equipmentOutgo-title"
            style="display: flex; justify-content: space-between; align-items: center;"
          >
            <div>
              {{ dataSource.equipmentVo.name }}
              <span
                v-if="!!status"
                class="equipmentOutgo-detail-tag"
                :class="{
                  red: status === '60',
                }"
              >
                {{ status ? egressStatusData.find((data) => data.value === status).name : '' }}
              </span>
              <div style="color: #999; font-weight: 500">
                {{ dataSource.equipmentVo.equipmentSn }}
              </div>
            </div>
            <div style="flex-shrink: 0;">
              <button
                v-if="status === '20'"
                v-permission="'mobile_equipmentEgressEdit'"
                style="
                  background-color: rgb(0, 102, 236);
                  border-radius: 5px;
                  padding: 5px 20px;
                  color: white;
                  border: none;
                  cursor: pointer;
                "
                @click="goEditOutInfo"
              >
                编辑
              </button>
            </div>
          </div>
        </van-sticky>
        <div class="equipmentOutgo-info">
          <div v-for="(item, index) in equipmentVo" :key="index">
            {{ item.name }}：<span
              :class="`${redStatus(item.field)} ${redNextCheckDate(
                item.field,
              )}`"
            >{{ dataSource.equipmentVo[item.field] }}</span>
          </div>
        </div>

        <div v-if="dataSource.id" class="equipmentOutgo-info">
          <div v-for="(item, index) in filteredBase" :key="index">
            {{ item.name }}：
            <span
              v-if="
                item.field === 'borrowTime'
                  || item.field === 'egressTime'
                  || item.field === 'expectReturnTime'
              "
            >
              {{ dataSource[item.field] ? formatDate(dataSource[item.field], 'YYYY-MM-DD HH:mm:ss') : '' }}
            </span>
            <span v-else-if="item.field === 'beforeStatus'">
              {{ dataSource[item.field] ? statusData.find((sItem) => sItem.typecode === dataSource[item.field]).typename : '' }}
            </span>
            <span v-else-if="item.field === 'attachments'">
              <AttachmentHandler
                :business-id="dataSource.id"
                business-type="EQ_EGRESS"
                readonly
              />
            </span>
            <span v-else-if="item.field === 'qualificationType'">
              {{ getQuaDisplayName(dataSource[item.field]) }}
            </span>
            <span v-else>{{ dataSource[item.field] }}</span>
          </div>
        </div>
        <HandOverApply
          v-if="showHandOverApply"
          ref="handOverApplyRef"
          class="mb-[100px]"
          :transition-user="dataSource.borrowUser"
        ></HandOverApply>
        <template v-else>
          <div
            v-for="(item, index) in dataSource.operationVos"
            :key="index"
            class="equipmentOutgo-info"
          >
            <template v-for="(item2) in operationVos[item.operationType]" :key="item2.field">
              <div v-if="!editOutConfirm[index]" class="equipmentOutgo-infoBox">
                {{ item2.name }}：

                <span v-if="item2.field === 'operationTime'">
                  {{ item[item2.field] ? formatDate(item[item2.field], 'YYYY-MM-DD HH:mm:ss') : '' }}
                </span>

                <span v-else-if="item2.field === 'operationType'">
                  {{ item[item2.field] ? egressStatusData.find((sItem) => sItem.value === item[item2.field]).name : '' }}
                </span>

                <span v-else-if="item2.name === '确认结果'">
                  {{ item2.field }}
                </span>

                <span v-else-if="item2.field === 'equipmentStatus'">
                  {{ item[item2.field] ? statusData.find((sItem) => sItem.typecode === item[item2.field]).typename : '' }}
                </span>

                <span v-else-if="item2.field === 'attachments'">
                  <AttachmentHandler
                    :business-id="item.id"
                    business-type="EQ_EGRESS"
                    readonly
                  />
                </span>

                <span v-else-if="item2.name === '确认结果' || item2.name === '操作'" :span="14">
                  {{ item2.field }}
                </span>

                <span v-else-if="item2.field === 'expectReturnTime'" :span="14">
                  {{
                    item.eqEgressExtension && item.eqEgressExtension[item2.field]
                  }}
                </span>

                <span v-else-if="item2.field === 'testTaskSn'" :span="14">
                  {{
                    item.eqEgressExtension && item.eqEgressExtension[item2.field]
                  }}
                </span>

                <span v-else-if="item2.field === 'project'" :span="14">
                  {{
                    item.eqEgressExtension && item.eqEgressExtension[item2.field]
                  }}
                </span>

                <span v-else-if="item2.field === 'extensionReturnTime'" :span="14">
                  {{
                    item.eqEgressExtension && item.eqEgressExtension[item2.field]
                  }}
                </span>

                <span v-else>{{ item[item2.field] }}</span>
              </div>
            </template>
            <div v-if="editOutConfirm[index]">
              <van-form>
                <FormItemPerson
                  v-model:value="editOperationForm.operatorList"
                  label="确认人"
                />

                <FormItemDate
                  v-model:value="editOperationForm.operationTime"
                  label="确认时间"
                />

                <van-field
                  v-model="editOperationForm.remark"
                  label="备注"
                  placeholder="请输入"
                  autosize
                  rows="2"
                  type="textarea"
                ></van-field>
                <van-field name="uploader" label="附件">
                  <template #input>
                    <AttachmentHandler
                      :business-id="editOperationForm.id"
                      business-type="EQ_EGRESS"
                    />
                  </template>
                </van-field>
              </van-form>
            </div>
            <div class="mt-2">
              <van-button
                v-if="item.status === 'editable'"
                v-permission="'mobile_equipmentConfirmEdit'"
                block
                type="primary"
                @click="
                  handleOutConfirm(item, editOutConfirm[index] ? 1 : 0, index)
                "
              >
                {{ editOutConfirm[index] ? '完成' : '编辑确认信息' }}
              </van-button>
              <van-button
                v-if="editOutConfirm[index]"
                block
                style="margin-top: 1vh"
                @click="cancleHandleOutConfirm(index)"
              >
                取消
              </van-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div v-if="!showHandOverApply" class="equipmentOutgo-btns">
      <van-button
        v-if="status === '10'"
        v-permission="'mobile_equipmentEgress'"
        type="primary"
        block
        @click="addEq"
      >
        外出
      </van-button>
      <van-button
        v-if="status === '20'"
        v-permission="'mobile_equipmentEgressConfirm'"
        type="primary"
        block
        @click="egressDispose('20')"
      >
        确认外出
      </van-button>
      <van-button
        v-if="status === '20'"
        v-permission="'mobile_equipmentEgressConfirm'"
        type="primary"
        block
        @click="egressDispose('30')"
      >
        拒绝外出
      </van-button>
      <van-button
        v-if="status === '50'"
        v-permission="'mobile_equipmentReturnConfirm'"
        type="primary"
        block
        @click="egressDispose('50')"
      >
        确认归还
      </van-button>
      <van-button
        v-if="status === '50'"
        v-permission="'mobile_equipmentReturnConfirm'"
        type="primary"
        block
        @click="egressDispose('60')"
      >
        拒绝归还
      </van-button>
      <van-button
        v-if="[EgressStatus.OUTGOING,
               EgressStatus.OUTGOING_DELAY,
               EgressStatus.DELAY_REJECTED,
               EgressStatus.RETURN_REJECTED,
               EgressStatus.TRANSFER_REJECTED,
        ].includes(status) && transitionStatus !== TransitionStatus.SUCCESS"
        v-permission="'mobile_equipmentReturn'"
        type="primary"
        block
        @click="egressDispose('40')"
      >
        归还
      </van-button>
      <van-button
        v-if="[EgressStatus.OUTGOING,
               EgressStatus.OUTGOING_DELAY,
               EgressStatus.DELAY_REJECTED,
               EgressStatus.RETURN_REJECTED,
               EgressStatus.TRANSFER_REJECTED,
        ].includes(status)"
        v-permission="'mobile_equipmentPostpone'"
        type="primary"
        block
        @click="postponeEq()"
      >
        延期
      </van-button>

      <van-button
        v-if="status === '80'"
        v-permission="'mobile_equipmentDeferredConfirmation'"
        type="primary"
        block
        @click="egressDispose('90')"
      >
        确认延期
      </van-button>

      <van-button
        v-if="status === '80'"
        v-permission="'mobile_equipmentDeferredReject'"
        type="primary"
        block
        @click="egressDispose('95')"
      >
        拒绝延期
      </van-button>

      <!-- 转交相关按钮 -->
      <van-button
        v-if="canHandOver"
        v-permission="'mobile_equipmentHandover'"
        type="primary"
        block
        @click="showHandOverApply = true"
      >
        转交
      </van-button>

      <van-button
        v-if="status === '110' && dataSource?.transitionUserId === userInfo?.id"
        v-permission="'mobile_equipmentHandoverConfirm'"
        type="primary"
        block
        @click="egressDispose('110')"
      >
        确认转交
      </van-button>

      <van-button
        v-if="status === '110' && dataSource?.transitionUserId === userInfo?.id"
        v-permission="'mobile_equipmentHandoverReject'"
        type="warning"
        block
        plain
        @click="egressDispose('120')"
      >
        拒绝转交
      </van-button>
    </div>
    <div v-else class="fixed-btn-box">
      <van-button block @click="handleCancel">
        取消
      </van-button>
      <van-button type="primary" block :loading="submitLoading" @click="handleSubmit">
        完成
      </van-button>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { showLoadingToast, showNotify } from 'vant'
import { EgressStatus, TransitionStatus } from '~/views/equipmentNew/egress/eqEgressList/list/OperationEntity'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import HandOverApply from './handOverApply.vue'

export default {
  components: {
    FormItemPerson,
    FormItemDate,
    MobileTitleBar,
    AttachmentHandler,
    HandOverApply,
  },
  beforeRouteEnter(to, from, next) {
    const pageState = useAppPageStateStore().getPage(from.name)

    if (pageState.updateBefore) {
      const toPageState = useAppPageStateStore().getPage(to.name)
      toPageState.resetList = true
      pageState.updateBefore = false
    }
    next()
  },
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem('appUser') || '{}')?.userInfo,
      EgressStatus,
      TransitionStatus,
      /** 控制表单中的资质类型显示 */
      EQ_ENGINEERING_FIELD: false,
      base: [
        { name: '借取日期', field: 'borrowTime' },
        { name: '借用人', field: 'borrowUser' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '工程项目', field: 'projectNames' },
        { name: '资质类型', field: 'qualificationType' },
        { name: '项目编号', field: 'projectCodes' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
        { name: '备注', field: 'remark' },
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
          { name: '归还确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
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
          { name: '附件材料', field: 'attachments' },
          { name: '操作', field: '延期申请' },
          { name: '备注', field: 'remark' },
        ],
        90: [
          /** "80"  延期确认 */
          { name: '延期确认时间', field: 'operationTime' },
          { name: '延期确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        95: [
          /** "80"  延期确认 */
          { name: '延期确认时间', field: 'operationTime' },
          { name: '延期确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
      },
      dataSource: {
        equipmentVo: {},
        operationVos: [],
      },
      formatDate,
      statusData: [],
      id: this.$route.params.id,
      status: '',
      egressStatusData: [
        { name: '全部', value: '0' },
        { name: '在库', value: '10' },
        { name: '外出待确认', value: '20' },
        { name: '在库', value: '30' },
        { name: '外出', value: '40' },
        { name: '归还待确认', value: '50' },
        { name: '外出', value: '60' },
        { name: '外出延期', value: '70' },
        { name: '延期待确认', value: '80' },
        { name: '延期被拒绝', value: '90' },
        { name: '外出转交', value: '100' },
        { name: '转交待确认', value: '110' },
        { name: '转交被拒绝', value: '120' },
      ],
      /** 转交申请状态 */
      transitionStatus: '',
      editOutConfirm: [],
      currentDate: new Date(),
      editOperationForm: {
        id: '', // 操作记录id
        operator: '',
        operatorId: '',
        operationTime: '',
        remark: '',
        attachmentIds: '',
        operatorList: [],
        qrKey: '',
      },
      qualificationTypeData: [],
      showHandOverApply: false,
      submitLoading: false,

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
    /**
     * # 是否可转交
     * 状态为40(外出)、70(外出延期)、90(延期被拒绝)且存在审核通过的转交申请
     */
    canHandOver() {
      return (this.transitionStatus === TransitionStatus.SUCCESS
        && [
          EgressStatus.OUTGOING,
          EgressStatus.OUTGOING_DELAY,
          EgressStatus.DELAY_REJECTED,
          EgressStatus.RETURN_REJECTED,
          EgressStatus.TRANSFER_REJECTED,
        ].includes(this.status)
        && this.dataSource?.borrowUserId === this.userInfo?.id
      )
    },
  },
  async created() {
    this.getqualificationTypeData()
    this.getStatus()
    this.EQ_ENGINEERING_FIELD = await this.getBusinessParams('EQ_ENGINEERING_FIELD')

    const pageState = useAppPageStateStore().getPage('equipmentGoOutDetail')
    pageState.resetList = false
    if (this.$route.query.type === 'handOver') {
      this.showHandOverApply = true
    }
  },
  methods: {
    async getBusinessParams(key) {
      try {
        const res = await mRequest.get('tSBusinessParamController.do?getBusinessParam', {
          params: {
            key,
          },
        })
        return res.obj === 'Y'
      }
      catch (err) {
        console.error(err)
        return false
      }
    },
    afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      mRequest
        .post(api.common.upload, formData)
        .then((res) => {
          file.status = 'done'
          file.message = '上传成功'
          if (res.obj && res.obj[0]) {
            file.obj = res.obj[0]
          }
        })
        .catch((_) => {
          file.status = 'failed'
          file.message = '上传失败'
        })
    },
    // 计算可编辑的记录
    countEditRecord(index, isCancle) {
      if (
        this.dataSource.operationVos
        && this.dataSource.operationVos.length > 0
      ) {
        // app端在库无操作记录
        const opsArr = this.dataSource.operationVos
        this.editOutConfirm = Array.from({ length: opsArr.length }).fill(false)
        const result = {
          20: -1,
          50: -1,
          90: -1,
        }
        for (let i = 0; i < opsArr.length; i++) {
          const type = opsArr[i].operationType
          if (type === '20')
            result[20] = i
          if (type === '50')
            result[50] = i
          if (type === '90')
            result[90] = i
        }
        // 为找到的对象添加status属性
        for (const key in result) {
          const index = result[key]
          if (index !== -1) {
            opsArr[index].status = 'editable'
          }
        }
        this.editOutConfirm[index] = !isCancle
        this.dataSource.operationVos = opsArr
      }
    },
    handleOutConfirm(item, status, index) {
      if (Number(status) === 0) {
        // 打开编辑
        this.countEditRecord(index, false)
        // 编辑回显
        this.editOperationForm.id = item.id
        if (item.operatorId) {
          this.editOperationForm.operatorList = [{
            id: item.operatorId,
            name: item.operator,
          }]
        }
        else {
          this.editOperationForm.operatorList = []
        }
        this.editOperationForm.operationTime = formatDate(
          item.operationTime,
          'YYYY-MM-DD HH:mm:ss',
        )
        this.editOperationForm.remark = item.remark
      }
      else {
        // 发送编辑
        const param = { ...this.editOperationForm }
        const id = param.id
        if (param.operatorList && param.operatorList.length) {
          param.operator = param.operatorList[0].name
          param.operatorId = param.operatorList[0].id
        }
        delete param.operatorList
        delete param.id
        const toast = showLoadingToast({
          duration: 0,
          forbidClick: true,
        })

        mRequest({
          method: 'PUT',
          url: `${api.eqEgressList.editOperation}/${id}`,
          data: param,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        })
          .then(() => {
            // 刷新父级别数据
            this.getData()
            showNotify({ type: 'primary', message: '操作成功' })
          })
          .finally(() => {
            toast.close()
            this.editOutConfirm[index] = false
          })
      }
    },
    cancleHandleOutConfirm(index) {
      this.countEditRecord(index, true)
    },
    downloadFile,
    // #31363 设备状态为正常与报废留用之外的其他状态，状态文字显示红色
    // 正常、已停用、报废留用、已报废、正在维修
    redStatus(field) {
      if (field !== 'status')
        return ''
      const status = this.dataSource.equipmentVo[field]
      if (!status)
        return
      return ['正常', '报废留用'].includes(status) ? '' : 'red-val'
    },
    // #31363 下次检校日期小于当前日期的显示红色
    redNextCheckDate(field) {
      if (field !== 'nextCheckDate')
        return ''
      const nextCheckDate = this.dataSource.equipmentVo[field]
      if (!nextCheckDate)
        return ''
      const checkDate = new Date(nextCheckDate.replace(/-/g, '/')).getTime()
      const nowDate = new Date(new Date().toLocaleDateString()).getTime()
      return checkDate - nowDate <= 0 ? 'red-val' : ''
    },
    getStatus() {
      mRequest({
        method: 'POST',
        url: `${api.eqEgressList.status}`,
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
    async getqualificationTypeData() {
      if (!this.qualificationTypeData.length) {
        const res = await mRequest.get('common-body/qualification/pagination')
        this.qualificationTypeData = res.rows || []
      }
    },
    getQuaDisplayName(ids) { // id字符串
      if (!ids) {
        return ''
      }
      const idArr = ids.split(',')
      return idArr.map((id) => {
        const qua = this.qualificationTypeData.find(item => item.id === id)
        return qua ? qua.name : id
      }).join(',')
    },
    async getData() {
      await this.getqualificationTypeData()
      mRequest({
        method: 'GET',
        url: `${api.eqEgressList.getEgressInfo}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
          isTransition: 1,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data.egressVo
          this.status = this.dataSource.equipmentVo.egressStatus
          this.transitionStatus = this.dataSource.transitionStatus || ''
          this.countEditRecord()
        }
      })
    },
    egressDispose(status) {
      this.$router.push({
        name: 'warehouseOutDispose',
        params: {
          id: this.id,
          status,
        },
      })
    },
    goEditOutInfo() {
      this.$router.push({
        name: 'addWarehouseOut',
      })

      sessionStorage.setItem('addWarehouseOutEditData', JSON.stringify(this.dataSource))
    },
    // 新增设备外出
    addEq() {
      this.$router.push({ name: 'addWarehouseOut', params: { id: this.id } })

      sessionStorage.removeItem('addWarehouseOutEditData')
    },

    postponeEq() {
      this.$router.push({ name: 'postponeEq', params: { id: this.id } })
    },

    /**
     * # 转交申请
     */
    handleHandOverApply() {
      this.$router.push({
        name: 'handOverApply',
        params: { id: this.id },
      })
    },
    handleCancel() {
      if (this.$route.query.type === 'handOver') {
        this.$router.go(-1)
      }
      else {
        this.showHandOverApply = false
      }
    },
    async  handleSubmit() {
      const formData = this.$refs.handOverApplyRef.formData
      formData.operationType = EgressStatus.OUTGOING_TRANSFER
      // 表单验证
      if (!formData.equipmentStatus) {
        showToast('请选择转交时状态')
        return
      }
      if (!formData.operationTime) {
        showToast('请选择转交时间')
        return
      }

      this.submitLoading = true
      showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '提交中...',
      })

      try {
        const record = await mRequest({
          method: 'GET',
          url: api.eqEgressList.getBatchEgress,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: {
            equipmentIds: this.id,
            status: this.status,
          },
        })
        const res = await mRequest({
          method: 'PUT',
          url: 'rest/eqEgress/batch-operation',
          data: {
            ids: [record.data[0].id],
            operation: formData,
          },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        })

        if (res.code === 20000) {
          showToast({ type: 'success', message: '转交申请提交成功' })
          // 更新页面状态，返回列表时刷新
          const pageState = useAppPageStateStore().getPage('equipmentGoOut')
          pageState.resetList = true
          this.$router.go(-1)
        }
        else {
          showToast(res.message || '提交失败')
        }
      }
      catch (error) {
        console.error('转交申请提交失败:', error)
        showToast('提交失败，请重试')
      }
      finally {
        this.submitLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
