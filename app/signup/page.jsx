"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, HomeIcon } from "lucide-react";

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    cognome: "",
    ragione_sociale: "",
    telefono: "",
    email: "",
    password: "",
    partita_iva: "",
    // SEDE LEGALE
    sede_legale: "",
    citta_legale: "",
    pr_legale: "",
    cap_legale: "",
    // SEDE OPERATIVA
    sede_operativa: "",
    citta_operativa: "",
    pr_operativa: "",
    cap_operativa: "",
    // STUDIO
    indirizzo_studio: "",
    citta_studio: "",
    cap_studio: "",
    pr_studio: "",
    codice_univoco: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🔑 GENERATORE PASSWORD SICURA
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 14; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password }));
    setGeneratedPassword(password);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(form.password);
    // Potresti aggiungere un toast qui
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Pulisci password generata se modifica manualmente
    if (name === "password" && generatedPassword) {
      setGeneratedPassword("");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (data.error) setError(data.error);
      else setSuccess(true);
    } catch (err) {
      setLoading(false);
      setError("Errore durante la registrazione");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white text-gray-500">
      <div className="w-full max-w-4xl p-10 bg-white rounded-3xl shadow-xl border">
        <h1 className="text-3xl font-bold text-center mb-8">Nuovo amministratore</h1>

        {error && (
          <p className="mb-6 text-red-500 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-8">
          {/* === DATI ANAGRAFICI === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-200 pb-2">
              👤 Dati Anagrafici
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["name", "Nome *"],
                ["cognome", "Cognome *"],
                ["ragione_sociale", "Ragione sociale"],
                ["telefono", "Telefono"],
                ["email", "Email *"],
                ["partita_iva", "Partita IVA"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  name={key}
                  placeholder={label}
                  value={form[key]}
                  onChange={handleChange}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={["name", "email"].includes(key)}
                />
              ))}
            </div>
          </section>

          {/* === SEDE LEGALE === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-green-200 pb-2">
              🏢 Sede Legale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["sede_legale", "Indirizzo"],
                ["citta_legale", "Città"],
                ["pr_legale", "Provincia"],
                ["cap_legale", "CAP"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  name={key}
                  placeholder={label}
                  value={form[key]}
                  onChange={handleChange}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ))}
            </div>
          </section>

          {/* === SEDE OPERATIVA === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-orange-200 pb-2">
              🏭 Sede Operativa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["sede_operativa", "Indirizzo"],
                ["citta_operativa", "Città"],
                ["pr_operativa", "Provincia"],
                ["cap_operativa", "CAP"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  name={key}
                  placeholder={label}
                  value={form[key]}
                  onChange={handleChange}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              ))}
            </div>
          </section>

          {/* === STUDIO === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-purple-200 pb-2">
              📍 Studio Professionale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["indirizzo_studio", "Indirizzo studio"],
                ["citta_studio", "Città studio"],
                ["pr_studio", "Provincia studio"],
                ["cap_studio", "CAP studio"],
                ["codice_univoco", "Codice univoco"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  name={key}
                  placeholder={label}
                  value={form[key]}
                  onChange={handleChange}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ))}
            </div>
          </section>

          {/* === PASSWORD CON GENERATORE === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-red-200 pb-2">
              🔐 Password Sicura
            </h2>
            
            <div className="space-y-3">
              {/* Campo password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Inserisci o genera password (min 12 caratteri)"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-28 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Mostra/Nascondi"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all"
                    title="Genera password sicura"
                  >
                    🔑
                  </button>
                  {form.password && (
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all"
                      title="Copia password"
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>

              {/* Password generata */}
              {generatedPassword && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 mb-1">Password generata:</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-green-100 px-2 py-1 rounded font-mono text-sm">
                      {generatedPassword}
                    </code>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Copia
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Usa almeno 12 caratteri. Clicca 🔑 per generare automaticamente una password sicura.
            </p>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? "Caricamento..." : "Crea amministratore"}
          </button>
        </form>
      </div>

      {/* POPUP SUCCESS */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-green-600 mb-4">
              ✅ Amministratore creato con successo!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Email: <strong>{form.email}</strong>
            </p>
            {form.password && (
              <p className="text-sm mb-6">
                Password: <code className="bg-gray-100 px-2 py-1 rounded">{form.password}</code>
              </p>
            )}


          </div>
        </div>
      )}
          
                    <button type="button"
 onClick={() => { if (confirm("Vuoi tornare alla Home senza salvare?")) { router.push("/dashboard"); } }} 
 title="Torna alla Home" className=" fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition " > 
 <HomeIcon className="home w-10 h-10"/> 
 </button>
    </div>
  );
}
