<template>
  <div class="edit-cell">
    <ul class="data-list">
      <li
        v-for="con in dataList"
        :key="con.baseStandardId"
        :class="`${con.isExpire ? 'expire' : ''}`"
      >
        {{ con.name }}
        <span v-if="con.publishCode">（{{ con.publishCode }}）</span>
        <span v-if="con.clauseCode && showClauseCode" class="blue">{{
          con.clauseCode
        }}</span>
      </li>
    </ul>
    <p v-if="isEdit" class="edit-icon" @click="clickEdit">
      <EditOutlined />
    </p>
  </div>
</template>

<script>
import { EditOutlined } from '@ant-design/icons-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'EditCell',
  components: {
    EditOutlined,
  },
  props: ['list', 'isEdit', 'showClauseCode'],
  emits: ['edit'],
  data() {
    return {
      dataList: this.list,
    }
  },
  watch: {
    list: {
      deep: true,
      immediate: true,

      handler(val) {
        this.dataList = val
      },
    },
  },
  methods: {
    clickEdit() {
      $emit(this, 'edit')
    },
  },
}
</script>

<style lang="less" scoped>
.edit-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover .edit-icon {
    opacity: 1;
  }
  .data-list {
    flex: 1;
  }
  .edit-icon {
    width: 30px;
    height: 30px;
    text-align: right;
    opacity: 0;
    transition: 0.2s;
    font-size: 20px;
    &:hover {
      color: #18aeff;
    }
  }
  .expire {
    /*color:red;*/
  }
}
</style>
