<template>
  <div>
    <div
      style="
        margin: 10px;
        border: 1px solid red;
        padding: 10px;
        background: rgba(0, 0, 0, 0.3);
      "
    >
      <h1>Hello页面</h1>
      <p>{{ message }}</p>
      <p>{{ mesFather }}</p>
      子组件输入框：<input
        v-model="inputValue"
        type="text"
        placeholder="请输入..."
        @keydown.enter="enterFn"
      />
      输入元素伪：{{ inputValue }}
      <button @click="enterFn">
        enterFn
      </button>
    </div>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'HelloDemo',
  props: ['mesFather'],
  emits: ['valueUp'],
  data() {
    return {
      message: '我是Hello本页面展示信息',
      inputValue: '', // 添加inputValue,用户输入绑定到inputValue变量，从而获取用户输入
    }
  },
  methods: {
    enterFn() {
      $emit(this, 'valueUp', this.inputValue)
      // 子组件发射自定义事件valueUp, 并携带要传递给父组件的值
      // 如果要传递给父组件很多值，这些值要作为参数依次列出 如 this.$emit('valueUp', this.inputValue, this.mesFather);
    },
  },
}
</script>

<style scoped></style>
