echo off

cd ../

set "ROOT_PATH=%cd%"

set "CORDOVA_ASSETS=%ROOT_PATH%/cordova/platforms/android/app/src/main/assets/www"

set "CORDOVA_JS=%CORDOVA_ASSETS%/cordova.js"
set "CORDOVA_PLUGIN_JS=%CORDOVA_ASSETS%/cordova_plugins.js"
set "CORDOVA_PLUGINS=%CORDOVA_ASSETS%/plugins"

set "TARGET_DIR=%ROOT_PATH%/public"

xcopy "%CORDOVA_PLUGINS%" "%TARGET_DIR%/plugins" /E /I /H /Y

cd "%CORDOVA_ASSETS%"

copy "cordova.js" "%TARGET_DIR%"
copy "cordova_plugins.js" "%TARGET_DIR%"