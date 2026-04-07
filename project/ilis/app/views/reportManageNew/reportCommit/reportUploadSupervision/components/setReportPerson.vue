<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="设置上报人员"
      :confirm-loading="confirmLoading"
      @cancel="cancelModal"
      @ok="handleSubmit"
    >
      <a-form>
        <a-form-item
          label="上报检测人"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-select
            v-model:value="person1"
            :label-in-value="true"
            placeholder="请选择上报检测人"
            mode="multiple"
            :options="personData"
          />
        </a-form-item>
        <a-form-item
          label="上报审核人"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-select
            v-model:value="person2"
            :label-in-value="true"
            placeholder="请选择上报审核人"
            mode="multiple"
            :options="personData"
          />
        </a-form-item>
        <a-form-item
          label="上报批准人"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-select
            v-model:value="person3"
            :label-in-value="true"
            placeholder="请选择上报批准人"
            mode="multiple"
            :options="personData"
          />
        </a-form-item>
        <a-form-item label="上报协助人" :label-col="{ span: 5 }" :wrapper-col="{ span: 15 }">
          <a-select v-model:value="person4" :label-in-value="true" placeholder="请选择上报协助人" mode="multiple" :options="personData" />
        </a-form-item>
        <a-form-item label="上报记录人" :label-col="{ span: 5 }" :wrapper-col="{ span: 15 }">
          <a-select v-model:value="person5" :label-in-value="true" placeholder="请选择上报记录人" mode="multiple" :options="personData" />
        </a-form-item>
        <a-form-item label="上报复核人" :label-col="{ span: 5 }" :wrapper-col="{ span: 15 }">
          <a-select v-model:value="person6" :label-in-value="true" placeholder="请选择上报复核人" mode="multiple" :options="personData" />
        </a-form-item>
        <a-form-item label="上报编写人" :label-col="{ span: 5 }" :wrapper-col="{ span: 15 }">
          <a-select v-model:value="person7" :label-in-value="true" placeholder="请选择上报编写人" mode="multiple" :options="personData" />
        </a-form-item>
        <p style="color: #006c14; font-size: 12px; padding: 0 21px">
          * 未设置上报人员时，将使用报告实际人员信息上报
        </p>
      </a-form>

      <template #footer>
        <a-button key="back" @click="cancelModal">
          取消
        </a-button>
        <a-button
          key="submit"
          :disabled="
            person1.length === 0
              && person2.length === 0
              && person3.length === 0
              && person4.length === 0
              && person5.length === 0
              && person6.length === 0
              && person7.length === 0
          "
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确定
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: ['callback'],
  emits: ['callback'],
  data() {
    return {
      selReport: [],
      loading: false,

      visible: false,
      confirmLoading: false,
      personData: [],
      person1: [],
      person2: [],
      person3: [],
      person4: [],
      person5: [],
      person6: [],
      person7: [],
    }
  },
  created() {},
  methods: {
    showModal(selReport) {
      this.selReport = selReport
      this.visible = true
      this.getPersonData()
      this.person1 = []
      this.person2 = []
      this.person3 = []
      this.person4 = []
      this.person5 = []
      this.person6 = []
      this.person7 = []
    },
    cancelModal() {
      this.person1 = []
      this.person2 = []
      this.person3 = []
      this.person4 = []
      this.person5 = []
      this.person6 = []
      this.person7 = []
      this.visible = false
    },
    getPersonData() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax({
        method: 'get',
        url: 'rest/biddingPersonController/dataGrid.do?page=1&size=9999',
      }).then((res) => {
        if (res.success) {
          that.personData = res.obj.rows.map(i => ({
            label: i.personName,
            value: i.id,
          }))
        }
      })
    },
    fomatParams(arr, t) {
      return arr.map((it) => {
        return {
          personId: it.key,
          name: it.label,
          type: t,
        }
      })
    },
    handleSubmit() {
      const persons = [
        ...this.fomatParams(this.person1, 6),
        ...this.fomatParams(this.person2, 4),
        ...this.fomatParams(this.person3, 5),
        ...this.fomatParams(this.person4, 8),
        ...this.fomatParams(this.person5, 7),
        ...this.fomatParams(this.person6, 3),
        ...this.fomatParams(this.person7, 2),
      ]
      this.loading = true

      this.confirmLoading = true

      window.$oAjax({
        method: 'POST',
        url: 'rest/report/hyxt/saveHyxtPerson',
        data: {
          reportIds: this.selReport.map((it) => {
            return it.id
          }),
          persons,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        this.loading = false
        if (res.code === 20000) {
          message.success(res.message || res.msg || '操作成功')
          this.cancelModal()
          $emit(this, 'callback')
        }
        else {
          message.error(res.message || res.msg)
        }
        this.confirmLoading = false
      })
    },
  },
}
</script>
