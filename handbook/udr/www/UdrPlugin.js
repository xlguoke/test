var exec = require('cordova/exec');

/*
    打开udr
    {
        url:"http://192.168.50.106:81/tpl_binding/main.json",
        initScript:"http://192.168.50.106:81/init-udr.js"
    }
*/
exports.open = function (arg0, success, error) {
    exec(success, error, 'UdrPlugin', 'open', [arg0]);
};

exports.registerAppCall = function (success, error) {
    exec(success, error, 'UdrPlugin', 'registerAppCall', []);
};

exports.finishCallApp = function (arg0, success, error) {
    exec(success, error, 'UdrPlugin', 'finishCallApp', [arg0]);
};

exports.openUdrActivity = function (arg0, success, error) {
    exec(success, error, 'UdrPlugin', 'openUdrActivity', [arg0]);
};
