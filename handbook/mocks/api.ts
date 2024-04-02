import { HttpResponse, http } from 'msw'
import { faker } from '@faker-js/faker'
import * as jose from 'jose'

async function jwt() {
  const secret = new TextEncoder().encode(
    'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2',
  )
  const alg = 'HS256'

  return new jose.SignJWT({ 'urn:example:claim': true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime('2h')
    .sign(secret)
}

const handlers = [
  http.get(`*/api/foo`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const res: Record<string, any> = {}
    if (params.size) {
      for (const key of params.keys())
        res[key] = params.get(key)
      return HttpResponse.json(res)
    }
    return HttpResponse.json({ foo: 'bar' })
  }),
  http.get(`*/api/bar`, () => HttpResponse.json({ foo: 'bar' })),
  http.post(`*/api/baz`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`*/ilis2/rest/userController/user/info`, () => {
    return HttpResponse.json({
      code: 20000,
      data: {
        id: faker.string.uuid(),
        realName: faker.person.fullName(),
        userName: faker.person.firstName(),
        iconUrl: faker.image.avatar(),
        signPhoto: faker.image.avatar(),
      },
    })
  }),
  http.post(`*/ilis2/api/handbook/login`, async () => {
    return HttpResponse.json({
      code: 20000,
      data: {
        ACCESS_TOKEN: await jwt(),
        REFRESH_TOKEN: await jwt(),
      },
    })
  }),
  http.post('*/api/auth/refresh/token', async () => {
    return HttpResponse.json({
      code: 20000,
      data: {
        ACCESS_TOKEN: await jwt(),
        REFRESH_TOKEN: await jwt(),
      },
    })
  }),
  http.get('*/api/malformed', () => {
    return HttpResponse.json({
      code: 20010,
      message: 'malformed response',
    })
  }),
]

export default handlers
