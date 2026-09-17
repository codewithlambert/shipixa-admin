import { createClient } from '@supabase/supabase-js'

let client: any = null

export function getAdmin(): any {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return client
}

export default getAdmin()
