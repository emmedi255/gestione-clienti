import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
"https://hbozloyhowjudrjpckna.supabase.co",  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib3psb3lob3dqdWRyanBja25hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjEyOTMwMiwiZXhwIjoyMDgxNzA1MzAyfQ.mFNolnm7Sf3L63QcHwinFQya9z9DgqruH-dIpAyEzac"
);

async function createUsers() {
  

  await supabase.auth.admin.createUser({
    email: "admin.owner@example.com",
    password: "AdminPass123!",
    email_confirm: true,
  });

  console.log("Utenti creati!");
}

createUsers();
