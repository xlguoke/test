<template>
  <ACard
    :head-style="{
      'position': 'sticky',
      'top': 0,
      'background': 'white',
      // ant-checkbox has z-index 1
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
    <Options :id :name @option-change="onOptionChange" />
  </ACard>
  <Transition name="fade" :duration="500">
    <div
      v-if="changes > 0"
      data-test="option-changes"
      class="p-5 bg-slate-50 w-full bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 sticky bottom-0"
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
</template>

<script setup lang="ts">
import { Eraser } from 'lucide-vue-next'
import { message, notification } from 'ant-design-vue'
import Options from './Options.vue'
import { clearUdrTemplateCache, saveChanges } from './settings'

export interface Props {
  catalog: { id: string, name: string }[]
}

const props = defineProps<Props>()

const options = props.catalog.map(it => it.name)

const option = props.catalog.reduce((acc, item) => {
  acc[item.name] = item.id
  return acc
}, {} as { [key: string]: string })

const name = ref(options[0])
const id = computed(() => option[name.value])

const optionChanges = ref<{ [key: string]: string | undefined }>({})
const changes = computed(() => Object.keys(optionChanges.value).length)

function onOptionChange(id: string, val: string | undefined, prev: string | undefined) {
  // eslint-disable-next-line eqeqeq
  if (val == prev) {
    delete optionChanges.value[id]
  }
  else {
    optionChanges.value[id] = val
  }
}

function save() {
  saveChanges(optionChanges.value)
    .then(() => {
      message.success('保存成功')
        .then(() => {
          optionChanges.value = {}
          location.reload()
        })
    })
    .catch((err) => {
      notification.error({ message: '保存失败' })
      console.error(err)
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
