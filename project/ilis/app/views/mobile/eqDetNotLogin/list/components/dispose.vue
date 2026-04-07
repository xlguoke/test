<template>
  <div>
    <a-modal
      title="操作"
      :open="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div v-if="status == '40'">
        <a-form :model="formState">
          <a-form-item
            label="外出设备"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-row :gutter="15">
              <a-col :span="24" style="font-size: 12px">
                {{
                  data.equipmentName
                }}
              </a-col>
            </a-row>
            <div v-if="data.equipmentName" style="font-size: 12px">
              设备编号：{{ data.equipmentSn }} 设备规格：{{ data.standard }}
            </div>
          </a-form-item>
          <a-form-item
            v-for="(item, index) in fields"
            :key="index"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :label="item.name"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                {{
                  item.field === 'egressTime' || item.field === 'expectReturnTime'
                    ? formatTime(data[item.field], 'YYYY-MM-DD HH:mm:ss')
                    : data[item.field]
                }}
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item
            label="归还时状态"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-select v-model:value="formState.equipmentStatus" placeholder="请选择">
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
            label="归还人"
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
                请选择归还人
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  @click="
                    () => {
                      $refs.SelectPersonnel.showModal()
                    }
                  "
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
            label="归还时间"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-date-picker
              v-model:value="formState.operationTime"
              style="width: 100%"
              show-time
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </a-form>
      </div>
      <div v-else>
        <a-textarea
          v-model:value="formState.remark"
          :row="4"
          placeholder="请输入备注"
        ></a-textarea>
      </div>
    </a-modal>
    <SelectPersonnel
      ref="SelectPersonnel"
      :callback="getPerson"
      :multiple="false"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime } from '~/providers-moblie/common/utils'
import SelectPersonnel from '~/providers-moblie/components/selectPersonnel.vue'

export default {
  components: {
    SelectPersonnel,
  },
  props: ['callback'],
  data() {
    return {
      formatTime,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      status: '',
      fields: [
        { name: '关联任务', field: 'testTaskSn' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '借取人', field: 'borrowUser' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
      ],
      person: {},
      remark: '',
      statusData: [],
      formState: {},
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
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
        }
      })
    },
    showModal(record, status) {
      this.data = record
      this.status = status
      this.visible = true
    },
    handleOk() {
      let data = {
        'operationType': this.status,
        'eqEgress.id': this.data.id,
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

      this.confirmLoading = true
      mAjax({
        method: 'POST',
        url: mApi.eqEgressList.dispose,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          message.success('操作成功')
          this.formState = {}
          this.person = {}
          this.visible = false
          this.callback()
          this.remark = ''
        }
        else {
          message.error(res.message)
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.visible = false
      this.formState = {}
    },
    getPerson(data) {
      this.person = data || {}
    },
  },
}
</script>

<style></style>
