<template>
  <Container
    @click="
      router.push({
        path: '/functionRoom2/deviceDetail',
        query: { ids: list?.map((i) => i.id)?.join(','), back: 1 }
      })
    "
  >
    <div class="body">
      <div class="name">设备管理</div>
      <div class="link">
        <van-icon name="arrow" color="#224059" />
      </div>
    </div>
  </Container>
</template>
<script lang="ts" setup>
import { useRouter } from "vue-router"
import Container from "../../../components/Container.vue"
import { ref } from "vue"
import { getLabEq } from "@/api/functionRoom2.api"

const props = defineProps<{
  labId: string
}>()

const router = useRouter()

const list = ref<any>([])

async function getList() {
  const { code, data } = await getLabEq(props.labId)
  if (code === 20000) {
    list.value = data
  }
}
getList()
</script>
<style lang="less" scoped>
.body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .name {
    color: #224059;
    font-size: 0.32rem;
    font-weight: 700;
  }
  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.44rem;
    height: 0.44rem;
    border-radius: 0.04rem;
    border: 1px solid #ffffff;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  }
}
</style>
