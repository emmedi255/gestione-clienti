import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    // Crea utente in Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });
    if (userError) throw new Error(userError.message);

    // Crea il profilo nel DB
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userData.user.id, name, email,password, role: "CLIENTE" }]);
    if (profileError) throw new Error(profileError.message);

    return NextResponse.json({ message: "Utente creato, email di conferma inviata!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
