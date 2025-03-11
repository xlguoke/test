<template>
  <AppProvider>
    <span @click="changePassword">{{ title }}</span>
  </AppProvider>
</template>

<script setup lang='ts'>
import EditPassword from './EditPassword.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'

const props = defineProps({
  catalog: {
    type: Object,
    default: () => ({
      text: '修改密码',
    }),
  },
})
const title = ref(props.catalog.text)

async function changePassword() {
  await AnyDialogHelper.showModel(EditPassword, {
    title: title.value,
  })
}
</script>

<style lang="less" scoped>

</style>
