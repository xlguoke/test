<!-- eslint-disable vue/valid-v-for -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <a-form ref="formRef" layout="inline" style="margin-bottom: 4px">
    <a-form-item v-show="queryTab == 1">
      <a-range-picker
        v-model:value="form.sendDate"
        :disabled-date="disabledDate"
        value-format="YYYY-MM-DD"
        style="width: 220px"
        :placeholder="['请选择发送日期', '请选择发送日期']"
        @change="queryData"
      />
    </a-form-item>
    <a-form-item v-show="queryTab == 2">
      <a-select
        v-model:value="form.templateId"
        placeholder="请选择短信名称"
        style="width: 160px"
        allow-clear
        @change="queryData"
      >
        <a-select-option v-for="d in noteList" :value="d.id">
          {{
            d.name
          }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-if="queryTab == 1">
      <a-select
        v-model:value="form.sentStatus"
        placeholder="请选择发送状态"
        style="width: 160px"
        allow-clear
        @change="queryData"
      >
        <a-select-option value="SUCCESS">
          发送成功
        </a-select-option>
        <a-select-option value="FAIL">
          发送失败
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-input
        v-model:value.trim="form.phone"
        placeholder="请输入手机号"
        allow-clear
        style="width: 180px"
        :max-length="50"
        @keyup.enter="queryData"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="queryData">
        查询
      </a-button>
      <a-button @click="resetQuery">
        重置
      </a-button>
    </a-form-item>
    <a-form-item v-show="queryTab == 2" style="float: right">
      <a-button
        v-for="d in queryDays"
        :key="d"
        :type="`${activeDay == d ? 'primary' : ''}`"
        @click="changeDay(d)"
      >
        近{{ d }}天
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import dayjs from 'dayjs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const queryDays = [10, 30, 60]
export default {
  props: {
    // 标签页：1-发送记录 2-数据走势
    queryTab: {
      type: [String, Number],
      default: 1,
    },
  },
  emits: ['query'],
  data() {
    return {
      form: {},
      activeDay: queryDays[0],
      queryDays,
      noteList: [],
    }
  },
  mounted() {
    this.resetQuery()
    if (this.queryTab == 2) {
      this.getNoteList()
    }
  },
  methods: {
    // 仅支持选择60天内的日期
    disabledDate(current) {
      const toDay = dayjs().endOf('day')
      const startT = dayjs(toDay).subtract(59, 'days')
      return (current && current > toDay) || current < startT
    },
    queryData() {
      const par = { ...this.form }
      if (par.sendDate && par.sendDate.length) {
        par.startDate = par.sendDate[0]
        par.endDate = par.sendDate[1]
      }

      if (this.queryTab == 2) {
        const toDay = dayjs().endOf('day')
        const startT = dayjs(toDay).subtract(this.activeDay - 1, 'days')
        par.startDate = startT.format('YYYY-MM-DD')
        par.endDate = toDay.format('YYYY-MM-DD')
      }
      delete par.sendDate
      par.phone = par.phone ? encodeURI(par.phone) : ''
      $emit(this, 'query', par)
    },
    resetQuery() {
      const day = this.queryTab == 1 ? 60 : this.activeDay
      const toDay = dayjs().endOf('day').format('YYYY-MM-DD')
      const startT = dayjs(toDay)
        .subtract(day - 1, 'days')
        .format('YYYY-MM-DD')
      this.form = {
        sendDate: [startT, toDay],
      }
      this.queryData()
    }, // 数据走势 - 查询周期
    changeDay(d) {
      this.activeDay = d
      this.queryData()
    },
    getNoteList() {
      window.$oAjax({
        url: '/rest/sms/template/pagination',
        method: 'GET',
        params: {
          page: 1,
          size: 9999,
        },
      })
        .then((res) => {
          if (res.code !== 20000) {
            return console.error('获取短信列表：', res)
          }
          this.noteList = res.data.rows || []
        })
        .catch((err) => {
          console.error('获取短信列表：', err)
        })
    },
  },
}
</script>

<style>
.ant-input-number-handler-wrap {
  display: none;
}
</style>
