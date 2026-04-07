cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "@red-mobile/cordova-plugin-barcodescanner.BarcodeScanner",
      "file": "plugins/@red-mobile/cordova-plugin-barcodescanner/www/barcodescanner.js",
      "pluginId": "@red-mobile/cordova-plugin-barcodescanner",
      "clobbers": [
        "cordova.plugins.barcodeScanner"
      ]
    }
  ];
  module.exports.metadata = {
    "@red-mobile/cordova-plugin-barcodescanner": "9.0.8"
  };
});