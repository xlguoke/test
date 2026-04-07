<template>
  <div v-show="list?.length">
    <div mb8 flex-x justify-between line-height-22>
      <div flex-x>
        <img src="@/assets/preIcon.svg " class="mr8 h16 w16">
        <div>预约任务</div>
      </div>
      <div @click="router.push({ path: '/preTask', query: data })">
        查看更多>
      </div>
    </div>
    <van-skeleton :row="6" :loading="loading">
      <div v-if="list?.length">
        <PreTaskCard
          v-for="item in list"
          :key="item.id"
          :data="item"
          mb16
          @refresh="getTaskList"
        />
      </div>
      <van-empty
        v-else
        :image="emptyImage"
        description="暂无内容"
      />
    </van-skeleton>
  </div>
</template>

<script lang="ts" setup>
import type { ILaboratory } from '@/interface/dataInterface/ILaboratory'
import { CreateType, getHumitureResList } from '@/pages/room'
import emptyImage from '@/assets/empty.svg'

const props = defineProps<{
  data: ILaboratory
}>()

const router = useRouter()

const list = ref([])

const loading = ref(false)

async function getTaskList() {
  loading.value = true
  const { data } = await getHumitureResList({
    'type': CreateType.预约,
    'laboratory.id': props.data.id,
  }).finally(() => loading.value = false)
  list.value = data.rows?.slice(0, 2) || []
}

getTaskList()
</script>
