<template>
  <Container
    @click="
      router.push({
        path: '/functionRoom2/customDetail',
        query: { id: dataObj.id, title: config.name, back: 1 }
      })
    "
  >
    <div class="body">
      <div class="name">{{ config.name }}</div>
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
import { functionRoom2Store } from "@/store/functionRoom2"
import { storeToRefs } from "pinia"

const props = defineProps<{
  labId: string
  config: Record<string, any>
}>()

const { customComponent } = storeToRefs(functionRoom2Store())

const router = useRouter()

const dataObj = ref<any>({})

async function getList() {
  const data = customComponent.value.find((d) => d.name === props.config.name)
  dataObj.value = data ? data : {}
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
