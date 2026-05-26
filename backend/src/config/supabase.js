const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan las credenciales de Supabase en el archivo .env')
  console.error('SUPABASE_URL:', supabaseUrl ? 'OK' : 'FALTA')
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'OK' : 'FALTA')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('✅ Supabase cliente inicializado correctamente')

module.exports = supabase