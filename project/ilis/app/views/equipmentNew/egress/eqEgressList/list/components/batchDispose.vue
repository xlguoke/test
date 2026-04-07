<template>
  <div>
    <ht-modal
      :title="`批量${title}`"
      :open="visible"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      width="800px"
      wrap-class-name="batch-dispose-wrap"
      @ok="handleOk()"
      @cancel="handleCancel"
    >
      <a-card title="所选外出设备记录">
        <a-table
          :columns="columns"
          :data-source="equipmentDatas"
          :pagination="false"
          :scroll="{ y: 300 }"
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.dataIndex === 'handle'">
              <a-button type="link" @click="removeRow(index)">
                移除
              </a-button>
            </template>
          </template>
        </a-table>
      </a-card>
      <br />
      <!-- 批量归还 -->
      <div v-if="status == 40">
        <a-form :model="formState">
          <a-form-item
            label="归还时状态"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 20 }"
            :rules="[{ required: true, message: '请选择归还时状态' }]"
            name="equipmentStatus"
          >
            <a-select
              v-model:value="formState.equipmentStatus"
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
            label="归还人"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 20 }"
            :rules="[{ required: !person.name, message: '请选择归还人' }]"
            name="operator"
          >
            <div style="display: flex">
              <a-input
                v-model:value="formState.operator"
                disabled
                placeholder="请选择归还人"
                style="flex: 1; margin-right: 10px"
              />
              <a-button

                v-permission="'modifyBorrower'"
                @click="
                  () => {
                    $refs.TableTreePersonnel.showModal('radio', 'person', [
                      person,
                    ])
                  }
                "
              >
                选择
              </a-button>
            </div>
          </a-form-item>
          <a-form-item
            label="归还时间"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 20 }"
            :rules="[{ required: true, message: '请选择归还时间' }]"
            name="operationTime"
          >
            <a-date-picker
              v-model:value="formState.operationTime"
              style="width: 100%"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </a-form-item>
        </a-form>
      </div>
      <!-- 批量撤回 -->
      <div v-else-if="status == 70" class="withdraw">
        <p class="title">
          <span style="color: red">*</span>
          请输入撤回的原因：
        </p>
        <a-textarea
          v-model:value="remark"
          :row="4"
          :max-length="200"
          placeholder="请输入撤回的原因"
        ></a-textarea>
      </div>
      <!-- 其他 -->
      <div v-else>
        <a-form-item
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 20 }"
          label="备注信息"
        >
          <a-textarea
            v-model:value="remark"
            :row="4"
            :max-length="200"
            placeholder="请输入备注"
          ></a-textarea>
        </a-form-item>
      </div>

      <a-form-item
        v-if="status != 70"
        :label-col="{ span: 3 }"
        :wrapper-col="{ span: 19 }"
        label="附件材料"
      >
        <HtUploadFile
          :key="visible"
          business-type="EQ_EGRESS"
          force-init
          @get-qr-code-key="qrKey = $event"
        />
      </a-form-item>

      <template #footer>
        <div v-if="status == 20" class="modal-footer">
          <a-button type="default" @click="handleOk(30)">
            驳回
          </a-button>
          <a-button type="primary" @click="handleOk(20)">
            同意
          </a-button>
        </div>
        <div v-if="status == 50" class="modal-footer">
          <a-button type="default" @click="handleOk(60)">
            驳回
          </a-button>
          <a-button type="primary" @click="handleOk(50)">
            同意
          </a-button>
        </div>
        <div v-if="status == 90" class="modal-footer">
          <a-button type="default" @click="handleOk(95)">
            驳回
          </a-button>
          <a-button type="primary" @click="handleOk(90)">
            同意
          </a-button>
        </div>
      </template>
    </ht-modal>
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { formatTime } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { TransitionStatus } from '../OperationEntity'

