import handleProgress from '~/components/sseRequestProgress'

(async function () {
  window.sseRequestProgress = handleProgress
})()
