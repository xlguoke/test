<template>
  <div class="search-wrap">
    <input
      v-model.trim="queryParam"
      type="text"
      :placeholder="placeholder"
      class="search font-ys"
      @input="changeInput"
      @keypress.enter="query"
    />
    <span class="search-btn" @click="query">查询</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "请输入关键字查询"
  }
})
const emits = defineEmits(["search", "update:modelValue"])

const queryParam = ref(props.modelValue)

const changeInput = () => {
  emits("update:modelValue", queryParam.value)
}
const query = () => {
  emits("search", queryParam.value)
}
</script>

<style lang="less" scoped>
.search-wrap {
  margin: 0.2rem 0.38rem;
  height: 0.6rem;
  line-height: 0.6rem;
  display: flex;
  align-items: center;

  .search {
    padding: 0 0.1rem;
    height: 100%;
    background-color: transparent;
    border: none;
    outline: none;
    flex: 1;
    color: #7bb0ff;
    letter-spacing: 0;
    font-size: 0.34rem;
    border: 1px solid #7bb0ff;
    box-sizing: border-box;
    width: 0;
  }

  .search-btn {
    width: 1.22rem;
    height: 100%;
    text-align: center;
    border: 1px solid #0084ff;
    background: linear-gradient(90deg, rgba(24, 143, 255, 0.1) 0%, rgba(24, 143, 255, 0.3) 100%);
    box-shadow: inset 0px 0px 8px 0px #0084ff;
    font-size: 0.24rem;
    color: #ffffff;
    font-weight: 500;
    box-sizing: border-box;
    margin-left: 0.16rem;
  }

  ::-webkit-input-placeholder {
    /* WebKit browsers */
    color: #7bb0ff;
  }

  :-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #7bb0ff;
  }

  ::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #7bb0ff;
  }

  :-ms-input-placeholder {
    /* Internet Explorer 10+ */
    color: #7bb0ff;
  }
}
</style>
