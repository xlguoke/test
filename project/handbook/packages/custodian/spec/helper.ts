import type { HttpHandler } from 'msw'
import { HttpResponse, http } from 'msw'
import { setupWorker } from 'msw/browser'
import { saveHitekCenterUrl } from 'custodian'
import { setupMigrator } from 'migration'

export const HITEK_CENTER_URL = 'http://192.168.2.50:8301'
const YYYYMMDD = new Intl.DateTimeFormat('fr-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const HANDLERS = [
  http.get(`${HITEK_CENTER_URL}/UDR/*`, () => {
    return HttpResponse.arrayBuffer(new TextEncoder().encode('some content').buffer)
  }),
]

export async function setupTestSuite(handlers: HttpHandler[] = []) {
  localStorage.setItem('uhb.user', JSON.stringify({ database: 'uhb.db' }))
  handlers.push(...HANDLERS)
  const worker = setupWorker(...handlers)
  await worker.start()
  await saveHitekCenterUrl(HITEK_CENTER_URL)
  await import('../../../migrations')
  setupMigrator().migrate().then(migrator => migrator.reset())
}

export function formatDate(date?: Date | string) {
  return YYYYMMDD.format(date ? typeof date === 'string' ? new Date(date) : date : new Date())
}
