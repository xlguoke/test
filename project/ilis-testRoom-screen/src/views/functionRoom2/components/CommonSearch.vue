<template>
  <div class="common-search">
    <van-field v-model="value" :placeholder="placeholder" @keyup.enter="handleSearch" />
    <div>
      <div class="button" @click="handleSearch">搜索</div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: "请输入搜索内容"
  }
)

const value = defineModel<string>()

const emits = defineEmits<{
  (e: "search", val?: string): void
}>()

function handleSearch() {
  emits("search", value.value)
}
</script>

<style scoped lang="less">
.common-search {
  display: flex;
  column-gap: 0.24rem;
  margin-bottom: 0.24rem;

  :deep(.van-field) {
    border: 1px solid #ffffff;
    border-radius: 0.12rem;
    background: rgba(255, 255, 255, 0.3);
    .van-field__control {
      color: #224059;
    }
    input::placeholder {
      color: #59768f;
    }
  }
  :deep(.van-cell) {
    &::after {
      border: unset;
    }
  }
  :deep(.van-field__body) {
    height: 100% !important;
  }

  .button {
    white-space: nowrap;
    height: 100%;
    border-radius: 0.12rem;
    padding: 0.18rem 0.38rem;
    background: #0066ec;
    box-sizing: border-box;
    border: 1px solid #ffffff;
    cursor: pointer;
    color: #fff;
    font-size: 28px;
    &:active {
      opacity: 0.8;
    }
  }
}
</style>
