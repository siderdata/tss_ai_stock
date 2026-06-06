import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))

const mimeMap: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

export default defineConfig({
  title: 'TSS AI Stock',
  description: '大模型 A 股量化交易系统 · 四阶段交易法 · 实盘记录',
  lang: 'zh-CN',
  cleanUrls: true,
  ignoreDeadLinks: true,
  base: '/tss_ai_stock/',

  head: [
    ['meta', { name: 'theme-color', content: '#0a1628' }],
  ],

  themeConfig: {
    siteTitle: 'TSS AI Stock',
    nav: [
      { text: '🏠 业绩仪表盘', link: '/' },
      { text: '🚀 主升浪时间线', link: '/timeline' },
      { text: '📊 量化评分', link: '/scores' },
      { text: '🎯 四阶段', link: '/phases' },
      { text: '📅 交易记录', link: '/journal/' },
      { text: 'GitHub', link: 'https://github.com/siderdata/tss_ai_stock' },
    ],
    sidebar: {
      '/journal/': [
        {
          text: '2026 年',
          collapsed: false,
          items: [
            { text: '📌 年度总结', link: '/journal/2026_Annual_Summary' },
            { text: '🚀 1月：把握主升浪', link: '/journal/2026-01/2026-01_Summary' },
            { text: '📋 1月计划', link: '/journal/2026-01/2026-01_PLan' },
            { text: '🌀 2月计划：高位震荡', link: '/journal/2026-02/2026-02_PLan' },
            { text: '🔥 4月总结：9.44 主升浪', link: '/journal/2026-04/2026-04-月度总结' },
            { text: '🌊 5月总结：认知觉醒月', link: '/journal/2026-05/2026-05-月度总结' },
            { text: '📋 5月计划', link: '/journal/2026-05/2026-05_PLan' },
            { text: '🛡️ 6月计划：杀跌防守', link: '/journal/2026-06/2026-06_Plan' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/siderdata/tss_ai_stock' },
    ],
    footer: {
      message: '量化评分 · 四阶段交易法 · 严格纪律 · 实盘记录',
      copyright: '© 2026 siderdata · MIT License',
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新' },
  },

  vite: {
    server: {
      fs: { allow: [projectRoot] },
    },
    plugins: [
      {
        name: 'watch-trading-journal',
        configureServer(server) {
          // dev 模式：监听 trading/2026 + wiki，自动重建索引并热刷新
          const watchPaths = [
            path.join(projectRoot, 'trading', '2026'),
            path.join(projectRoot, 'wiki'),
          ]
          let rebuildTimer: NodeJS.Timeout | null = null
          const rebuild = () => {
            if (rebuildTimer) clearTimeout(rebuildTimer)
            rebuildTimer = setTimeout(() => {
              console.log('[journal] 检测到 trading/wiki 变化，重建索引...')
              const proc = spawn('node', ['scripts/sync-content.mjs'], { cwd: projectRoot, stdio: 'inherit' })
              proc.on('exit', () => {
                spawn('node', ['scripts/build-journal-index.mjs'], { cwd: projectRoot, stdio: 'inherit' })
                  .on('exit', () => {
                    server.ws.send({ type: 'full-reload' })
                  })
              })
            }, 600)
          }
          for (const p of watchPaths) {
            if (fs.existsSync(p)) server.watcher.add(p)
          }
          server.watcher.on('add', f => watchPaths.some(p => f.startsWith(p)) && rebuild())
          server.watcher.on('change', f => watchPaths.some(p => f.startsWith(p)) && rebuild())
          server.watcher.on('unlink', f => watchPaths.some(p => f.startsWith(p)) && rebuild())
        },
      },
      {
        name: 'serve-project-data',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = decodeURIComponent((req.url || '').split('?')[0])
            for (const prefix of ['/data/', '/trading/', '/wiki/']) {
              if (url.startsWith(prefix)) {
                const filePath = path.join(projectRoot, url)
                try {
                  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    const ext = path.extname(filePath).toLowerCase()
                    res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream')
                    res.setHeader('Cache-Control', 'no-cache')
                    fs.createReadStream(filePath).pipe(res)
                    return
                  }
                } catch (e) { /* 忽略，继续 */ }
              }
            }
            next()
          })
        },
      },
    ],
  },
})
