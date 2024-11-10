import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { basicAuth } from 'hono/basic-auth'
import { HTTPException } from 'hono/http-exception'
import { z, ZodError } from 'zod'
import { zValidator } from '@hono/zod-validator'


export const runtime = 'edge'

// Hono is the primary object. It will be imported first and used until the end.
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


// Custom 404 handler
// app.notFound allows you to customize a Not Found Response.
app.notFound((c) => {
  return c.json({
    message: "残念でしたー。そんなエンドポイントないですよ😇",
    status: 404
  })
})


// Error Handling
// https://hono.dev/docs/api/hono#error-handling
// app.onError handles an error and returns a customized Response.
// → honoはトップダウンでエラーを処理できる。ここにロギングの処理とか入れると良いかもね。
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({
    message: `サーバーでエラーが発生してまっせ！！大変だーー😅 原因：${err}`,
    status: 500
  })
})

//エラーを意図的に発生させるエンドポイント
app.get('/error', (c) => {
  throw new Error('intended error')
})


// Exception 
// https://hono.dev/docs/api/exception#exception
// When a fatal error occurs, such as authentication failure, an HTTPException must be thrown.
// → honoにはHTTPExceptionクラスが用意されており、認証時のエラーなどのHTTPステータスコードを指定してエラーをスローすることが推奨
app.get('/exception', async (c, next) => {
  const authorized = false
  if (!authorized) {
    throw new HTTPException(401, { message: '認証関連のエラーでっせ！！！😜' })
  }
  await next()
})

// Validation Error
// https://hono.dev/examples/validator-error-handling#error-handling-in-validator
// By using a validator, you can handle invalid input more easily. This example shows you can utilize the callback result for implementing custom error handling.

const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number')
})
app.get(
  '/user/:id',
  zValidator('param', idSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        message: "Invalid ID.....",
        status: 400
      })

    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    return c.json({
      message: `Valid ID: ${id}`,
      status: 200
    })
  }
)

export const GET = handle(app)