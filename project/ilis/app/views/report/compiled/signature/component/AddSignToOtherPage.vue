<template>
  <HtModal
    v-model:open="showDialog"
    title="应用到其他页"
    :after-close="onClosed"

    @ok="onOk"
  >
    <a-space direction="vertical" style="width: 100%;">
      <BaseTitle>签字项</BaseTitle>
      <a-checkbox
        v-model:checked="state.checkAll"
        :indeterminate="state.indeterminate"
        @change="onCheckAllChange"
      >
        全选
      </a-checkbox>
      <a-checkbox-group v-model:value="state.checkedList" :options="signItemOptions" option-label-prop="label" option-value-prop="value" />
      <BaseTitle class="mt-3">
        应用范围
      </BaseTitle>
      <a-radio-group v-model:value="usedType" :options="usedTypeOptions" option-label-prop="label" option-value-prop="value" />
      <div v-if="usedType === 'RANGE'">
        <a-textarea v-model:value.trim="pageRange" :rows="4" placeholder="请输入页码，或者页面范围" />
        <div class="text-[#8a8a8a]">
          <div>请输入页码,或者页面范围</div>
          <div class="flex w-full">
            <div>例如：</div>
            <div class="flex-1">
              <div>
                <span class="inline-block w-[60px] mr-2">3,5,6</span>
                <span>指定某一页或多页</span>
              </div>
              <div>
                <span class="inline-block w-[60px] mr-2">5- </span>
                <span>第5页及其以后的页</span>
              </div>
              <div>
                <span class="inline-block w-[60px] mr-2">5-7 </span>
                <span>第5页至第7页</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-space>
  </HtModal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { message } from 'ant-design-vue'
import { SignPostionConfigEntity } from '../SignPostionConfigEntity'
import { parsePageRange, validatePageRange } from './utils/pageRangeUtils'

interface IProps {
  /** # 待应用的签名项 */
  signItems: SignPostionConfigEntity[]
  /** # 总页数 */
  pageCount: number
  /** # 当前页 */
  currentPage: number
}

const props = defineProps<IDialogPropsParam<SignPostionConfigEntity[], IProps>>()

const showDialog = ref(true)

const state = reactive({
  indeterminate: false,
  checkAll: false,
  checkedList: [] as string[],
})

const usedType = ref('ALL')

const pageRange = ref('')

const signItemOptions = computed(() => props.param.signItems!.map(i => ({
  label: i.userName || '',
  value: i.id,
})))

const usedTypeOptions = ref([
  { label: '其他全部页码', value: 'ALL' },
  { label: '指定页码范围', value: 'RANGE' },
])

watch(
  () => state.checkedList,
  (val) => {
    state.indeterminate = !!val.length && val.length < signItemOptions.value.length
    state.checkAll = val.length === signItemOptions.value.length
  },
)

function onCheckAllChange(e: any) {
  Object.assign(state, {
    checkedList: e.target.checked ? signItemOptions.value.map(i => i.value) : [],
    indeterminate: false,
  })
}

function onOk() {
  const res: SignPostionConfigEntity[] = []
  const checkedItems = props.param?.signItems?.filter(i => state.checkedList.includes(i.id))

  if (!checkedItems?.length) {
    message.warning('请选择要应用的签字项')
    return
  }

  // 应用到其他页
  if (usedType.value === 'ALL') {
    for (let i = 0; i < props.param.pageCount; i++) {
      const items = checkedItems?.map((j) => {
        const id = j.id
        const item = SignPostionConfigEntity.fromJSON(j)
        item.pageNo = i + 1
        item.id = id
        return item
      })
      res.push(...items?.filter(i => i.pageNo !== props.param.currentPage))
    }
  }
  // 应用到指定范围
  else if (usedType.value === 'RANGE') {
    // 验证输入
    const validation = validatePageRange(pageRange.value, props.param.pageCount)
    if (!validation.isValid) {
      message.error(validation.error)
      return
    }
    // 解析页码范围
    const targetPages = parsePageRange(pageRange.value, props.param.pageCount)
    if (targetPages.length === 0) {
      message.warning('没有有效的目标页码')
      return
    }

    // 应用到指定页码
    for (const pageNo of targetPages) {
      const items = checkedItems?.map((j) => {
        const id = j.id
        const item = SignPostionConfigEntity.fromJSON(j)
        item.pageNo = pageNo
        item.id = id
        return item
      })
      res.push(...items)
    }
  }
  if (!res?.length) {
    message.warning('没有有效的应用项')
    return
  }
  props.onConfirm(res)
  showDialog.value = false
}
</script>
