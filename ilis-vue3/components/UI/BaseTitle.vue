<template>
  <div class=" flex items-center mb-3 text-[16px] font-bold ">
    <span class=" block w-1 h-5 mr-2 bg-primaryColor rounded-e-sm"></span>
    <slot>标题</slot>
    <span class="flex-1 text-right ">
      <slot name="right" />
    </span>
  </div>
</template>

<script>
</script>
