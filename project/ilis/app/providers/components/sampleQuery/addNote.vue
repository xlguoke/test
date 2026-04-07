<template>
  <div>
    <ht-modal
      title="添加附注"
      centered
      :open="value"
      width="500px"
      :confirm-loading="loading"
      :mask-closable="false"
      @cancel="onCancel"
      @ok="submit"
    >
      <div>
        <a-input v-model:value="note"></a-input>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: ['value'],
  emits: ['save-success', 'update:value'],
  data() {
    return {
      note: '',
      id: '',
      loading: false,
    }
  },
  watch: {
    record() {
      // let data = JSON.parse(newVal || "{}");
      // this.id = data.id;
      // if (data && data.attributes) {
      //   this.note = data.attributes.sampleNote;
      // } else {
      //   this.note = "";
      // }
    },
  },
  // props: ["value", "record"],
  methods: {
    async submit() {
      this.loading = true
      const res = await window.$oAjax({
        method: 'POST',
        url: window.$oApi.selectSample.addSampleNote,
        data: {
          id: this.id,
          sampleNote: this.note,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
      this.loading = false

      if (res.code === 20000) {
        $emit(this, 'save-success', {
          id: this.id,
          sampleNote: this.note,
        })
        this.onCancel()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
    onCancel() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.note = ''
        this.id = ''
      })
    },
    showModal(newVal) {
      const data = JSON.parse(newVal || '{}')
      this.id = data.id
      if (data && data.attributes) {
        this.note = data.attributes.sampleNote
      }
      else {
        this.note = ''
      }
    },
  },
}
</script>
