<template>
  <Editor
    ref="editor"
    v-model="content"
    api-key="jqi09eawbotgii8m2s7rf60ncxcgfkkixgjltnrfifzgbz6j"
    :init="init"
    placeholder="请输入内容"
  ></Editor>
</template>

<script>
import Editor from "@tinymce/tinymce-vue";
export default {
  props: {
    value: String,
    height: {
      type: Number,
      default: 300,
    },
  },
  components: {
    Editor,
  },
  data() {
    return {
      content: this.value,
      init: {
        language: "zh_CN",
        height: this.height,
        plugins:
          "link fullscreen table image imagetools hr pagebreak nonbreaking lists codesample",
        toolbar:
          "undo redo | alignleft aligncenter alignright alignjustify outdent indent | lineheight forecolor backcolor bold italic underline strikethrough link | \
          formatselect fontselect fontsizeselect | bullist numlist | subscript superscript removeformat | table image | codesample hr pagebreak | cut copy paste pastetext | fullscreen",
        fontsize_formats: "12px 14px 16px 18px 24px 36px 48px 56px 72px",
        font_formats:
          "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;",
        branding: false, // 隐藏右下角技术支持
        menubar: false, // 隐藏菜单栏
        file_picker_callback: function (callback) {
          const filetype = ".jpg, .jpeg, .png, .bmp, .svg, .webp";
          var input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", filetype);
          input.click();
          input.onchange = function () {
            var file = this.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
              callback(reader.result, { title: file.name });
            };
          };
        },
      },
    };
  },
  watch: {
    value(val) {
      this.content = val;
    },
    content(val) {
      this.$emit("input", val);
    },
  },
  methods: {},
  mounted() {},
};
</script>

<style scoped>
.mce-content-body p {
  margin: 0;
}
</style>
