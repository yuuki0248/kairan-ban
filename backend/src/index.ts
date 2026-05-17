import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { postsRouter } from './routes/posts.js'
import { readsRouter } from './routes/reads.js'
import { usersRouter } from './routes/users.js'
import { surveysRouter } from './routes/surveys.js'
import { inquiriesRouter } from './routes/inquiries.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())

app.route('/api/posts', postsRouter)
app.route('/api/reads', readsRouter)
app.route('/api/users', usersRouter)
app.route('/api/surveys', surveysRouter)
app.route('/api/inquiries', inquiriesRouter)

app.get('/health', (c) => c.json({ ok: true }))

const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Backend running on http://localhost:${info.port}`)
})
