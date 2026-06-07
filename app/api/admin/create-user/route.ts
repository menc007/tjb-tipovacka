import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Ověření přihlášeného uživatele
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nepřihlášen' },
        { status: 401 }
      )
    }

    // Ověření role admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nedostatečná práva' },
        { status: 403 }
      )
    }

    // Admin Supabase klient (service role – má plný přístup)
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const body = await req.json()
    const { email, password, username } = body

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Vyplň email, heslo a přezdívku' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Heslo musí mít alespoň 8 znaků' },
        { status: 400 }
      )
    }

    // Vytvoření uživatele v Supabase Auth
    const { data: newUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username },
      })

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    // Vytvoření profilu v tabulce profiles
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id:           newUser.user.id,
        username:     username,
        display_name: username,
        role:         'user',
      })

    if (profileError) {
      // Rollback – smazání uživatele pokud profil selhal
      await adminSupabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      message: `Uživatel ${username} byl úspěšně vytvořen`,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Interní chyba serveru'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}