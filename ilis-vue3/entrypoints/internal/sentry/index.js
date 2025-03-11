import { captureException, showComplementaryDialog } from '~/internal/tracing'

(function () {
  window.captureException = e => captureException(e).catch(err => console.error('captureException', err))
  window.showComplementaryDialog = showComplementaryDialog
})()
