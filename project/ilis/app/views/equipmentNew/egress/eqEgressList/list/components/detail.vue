<template>
  <div>
    <ht-modal
      title="详情"
      centered
      :open="visible"
      :footer="false"
      width="70%"
      :mask-closable="false"
      @cancel="handleCancel"
    >
      <div class="w-full p-2">
        <a-row
          :gutter="20"
          style="padding: 10px 0; border-bottom: 1px dashed #ccc"
        >
          <a-col v-for="(item, index) in equipmentVo" :key="index" :span="12">
            <a-row :gutter="4">
              <a-col :span="10" style="text-align: right">
                {{ item.name }}：
              </a-col>
              <a-col :span="14">
                {{ dataSource.equipmentVo[item.field] }}
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <!-- 第二行：借用申请信息 -->
        <div>
          <a-row
            style="padding: 10px 0; border-bottom: 1px dashed #ccc; max-height: 300px;"
          >
            <a-col v-for="(item, index) in filteredBase" :key="index" :span="12">
              <a-row :gutter="4">
                <a-col :span="10" style="text-align: right">
                  {{ item.name }}：
                </a-col>
                <a-col
                  v-if="
                    item.field == 'borrowTime'
                      || item.field == 'egressTime'
                      || item.field == 'expectReturnTime'
                  "
                  :span="14"
                >
                  {{
                    dataSource[item.field]
                      ? formatTime(dataSource[item.field], 'YYYY-MM-DD HH:mm:ss')
                      : ''
                  }}
                </a-col>
                <a-col v-else-if="item.field == 'beforeStatus'" :span="14">
                  {{
                    dataSource[item.field]
                      ? statusData.find(
                        (status) => status.typecode == dataSource[item.field],
                      ).typename
                      : ''
                  }}
                </a-col>
                <a-col v-else-if="item.field == 'attachments'" :span="14">
                  <HtUploadFile
                    v-if="dataSource.id && visible"
                    :key="dataSource.id"
                    :business-id="dataSource.id"
                    business-type="EQ_EGRESS"
                    is-reandonly
                    force-init
                  />
                </a-col>
                <a-col v-else-if="item.field == 'qualificationType'" :span="14">
                  {{ dataSource.qualificationTypeName || '' }}
                </a-col>
                <a-col v-else :span="14">
                  {{ dataSource[item.field] }}
                </a-col>
              </a-row>
            </a-col>
            <div style="width: 96%;display: flex;justify-content: end;position: relative;">
              <a-button
                v-permission="'editEgress'"
                type="primary"
                @click="handleApplyEdit"
              >
                编辑
              </a-button>
            </div>
          </a-row>
        </div>

        <a-row
          v-for="(item, index) in dataSource.operationVos"
          :key="index"
          :gutter="20"
          style="padding: 10px 0; border-bottom: 1px dashed #ccc"
        >
          <a-col
            v-for="(item2, index2) in fields[item.operationType]"
            :key="index2"
            :span="12"
          >
            <a-row :gutter="4">
              <a-col :span="10" style="text-align: right">
                {{ item2.name }}：
              </a-col>
              <a-col v-if="item2.field == 'operationTime'" :span="14">
                {{
                  item[item2.field]
                    ? formatTime(item[item2.field], 'YYYY-MM-DD HH:mm:ss')
                    : ''
                }}
              </a-col>
              <a-col v-else-if="item2.field == 'equipmentStatus'" :span="14">
                {{
                  item[item2.field]
                    ? statusData.find(
                      (status) => status.typecode == item[item2.field],
                    ).typename
                    : ''
                }}
              </a-col>
              <a-col v-else-if="item2.field == 'createName'" :span="14">
                {{ item[item2.field] }}
              </a-col>
              <a-col
                v-else-if="item2.name == '确认结果' || item2.name == '操作'"
                :span="14"
              >
                {{ item2.field }}
              </a-col>
              <a-col v-else-if="item2.field == 'attachments'" :span="14">
                <HtUploadFile
                  v-if="item.id && visible"
                  :key="item.id"
                  :business-id="item.id"
                  business-type="EQ_EGRESS"
                  is-reandonly
                  force-init
                />
              </a-col>

              <a-col v-else-if="item2.field == 'expectReturnTime'" :span="14">
                {{
                  item.eqEgressExtension && item.eqEgressExtension[item2.field]
                }}
              </a-col>
              <a-col v-else-if="item2.field == 'testTaskSn'" :span="14">
                {{
                  item.eqEgressExtension && item.eqEgressExtension[item2.field]
                }}
              </a-col>
              <a-col v-else-if="item2.field == 'project'" :span="14">
                {{
                  item.eqEgressExtension && item.eqEgressExtension[item2.field]
                }}
              </a-col>
              <a-col
                v-else-if="item2.field == 'extensionReturnTime'"
                :span="14"
              >
                {{
                  item.eqEgressExtension && item.eqEgressExtension[item2.field]
                }}
              </a-col>

              <a-col v-else :span="14">
                {{ item[item2.field] }}
              </a-col>
            </a-row>
          </a-col>
          <div style="width: 95%;display: flex;justify-content: end;position: relative;">
            <a-button
              v-if="item.status === 'editable'"
              v-permission="'editConfirm'"
              type="primary"
              @click="handleOutConfirm(item)"
            >
              编辑
            </a-button>
          </div>
        </a-row>
      </div>
    </ht-modal>
    <Add ref="Add" :callback="getData" />
    <Dispose ref="Dispose" :callback="getData" />
  </div>
