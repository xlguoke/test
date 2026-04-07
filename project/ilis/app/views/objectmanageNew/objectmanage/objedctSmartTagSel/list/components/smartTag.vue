<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="flex-1">
    <a-flex>
      <a-select
        v-model:value="type"
        placeholder="请选择"
        class="flex-1 mr-2"
        @change="
          (e) => {
            handleChange(e, 'intelligence')
          }
        "
      >
        <a-select-option key="2" value="二维码编号">
          二维码编号
        </a-select-option>
        <a-select-option key="3" value="RFID编号">
          RFID编号
        </a-select-option>
        <a-select-option key="1" value="标签编号">
          标签编号
        </a-select-option>
      </a-select>
      <a-input
        id="scanCode_"
        ref="scanCode_"
        v-model:value="typeValue"
        :placeholder="type === '标签编号' ? '请输入' : '请扫码'"
        autocomplete="off"
        class="flex-1"
        @change="(e) => handleChange(e.target.value, 'typeValue')"
      />
    </a-flex>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
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
      type: '二维码编号',
      typeValue: '',
      modalPage: getQueryVariable('modalPage'),
      outsidePage: false,
      outsideId: '',
    }
  },
  computed: {},
  created() {
    const type = localStorage.getItem('rfidType')
    this.type = type ? JSON.parse(type) : '二维码编号'
  },
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
      if (this.type !== '标签编号' && this.typeValue) {
        $emit(this, 'setData', {
          type: this.type,
          typeValue: this.typeValue,
          id: this.id,
        })
      }
      localStorage.setItem('rfidType', JSON.stringify(this.type))
    },
    save() {
      if (this.outsidePage) {
        return { type: this.type, typeValue: this.typeValue, id: this.id }
      }
    },
    handleOk() {
      $emit(this, 'setData', {
        type: this.type,
        typeValue: this.typeValue,
        id: this.id,
      })
    },
    clearInput() {
      this.typeValue = ''
    },
  },
}
</script>

<style lang="less"></style>
