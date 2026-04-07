/* eslint-disable */

/**
 * 安卓原生调用蓝牙模块相关方法
 * @author dengyy
 * 官方文档地址：https://www.html5plus.org/doc/zh_cn/bluetooth.html
 * */

/**
 * 初始化蓝牙模块
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 完成回调函数
 * */
let openBluetoothAdapter = (success, fail, complete) => {
  window._appPlus.bluetooth.openBluetoothAdapter({
    success,
    fail,
    complete
  });
};

/**
 * 获取本机蓝牙适配器状态
 * @param success 成功回调函数
 * @param fail 错误回调函数
 * @param complete 完成回调函数
 * */
let getBluetoothAdapterState = (success, fail, complete) => {
  window._appPlus.bluetooth.getBluetoothAdapterState({
    success,
    fail,
    complete
  });
};

/**
 * 获取已搜索到的蓝牙设备
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 完成回调函数
 * */
let getBluetoothDevices = (success, fail, complete) => {
  window._appPlus.bluetooth.getBluetoothDevices({
    success,
    fail,
    complete
  });
};

/**
 * 关闭蓝牙
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 完成回调函数
 * */
let closeBluetoothAdapter = (success, fail, complete) => {
  window._appPlus.bluetooth.closeBluetoothAdapter({
    success,
    fail,
    complete
  });
};

/**
 * 开始搜索附近的蓝牙设备
 * @param services 要获取设备的uuid列表
 * @param allowDuplicatesKey 是否允许重复上报同一设备
 * @param interval 上报设备的间隔，0表示找到新设备立即上报，其他数值根据传入的间隔上报。
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 完成回调函数
 * */
let startBluetoothDevicesDiscovery = (services, allowDuplicatesKey, interval, success, fail, complete) => {
  window._appPlus.bluetooth.startBluetoothDevicesDiscovery({
    services,
    allowDuplicatesKey,
    interval,
    success,
    fail,
    complete
  });
};

/**
 * 停止搜寻附近的蓝牙外围设备
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 完成回调函数
 * */
let stopBluetoothDevicesDiscovery = (success, fail, complete) => {
  window._appPlus.bluetooth.stopBluetoothDevicesDiscovery({
    success,
    fail,
    complete
  });
};

/**
 * 连接低功耗蓝牙设备
 * @param deviceId 蓝牙设备的id
 * @param? success 成功回调函数
 * @param? fail 失败回调函数
 * @param? complete 操作完成回调函数
 * */
let createBLEConnection = (deviceId, success, fail, complete) => {
  window._appPlus.bluetooth.createBLEConnection({
    deviceId,
    success,
    fail,
    complete
  });
};

/**
 * 断开与低功耗蓝牙设备的连接
 * @param deviceId 蓝牙设备的id
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 操作完成回调函数
 * */
let closeBLEConnection = (deviceId, success, fail, complete) => {
  window._appPlus.bluetooth.closeBLEConnection({
    deviceId,
    success,
    fail,
    complete
  });
};

/**
 * 监听搜索到新设备的事件
 * @param callback 搜索到新设备回调函数
 * */
let onBluetoothDeviceFound = (callback) => {
  window._appPlus.bluetooth.onBluetoothDeviceFound(callback);
};

/**
 * 获取蓝牙设备的所有服务(service)
 * @param deviceId 蓝牙设备的id
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 操作完成回调函数
 * */
let getBLEDeviceServices = (deviceId, success, fail, complete) => {
  window._appPlus.bluetooth.getBLEDeviceServices({
    deviceId,
    success,
    fail,
    complete
  });
};

/**
 * 获取蓝牙设备指定服务中所有特征值(characteristic)
 * @param deviceId 蓝牙设备的id
 * @param serviceId 蓝牙服务uuid
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 操作完成回调函数
 * */