const columns = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    key: 'equipmentSn',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    key: 'standard',
  },
  {
    title: '操作',
    dataIndex: 'handle',
    key: 'handle',
    width: 80,
    scopedSlots: { customRender: 'handle' },
  },
]
export default {
  components: {
    TableTreePersonnel,
    HtUploadFile,
  },
  props: ['callback'],
  data() {
    return {
      qrKey: '',
      title: '操作',
      formatTime,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      formState: {},
      status: '',
      fields: [
        { name: '关联任务', field: 'testTaskSn' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '借用人', field: 'borrowUser' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
      ],
      person: {},
      remark: '',
      statusData: [],
      columns,
      equipmentDatas: [],
      accessoriesQrCode: '',
    }
  },
  created() {
    this.getStatus()
  },
  methods: {

    beforeFilter(val) {
      return this.statusData.find(it => it.typecode === val).typename
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
    showModal(title, status, datas) {
      this.title = title || '操作'
      this.equipmentDatas = [...datas]
      // status : 确认外出:20，拒绝外出:30，归还:40，确认归还:50，拒绝归还:60，撤回:70
      this.status = status
      window.$oNextTick(() => {
        status == 40 && this.setPersonInfo(datas)
      })
      this.visible = true
    },
    /*  归还人处理
     *   1、单个设备外出后归还时，归还人默认为借取人
     *   2、多个设备批量归还时，检查设备外出记录中的借取人是否是同一人，若是同一人，则默认该人员为归还人，若不是同一人，默认当前登录人
     *   3、第三方系统接入时，无法获取本地缓存的登录人信息，则将归还人设为空，并设置为必填，让用户手动选择
     */
    setPersonInfo(datas) {
      if (datas.length === 0) {
        this.person = {
          name: datas[0].borrowUser,
          id: datas[0].BorrowUserId,
        }
        this.formState.operator = this.person.name
        return
      }
      let flag = true
      const firstName = datas[0].borrowUser
      for (let i = 1; i < datas.length; i++) {
        if (firstName != datas[i].borrowUser) {
          flag = false
          break
        }
      }
      if (flag) {
        this.person = {
          name: firstName,
          id: datas[0].BorrowUserId,
        }
      }
      else {
        const storage = window.localStorage.getItem('userInfo')
        const userInfo = storage ? JSON.parse(storage) : {}
        this.person = {
          name: userInfo.realName || '',
          id: userInfo.userId || '',
        }
      }
      this.formState.operator = this.person.name
    },
    // 移除设备
    removeRow(ind) {
      this.equipmentDatas.splice(ind, 1)
    },
    async handleOk(status) {
      const ids = this.equipmentDatas.map(d => d.id)
      if (ids.length === 0) {
        return window.$oAntdMessage.warning(`请选择需要批量${this.title}的设备`)
      }
      // 撤回时，测回原因不能为空
      if (this.status == 70 && this.remark == '') {
        return window.$oAntdMessage.warning(`请输入撤回原因`)
      }
      let data = {
        operationType: this.status,
        qrKey: this.qrKey,
        remark: this.remark,
      }
      if (this.status == 40) {
        const formVal = { ...this.formState }
        if (!formVal.equipmentStatus) {
          return window.$oAntdMessage.warning(`请选择归还时状态`)
        }
        else if (!this.person.name) {
          return window.$oAntdMessage.warning(`请选择归还人`)
        }
        else if (!formVal.operationTime) {
          return window.$oAntdMessage.warning(`请选择归还时间`)
        }
        data = {
          ...data,
          ...formVal,
        }
        data.operationTime = data.operationTime
          ? formatTime(data.operationTime, 'YYYY-MM-DD HH:mm:ss')
          : ''
        data.operator = this.person.name
        data.operatorId = this.person.id

        const flag = this.equipmentDatas.filter((d) => {
          return (
            new Date(d.egressTime).valueOf()
              >= new Date(data.operationTime).valueOf()
          )
        })
        if (flag.length) {
          const names = flag.map((d) => {
            return d.equipmentName
          })
          window.$oAntdMessage.warning(`${names}归还时间必须大于外出时间`)
          return
        }
        const ids = this.equipmentDatas.map(d => d.id)
        const { data: detailData } = await detailBatchApi(ids)
        const hadHandOver = []
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
      // eslint-disable-next-line ts/no-unused-expressions
      status ? (data.operationType = status) : null
      this.confirmLoading = true
      window.$oAjax({
        method: 'PUT',
        url: window.$oApi.eqEgressList.batchOperation,
        data: {
          operation: data,
          ids,
        },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.qrKey = ''
          this.formState = {}
          this.person = {}
          this.visible = false
          this.callback()
          this.remark = ''
        }
        else {
          if (res.error && Array.isArray(res.error)) {
            let msg = ``
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
            if (this.status == 70) {
              window.$oAntdModal.warning(window.$oMsgTips.info(msg + res.error[0].message))
            }
            else {
              window.$oAntdModal.warning(
                window.$oMsgTips.info(
                  `${res.message || ''}，设备 ${msg} 状态不符`,
                ),
              )
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        }
        this.confirmLoading = false
      })
    },
    handleCancel() {
      this.qrKey = ''
      this.visible = false
      this.remark = ''
      this.formState = {}
    },
    getPerson(idsPerson, acceptData) {
      const obj = acceptData[0] || {}
      this.person = obj
      this.formState.operator = obj.name
      this.formState.operatorId = obj.id
    },
  },
}
</script>

<style lang="less">
.batch-dispose-wrap {
  .ant-modal-body {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .ant-card-head-title {
    padding: 10px 0;
  }
  .ant-card-body {
    padding: 15px 20px;
  }
  .withdraw {
    margin-right: 2%;
    .title {
      margin-bottom: 5px;
    }
  }
}
</style>
