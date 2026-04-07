<template>
  <ht-modal
    title="请选择骑缝章"
    width="640px"
    :open="value"
    :closable="false"
    :mask-closable="false"
    :confirm-loading="confirmLoading"
    @ok="submit"
    @cancel="cancel"
  >
    <a-checkbox-group
      v-model:value="sealIds"
      style="width: 100%; min-height: 260px"
    >
      <a-row>
        <a-col v-for="item in sealList" :key="item.id" :span="8">
          <a-checkbox :value="item.id">
            {{ item.name }}
          </a-checkbox>
        </a-col>
      </a-row>
    </a-checkbox-group>
  </ht-modal>
</template>

<script>
import { CrossPageSealReportService } from '~/providers/providers/services/crossPageSealReport'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const crossPageSealReportService = new CrossPageSealReportService()

export default {
  props: ['value', 'reportIds'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      noticeContent: '',
      confirmLoading: false,
      sealList: [],
      sealIds: [],
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.getSeals()
      }
      else {
        this.sealList = []
        this.sealIds = []
      }
    },
  },
  methods: {
    async getSeals() {
      const res = await crossPageSealReportService.reportSealList(
        this.reportIds.join(','),
      )
      const data = res.data
      this.sealList = data
      this.sealIds = data.filter(i => i.selected == '1').map(j => j.id)
    },
    async submit() {
      this.confirmLoading = true
      // eslint-disable-next-line unused-imports/no-unused-vars
      const res = await crossPageSealReportService
        .saveReportSeal({
          reportIds: this.reportIds,
          sealIds: this.sealIds,
        })
        .finally(() => {
          this.confirmLoading = false
        })

      window.$oAntdMessage.success('操作成功！')
      $emit(this, 'on-success')
      this.cancel()
    },
    cancel() {
      $emit(this, 'update:value', false)
    },
  },
}
</script>
