import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Nedostatečná práva' }, { status: 403 })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Chybí userId' }, { status: 400 })
    }

    // Nelze smazat admina
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json(
        { error: 'Admina nelze smazat' },
        { status: 403 }
      )
    }

    // Smazání (cascade smaže profil a tipy automaticky)
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Interní chyba'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}