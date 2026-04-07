<template>
  <div>
    <a-list :data-source="previewData">
      <template #renderItem="{ item }">
        <a-list-item>
          {{ item }}
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script>
export default {
  name: 'ProblemPreview',
  props: {
    data: {},
  },
  data() {
    return {
      previewData: [],
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.previewData = this.data.problemPreview.split(/@@/)
    },
  },
}
</script>

<style scoped></style>
