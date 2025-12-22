"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.error) setError(data.error);
      else setSuccess(true); // mostra il popup
    } catch (err) {
      setLoading(false);
      setError("Errore durante la registrazione");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white font-sans relative">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-xl border border-gray-200 z-10 relative">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Registrazione Cliente
        </h1>

        {error && (
          <p className="mb-4 text-red-500 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-800 transition"
            required
          />
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

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition duration-200 font-semibold shadow-md disabled:opacity-50"
          >
            {loading ? "Caricamento..." : "Registrati"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Hai già un account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 font-medium hover:underline"
          >
            Accedi
          </button>
        </p>
      </div>

      {/* ---------- POPUP SUCCESS CON BOTTONE ---------- */}
      {success && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Registrazione avvenuta con successo!
            </h2>
            <p className="text-gray-700 mb-6">
              Controlla la tua casella postale e conferma la tua email
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Vai al Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