</template>

<script>
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { formatTime } from '~/providers/common/utils'
import { getBusinessParam } from '~/utils/getBusinessParam.ts'
import Add from './add.vue'
import Dispose from './dispose.vue'

export default {
  components: {
    Add,
    Dispose,
    HtUploadFile,
  },
  props: ['egressStatusData', 'callback'],
  data() {
    return {
      visible: false,
      formLayout: 'horizontal',
      /** 控制表单中的资质类型显示 */
      EQ_ENGINEERING_FIELD: false,
      base: [
        // { name:"借取日期", field:"borrowTime" },  外出
        { name: '借用人', field: 'borrowUser' },
        { name: '借取操作人', field: 'createName' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '关联工程项目', field: 'projectNames' },
        { name: '资质类型', field: 'qualificationType' },
        { name: '项目编号', field: 'projectCodes' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
        { name: '备注', field: 'remark' },
        { name: '附件材料', field: 'attachments' },
      ],
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
      fields: {
        // operationType
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
        100: [
          /** "100"  转交 */
          { name: '转交时间', field: 'operationTime' },
          { name: '接收人', field: 'receiveUser' },
          { name: '转交时状态', field: 'equipmentStatus' },
          { name: '转交人', field: 'transitionUser' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        110: [
          /** "110"  确认转交 */
          { name: '转交确认时间', field: 'operationTime' },
          { name: '转交人', field: 'transitionUser' },
          { name: '确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        120: [
          /** "120"  拒绝转交 */
          { name: '转交确认时间', field: 'operationTime' },
          { name: '转交人', field: 'transitionUser' },
          { name: '确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
      },
      dataSource: {
        equipmentVo: {},
        operationVos: [],
      },
      formatTime,
      statusData: [],
      qualificationTypeData: [],
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
    this.getStatus()
    this.EQ_ENGINEERING_FIELD = await getBusinessParam('EQ_ENGINEERING_FIELD')
  },
  methods: {
    // 计算可编辑的记录
    countEditRecord() {
      const opsArr = this.dataSource.operationVos
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
      this.dataSource.operationVos = opsArr
    },
    // 刷新详情记录回调
    getData(id) {
      window.$oAjax({
        method: 'GET',
        url: `${window.$oApi.eqEgressList.detail}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data
          this.countEditRecord()
          // 刷新index表格数据
          this.callback()
        }
      })
    },
    // 编辑确认外出详情信息
    handleApplyEdit() {
      const isEdit = true
      // const record = this.dataSource.equipmentVo
      const record = this.dataSource
      this.$refs.Add.showModal(isEdit, record)
      this.visible = false
    },
    // 编辑(外确出认，延期确认，归还确认)确认信息
    handleOutConfirm(record) {
      const isEdit = true
      this.$refs.Dispose.showModal(record, record.operationType, isEdit)
      this.visible = false
    },
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
      })
    },
    showModal(id) {
      window.$oAjax({
        method: 'GET',
        url: `${window.$oApi.eqEgressList.detail}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data
          this.countEditRecord()
        }
      })
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style></style>
