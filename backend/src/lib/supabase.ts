import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY
  ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 10)}...)`
  : 'undefined')

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
