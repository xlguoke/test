<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <van-cell-group>
      <van-field
        v-model="data.repairContacts"
        placeholder="请选择"
        readonly
        input-align="right"
      >
        <template #label>
          <i class="red" style="margin-right: 8px">*</i>联系人
        </template>
        <template v-if="!readonly" #button>
          <van-button
            size="small"
            plain
            type="primary"
            @click="selectPersonVisible = true"
          >
            选择
          </van-button>
        </template>
      </van-field>

      <FormItemDate
        v-model:value="data.contactTime"
        label="维修联系时间"
        :placeholder="placeholder"
      />

      <van-field
        v-model="data.contactDetail"
        label="维修联系情况"
        :placeholder="placeholder"
        :rows="1"
        autosize
        type="textarea"
        input-align="right"
        :readonly="readonly"
      />
    </van-cell-group>

    <SelectPerson
      v-model:value="selectPersonVisible"
      @selected-ok="getPerson"
    />
  </div>
</template>

<script>
// eslint-disable vue/no-mutating-props
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: {
    FormItemDate,
    SelectPerson,
  },
  props: ['data', 'detailData', 'readonly'],
  emits: ['update:formData'],
  data() {
    return {
      labelWidth: '6em',
      selectPersonVisible: false,
    }
  },
  computed: {
    placeholder() {
      return !this.readonly ? '请输入' : ''
    },
  },
  watch: {
    data: {
      handler(val) {
        $emit(this, 'update:formData', val)
      },
      deep: true,
    },
  },
  created() {},
  methods: {
    getPerson(rows) {
      const row = rows[0]
      // eslint-disable-next-line vue/no-mutating-props
      this.data.repairContactsId = row.id
      // eslint-disable-next-line vue/no-mutating-props
      this.data.repairContacts = row.name
    },
  },
}
</script>
