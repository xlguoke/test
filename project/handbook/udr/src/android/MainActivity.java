/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package cn.ilis.uhb;

import android.content.Intent;
import android.os.Bundle;
import android.view.MotionEvent;
import android.webkit.WebView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.appcompat.view.menu.MenuView;

import com.google.gson.reflect.TypeToken;
import com.hitek.thingsboard.dtos.DeviceInfoDto;
import com.hitek.udrhandbook.services.CordovaUdrFragmentService;
import com.hitek.util.ActivityResultLauncherUtil;

import org.apache.cordova.*;

import java.util.ArrayList;

public class MainActivity extends CordovaActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // enable Cordova apps to be started in the background
        Bundle extras = getIntent().getExtras();
        if (extras != null && extras.getBoolean("cdvStartInBackground", false)) {
            moveTaskToBack(true);
        }

        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);

        udrService = new CordovaUdrFragmentService(this, (WebView) appView.getView(), deviceLauncher, udrPreferenceLauncher);
        //加载webview全局变量
        udrService.initHitekUdr();
    }

    CordovaUdrFragmentService udrService;
    /**
     * 点击设置
     */
    private final ActivityResultLauncher<Intent> udrPreferenceLauncher = ActivityResultLauncherUtil.<Boolean>getLauncher(this, result -> {
        udrService.udrPreferenceLauncherCallback(result);
    }, new TypeToken<Boolean>() {
    });


    /**
     * 二维码扫描设备，或过滤设备后添加
     */
    private final ActivityResultLauncher<Intent> deviceLauncher = ActivityResultLauncherUtil.<ArrayList<DeviceInfoDto>>getLauncher(this, result -> {
        udrService.deviceLauncherCallback(result);
    }, new TypeToken<ArrayList<DeviceInfoDto>>() {
    });


    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        udrService.dispatchTouchEvent(event);
        return super.dispatchTouchEvent(event);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        udrService.onDestroy();
    }

    @Override
    protected void onStart() {
        super.onStart();
        udrService.onStart();
    }


    @Override
    protected void onResume() {
        super.onResume();
        udrService.onResume();
    }
}
