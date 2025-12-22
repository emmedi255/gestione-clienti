import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_SUPABASE_ROLE_KEY // SERVICE ROLE lato server
);

export async function DELETE(req, { params }) {
  try {
    // ⚠️ unwrap della Promise
    const { id } = await params;

      
    if (!id) {
      return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });
    }

 const { error: documentsError } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", id);

      
    if (documentsError) throw new Error(documentsError.message);

     const { error: customerError } = await supabase
      .from("customer_data")
      .delete()
      .eq("user_id", id);

    if (customerError) throw new Error(customerError.message);


    // 2️⃣ elimina il profilo dalla tabella "profiles"
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

      
    if (profileError) throw new Error(profileError.message);

    
 

 

    // 1️⃣ elimina dall'autenticazione
    const { data: userData, error: userError } = await supabase.auth.admin.deleteUser(id);
    if (userError) throw new Error(userError.message);

    return NextResponse.json({ message: "Cliente eliminato correttamente" });
  } catch (err) {
    console.error("DELETE CUSTOMER ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
