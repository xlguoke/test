<template>
  <div class="copyright flex items-center justify-center gap-2 p-2">
    <a v-if="unitCode === 'gjzx'" href="https://beian.miit.gov.cn" target="_blank">京ICP备18013285号-3  </a>
    <a v-else-if="unitCode === 'whld'" href="https://beian.miit.gov.cn" target="_blank">鄂icp备17018508号-4  </a>
    <a v-else-if="unitCode === 'yljc'" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=53011202001170" target="_blank">滇公网安备 53011202001170号|ICP备案/许可证号：滇ICP备17011551号-9</a>
    <a v-else-if="unitCode === 'sgjc'" href="https://beian.miit.gov.cn" target="_blank">蜀ICP备16012915号-1 </a>
    <a v-else-if="unitCode === 'sjkjc'" href="https://beian.miit.gov.cn" target="_blank">苏ICP备11019701号-22 </a>
    <a v-else href="https://beian.miit.gov.cn" target="_blank">渝ICP备10201065号-15</a>
    <span class="cursor-pointer" @click="officialWebsite()">{{ `${unitCode !== 'yljc' ? `©1998-${dayjs().year()}` : ''} 重庆海特科技发展有限公司 客服电话：（023）67037628` }}</span>
    <a href="udrExeVersionController/downloadUdrExe.do"> 系统插件下载</a>
    <a v-if="unitCode === 'gfzx'" href="rest/signer/download"> ukey锁签名插件下载</a>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const unitCode = localStorage.getItem('unitCode')

function officialWebsite() {
  window.open('http://www.hiteksoft.com', '_blank')
}
</script>
