# Requirements

* Node version > 1.8, it's recommended using [nvm](https://github.com/coreybutler/nvm-windows) to manage multiple
  installations of node.js on Windows
* Android platform requirements, using IntelliJ IDEA or Android Studio (make sure to add the `ANDROID_HOME` to the
  environment variables and add the build tool bin path to the `PATH` variable)
    - SDK platform: Android SDK 13 API level 33
    - SDK tools: Android SDK Build-Tools 33.0.2 (check the *Show Package Details* option to select the correct version)
    - Applicable virtual devices
* Cordova > 12, `npm i -g cordova`
* JDK > 1.8
* Gradle > 7.6

# SQLite Database contract

We define a user store contract to establish communication between the application and the `custodian`
library.

The definition:
```json
{
  "id": "",
  "name": "",
  "username": "",
  "avatar": null,
  "autograph": null,
  "database": "",
  "permissions": []
}
```
For convenience, `custodian` library can use a database without specifying the user database name
by looking at user store.

The user store will persist in the `localStorage` via pinia-persistent-plugin.
