<template>
  <div class="select-wrap">
    <input
      v-model="inputValue"
      class="input"
      type="text"
      readonly
      :placeholder="placeholder"
      @click.stop="select"
    />
    <slot name="right">
    </slot>
    <van-popup v-model:show="selectPicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="columns"
        v-bind="$attrs"
        @confirm="onConfirm"
        @cancel="onCancel"
      />
    </van-popup>
  </div>
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
    placeholder: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value', 'confirm', 'cancel'],
  data() {
    return {
      inputValue: '',
      selectPicker: false,
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.inputValue = val
    },
  },
  mounted() {
    this.inputValue = this.value
  },
  methods: {
    select() {
      if (this.disabled) {
        return
      }
      this.selectPicker = true
    },
    onConfirm({ selectedOptions, selectedIndexes }) {
      const val = selectedOptions[0]
      const index = selectedIndexes[0]
      this.inputValue = val
      this.selectPicker = false
      this.$emit('update:value', val)
      this.$emit('confirm', val, index)
    },
    onCancel() {
      this.selectPicker = false
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
