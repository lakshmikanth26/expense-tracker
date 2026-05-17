import { MonthData, GitHubConfig } from './types'
import { emptyMonthData } from './utils'

function getConfig(): GitHubConfig | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('gh_token') || ''
  const owner = localStorage.getItem('gh_owner') || ''
  const repo = localStorage.getItem('gh_repo') || ''
  const branch = localStorage.getItem('gh_branch') || 'main'
  if (!token || !owner || !repo) return null
  return { token, owner, repo, branch }
}

function apiUrl(cfg: GitHubConfig, path: string): string {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`
}

function headers(cfg: GitHubConfig) {
  return {
    Authorization: `token ${cfg.token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  const cfg = getConfig()
  if (!cfg) return { ok: false, message: 'GitHub not configured. Go to Settings.' }
  try {
    const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
      headers: headers(cfg),
    })
    if (res.ok) return { ok: true, message: 'Connected successfully!' }
    return { ok: false, message: `GitHub error: ${res.status} ${res.statusText}` }
  } catch {
    return { ok: false, message: 'Network error. Check your token and repo.' }
  }
}

export async function getMonthData(month: string): Promise<MonthData> {
  const cfg = getConfig()
  if (!cfg) return emptyMonthData(month)
  try {
    const res = await fetch(apiUrl(cfg, `data/${month}.json`) + `?ref=${cfg.branch}`, {
      headers: headers(cfg),
    })
    if (!res.ok) return emptyMonthData(month)
    const json = await res.json()
    const content = JSON.parse(atob(json.content.replace(/\n/g, '')))
    return content as MonthData
  } catch {
    return emptyMonthData(month)
  }
}

export async function saveMonthData(month: string, data: MonthData): Promise<boolean> {
  const cfg = getConfig()
  if (!cfg) return false
  try {
    const path = `data/${month}.json`
    const url = apiUrl(cfg, path)
    let sha: string | undefined

    const existing = await fetch(url + `?ref=${cfg.branch}`, { headers: headers(cfg) })
    if (existing.ok) {
      const j = await existing.json()
      sha = j.sha
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))
    const body: Record<string, unknown> = {
      message: `Update ${month} data`,
      content,
      branch: cfg.branch,
    }
    if (sha) body.sha = sha

    const res = await fetch(url, {
      method: 'PUT',
      headers: headers(cfg),
      body: JSON.stringify(body),
    })

    if (res.ok) {
      await updateManifest(month)
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function getManifest(): Promise<string[]> {
  const cfg = getConfig()
  if (!cfg) return []
  try {
    const res = await fetch(apiUrl(cfg, 'data/manifest.json') + `?ref=${cfg.branch}`, {
      headers: headers(cfg),
    })
    if (!res.ok) return []
    const j = await res.json()
    return JSON.parse(atob(j.content.replace(/\n/g, ''))) as string[]
  } catch {
    return []
  }
}

async function updateManifest(month: string): Promise<void> {
  const cfg = getConfig()
  if (!cfg) return
  try {
    const months = await getManifest()
    if (!months.includes(month)) {
      months.push(month)
      months.sort()
      const url = apiUrl(cfg, 'data/manifest.json')
      let sha: string | undefined
      const existing = await fetch(url + `?ref=${cfg.branch}`, { headers: headers(cfg) })
      if (existing.ok) {
        const j = await existing.json()
        sha = j.sha
      }
      const content = btoa(JSON.stringify(months, null, 2))
      const body: Record<string, unknown> = {
        message: 'Update manifest',
        content,
        branch: cfg.branch,
      }
      if (sha) body.sha = sha
      await fetch(url, { method: 'PUT', headers: headers(cfg), body: JSON.stringify(body) })
    }
  } catch {
    // non-critical
  }
}

export function isConfigured(): boolean {
  if (typeof window === 'undefined') return false
  return !!(localStorage.getItem('gh_token') && localStorage.getItem('gh_owner') && localStorage.getItem('gh_repo'))
}
