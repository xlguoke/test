<template>
  <div class="flex flex-col h-full gap-2 relative">
    <ul v-if="!isSgjc" class="eq-letter absolute">
      <li
        v-for="d in uppercaseLetters"
        :key="d"
        :class="`${showLetter(d) ? 'active' : ''} letter`"
        @click="
          () => {
            scrollToLetter(d)
          }
        "
      >
        {{ d }}
      </li>
    </ul>
    <Container class="search-box">
      <img src="@/assets/images/functionRoom2/search.png" class="search-icon" />
      <input
        v-model.trim="searchValue"
        placeholder="请输入设备名称"
        class="search-input"
        @keypress.enter="onSearch"
      />
    </Container>
    <Container class="device-list">
      <div ref="scrollContainer" class="list">
        <div
          v-for="(i, index) in showData"
          :id="index === 0 || showData[index - 1].letter !== i.letter ? i.letter : ''"
          :key="i.id"
          :class="{
            item: true,
            target: index === targetIndex
          }"
          @click="handleClick(index)"
        >
          <div class="name">{{ i.name }}</div>
          <div class="sn">{{ i.equipmentSn }}</div>
          <div class="line"></div>
        </div>
      </div>
    </Container>
  </div>
</template>

<script lang="ts" setup>
import Container from "@/views/functionRoom2/components/Container.vue"
import { computed, ref, watch } from "vue"
import pinyin from "js-pinyin"
import { useStore } from "@/store"

pinyin.setOptions({ checkPolyphone: true, charCase: 1 })

const props = defineProps<{
  data: Array<any>
  currentDevice: any
}>()

const scrollContainer = ref()

const targetIndex = ref(0)

const searchValue = ref("")

const emits = defineEmits(["update:currentDevice"])

const showData = ref<any[]>(props.data)

const isSgjc = computed(() => useStore().getUnitCode() === "sgjc")

const uppercaseLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
const letters = computed(() => {
  const data = props.data.filter((d) => {
    d.letter = d.letter.toLocaleUpperCase()
    return d.letter !== "ZZZ"
  })
  const letterArr = data.map((d) => d.letter)
  return [...new Set(letterArr)]
})

function showLetter(letter: string) {
  return letters.value.includes(letter)
}

watch(
  () => props.data,
  () => {
    showData.value = props.data
  }
)

function handleClick(i: number) {
  targetIndex.value = i
  emits("update:currentDevice", showData.value[i])
}

function onSearch() {
  if (!searchValue.value) {
    showData.value = props.data
  } else {
    const val = searchValue.value.toLocaleLowerCase()
    showData.value = props.data.filter((item) => {
      const name = item.name.toLocaleLowerCase()
      const sn = item.equipmentSn.toLocaleLowerCase()
      const result = pinyin.getFullChars(name)
      const initial = result.slice(0, 1)
      return name.includes(val) || sn.includes(val) || val === initial
    })
  }
  if (showData.value.length) {
    targetIndex.value = 0
    emits("update:currentDevice", showData.value[0])
  }
}

/** 滚动到指定字母 */
function scrollToLetter(letter: string) {
  const element = document.getElementById(letter)
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}
</script>

<style lang="less" scoped>
.search-box {
  padding: 0.2rem;
  margin: 0;
  border-radius: 0.1rem;
  display: flex;
  align-items: center;
  .search-icon {
    margin-right: 0.1rem;
    width: 0.26rem;
    height: 0.24rem;
  }
  .search-input {
    flex: 1;
    width: 0;
    background-color: transparent;
    border: none;
    outline: none;
    color: #59768f;
  }
}

.eq-letter {
  top: 1rem;
  left: -0.48rem;
  bottom: 0.1rem;
  font-size: 0.28rem;
  text-align: center;
  overflow-y: auto;
  .letter {
    padding: 0.02rem 0.1rem;
    opacity: 0.3;
    &.active {
      opacity: 1;
    }
  }
}

.device-list {
  flex: 1;
  height: 0;
  display: flex;
  padding: 0;
  margin: 0;
  overflow: hidden;

  .list {
    flex: 1;
    overflow-y: auto;
    .item {
      position: relative;
      cursor: pointer; // 添加鼠标指针样式以提示可点击
      width: 100%;
      padding: 0.2rem 0.14rem;
      word-break: break-all;
      font-size: 0.24rem;
      line-height: 0.32rem;
      text-align: center;
      transition: all 0.3s;

      &.target {
        color: #fff;
        background-color: #0066ec;
      }
      .line {
        position: absolute;
        bottom: -0.01rem;
        left: 0;
        right: 0;
        height: 0.01rem;
        background-color: #fff;
        width: calc(100% - 0.28rem);
        margin: 0 auto;
      }
    }
  }
}
</style>
