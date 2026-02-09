import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://izcxnbajwjujzlctolkx.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Y3huYmFqd2p1anpsY3RvbGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0Mjc2NTMsImV4cCI6MjA4NTAwMzY1M30.nYNetjDTKfODixCrmc7LIiyXx1zGSxDn5lQe4GcS2po"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
