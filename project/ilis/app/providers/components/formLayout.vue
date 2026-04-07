<template>
  <div>
    <a-row :gutter="formLayout ? formLayout.gutter || 0 : 0">
      <a-col
        v-for="item in dataSource"
        :key="item.field"
        :span="formLayout ? formLayout.span || 24 : 24"
      >
        <a-form-item
          v-if="item.field !== 'copyTo' || (item.field === 'copyTo' && !readonly)"
          :label="item.name"
          :label-col="{ span: formLayout.labelCol }"
          :wrapper-col="{ span: formLayout.wrapperCol }"
          :rules="item.rules
            ? [{ required: true, message: `${item.name}为必填项!` }]
            : undefined"
          :name="item.field"
        >
          <span v-if="item.type === 'input'">
            <div v-if="item.field === 'copyTo'" style="display: flex;align-items: center;">
              <a-input
                v-model:value="_formState[item.field]"
                style="display: none;"
              />
              <div class="ant-input" style="min-height: 30px;line-height: 30px;height:auto;">
                <span v-if="copyToUsers.length === 0" style="color:#bbb;">请选择{{ item.name }}</span>
                <a-tag v-for="(u, i) in copyToUsers" :key="u.id" closable @close="copyToUsers.splice(i, 1)">{{ u.realName }}</a-tag>
              </div>
              <a-button type="primary" style="margin-left: 8px;" @click="chooseUser">选择</a-button>
            </div>

            <a-input
              v-else
              v-model:value="_formState[item.field]"
              :disabled="readonly"
              :placeholder="`请输入${item.name}`"
              style="width: 100%"
            />
          </span>
          <span v-else-if="item.type === 'select'">
            <a-select
              v-model:value="_formState[item.field]"
              :disabled="readonly"
              :placeholder="`请选择${item.name}`"
              style="width: 100%"
            >
              <a-select-option
                v-for="(comItem, index) in item.data"
                :key="index"
                :value="comItem[item.dataField.value]"
              >
                {{ comItem[item.dataField.name] }}
              </a-select-option>
            </a-select>
          </span>
          <span v-else-if="item.type === 'radio'">
            <a-radio-group
              v-model:value="_formState[item.field]"
              :disabled="readonly"
              :name="item.field"
            >
              <a-radio
                v-for="(comItem, index) in item.data"
                :key="index"
                :value="comItem.value"
              >
                {{ comItem.name }}
              </a-radio>
            </a-radio-group>
          </span>
          <span v-if="item.type === 'date'">
            <a-date-picker
              v-model:value="_formState[item.field]"
              :disabled="readonly"
              :placeholder="`请选择${item.name}`"
              style="width: 100%"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </span>
          <span v-if="item.type === 'inputNumber'">
            <a-input-number
              v-model:value="_formState[item.field]"
              :disabled="readonly"
              :placeholder="`请输入${item.name}`"
              style="width: 100%"
            />
          </span>
        </a-form-item>
      </a-col>
    </a-row>

    <TableTreePersonnel ref="tableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import TableTreePersonnel from './tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
  },
  props: ['dataSource', 'formLayout', 'readonly', 'formState', 'copyToUserList'],
  data() {
    return {
      dayjs,
      copyToUsers: [],
    }
  },
  computed: {
    _formState() { return this.formState },
    copyToUsersStr() {
      return JSON.stringify(this.copyToUsers)
    },
  },
  watch: {
    copyToUserList: {
      handler(list) {
        if (list) {
          this.copyToUsers = list.map((d) => {
            return {
              ...d,
              value: d.id,
              label: d.userName,
            }
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    chooseUser() {
      this.$refs.tableTreePersonnel.showModal()
    },
    getPerson(_ids, users) {
      const selIds = this.copyToUsers.map(d => d.id)
      for (let i = 0; i < users.length; i++) {
        const u = users[i]
        if (selIds.includes(u.id))
          continue
        this.copyToUsers.push({
          id: u.id,
          userName: u.account,
          realName: u.name,
          value: u.id,
          label: u.userName,
        })
      }
    },
  },
}
</script>

<style scoped>
.ant-tag{
  line-height: 30px;
}
</style>
