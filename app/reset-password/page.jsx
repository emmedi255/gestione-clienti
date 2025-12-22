"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff } from "lucide-react";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);


  const handleReset = async () => {
    // if (password.length < 6) {
    //   setMessage("La password deve avere almeno 6 caratteri");
    //   return;
    // }



    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password aggiornata con successo! Verrai reindirizzato al login…");

    // 🔐 Chiudi la sessione di recovery
    await supabase.auth.signOut();

    // 🔁 Redirect al login dopo 2s
    setTimeout(() => {
      router.push("/login");
    }, 2000);

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-500">
          Reimposta password
        </h1>

       <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-800 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="bg-blue-600 text-white p-4 mt-4 w-full rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Aggiornamento..." : "Aggiorna password"}
        </button>

        {message && (
          <p className="text-sm text-center mt-4 text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
