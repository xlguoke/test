<!-- 任务详情->样品制备 -->

<script setup lang='ts'>
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import SamplePreparation from './components/SamplePreparation.vue'

interface Param {
  taskId: string
}
function openModal(data: Param) {
  AnyDialogHelper.showModel(SamplePreparation, data)
}

if (!window.vm) {
  window.vm = {}
}
window.vm.openSamplePreparation = openModal
</script>
