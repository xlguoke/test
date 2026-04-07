package com.hitek.cordova.udr;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import com.hitek.udr.IAppCallChannel;
import com.hitek.udr.UdrCtrl;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * This class echoes a string called from JavaScript.
 */
public class UdrPlugin extends CordovaPlugin {

    static AtomicInteger requestCode = new AtomicInteger(1000);
    static Map<Integer, CallbackContext> mapReqeustCode2Callback = new ConcurrentHashMap<>();

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("open")) {
            JSONObject paramObj = args.optJSONObject(0);
            if (paramObj == null) {
                callbackContext.error("无效的参数！open调用示例：open({url:\"\", initScript:\"\"})");
                return false;
            }

            if (paramObj.optString("url", null) == null) {
                callbackContext.error("url不能为空！");
                return false;
            }

            //js是否等待Activity完成？
            boolean waitForResult = paramObj.optBoolean("waitForResult", false);

            //new intent
            Context context = cordova.getActivity().getApplicationContext();
            Intent intent = new Intent(context, /*com.example.mylibrary.MainActivity.class*/com.hitek.udrhandbook.UdrMainActivity.class);

            //json => intent
            json2intent(paramObj, intent);

            if (waitForResult) {
                int curRequestCode = requestCode.incrementAndGet();

                intent.putExtra("_requestCode_", curRequestCode);
                mapReqeustCode2Callback.put(curRequestCode, callbackContext);
                this.cordova.startActivityForResult(this, intent, curRequestCode);
            } else {
                this.cordova.getActivity().startActivity(intent);
                callbackContext.success();
            }
            return true;
        }

        //注册app回调函数
        if (action.equals("registerAppCall")) {
            UdrCtrl.appCallChannel = (String funcName, JSONObject jsonParam, String callId) -> {
                //调用app方法: funcName, jsonParam, callId
                JSONObject paramObj = new JSONObject();
                PluginResult.Status status = PluginResult.Status.OK;
                try {
                    paramObj.put("name", funcName);
                    paramObj.put("param", jsonParam);
                    paramObj.put("callId", callId);
                } catch (JSONException e) {
                    status = PluginResult.Status.ERROR;
                    try {
                        paramObj.put("message", e.getMessage());
                    } catch (JSONException ex) {
                    }
                }

                PluginResult pluginResult = new PluginResult(status, paramObj);
                pluginResult.setKeepCallback(true);
                callbackContext.sendPluginResult(pluginResult);
            };
            return true;
        }

        //app调用完成的通知： {callId:uuid, showUdr:true, error:null, data:{}}
        if (action.equals("finishCallApp")) {
            JSONObject paramObj = args.optJSONObject(0);
            if (paramObj == null) {
                callbackContext.error("无效的参数！finishCallApp调用示例：finishCallApp({callId:\"\", error:null, data:\"\"})");
                return false;
            }

            //finishCallApp
            try {
                UdrCtrl.finishCallApp(paramObj);
                callbackContext.success();
                return true;
            } catch (Exception e) {
                callbackContext.error(e.getMessage());
                return false;
            }
        }

        if (action.equals("openUdrActivity")) {
            Context context = cordova.getActivity().getApplicationContext();
            this.openNewActivity(context);
            callbackContext.success("abc");
            return true;
        }

        return false;
    }

    private static void json2intent(JSONObject paramObj, Intent intent) throws JSONException {
        Iterator<String> keys = paramObj.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            //intent.putExtra(key, paramObj.getString(key));
            Object val = paramObj.get(key);
            if (val != null) {
                if (val instanceof Integer)
                    intent.putExtra(key, (Integer) val);
                else if (val instanceof Boolean)
                    intent.putExtra(key, (Boolean) val);
                else if (val instanceof String)
                    intent.putExtra(key, (String) val);
                else if (val instanceof Long)
                    intent.putExtra(key, (Long) val);
                else if (val instanceof Float)
                    intent.putExtra(key, (Float) val);
                else if (val instanceof Double)
                    intent.putExtra(key, (Double) val);
                else if (val instanceof Short)
                    intent.putExtra(key, (Short) val);
                else if (val instanceof Byte)
                    intent.putExtra(key, (Byte) val);
                else
                    intent.putExtra(key, paramObj.getString(key));
            }
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        CallbackContext callbackContext = mapReqeustCode2Callback.get(requestCode);
        if (callbackContext != null) {
            mapReqeustCode2Callback.remove(requestCode);

            JSONObject ret = new JSONObject();
            try {
                ret.put("requestCode", requestCode);
                ret.put("resultCode", resultCode);
            } catch (JSONException e) {
            }
            callbackContext.success(ret);
        }
    }

    private void openNewActivity(Context context) {
        Intent intent = new Intent(context, /*com.example.mylibrary.MainActivity.class*/com.hitek.udrhandbook.UdrMainActivity.class);
        this.cordova.getActivity().startActivity(intent);
    }
}