let getBLEDeviceCharacteristics = (deviceId, services, success, fail, complete) => {
  const serviceId = services.shift().uuid;

  window._appPlus.bluetooth.getBLEDeviceCharacteristics({
    deviceId,
    serviceId,
    success: function (res) {
      let finished = false;
      let write = false;
      let notify = false;
      let indicate = false;
      var readId;
      var writeId;
      //有斑马品牌的一款打印机中res.characteristics的所有uuid都是相同的，找所有的properties存在(notify || indicate) && write这种情况就说明这个uuid是可用的（不确保所有的打印机都能用这种方式取得uuid,在主要测试得凯盛诺打印机res.characteristic只有一个uuid,所以也能用这个方式）
      for (var i = 0; i < res.characteristics.length; i++) {
        if (!notify) {
          notify = res.characteristics[i].properties.notify;
          if (notify) readId = res.characteristics[i].uuid;
        }
        if (!indicate) {
          indicate = res.characteristics[i].properties.indicate;
          if (indicate) readId = res.characteristics[i].uuid;
        }
        if (!write) {
          write = res.characteristics[i].properties.write;
          writeId = res.characteristics[i].uuid;
        }
        if ((notify || indicate) && write) {
          /* 获取蓝牙特征值uuid */
          success &&
          success({
            serviceId,
            writeId: writeId,
            readId: readId,
          });
          finished = true;
          break;
        }
      }

      if (!finished) {
        getBLEDeviceCharacteristics(deviceId, services, success, fail);
      }
    },
    fail: function (err) {
      getBLEDeviceCharacteristics(deviceId, services, success, fail);
    },
    complete
  });
};

/**
 * 向低功耗蓝牙设备指定特征值写入二进制数据，这个方法会递归调用传输
 * @param deviceId 蓝牙设备的id
 * @param serviceId 蓝牙服务的uuid
 * @param characteristicId 蓝牙特征值的uuid
 * @param value 要写入的数据
 * @param success 成功回调函数
 * @param fail 失败回调函数
 * @param complete 操作完成回调函数
 * */
let writeBLECharacteristicValue = (options, success, fail, complete) => {
  let {deviceId, serviceId, characteristicId, onceLength, value} = options;
  let byteLength = value.byteLength;
  const speed = onceLength;
  if (byteLength > 0) {
    window._appPlus.bluetooth.writeBLECharacteristicValue({
      deviceId,
      serviceId,
      characteristicId,
      value: value.slice(0, byteLength > speed ? speed : byteLength),
      success: function () {
        console.log("传输成功");
        // 还未传输完，则递归继续传
        if (byteLength > speed) {
          setTimeout(function() {
            writeBLECharacteristicValue({...options, value: value.slice(speed, byteLength)}, success, fail, complete);
          }, 200);
        } else {
          success && success();
        }
      },
      fail: function (err) {
        if(err.code === 10004) {
          alert("连接已断开，请重试");
        } else {
          alert(JSON.stringify(err) + "，请重试");
        }
        fail && fail();
      },
      complete
    });
  }
};

/**
 * 获取连接蓝牙设备的信号强度
 * @param deviceId 蓝牙设备的id
 * @param? success 成功回调函数
 * @param? fail 失败回调函数
 * @param? complete 操作完成回调函数
 * */
let getBLEDeviceRSSI = (deviceId, success, fail, complete) => {
  window._appPlus.bluetooth.getBLEDeviceRSSI({
    deviceId,
    success,
    fail,
    complete
  });
};

/**
 * 监听蓝牙打印机的状态
 * @param changeCB 变化的回调
 * */
let onBLEConnectionStateChange = (changeCB) => {
  window._appPlus.bluetooth.onBLEConnectionStateChange(changeCB);
};

export {
  openBluetoothAdapter,
  getBluetoothDevices,
  getBluetoothAdapterState,
  closeBluetoothAdapter,
  startBluetoothDevicesDiscovery,
  stopBluetoothDevicesDiscovery,
  createBLEConnection,
  closeBLEConnection,
  onBluetoothDeviceFound,
  getBLEDeviceServices,
  getBLEDeviceCharacteristics,
  writeBLECharacteristicValue,
  getBLEDeviceRSSI,
  onBLEConnectionStateChange
};
