import { Hono } from 'hono'
import { authMiddleware, adminMiddleware, type UserVar } from '../middleware/auth.js'
import { supabase } from '../lib/supabase.js'

type Question = { id: string; text: string; options: string[] }

export const surveysRouter = new Hono<UserVar>()

// GET /surveys — 一覧（自分の回答済み状態付き）
surveysRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user')

  const [surveysResult, myAnswersResult] = await Promise.all([
    supabase
      .from('surveys')
      .select('*, author:users(display_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('survey_answers')
      .select('survey_id')
      .eq('user_id', user.id),
  ])

  if (surveysResult.error) return c.json({ error: surveysResult.error.message }, 500)

  const answeredIds = new Set(myAnswersResult.data?.map((a) => a.survey_id) ?? [])
  const surveys = surveysResult.data.map((s) => ({
    ...s,
    is_answered: answeredIds.has(s.id),
  }))

  return c.json(surveys)
})

// POST /surveys — アンケート作成（管理者のみ）
surveysRouter.post('/', authMiddleware, adminMiddleware, async (c) => {
  const user = c.get('user')
  const body = await c.req.json<{ title: string; questions: Question[] }>()

  if (!body.title || !Array.isArray(body.questions) || body.questions.length === 0) {
    return c.json({ error: 'title and questions are required' }, 400)
  }

  const { data, error } = await supabase
    .from('surveys')
    .insert({ title: body.title, questions: body.questions, author_id: user.id })
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

// GET /surveys/:id — 詳細＋自分の回答
surveysRouter.get('/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')

  const [surveyResult, myAnswerResult] = await Promise.all([
    supabase
      .from('surveys')
      .select('*, author:users(display_name)')
      .eq('id', surveyId)
      .single(),
    supabase
      .from('survey_answers')
      .select('answers')
      .eq('survey_id', surveyId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (surveyResult.error || !surveyResult.data) return c.json({ error: 'Survey not found' }, 404)

  return c.json({
    ...surveyResult.data,
    my_answer: (myAnswerResult.data?.answers as Record<string, string>) ?? null,
  })
})

// POST /surveys/:id/answers — 回答送信（1人1回、upsert）
surveysRouter.post('/:id/answers', authMiddleware, async (c) => {
  const user = c.get('user')
  const surveyId = c.req.param('id')
  const body = await c.req.json<{ answers: Record<string, string> }>()

  if (!body.answers || typeof body.answers !== 'object') {
    return c.json({ error: 'answers are required' }, 400)
  }

  const { error } = await supabase
    .from('survey_answers')
    .upsert(
      { survey_id: surveyId, user_id: user.id, answers: body.answers },
      { onConflict: 'survey_id,user_id' }
    )

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// GET /surveys/:id/results — 集計結果（管理者のみ）
surveysRouter.get('/:id/results', authMiddleware, adminMiddleware, async (c) => {
  const surveyId = c.req.param('id')

  const [surveyResult, answersResult] = await Promise.all([
    supabase.from('surveys').select('*').eq('id', surveyId).single(),
    supabase.from('survey_answers').select('answers').eq('survey_id', surveyId),
  ])

  if (surveyResult.error || !surveyResult.data) return c.json({ error: 'Survey not found' }, 404)

  const survey = surveyResult.data
  const answers = answersResult.data ?? []
  const questions = survey.questions as Question[]

  const tally: Record<string, Record<string, number>> = {}
  for (const q of questions) {
    tally[q.id] = Object.fromEntries(q.options.map((opt) => [opt, 0]))
  }
  for (const row of answers) {
    const ans = row.answers as Record<string, string>
    for (const [qId, chosen] of Object.entries(ans)) {
      if (tally[qId]?.[chosen] !== undefined) tally[qId][chosen]++
    }
  }

  return c.json({ survey, tally, total: answers.length })
})
