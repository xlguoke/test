/* eslint-disable */

/**
 * 便携打印模板 - 样品标签
 * @author dengyy
 * @param unitCode: 单位编码，不同单位样品标签不同
 * @param width: 标签纸的宽度，单位像素點
 * @param height: 标签纸的宽度，单位像素點
 * */

let TemplateSampleLabel = function (unitCode, width, height) {
  this.unitCode = unitCode || null;
  this.width = width;
  this.height = height;

  // canvas画布
  this.canvas = null;
  // canvas context对象
  this.canvasCtx = null;

  this.createCanvas();
};

// 创建画布
TemplateSampleLabel.prototype.createCanvas = function () {
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", this.width + "px");
  canvas.setAttribute("height", this.height + "px");
  // canvas.style = `width: ${this.width / 2}px; height: ${this.height / 2}px`;

  this.canvas = canvas;
  this.canvasCtx = this.canvas.getContext("2d");
};

TemplateSampleLabel.prototype.drawBackground = function (color) {
  let ctx = this.canvasCtx;
  ctx.fillStyle = color || "#ffffff";
  ctx.fillRect(0, 0, this.width, this.height);

  // 还原颜色
  ctx.fillStyle = "#333";
};

/**
 * 绘画框框，一般是最外面的一圈，也可能被用作其他地方
 * @param x: 横坐标
 * @param y: 纵坐标
 * @param w: 宽度
 * @param h: 高度
 * */
TemplateSampleLabel.prototype.drawBox = function (x, y, w, h) {
  let ctx = this.canvasCtx;
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);

  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);

  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);

  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);

  // 颜色
  ctx.strokeStyle = 'black';
  // 线条宽度
  ctx.lineWidth = 1;

  ctx.stroke();
};

// 获取二维码，此方法绘画的二维码无法被打印出来，已废弃
TemplateSampleLabel.prototype.drawQRCode = function () {
  let ctx = this.canvasCtx;

  var img = new Image();
  img.src = "data:image/png;base64,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"
  img.onload = () => {
    // 二维码宽
    let qwidth = 80;
    // 二维码高
    let qheight = 80;
    ctx.drawImage(img, this.width - 15 - qwidth, this.height - 15 - qheight, qwidth, qheight);
  }
};

// 获取宏信创达样品标签打印图
TemplateSampleLabel.prototype.createPrintTemplate_hxcd = function () {
  let ctx = this.canvasCtx;

  let fontSize = 18; // 文字大小
  let fontTopMargin = 15; // 文字间隔

  // 背景
  this.drawBackground();

  // 框框
  this.drawBox(10, 10, this.width - 20, this.height - 20);

  // 文字渲染
  // 测试数据
  let data = [
    {name: "样品名称", value: "粗集料"},
    {name: "样品规格", value: "（5~31.5）mm"},
    {name: "样品编号", value: "YP-2021-CJL-09022"},
    {name: "收样日期", value: "2021-09-29"},
    {name: "检验状态", options: ["待检", "在检", "已检", "留样", "退还", "复检"]}
  ];

  ctx.font = `${fontSize}px SimSun`;
  ctx.textBaseline = "top";
  let lineCount = 0; // 距离计数
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    // 绘制复选框
    if (item.options) {
      ctx.fillText(`${item.name}：`, 20, 20 + (fontTopMargin * lineCount) + (fontSize * lineCount));
      for (var j = 0; j < item.options.length; j++) {
        let option = item.options[j];
        ctx.fillText(`${option}`, j % 2 == 0 ? 110 : 185, 20 + (fontTopMargin * lineCount) + (fontSize * lineCount));
        this.drawBox(j % 2 == 0 ? 155 : 230, 20 + (fontTopMargin * lineCount) + (fontSize * lineCount), 18, 18);
        if (j % 2 == 1) {
          lineCount++;
        }
      }
    } else {
      // 绘制文本信息
      ctx.fillText(`${item.name}：${item.value}`, 20, 20 + (fontTopMargin * lineCount) + (fontSize * lineCount));

    }
    lineCount++;
  }

  // 二维码渲染，此方法不适用，采用打印机厂商提供的绘制二维码方法
  // this.drawQRCode();
};

// 获取canvas绘画的打印模板
TemplateSampleLabel.prototype.getPrintTemplate = function () {
  if (this.unitCode === "hxcd") {
    this.createPrintTemplate_hxcd();
  }
  return this.canvasCtx.getImageData(0, 0, this.width, this.height);
};

export default TemplateSampleLabel;