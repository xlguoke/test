<template>
  <div id="app">
    <HelloWorld v-if="show == 1" />
    <TinyMCE v-else v-model="editorVal" :height="500"/>

    <div class="editor-html" v-html="editorVal"></div>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import TinyMCE from "./components/TinyMCE.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
    TinyMCE,
  },
  data() {
    return {
      show: 2,
      editorVal: ''
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.editor-html {
  font-size: initial;
  font-weight: initial;
}

h1, h2, h3, h4, h5, h6{
  font-weight: bold;
}

</style>
