<template>
  <van-popup v-model:show="pickerModel" v-bind="$attrs" position="bottom">
    <van-picker
      show-toolbar
      :columns="columns"
      v-bind="$attrs"
      :close-on-popstate="true"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </van-popup>
</template>

<script>
export default {
  name: 'VSelect',
  props: {
    value: {
      type: [Array, String, Number, Boolean],
      default: null,
    },
    columns: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:value', 'confirm', 'cancel'],
  data() {
    return {
      pickerModel: false,
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.pickerModel = val
    },
    pickerModel(val, oldVal) {
      if (val !== oldVal && !val) {
        this.$emit('update:value', false)
      }
    },
  },
  mounted() {
    this.pickerModel = this.value
  },
  methods: {
    onConfirm({ selectedOptions, selectedIndexes }) {
      const val = selectedOptions[0]
      const index = selectedIndexes[0]
      this.$emit('update:value', false)
      this.$emit('confirm', val, index)
    },
    onCancel() {
      this.$emit('update:value', false)
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="less" scoped>
.select-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  .input {
    flex: 1;
    overflow: hidden;
    width: 100%;
    height: 100%;
    border: none;
    box-sizing: border-box;
    color: #333;
    &::placeholder {
      opacity: 0.55;
    }
  }
}
</style>
