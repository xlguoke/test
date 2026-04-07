<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="批量设置流程状态"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      :centered="true"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form-item
            label="流程状态"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-select
              v-model:value="status"
              placeholder="请选择"
              style="width: 100%"
            >
              <a-select-option
                v-for="(item, index) in statusData"
                :key="index"
                :value="item.typename"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: ['callback'],
  emits: ['success-select'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      folderName: '',
      mainEntityId: '',
      editInfo: {},
      pid: '',
      isAdd: true,
      statusData: [],
      ids: '',
      status: undefined,
      spinning: false,
    }
  },
  created() {
    this.getTypeData()
  },
  methods: {
    showModal(ids, defaultValue) {
      this.ids = ids

      defaultValue && (this.status = defaultValue)
      this.visible = true
    },
    getTypeData() {
      let arr = []
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        params: {
          dictGroupId: 'f852d85d47ed64a40147ed70894c00x8',
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          if (res.obj && Array.isArray(res.obj) && res.obj.length > 0) {
            arr = res.obj.map(item => ({
              id: item.id,
              typecode: item.typecode,
              typename: item.typename,
            }))
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.statusData = arr.map(item => item)
        this.status = this.statusData[0].typename
      })
    },
    cancelModal() {
      this.status = undefined
      this.visible = false
    },
    handleSubmit() {
      this.confirmLoading = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.subcontractManage.modifyStatus,
        data: qs.stringify({
          status: this.status,
          id: this.ids,
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('设置成功')
          $emit(this, 'success-select', this.status)
          this.cancelModal()

          this.callback && this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
        this.confirmLoading = false
      })
    },
  },
}
</script>

<style></style>
