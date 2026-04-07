<template>
  <div style="padding: 15px 0">
    <div v-if="editing">
      <WangEditor v-model:value="data.workRecord"></WangEditor>
    </div>
    <div v-show="!editing">
      <div id="workRecord"></div>
    </div>
    <div style="padding-top: 10px">
      <a-button v-if="!editing" @click="edit">
        编辑
      </a-button>
      <a-button v-if="editing" type="primary" @click="handleSubmit">
        保存
      </a-button>
      <a-button v-if="editing" @click="cancelModal">
        取消
      </a-button>
    </div>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import WangEditor from '~/providers/components/wangEditor/WangEditor.vue'

export default {
  components: {
    WangEditor,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      data: {
        workRecord: '',
      },
      editing: false,
    }
  },
  created() {
    this.getDetailInfo()
  },
  methods: {
    getDetailInfo() {
      window.$oAjax
        .get(window.$oApi.biddingPerson.personDetail, {
          params: { id: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.data = res.obj
            document.getElementById('workRecord').innerHTML
              = this.data.workRecord || ''
          }
        })
    },
    handleSubmit() {
      this.confirmLoading = true

      const workRecord = this.data.workRecord || ''

      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingPerson.person}`,
        data: {
          workRecord,
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then(
        (res) => {
          if (res && res.success) {
            this.cancelModal()
            this.editing = false
            message.success(res.message || res.msg)
            this.getDetailInfo()
          }
          else {
            message.error(res.message || res.msg)
          }
          this.confirmLoading = false
        },
        () => {
          this.confirmLoading = false
        },
      )
    },
    edit() {
      this.editing = !this.editing
    },
    cancelModal() {
      this.editing = false
    },
  },
}
</script>
