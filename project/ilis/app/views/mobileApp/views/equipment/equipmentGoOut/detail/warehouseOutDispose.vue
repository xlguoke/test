<template>
  <div class="equipmentOutgo">
    <div class="equipmentOutgo-dispose equipmentOutgo-detail">
      <van-sticky>
        <MobileTitleBar
          title="设备出入库处理"
          left-arrow
          @click-left="$router.go(-1)"
        />
        <div v-if="id.length > 3" class="equipmentOutgo-title">
          {{ dataSource.equipmentVo.name }}
          <span
            v-if="dataSource.equipmentVo.egressStatus"
            class="equipmentOutgo-detail-tag"
          >
            {{
              egressStatusData.find(
                (data) => data.value === dataSource.equipmentVo.egressStatus,
              ).name
            }}
          </span>
          <div style="color: #999; font-weight: 500">
            {{ dataSource.equipmentVo.equipmentSn }}
          </div>
        </div>
      </van-sticky>

      <!-- 设备信息-批量操作 -->
      <van-collapse v-if="id.length <= 3" v-model="collapseActive">
        <van-collapse-item title="所选设备" name="1" class="background-gray">
          <div v-for="(equipment, index) in equipmentVoData" :key="index" class="equipmentOutgo-info">
            <div class="equipment-name">
              <div class="left">
                <p class="name">
                  {{ equipment.equipmentVo.name }}
                </p>
                {{ equipment.equipmentVo.equipmentSn }}
              </div>
              <span
                v-if="equipment.equipmentVo.egressStatus"
                class="equipmentOutgo-detail-tag"
              >
                {{
                  egressStatusData.find(
                    (data) => data.value === equipment.equipmentVo.egressStatus,
                  ).name
                }}
              </span>
            </div>
            <div v-for="(item, index2) in equipmentVo" :key="index2">
              {{ item.name }}：<span
                :class="`${redStatus(
                  item.field,
                  equipment.equipmentVo,
                )} ${redNextCheckDate(item.field, equipment.equipmentVo)}`"
              >{{ equipment.equipmentVo[item.field] || '/' }}</span>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>

      <template v-else>
        <!-- 设备信息 -->
        <div class="equipmentOutgo-info">
          <div v-for="(item, index) in equipmentVo" :key="index">
            {{ item.name }}：<span
              :class="`${redStatus(
                item.field,
                dataSource.equipmentVo,
              )} ${redNextCheckDate(item.field, dataSource.equipmentVo)}`"
            >{{ dataSource.equipmentVo[item.field] }}</span>
          </div>
        </div>

        <!-- 借取人信息 -->
        <div class="equipmentOutgo-info">
          <div v-for="(item, index) in base" :key="index">
            {{ item.name }}：
            <span
              v-if="
                item.field === 'borrowTime'
                  || item.field === 'egressTime'
                  || item.field === 'expectReturnTime'
              "
            >
              {{
                dataSource[item.field]
                  ? formatDate(dataSource[item.field], 'YYYY-MM-DD HH:mm:ss')
                  : ''
              }}
            </span>
            <span v-else-if="item.field === 'beforeStatus'">
              {{
                dataSource[item.field]
                  ? statusData.find(
                    (status) => status.typecode === dataSource[item.field],
                  ).typename
                  : ''
              }}
            </span>
            <span v-else-if="item.field === 'attachments'">
              <AttachmentHandler
                :business-id="dataSource.id"
                business-type="EQ_EGRESS"
                readonly
              />
            </span>
            <span v-else>{{ dataSource[item.field] }}</span>
          </div>
        </div>

        <!-- 外出确认信息 -->
        <div
          v-for="(item, index) in dataSource.operationVos"
          :key="index"
          class="equipmentOutgo-info"
        >
          <div
            v-for="(item2, index2) in operationVos[item.operationType]"
            :key="index2"
          >
            {{ item2.name }}：
            <span v-if="item2.field === 'operationTime'">
              {{
                item[item2.field]
                  ? formatDate(item[item2.field], 'YYYY-MM-DD HH:mm:ss')
                  : ''
              }}
            </span>
            <span v-else-if="item2.field === 'operationType'">
              {{
                item[item2.field]
                  ? egressStatusData.find(
                    (status) => status.value === item[item2.field],
                  ).name
                  : ''
              }}
            </span>
            <span v-else-if="item2.name === '确认结果'">{{ item2.field }}</span>
            <span v-else-if="item2.field === 'equipmentStatus'">
              {{
                item[item2.field]
                  ? statusData.find(
                    (status) => status.typecode === item[item2.field],
                  ).typename
                  : ''
              }}
            </span>
            <span v-else-if="item2.field === 'attachments'">
              <AttachmentHandler
                :business-id="item.id"
                business-type="EQ_EGRESS"
                readonly
              />
            </span>
            <span v-else>{{ item[item2.field] }}</span>
          </div>
        </div>
      </template>

      <!-- 表单内容 -->
      <div v-if="status === '40'">
        <van-form ref="form">
          <van-field
            v-model="formData.equipmentStatus"
            label="归还时状态"
            clearable
            center
            required
            :rules="[{ required: true, message: '请选择归还时状态' }]"
          >
            <template #input>
              <select v-model="formData.equipmentStatus" placeholder="请选择">
                <option
                  v-for="(item, index) in statusData"
                  :key="index"
                  :value="item.typecode"
                >
                  {{ item.typename }}
                </option>
              </select>
            </template>
          </van-field>
          <van-field label="归还人" clearable center placeholder="请选择">
            <template #input>
              <span v-if="person.name">{{ person.name }}</span>
              <span v-else style="color: #ccc">请选择</span>
            </template>
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

          <FormItemDate
            v-model:value="formData.operationTime"
            label="归还时间"
            placeholder="请选择"
            required
            input-align="left"
            :enable-time="true"
            :rules="[{ required: true, message: '请选择归还时间' }]"
            @select="(val) => {
              operationTime = val
            }"
          />

          <van-field
            v-model="formData.remark"
            label="备注"
            placeholder="请输入"
            autosize
            rows="2"
            type="textarea"
          >
          </van-field>
          <van-field name="uploader" label="附件">
            <template #input>
              <AttachmentHandler
                ref="attachmentHandlerRef"
                business-type="EQ_EGRESS"
              />
            </template>
          </van-field>
        </van-form>
      </div>
      <div v-else>
        <van-form ref="form">
          <van-field
            v-model="operator"
            label="确认人"
            placeholder="请输入"
            readonly
            autosize
            rows="2"
            type="input"
          ></van-field>

          <FormItemDate
            v-model:value="operationTime"
            label="确认时间"
            input-align="left"
            :enable-time="true"
            @select="(val) => {
              formData.operationTime = val
            }"
          />

          <van-field
            v-model="remark"
            label="备注"
            placeholder="请输入"
            autosize
            rows="2"
            type="textarea"
          ></van-field>
          <van-field name="uploader" label="附件">
            <template #input>
              <AttachmentHandler
                ref="attachmentHandlerRef"
                business-type="EQ_EGRESS"
              />
            </template>
          </van-field>
        </van-form>
      </div>
    </div>

    <ActionBar>
      <van-button type="primary" @click="submitData()">
        完成
      </van-button>
      <van-button
        @click="
          () => {
            equipmentStore.clearEqData()
            $router.go(-1)
          }
        "
      >
        取消
      </van-button>
    </ActionBar>

    <SelectPerson
      v-model:value="selectPersonVisible"
      @selected-ok="getPerson"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import {
  showDialog,
  showLoadingToast,
  showNotify,
} from 'vant'
import { TransitionStatus } from '~/views/equipmentNew/egress/eqEgressList/list/OperationEntity'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    FormItemDate,
    SelectPerson,
    MobileTitleBar,
    AttachmentHandler,
    ActionBar,
  },
  data() {
    const equipmentStore = useEquipmentStore()

    return {
      equipmentStore,
      formatDate,
      formData: {},
      selectPersonVisible: false,
      // id为 20、30、40、50、60时，表示批量操作；区分批量操作和单个设备直接操作，根据id长度判断的
      id: `${this.$route.params.id}`,
      status: this.$route.params.status,
      base: [
        { name: '借取日期', field: 'borrowTime' },
        { name: '借用人', field: 'borrowUser' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '工程项目', field: 'projectNames' },
        { name: '项目编号', field: 'projectCodes' },
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
          { name: '附件资料', field: 'attachments' },
        ],
        60: [
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件资料', field: 'attachments' },
        ],
      },
      person: {},
      remark: '',
      operator: '', // 外出-延期-归还确认人
      operationTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'), // 确认时间
      statusData: [],
      data: {
        equipmentName: '',
      },
      equipmentVoData: [],
      dataSource: {
        equipmentVo: {},
      },
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
      collapseActive: ['1'],
    }
  },
  computed: {
    ...mapState(useAppUserStore, {
      currentUser: 'userInfo',
    }),
    ...mapState(useEquipmentStore, ['eqDataList']),
  },
  created() {
    this.person = {
      name: this.currentUser.realName,
      id: this.currentUser.id,
    }
    // 外出-延期-归还确认人
    this.operator = this.person.name
    this.getStatus()
  },
  methods: {
    // #31363 设备状态为正常与报废留用之外的其他状态，状态文字显示红色
    // 正常、已停用、报废留用、已报废、正在维修
    redStatus(field, equipment) {
      if (field !== 'status')
        return ''
      const status = equipment[field]
      if (!status)
        return
      return ['正常', '报废留用'].includes(status) ? '' : 'red-val'
    },
    // #31363 下次检校日期小于当前日期的显示红色
    redNextCheckDate(field, equipment) {
      if (field !== 'nextCheckDate')
        return ''
      const nextCheckDate = equipment[field]
      if (!nextCheckDate)
        return
      const checkDate = new Date(nextCheckDate.replace(/-/g, '/')).getTime()
      const nowDate = new Date(new Date().toLocaleDateString()).getTime()
      return checkDate - nowDate <= 0 ? 'red-val' : ''
    },
    downloadFile,
    openSelectPerson() {
      this.selectPersonVisible = true
    },
    getStatus() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
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
      }).finally(() => {
        toast.close()
      })
    },
    getData() {
      // 批量操作
      if (['10', '20', '30', '40', '50', '60', '100', '110', '120'].includes(this.id)) {
        this.getOutRecordDatas()
        return
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'GET',
        url: `${api.eqEgressList.getEgressInfo}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          const obj = res.data.egressVo
          this.equipmentVoData = obj.equipmentVo ? [obj.equipmentVo] : []
          this.dataSource = obj
          this.person = {
            name: obj.borrowUser,
            id: obj.borrowUserId,
          }
        }
      }).finally(() => {
        toast.close()
      })
    },
    // 批量操作时，通过设备 id 集合获取对应的外出记录数据
    getOutRecordDatas() {
      const dataList = this.eqDataList
      const ids = dataList.map(d => d.id)
      const status = dataList.map(d => d.egressStatus)

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'GET',
        url: api.eqEgressList.getBatchEgress,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          equipmentIds: ids.join(','),
          status: status.join(','),
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.equipmentVoData = res.data
          const persons = {}
          res.data.forEach((d) => {
            persons[d.borrowUserId] = d
          })
          const ids = Object.keys(persons)
          if (Object.keys(persons).length === 1) {
            this.person = {
              name: persons[ids[0]].borrowUser,
              id: persons[ids[0]].borrowUserId,
            }
          }
        }
      }).finally(() => {
        toast.close()
      })
    },
    getPerson(data) {
      this.person = data.length > 0 ? data[0] : {}
    },
    async submitData() {
      const result = await this.$refs.form.validate()
      if (result) {
        return
      }

      let data = {
        operationType: this.status,
      }
      data.qrKey = this.$refs.attachmentHandlerRef.qrKey

      if (this.status === '40') {
        data = {
          ...data,
          ...this.formData,
        }
        data.operator = this.person.name
        data.operatorId = this.person.id
        data.operationType = this.status

        if (
          new Date(this.dataSource.egressTime).valueOf()
            >= new Date(data.operationTime).valueOf()
        ) {
          showDialog({ message: '归还时间必须大于外出时间' })
          return
        }
        let ids = []
        if (['10', '20', '30', '40', '50', '60', '100', '110', '120'].includes(this.id)) {
          ids = this.equipmentVoData.map(d => d?.equipmentVo?.id)
        }
        else {
          ids = [this.equipmentVoData[0]?.id]
        }

        const res = await mRequest({
          method: 'POST',
          url: `rest/eqEgress/egress-record/equipment`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json; charset=UTF-8',
          },
          data: {
            equipmentIds: ids,
          },
        })
        if (res.code && res.code === 20000) {
          const hadHandOver = []
          const detailData = res.data
          ids.forEach((id) => {
            if (detailData[id]?.transitionStatus === TransitionStatus.CREATE) {
              hadHandOver.push(detailData[id])
            }
          })
          if (hadHandOver?.length) {
            await new Promise((resolve, reject) => {
              Modal.confirm({
                title: '提示',
                content: `设备：${hadHandOver.map(d => d.equipmentName).join('、')}存在转场申请，是否继续?`,
                onOk: async () => {
                  await rejectOtherApplyBatchApi(hadHandOver.map(d => d.id))
                  resolve()
                },
                onCancel: reject,
              })
            })
          }
        }
        else {
          showDialog({ message: res.message || res.msg })
        }
      }
      else {
        data.remark = this.remark
        // 新增字段
        data.operator = this.operator
        data.operationTime = this.operationTime
      }

      let ids = this.equipmentVoData.map(d => d.id)
      if (this.id.length > 3) {
        ids = [this.dataSource.id]
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'PUT',
        url: api.eqEgressList.batchOperation,
        data: {
          operation: data,
          ids,
        },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          showNotify({ type: 'primary', message: '操作成功' })
          const equipmentStore = useEquipmentStore()
          equipmentStore.clearEqData()

          const pageState = useAppPageStateStore().getPage('warehouseOutDispose')
          pageState.updateBefore = true
          this.$router.go(-1)
        }
        else {
          let msg = ''
          if (res.error && Array.isArray(res.error)) {
            res.error.forEach((err) => {
              msg += `${
                err.eqName
                  ? `[${
                    err.eqName
                  }${err.eqSn ? `（${err.eqSn}）` : ''
                  }]`
                  : ''
              }`
            })
            showDialog({
              message: `${res.message}，设备 ${msg} 状态不符`,
            })
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        }
      }).finally(() => {
        toast.close()
      })
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
@import url('./index');
</style>
