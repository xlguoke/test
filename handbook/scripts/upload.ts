import process from 'node:process'
import { createReadStream } from 'node:fs'
import colors from 'picocolors'
import fetch from 'node-fetch'
import FormData from 'form-data'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { args } from './utils'

export async function upload(tag: string, path: string, proxy?: string) {
  let dir = 'ILIS_ELN'
  if (tag.includes('beta') || tag.includes('alpha'))
    dir = 'ILIS_ELN_DEBUG'
  let agent: HttpsProxyAgent<string> | undefined
  if (proxy)
    agent = new HttpsProxyAgent<string>(proxy)
  const form = new FormData()
  form.append('Content-Type', 'application/octect-stream')
  form.append('files', createReadStream(path))
  form.append('name', `uhb-${tag}.apk`)
  const res = await fetch(
    `https://auth.qdm123.com/Content/js/HitekPlugins/HitekUpload/HitekFileUpload.ashx?FileType=FileType&FileTypeTag=${dir}`,
    {
      method: 'post',
      body: form,
      agent,
    },
  )
  if (res.ok) {
    console.log(colors.green(`upload success, download link: https://auth.qdm123.com/api/ClientSetup/DownLoadSetupClient?PType=${dir}`))
  }
  else {
    console.log(colors.red('upload failed'), await res.text())
    process.exit(1)
  }
}

function main() {
  const tag = args.tag
  if (!tag)
    throw new Error('tag is required')
  const path = args.path
  if (!path)
    throw new Error('path is required')
  const proxy = args.proxy
  upload(tag, path, proxy)
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
main()
