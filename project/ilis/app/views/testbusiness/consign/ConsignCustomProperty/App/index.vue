<template>
  <IlisContainer app-id="ConsignCustomProperty">
    <List
      customize-type="consign-property"
      columns-type="consignTable"
      show-blind-col
      show-pre-consign-col
    />
  </IlisContainer>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  mounted() {
    window.GetResult = (layerI, successFunc) => {
      successFunc(layerI, [])
    }
  },
  methods: {

  },
}
</script>

<style>

</style>
