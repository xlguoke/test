/* eslint-disable */

import * as zksdk from '~/views/mobileApp/libs/bluetoothPrint';

/**
 * 便携打印模板 - 样品标签
 * @author dengyy
 * @param options
 * @param unitCode: 单位编码，不同单位样品标签不同
 * @param width: 标签纸的宽度，单位像素點
 * @param height: 标签纸的宽度，单位像素點
 * @param number: 打印份数
 * */

let TemplateSampleLabel = function (options) {
  this.unitCode = options.unitCode || null;
  this.width = options.width || 560;
  this.height = options.height || 400;
  this.number = options.number || 1;
  this.dataSource = options.dataSource || {};
};

// 获取 苏交科检测 样品标签打印图
TemplateSampleLabel.prototype.createPrintTemplate_sjkjc = function () {
  let dataSource = this.dataSource;
  let width = this.width, height = this.height;

  let strCmd = zksdk.CreatCPCLPage(width, height, this.number, 0);

  // 设置居中
  strCmd += zksdk.addCPCLLocation(2);
  // 加粗
  // strCmd += zksdk.addCPCLSETBOLD(2);
  // 放大
  strCmd += zksdk.addCPCLSETMAG(2, 2);

  // 标题
  strCmd += zksdk.addCPCLText(0, 14, 55, 0, 0, "样品标识");

  // 设置居左
  strCmd += zksdk.addCPCLLocation(0);
  // 还原加粗
  strCmd += zksdk.addCPCLSETBOLD(0);
  // 放大改为1倍
  strCmd += zksdk.addCPCLSETMAG(1, 1);

  let drawTop = 60;

  // 样品名称
  strCmd += zksdk.addCPCLText(12, drawTop, 12, 2, 0, "样品名称:");
  strCmd += zksdk.addCPCLLine(120, drawTop + 25, 500, 85, 2);
  strCmd += this.addCPCLTextCalc(120, drawTop, 12, 2, dataSource["样品名称"], 24, 550);

  drawTop += 50;

  // 样品编号
  strCmd += zksdk.addCPCLText(12, drawTop, 12, 2, 0, "样品编号:");
  strCmd += zksdk.addCPCLLine(120, drawTop + 25, 270, drawTop + 25, 2);
  strCmd += this.addCPCLTextCalc(120, drawTop + 5, 55, 0, dataSource["样品编号"], 18, 270);

  // 二维码
  strCmd += zksdk.addCPCLQRCode(width / 2 + 20, drawTop, 'M', 2, 5, dataSource["样品标签二维码"]);

  drawTop += 50;

  // 规格型号
  strCmd += zksdk.addCPCLText(12, drawTop, 12, 2, 0, "规格型号:");
  strCmd += zksdk.addCPCLLine(120, drawTop + 25, 270, drawTop + 25, 2);
  strCmd += this.addCPCLTextCalc(120, drawTop + 5, 55, 0, dataSource["规格型号"], 18, 270);

  drawTop += 50;

  // 收样日期
  strCmd += zksdk.addCPCLText(12, drawTop, 12, 2, 0, "收样日期:");
  strCmd += zksdk.addCPCLLine(120, drawTop + 25, 270, drawTop + 25, 2);
  dataSource["收样日期"] && (strCmd += zksdk.addCPCLText(120, drawTop + 5, 55, 0, 0, dataSource["收样日期"]));

  drawTop += 50;

  // 流转状态
  // ["待检", "在检", "已检", "留样"];
  let ypzt = dataSource["样品状态"];
  strCmd += zksdk.addCPCLBox(12, drawTop, 12 + 24, drawTop + 24, 1);
  strCmd += zksdk.addCPCLText(42, drawTop, 12, 2, 0, "待检");
  if ("待检" === ypzt) {
    strCmd += zksdk.addCPCLText(12 + 4, drawTop, 12, 2, 0, "√");
  }

  strCmd += zksdk.addCPCLBox(130, drawTop, 130 + 24, drawTop + 24, 1);
  strCmd += zksdk.addCPCLText(130 + 24 + 6, drawTop, 12, 2, 0, "在检");
  if ("在检" === ypzt) {
    strCmd += zksdk.addCPCLText(130 + 4, drawTop, 12, 2, 0, "√");
  }

  drawTop += 44;

  strCmd += zksdk.addCPCLBox(12, drawTop, 12 + 24, drawTop + 24, 1);
  strCmd += zksdk.addCPCLText(42, drawTop, 12, 2, 0, "已检");
  if ("已检" === ypzt) {
    strCmd += zksdk.addCPCLText(12 + 4, drawTop, 12, 2, 0, "√");
  }

  strCmd += zksdk.addCPCLBox(130, drawTop, 130 + 24, drawTop + 24, 1);
  strCmd += zksdk.addCPCLText(130 + 24 + 6, drawTop, 12, 2, 0, "留样");
  if ("留样" === ypzt) {
    strCmd += zksdk.addCPCLText(130 + 4, drawTop, 12, 2, 0, "√");
  }

  // 外框
  strCmd += zksdk.addCPCLBox(4, 4, width - 4, height - 4, 1);

  // 定位缝隙
  strCmd += zksdk.addCPCLGAP();

  // 打印指令
  strCmd += zksdk.addCPCLPrint();

  return strCmd;
};

/**
 * 通过计算渲染CPCL文字
 * @param x: 文字方块左上角X座标，单位dot
 * @param y: 文字方块左上角Y座标，单位dot
 * @param fontName: 字体
 * @param fontSize: 文字大小
 * @param content: 文字内容
 * @param fontWidth 文字的宽高,大概即可
 * @param width 文字显示区域大小
 * */
TemplateSampleLabel.prototype.addCPCLTextCalc = function (x, y, fontName, fontSize, content, fontWidth, width) {
  if (content === undefined || content === "") {
    return "";
  }

  var vArr = [];
  var vStr = "";
  var vWidth = 0;

  // 计算文字长度
  var reg = new RegExp("[\u4E00-\u9FA5]+");
  var sChart = ['（','）', '，', '。', '、', '？', '！'];
  var clacWidth = 0;
  var strArr = content.split("");
  for (var i = 0; i < strArr.length; i++) {
    var text = strArr[i];
    var num = 28;
    if (reg.test(text) || sChart.indexOf(text) !== -1) {
      clacWidth += 28;
      num = 28;
    } else {
      clacWidth += 14;
      num = 14;
    }

    if (vWidth > width) {
      vWidth = num;
      vArr.push(vStr);
      vStr = text;
    } else {
      vWidth += num;
      vStr += text;
    }
  }

  if (vStr) {
    vArr.push(vStr);
  }

  if (clacWidth <= width) {
    return zksdk.addCPCLText(x, y, fontName, fontSize, 0, content);
  } else {
    var strCmd = "";
    var _y = y - (vArr.length - 1) * fontWidth;
    // arr.map((item, index) => {
    //   strCmd += zksdk.addCPCLText(x, (_y + fontWidth * index), fontName, fontSize, 0, item);
    // });

    vArr.map((item, index) => {
      strCmd += `T ${fontName} ${fontSize} ${x} ${_y + 18 * index} ${item}\n`;
    });
    return strCmd;
  }
};

// 获取canvas绘画的打印模板
TemplateSampleLabel.prototype.getPrintTemplate = function () {
  let unitCode = this.unitCode;
  if (unitCode === "sjkjc") {
    return this.createPrintTemplate_sjkjc();
  }
};

export default TemplateSampleLabel;