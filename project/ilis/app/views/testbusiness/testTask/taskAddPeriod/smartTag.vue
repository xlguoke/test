<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <div style="width: 100%; display: flex">
      <a-select
        v-model:value="type"
        style="width: 50%"
        placeholder="请选择"
        @change="
          (e) => {
            handleChange(e, 'intelligence')
          }
        "
      >
        <a-select-option key="1" value="二维码">
          二维码
        </a-select-option>
        <a-select-option key="2" value="RFID编号">
          RFID编号
        </a-select-option>
        <a-select-option key="3" value="标签编号">
          标签编号
        </a-select-option>
      </a-select>
      <a-input
        id="scanCode_"
        ref="scanCode_"
        v-model:value="typeValue"
        style="width: 50%"
        placeholder="请扫码或输入"
        @change="(e) => handleChange(e.target.value, 'typeValue')"
      />
    </div>
    <!-- <div style="padding-top:10px;"> -->
    <!-- <a-button type="primary" style="margin-right:5px;" @click="save">保存</a-button> -->
    <!-- </div> -->
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  components: {},
  props: ['id'],
  emits: ['setData'],
  data() {
    return {
      dayjs,
      loading: false,
      type: '二维码',
      typeValue: '',
      modalPage: getQueryVariable('modalPage'),
      outsidePage: false,
      outsideId: '',
    }
  },
  computed: {},
  created() {},
  mounted() {
    if (this.modalPage && this.modalPage == 'objectmanageReceive') {
      this.outsidePage = true
    }
    document.getElementById('scanCode_').focus()
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    window.GetResultObj = (layerI, successFunc) => {
      successFunc(layerI, self.save())
    }
  },
  methods: {
    getData(flag) {
      this.visible = false
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      const { page, size } = this
      const params = {
        page,
        rows: size,
      }
      this.loading = true
      window.$oAjax({
        url: window.$oApi.equipRent.list,
        method: 'POST',
        data: qs.stringify(params),
      }).then((res) => {
        if (res && res.total >= 0) {
          this.data = res.rows
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.data = []
        }
        this.loading = false
      })
    },
    handleChange(value, title) {
      if (title == 'intelligence') {
        document.getElementById('scanCode_').focus()
        // 调接口输入
      }
      // eslint-disable-next-line ts/no-unused-expressions
      this.outsidePage
        ? ''
        : $emit(this, 'setData', {
            type: this.type,
            typeValue: this.typeValue,
            id: this.id,
          })
    },
    save() {
      if (this.outsidePage) {
        return { type: this.type, typeValue: this.typeValue, id: this.id }
      }
    },
  },
}
</script>

<style lang="less"></style>
