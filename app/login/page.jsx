"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {



  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ FONDAMENTALE
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Errore di login");
      return;
    }

    setUser(data.user);
    router.push("/dashboard");
  } catch (err) {
    setLoading(false);
    setError("Errore durante il login");
    console.error(err);
  }
};

const handleResetPassword = async () => {
  if (!email) {
    setError("Inserisci prima la tua email");
    return;
  }

  setResetLoading(true);
  setResetMessage("");
  setError("");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  setResetLoading(false);

  if (error) {
    setError(error.message);
  } else {
    setResetMessage(
      "Ti abbiamo inviato un'email per reimpostare la password"
    );
  }
};



  const goToSignup = () => router.push("/signup");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white font-sans">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-xl border border-gray-200">
        {/* Titolo */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Benvenuto
        </h1>

        {/* Messaggio di errore */}
        {error && (
          <p className="mb-4 text-red-500 text-center font-medium">{error}</p>
        )}
        {resetMessage && (
  <p className="mb-4 text-green-600 text-center font-medium">
    {resetMessage}
  </p>
)}


        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-800 transition"
            required
          />
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
          <div className="text-right">
  <button
    type="button"
    onClick={handleResetPassword}
    disabled={resetLoading}
    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
  >
    {resetLoading ? "Invio email..." : "Password dimenticata?"}
  </button>
</div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition duration-200 font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? "Caricamento..." : "Accedi"}
          </button>
        </form>

        {/* Link secondari */}
        <p className="mt-6 text-center text-gray-500">
          Non hai un account?{" "}
          <button
            onClick={goToSignup}
            className="text-blue-600 font-medium hover:underline"
          >
            Registrati
          </button>
        </p>
      </div>
    </div>
  );
}
