<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps({
  value: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change'])
const selectOption = ref()
const show = ref(false)

function selectedOpt(e: any) {
  show.value = false
  emit('change', e.target.textContent.trim())
}

async function hideOther() {
  const els = document.querySelectorAll('.select-option.show')
  els.forEach(el => el.classList.remove('show'))
}

async function toggleShow() {
  const isShow = selectOption.value.classList.contains('show')
  show.value = false
  await hideOther()
  show.value = !isShow
}

onMounted(() => {
  const box = document.querySelector('.eq-use-record') as HTMLElement
  box.onclick = () => {
    hideOther()
  }
})
</script>

<template>
  <div class="cell-select">
    <div class="select-value" @click.stop="toggleShow">
      <span class="text">{{ value }}</span>
      <van-icon class="arrow" name="play" />
    </div>
    <ul
      ref="selectOption"
      class="select-option"
      :class="{ show }"
      @click="selectedOpt"
    >
      <li :class="{ active: value === '正常' }">
        正常
      </li>
      <li :class="{ active: value === '不正常' }">
        不正常
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
.cell-select {
  position: relative;
  .select-value {
    display: flex;
    align-items: center;
  }

  .text {
    flex: 1;
    width: 0;
    text-align: center;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .select-option {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    min-width: 9rem;
    padding: 0.2rem 0;
    background-color: #fff;
    border-radius: 0.6rem;
    box-shadow: 2px 4px 8px 0px #c6dcf1;
    z-index: 10;
    line-height: 20px;
    white-space: nowrap;
    overflow: hidden;
    display: none;

    &.show {
      display: block;
    }

    li {
      padding: 1rem 1.6rem;
      &.active {
        color: #fff;
        background-color: #0066ec;
      }
    }
  }
}
</style>
