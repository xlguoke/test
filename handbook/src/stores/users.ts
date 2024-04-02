import { defineStore } from 'pinia'
import { z } from 'zod'
import { setupMigrator } from 'migration'
import { downloadExtraFilesForUdr } from 'custodian'
import { useCredentialStore } from '@/stores/credentials'
import autoUpdate from '@/stores/autoUpdate'
import { request } from '@/axios'
import '../../migrations'
import { useHitekCenter } from '@/composables/hitek-center'

const userInfo = z.object({
  id: z.string(),
  realName: z.string(),
  userName: z.string(),
  iconUrl: z.string().nullable(),
  signPhoto: z.string().nullable(),
}).transform(info => ({
  id: info.id,
  name: info.realName,
  username: info.userName,
  avatar: info.iconUrl,
  autograph: info.signPhoto,
}))

export interface User extends z.infer<typeof userInfo> {
  /**
   * Pattern: company.username.db
   * @example
   * whld.admin.db
   */
  database: string
  permissions: string[]
}

export const useUserStore = defineStore('uhb.user', {
  state: (): User => {
    return {
      id: '',
      name: '',
      username: '',
      avatar: null,
      autograph: null,
      database: '',
      permissions: [],
    }
  },
  actions: {
    async login(username: string, password: string, code: string) {
      const credentialStore = useCredentialStore()
      if (!await credentialStore.hasValidCredential())
        await credentialStore.requestToken({ username, password, code })
      const info = await request({
        url: '/ilis2/rest/userController/user/info',
        schema: userInfo,
      })
      const key = `${credentialStore.code}.${info.username}`
      this.id = info.id
      this.name = info.name
      this.username = info.username
      this.avatar = info.avatar
      this.autograph = info.autograph
      this.database = `${key}.db`
      this.permissions = []
      // schema migration
      const migrator = setupMigrator(this.database)
      await migrator.migrate()
      // extra udr scripts
      useHitekCenter(downloadExtraFilesForUdr)
    },
    logout() {
      const credentialStore = useCredentialStore()
      credentialStore.$reset()
      autoUpdate().stop()
      this.$reset()
    },
  },
})
