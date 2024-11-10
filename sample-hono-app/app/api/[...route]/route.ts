import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { basicAuth } from 'hono/basic-auth'


export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.use(
  '/admin/*',
  basicAuth({
    username: 'name',
    password: 'password',
  })
)

app.get('/admin', (c) => {
  return c.text('You are authorized!')
})

app.get('/hello/:name', (c) => {
  const name = c.req.param('name')
  return c.json({
    message: `Hello! Mr.${name}!!`,
    status: 200
  })
})

export const GET = handle(app)