<template>
  <div>
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      multiple="multiple"
      style="display: hidden"
      @change="changeFile"
    />
    <button @click="uploadFile">打开相册</button>

    <hr />

    <ul>
      <li v-for="f in fileDatas" :key="f.name">
        {{ f.name }}
      </li>
    </ul>

    <a-button @click="mergepdf">合成pdf</a-button>
  </div>
</template>

<script>
import { jsPDF } from "jspdf";
export default {
  name: "HelloWorld",
  data() {
    return {
      a4_size: [210, 297],
      fileDatas: [],
      margin: 2,
    };
  },
  methods: {
    changeFile(e) {
      this.fileDatas.push(...e.target.files);
    },
    async mergepdf() {
      const doc = new jsPDF("p", "mm", this.a4_size);
      const maxW = this.a4_size[0] - this.margin * 2;
      const maxH = this.a4_size[1] - this.margin * 2;
      const imgList = await this.initImageInfo();
      let top = this.margin;
      for (let i = 0; i < imgList.length; i++) {
        const { base64Url, width, height, type } = imgList[i];
        let left = this.margin;
        // 宽度未超出，居中显示
        if (width < maxW) {
          left = (maxW - width) / 2;
        }
        // 高度超出，新增一页
        if (height + top > maxH) {
          doc.addPage(this.a4_size);
          top = this.margin;
        }
        doc.addImage(base64Url, type, left, top, width, height);
        top += height + this.margin;
      }
      const pdfName = Date.now() + ".pdf";
      await doc.save(pdfName, { returnPromise: true });
      const _blob = doc.output("blob", pdfName);
      const file = new File([_blob], pdfName, { type: _blob.type });
      console.log(`output->file`, file);
    },
    
    // 将文件转为图片，初始化图片信息：宽、高、类型、base64Url
    async initImageInfo() {
      const imgs = [];
      for (let i = 0; i < this.fileDatas.length; i++) {
        const file = this.fileDatas[i];
        try {
          const base64Url = await this.fileToBase64(file);
          const { width, height } = await this.getImgSize(base64Url);
          const type = this.fileType(file.name);
          imgs.push({
            base64Url,
            width,
            height,
            type,
          });
        } catch (err) {
          console.error(`${file.name} error：`, err);
        }
      }
      return imgs;
    },
    // file对象传为base64
    fileToBase64(file) {
      return new Promise((resolve) => {
        const url = window.URL.createObjectURL(file);
        console.log(`output->url`,url)
        resolve(url)
        // const reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.onload = () => resolve(reader.result);
        // reader.onerror = (error) => reject(error);
      });
    },
    // 图片在pdf中展示的大小
    async getImgSize(url) {
      return new Promise((resolve, reject) => {
        const a4_w = this.a4_size[0] - this.margin * 2;
        const a4_h = this.a4_size[1] - this.margin * 2;
        const img = new Image();
        img.src = url;
        img.onload = () => {
          let w = img.width,
            h = img.height,
            scale = w / h;
          if (w > a4_w) {
            w = a4_w;
            h = w / scale;
          }
          if (h > a4_h) {
            h = a4_h;
            w = h * scale;
          }
          resolve({
            width: w,
            height: h,
          });
        };
        img.onerror = (error) => {
          reject(error);
        };
      });
    },
    fileType(name) {
      return name.split(".").pop();
    },
    uploadFile() {
      const file = this.$refs.fileInput;
      file.click();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
