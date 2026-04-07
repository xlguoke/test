<template>
  <div class="eqGoOut-detail-wrap">
    <van-sticky>
      <MobileTitleBar
        title="设备外出台账详情"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>

    <van-pull-refresh
      v-model="isLoading"
      success-text="刷新成功"
      @refresh="onRefresh"
    >
      <div class="eqGoOut-detail-content">
        <!-- 设备信息 -->
        <div class="eq-info">
          <van-cell-group>
            <van-cell
              v-for="(item, index) in equipmentVo"
              :key="index"
              :title="item.name"
              :value="dataSource.equipmentVo[item.field]"
              title-class="left-label"
              value-class="right-value"
            >
              <template #default>
                <div v-if="item.field === 'name'">
                  <span
                    v-if="dataSource.status === '10'"
                    class="eq-info-status"
                  >
                    已归还
                  </span>
                  <span v-else class="eq-info-status"> 外出中 </span>
                </div>
                <div v-else>
                  {{ dataSource.equipmentVo[item.field] || '--' }}
                </div>
              </template>
              <template v-if="item.field === 'name'" #title>
                <div class="eq-info-name">
                  {{ dataSource.equipmentVo[item.field] }}
                </div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
        <!-- 设备借用信息 -->
        <div class="eq-info">
          <van-cell-group>
            <van-cell
              v-for="(item, index) in base"
              :key="index"
              :title="item.name"
              :value="
                Array.isArray(dataSource[item.field])
                  ? ''
                  : dataSource[item.field]
              "
              title-class="left-label"
              value-class="right-value"
            >
              <template #default>
                <span
                  v-if="['egressTime', 'expectReturnTime'].includes(item.field)"
                >
                  {{ formatDate(dataSource[item.field], 'YYYY-MM-DD HH:mm:ss') }}
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
                  <p v-for="(acitem, i) in dataSource[item.field]" :key="i">
                    <a
                      :href="acitem.realpath"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="position: relative; z-index: 10"
                    >{{ acitem.attachmenttitle }}</a>
                  </p>
                </span>
                <span v-else-if="item.field === 'equipmentStatus'">
                  {{
                    item[item2.field]
                      ? statusData.find(
                        (status) => status.typecode === item[item2.field],
                      ).typename
                      : ''
                  }}
                </span>
                <span v-else>
                  {{ dataSource[item.field] || '--' }}
                </span>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
        <!-- 设备外出后操作信息 -->
        <div class="eq-op-info">
          <van-cell-group
            v-for="(item, index) in dataSource.operationVos"
            :key="index"
          >
            <van-cell
              v-for="(item2, index2) in fields[item.operationType]"
              :key="index2"
              :title="item2.name"
              :value="Array.isArray(item[item2.field]) ? '' : item[item2.field]"
              title-class="left-label"
              value-class="right-value"
            >
              <template #default>
                <span v-if="['operationTime'].includes(item2.field)">
                  {{ formatDate(item[item2.field], 'YYYY-MM-DD HH:mm:ss') || '--' }}
                </span>
                <span v-else-if="item2.field === 'attachments'">
                  <p v-for="(acitem, i) in item[item2.field]" :key="i">
                    <a
                      :href="acitem.realpath"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="position: relative; z-index: 10"
                    >{{ acitem.attachmenttitle }}</a>
                  </p>
                </span>
                <span v-else-if="item2.field === 'equipmentStatus'">
                  {{
                    item[item2.field]
                      ? statusData.find(
                        (status) => status.typecode === item[item2.field],
                      ).typename
                      : ''
                  }}
                </span>
                <span v-else-if="item2.name === '确认结果'">
                  {{ item2.field }}
                </span>
                <span v-else-if="item2.name === '操作'">
                  {{ item2.field }}
                </span>
                <span v-else>
                  {{ item[item2.field] || '--' }}
                </span>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script>
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: { MobileTitleBar },
  emits: ['showFilter'],
  data() {
    return {
      formatDate,
      id: '', // 设备id
      isLoading: false,
      equipmentVo: [
        { name: '设备名称', field: 'name' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '档案编号', field: 'archiveSn' },
        { name: '资产编号', field: 'assetSn' },
        { name: '设备状态', field: 'status' },
        { name: '规格型号', field: 'standard' },
        { name: '量程', field: 'eqRange' },
        { name: '精度', field: 'accuracy' },
        { name: '下次检校日期', field: 'nextCheckDate' },
      ],
      base: [
        { name: '借用人', field: 'borrowUser' },
        { name: '借取操作人', field: 'createName' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '关联工程项目', field: 'projectNames' },
        { name: '项目编号', field: 'projectCodes' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
        { name: '备注', field: 'remark' },
        { name: '附件材料', field: 'attachments' },
      ],
      fields: {
        20: [
          /** "20" 外出确认 "30" 外出拒绝 */
          { name: '外出确认日期', field: 'operationTime' },
          { name: '外出确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        30: [
          /** "20" 外出确认 "30" 外出拒绝 */
          { name: '外出确认日期', field: 'operationTime' },
          { name: '外出确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        40: [
          /** "40" 归还 */
          { name: '归还时间', field: 'operationTime' },
          { name: '归还人', field: 'operator' },
          { name: '归还操作人', field: 'createName' },
          { name: '归还时设备状态', field: 'equipmentStatus' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        50: [
          /** "50" 归还确认 "60" 归还拒绝 */
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        60: [
          /** "50" 归还确认 "60" 归还拒绝 */
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        70: [
          /** "70" 撤回 */
          { name: '撤回时间', field: 'operationTime' },
          { name: '撤回人', field: 'operator' },
          { name: '操作', field: '撤回' },
          { name: '备注', field: 'remark' },
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
      statusData: [],
    }
  },
  mounted() {
    const query = this.$route.query
    this.id = query.id ? query.id : ''
    this.getStatus()
    this.getDetailData()
  },
  methods: {
    // 获取设备详情信息
    getDetailData() {
      const toast = showLoadingToast({
        duration: 0,
        message: '加载中...',
        forbidClick: true,
      })
      mRequest
        .get(api.eqEgressList.detail, {
          params: {
            id: this.id,
          },
        })
        .then((res) => {
          if (res.code && res.code === 20000) {
            this.dataSource = res.data
          }
        })
        .finally(() => {
          this.isLoading = false
          if (toast) {
            toast.close()
          }
        })
    },
    getStatus() {
      mRequest
        .post(
          api.eqEgressList.status,
          qs.stringify({
            dictGroupId: '402882cd5f998a58015f9998ff71001b',
          }),
          {
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          },
        )
        .then((res) => {
          if (res && res.success) {
            this.statusData = res.obj
          }
        })
    },
    onRefresh() {
      this.isLoading = true
      this.getDetailData()
    },
    showFilter() {
      $emit(this, 'showFilter')
    },
  },
}
</script>

<style lang="less" scoped>
.eqGoOut-detail-wrap {
  height: auto;
  overflow: hidden;
  width: 100%;
  .eqGoOut-detail-content {
    height: max-content;
    display: flex;
    flex-direction: column;
    gap: 12px;
    .eq-info {
      .eq-info-name {
        font-weight: 500;
        font-size: 14px;
        color: #151515;
      }
      .eq-info-status {
        font-weight: 400;
        font-size: 14px;
        color: #24b276;
      }
      .left-label {
        font-size: 14px;
        color: #666666;
        font-weight: 350;
        display: flex;
        align-items: center;
      }
      .right-value {
        font-size: 14px;
        color: #151515;
        font-weight: 350;
      }
    }
    .eq-op-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      .left-label {
        font-size: 14px;
        color: #666666;
        font-weight: 350;
        display: flex;
        align-items: center;
      }
      .right-value {
        font-size: 14px;
        color: #151515;
        font-weight: 350;
      }
    }
  }
}
</style>
