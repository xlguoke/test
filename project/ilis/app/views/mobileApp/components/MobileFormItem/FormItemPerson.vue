<template>
  <div>
    <van-field
      readonly
      label-align="left"
      input-align="right"
      center
      :model-value="personList.map(i => i.name).join(',')"
      v-bind="$attrs"
    >
      <template #input>
        <span v-if="!personList.length && !disabled" class="text-[#ccc]">请选择</span>
        <div class="flex gap-2 flex-wrap justify-end">
          <van-tag
            v-for="item in personList"
            :key="item.id"
            :closeable="!disabled"
            size="medium"
            type="primary"
            color="#5ba6ec"
            @close="onClose(item)"
          >
            {{ item.name }}
          </van-tag>
        </div>
      </template>

      <template v-if="!disabled" #right-icon>
        <van-button
          size="small"
          plain
          hairline
          type="primary"
          @click="open = true"
        >
          选择
        </van-button>
      </template>
    </van-field>

    <MobilePersonSelector
      v-if="!disabled"
      v-model:open="open"
      :enable-multiple="enableMultiple"
      :person-data-source="personDataSource"
      :active-ids="personList.map(i => i.id)"
      @select="getPerson"
    />
  </div>
</template>

<script setup lang='ts'>
import type { PersonDTO } from '~/views/mobileApp/components/MobileFormItem/MobileFormItemInterface.ts'
import MobilePersonSelector from '~/views/mobileApp/components/MobileSelector/MobilePersonSelector.vue'

interface PersonItem {
  id: string
  name: string
  account: string
}

const props = defineProps({
  value: Object as PropType<PersonItem[]>,
  enableMultiple: Boolean,
  personDataSource: [Object, Function] as PropType<PersonDTO | (() => Promise<PersonDTO[]>)>,
})

const emits = defineEmits(['update:value', 'select'])

const attrs = useAttrs()

const personList = computed({
  get() {
    return props.value || []
  },
  set(val) {
    emits('update:value', val)
  },
})

const enableMultiple = computed(() => props.enableMultiple)

const disabled = computed(() => attrs.readonly || attrs.disabled)

const open = ref(false)

function onClose(item: PersonItem) {
  personList.value = personList.value.filter(i => i.id !== item.id)
}

function getPerson(rows: PersonItem[]) {
  personList.value = rows
  emits('select', rows)
}
</script>
