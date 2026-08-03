import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://admgvtrblnzdncmzsrbp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkbWd2dHJibG56ZG5jbXpzcmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MTAxMTEsImV4cCI6MjEwMTI4NjExMX0.RuZUFsyWdRTUKkQ6ziE_3updwKIdcrf1gypPXewBoz4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)