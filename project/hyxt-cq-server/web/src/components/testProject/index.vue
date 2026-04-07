<template>
  <a-modal
    v-model:visible="visible"
    title="选择试验项目"
    :mask-closable="false"
    :keyboard="false"
    width="70%"
    @ok="saveModal"
  >
    <a-spin :spinning="spinning">
      <div style="min-height: 350px">
        <div class="query-form-wrap">
          <a-space>
            <a-select v-model:value="majors" placeholder="请选择" @change="getDatas">
              <a-select-option value="公路工程">公路工程</a-select-option>
              <a-select-option value="水运工程">水运工程</a-select-option>
            </a-select>
            <!-- <a-button type="primary" @click="getDatas">查询</a-button> -->
          </a-space>
        </div>
        <a-checkbox-group v-model:value="checkedList" style="width: 100%">
          <template v-for="(opt, i) in plainOptions" :key="i">
            <p class="detail-title">{{ opt.classification }}</p>
            <a-row :gutter="20">
              <a-col v-for="d in opt.items" :key="d.id" :xxl="6" :lg="8" :md="12" :xs="24">
                <a-checkbox :value="d">{{ d.name }}</a-checkbox>
              </a-col>
            </a-row>
          </template>
        </a-checkbox-group>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { message } from "ant-design-vue"
import { getTestProject } from "@/api/performance.api"

const props = defineProps(["selected"])
const emit = defineEmits(["update:selected", "confirm"])

const spinning = ref<boolean>(false)
const visible = ref<boolean>(false)
const openModal = () => {
  visible.value = true
}

defineExpose({
  openModal
})

onMounted(() => {
  initMajor()
})
watch(
  () => props.selected,
  () => {
    initMajor()
  }
)

const initMajor = () => {
  if (props.selected.length) {
    majors.value = props.selected[0].majors
  }
  getDatas()
}

interface optItemType {
  id: string
  majors: string
  classification: string
  name: string
  qualify?: string
}
interface optType {
  classification: string
  items: optItemType[]
}
const plainOptions = ref<optType[]>([])
const getDatas = () => {
  spinning.value = true
  checkedList.value = []
  getTestProject(majors.value)
    .then((res: any) => {
      spinning.value = false
      if (!res) return
      plainOptions.value = res
      defaultSelected(res)
    })
    .catch(() => {
      plainOptions.value = []
      spinning.value = false
    })
}

const defaultSelected = (res) => {
  const list = props.selected
  if (list.length === 0) return
  for (let i = 0; i < res.length; i++) {
    for (let j = 0; j < res[i].items.length; j++) {
      const d: optItemType = res[i].items[j]
      if (list.find((n) => n.itemId == d.id)) {
        checkedList.value.push(d)
      }
    }
  }
}

const majors = ref("公路工程")
const checkedList = ref<optItemType[]>([])

const saveModal = () => {
  let selectedDatas: any = []
  if (checkedList.value.length === 0) {
    message.warning("请选择检测内容")
    return
  }
  selectedDatas = checkedList.value.map((d: any) => ({
    itemId: d.id,
    majors: majors.value,
    classification: d.classification,
    content: d.name
  }))
  emit("update:selected", selectedDatas)
  emit("confirm", selectedDatas)
  visible.value = false
}
</script>

<style lang="less" scoped></style>
