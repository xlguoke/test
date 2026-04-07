<template>
  <div v-show="list?.length">
    <div mb8 flex-x justify-between line-height-22>
      <div flex-x>
        <img src="@/assets/timeIcon.svg " class="mr8 h16 w16">
        <div>调养箱</div>
      </div>
      <div @click="router.push({ path: '/incubator', query: { labId: data.id } })">
        查看更多>
      </div>
    </div>
    <van-skeleton :row="6" :loading="loading">
      <div v-if="list?.length" class="grid grid-cols-2 mb16 gap-9">
        <IncubatorCard
          v-for="item in list"
          :key="item.id"
          :data="item"
          :base-config="baseConfig"
          mb16
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
import emptyImage from '@/assets/empty.svg'
import { humitureBookPage } from '@/pages/incubator'
import { useIncubatorConfig } from '@/pages/incubator/modules/useIncubatorConfig'

const props = defineProps<{
  data: ILaboratory
}>()

const router = useRouter()

const list = ref([])

const loading = ref(false)

const {
  baseConfig,
  listenCollectDataUpdate,
} = useIncubatorConfig()

async function getPageData() {
  try {
    loading.value = true
    const { data } = await humitureBookPage({
      labId: props.data.id,
      page: 1,
      size: 2,
    })
    list.value = data.rows || []
    listenCollectDataUpdate(list.value)
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}

getPageData()
</script>
