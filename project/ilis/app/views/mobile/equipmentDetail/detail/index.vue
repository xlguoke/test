<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="equipmentOutgo-detail">
    <div>
      <div
        class="clearfix"
        style="
          font-size: 14px;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: solid 1px #e2e2e2;
        "
      >
        <div class="eq-name-status">
          {{ dataSource.equipmentVo ? dataSource.equipmentVo.name : '' }}
          <span v-if="status" class="equipmentOutgo-detail-tag">
            {{
              status
                ? egressStatusData.find((data) => data.value == status).name
                : ''
            }}</span>
          <p class="text-xs">
            {{ dataSource.equipmentSn }}
          </p>
        </div>
        <span class="eq-detail-link" @click="goEqDetail">设备详情</span>
      </div>
      <div>
        <div v-for="(item, index) in equipmentVo" :key="index">
          {{ item.name }}：{{
            dataSource.equipmentVo ? dataSource.equipmentVo[item.field] : ''
          }}
        </div>
      </div>

      <div v-if="dataSource.id" style="padding-top: 15px">
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
          <span v-else-if="item2.name == '确认结果' || item2.name == '操作'">{{ item2.field }}</span>
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

    <div style="padding-top: 5px">
      <a-button
        v-if="!status || status === '10'"
        v-permission="'mobile_equipmentEgress'"
        type="primary" @click="addEq"
      >
        外出
      </a-button>
      <a-button
        v-if="status == '20'"
        v-permission="'mobile_equipmentEgressConfirm'"
        type="primary"
        @click="egressDispose('20')"
      >
        确认外出
      </a-button>
      <a-button
        v-if="status == '20'"
        v-permission="'mobile_equipmentEgressConfirm'"
        type="primary"
        @click="egressDispose('30')"
      >
        拒绝外出
      </a-button>
      <a-button
        v-if="status == '40' || status == '70'"
        v-permission="'mobile_equipmentReturn'"
        type="primary"
        @click="egressDispose('40')"
      >
        归还
      </a-button>
      <a-button
        v-if="status == '50'"
        v-permission="'mobile_equipmentReturnConfirm'"
        type="primary"
        @click="egressDispose('50')"
      >
        确认归还
      </a-button>
      <a-button
        v-if="status == '50'"
        v-permission="'mobile_equipmentReturnConfirm'"
        type="primary"
        @click="egressDispose('60')"
      >
        拒绝归还
      </a-button>
      <a-button
        v-if="status == '60'"
        v-permission="'mobile_equipmentReturn'"
        type="primary"
        @click="egressDispose('40')"
      >
        归还
      </a-button>
      <a-button
        v-if="status == '40' || status == '70' || status == '90'"
        v-permission="'mobile_equipmentPostpone'"
        type="primary"
        @click="postponeEq()"
      >
        延期
      </a-button>
      <a-button
        v-if="status == '80'"
        v-permission="'mobile_equipmentDeferredConfirmation'"
        type="primary"
        @click="egressDispose('90')"
      >
        确认延期
      </a-button>

      <a-button
        v-if="status == '80'"
        v-permission="'mobile_equipmentDeferredReject'"
        type="primary"
        @click="egressDispose('95')"
      >
        拒绝延期
      </a-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime, getQueryVariable } from '~/providers-moblie/common/utils'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import AttachmentHandler from '../../components/AttachmentHandler.vue'

export default {
  components: {
    AttachmentHandler,
  },
  data() {
    return {
      /** 系统控制参数：控制资质类型显示 */
      EQ_ENGINEERING_FIELD: false,
      formLayout: 'horizontal',
      base: [
        { name: '借取日期', field: 'borrowTime' },
        { name: '借取人', field: 'borrowUser' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '资质类型', field: 'qualificationType' },
        { name: '关联工程项目', field: 'projectNames' },
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
      dataSource: {
        equipmentVo: {},
        operationVos: [],
      },
      formatTime,
      statusData: [],
      id: getQueryVariable('id'),
      status: '',
      egressStatusData: [
        { name: '全部', value: 0 },
        { name: '库存', value: 10 },
        { name: '外出申请待提交', value: 12 },
        { name: '外出申请审核中', value: 14 },
        { name: '外出申请审核通过', value: 16 },
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
          pageSize: 999,
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
    async getData() {
      const resDetail = await mAjax({
        method: 'GET',
        url: `${mApi.eqEgressList.getDetailById}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      })
      const resInfo = await mAjax({
        method: 'GET',
        url: `${mApi.eqEgressList.getEgressInfo}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id: this.id,
        },
      })
      let detailObj = {}
      let infoObj = {}
      if (resDetail.code && resDetail.code === 20000) {
        this.status = resDetail.data.egressStatus || '' // status一直表示设备外出状态
        detailObj = {
          ...resDetail.data,
          equipmentVo: { ...resDetail.data },
          status: this.status,
        }
      }
      else {
        message.error(resDetail.msg)
      }
      if (resInfo.code && resInfo.code === 20000) {
        infoObj = { ...resInfo.data.egressVo }
        this.unitCode = resInfo.data.unitCode || ''
      }
      else {
        message.error(resInfo.msg)
      }
      if (!this.status || this.status == '10') {
        this.dataSource = { ...detailObj }
      }
      else {
        this.dataSource = { ...detailObj, ...infoObj }
      }
    },
    egressDispose(status) {
      this.$router.push({
        name: 'dispose',
        params: {
          id: this.id,
          status,
        },
      })
    },
    // 新增设备外出
    addEq() {
      this.$router.push({
        name: 'add',
        params: {
          unitCode: this.unitCode,
        },
      })
    },
    // 设备详情
    goEqDetail() {
      this.$router.push({
        name: 'eqDetail',
        query: {
          unitCode: this.unitCode,
          id: this.id,
          detailPage: 1,
        },
      })
    },
    // 外出延期
    postponeEq() {
      this.$router.push({ name: 'postponeEq', params: { id: this.id, status: '90' } })
    },
  },
}
</script>

<style lang="less" scoped>
.equipmentOutgo-detail {
  padding: 10px;
  button {
    width: 100%;
    height: 32px;
    margin-top: 10px;
  }

  .equipmentOutgo-detail-tag {
    display: inline-block;
    border: solid 1px #1890ff;
    padding: 0px 5px;
    border-radius: 3px;
    margin-left: 10px;
    font-size: 12px;
    color: #1890ff;
  }
}
.eq-name-status {
  float: left;
  width: calc(100% - 90px);
}
.eq-detail-link {
  padding: 2px 8px;
  float: right;
  font-size: 12px;
  border-radius: 2px;
  background-color: #1890ff;
  color: #fff;
}
</style>
