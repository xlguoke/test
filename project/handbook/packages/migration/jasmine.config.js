import reporters from 'jasmine-reporters'

export default {
  srcDir: '../../platforms/browser/platform_www',
  srcFiles: [
    'cordova.js',
  ],
  specDir: 'dist',
  specFiles: [
    '**/*[sS]pec.[m]js',
  ],
  helpers: [
    'helpers/**/*.js',
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    stopOnSpecFailure: false,
    random: true,
  },
  browser: {
    name: 'headlessChrome',
  },
  reporters: [
    new reporters.JUnitXmlReporter(),
  ],
}
