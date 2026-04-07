<template>
  <div class="h-full overflow-y-scroll">
    <ACard
      :head-style="{
        'position': 'sticky',
        'top': 0,
        // ant-checkbox has z-index 1
        'background': 'var(--colorBgContainer)',
        'z-index': 2,
      }"
    >
      <template #title>
        <div class="flex justify-between">
          <ASegmented v-model:value="name" class="font-medium" :options />
          <AButton type="primary" disabled>
            新增设置
          </AButton>
        </div>
      </template>
      <ASpin :spinning="spinning">
        <Options :id="id" :key="reloadKey" :name="name" @option-change="onOptionChange" />
      </ASpin>
    </ACard>
    <Transition name="fade" :duration="500">
      <div
        v-if="changes > 0"
        data-test="option-changes"
        class="p-5 bg-[var(--colorBgContainer)] w-full bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-[var(--border-color)] sticky bottom-0"
      >
        <AButton
          type="primary"
          @click="save"
        >
          保存更改（{{ changes }}）
        </AButton>
        <ADivider type="vertical" />
        <AButton @click="() => optionChanges = {}">
          取消
        </AButton>
      </div>
    </Transition>
    <AFloatButton
      type="primary"
      tooltip="UDR模板刷新"
      @click="() => {
        clearUdrTemplateCache()
          .then(() => message.success('清理成功'))
          .catch((err) => {
            notification.error({ message: '清理失败', description: '请将请求ID发送给管理员' })
            console.error(err)
          })
      }"
    >
      <template #icon>
        <Eraser />
      </template>
    </AFloatButton>
  </div>
</template>

<script setup lang="ts">
import { message, notification } from 'ant-design-vue'
import { Eraser } from 'lucide-vue-next'
import { useIndustryStore } from '~/store/industryStore'
import Options from './Options.vue'
import { clearUdrTemplateCache, saveChanges } from './settings'

export interface Props {
  catalog: { id: string, name: string }[]
}

const props = defineProps<Props>()

const { term } = useIndustryStore()

const options = computed(() => props.catalog.map(it => term(it.name)))

const spinning = ref(false)
const option = computed(() => {
  return props.catalog.reduce((acc, item) => {
    acc[term(item.name)] = item.id
    return acc
  }, {} as { [key: string]: string })
})
const name = ref(options.value[0])
const id = computed(() => option.value[name.value])

// 添加reloadKey用于强制重新加载Options组件，更新数据状态
const reloadKey = ref(0)

const optionChanges = ref<{ [key: string]: string | undefined }>({})
const changes = computed(() => Object.keys(optionChanges.value).length)

function onOptionChange(id: string, val: string | undefined, prev: string | undefined) {
  if (val == prev) {
    delete optionChanges.value[id]
  }
  else {
    optionChanges.value[id] = val
  }
}

function save() {
  spinning.value = true
  saveChanges(optionChanges.value)
    .then(() => {
      optionChanges.value = {}
      setTimeout(() => {
        reloadKey.value++
        spinning.value = false
        message.success('保存成功')
      }, 500)
    })
    .catch((err) => {
      notification.error({ message: '保存失败' })
      console.error(err)
      spinning.value = false
    })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-leave-active {
  transition-delay: 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
/* this is why I give a hehe about ant-* */
:deep(.ant-float-btn-icon) {
  width: unset!important;
}
</style>
