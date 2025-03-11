<template>
  <div>
    <van-popup v-model:show="visible" position="bottom">
      <div class="h-screen flex flex-col">
        <van-nav-bar title="委托单">
          <template #right>
            <van-icon name="cross" size="20" @click="visible = false" />
          </template>
        </van-nav-bar>
        <div class="flex-1 h-0">
          <iframe :src="viewUrl" frameborder="0" class="h-full w-full overflow-auto"></iframe>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang='ts'>
const props = withDefaults(defineProps<{
  show: boolean
  fileUrl: string
}>(), {
  show: false,
  fileUrl: '',
})

const emits = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

const origin = location.origin.includes('localhost') ? 'http://192.168.2.65:8080' : location.origin
const pdfjs = '/ilis2/plug-in/pdfjs/web/viewer.html'
const viewUrl = ref('')
const visible = ref(false)
watch(() => props.show, (val) => {
  if (!val)
    return
  visible.value = val
  viewUrl.value = `${origin}${pdfjs}?file=${props.fileUrl}`
})
watch(visible, (val) => {
  if (val)
    return
  viewUrl.value = ''
  emits('update:show', val)
})
</script>

<style>

</style>
