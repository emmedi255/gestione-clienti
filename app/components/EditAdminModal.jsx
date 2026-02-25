"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, HomeIcon, User, Users } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

export default function EditAdminModal({ adminId, onClose }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copySedeOperativa, setCopySedeOperativa] = useState(false);
  const [copyStudio, setCopyStudio] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const defaultExpiration = new Date();
  defaultExpiration.setFullYear(defaultExpiration.getFullYear() + 1);
  // 🔹 carica admin
  useEffect(() => {
    async function loadAdmin() {
      try {
        const res = await fetch(`/api/customers/${adminId}`);
        const data = await res.json();
        const today = new Date();
        const adminExpiration = new Date(data.admin.password_expiration);
        if (data.admin) {
          setForm({
            ...data.admin,
            password_expiration:
              adminExpiration >= today
                ? adminExpiration.toISOString().slice(0, 10) // YYYY-MM-DD
                : defaultExpiration.toISOString().slice(0, 10),
          });
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Errore nel caricamento dell'amministratore");
        setLoading(false);
      }
    }
    loadAdmin();
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSuccess(false);
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "password" && generatedPassword) setGeneratedPassword("");
  };

  // 🔑 Generatore password sicura
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 14; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm((prev) => ({ ...prev, password }));
    setGeneratedPassword(password);
  };
  const copyPassword = () => navigator.clipboard.writeText(form.password);

  // Copia Sede Legale -> Sede Operativa
  // Copia Sede Legale -> Sede Operativa
  useEffect(() => {
    setSuccess(false);
    if (copySedeOperativa && form) {
      setForm((prev) => ({
        ...prev,
        sede_operativa: prev.sede_legale,
        citta_operativa: prev.citta_legale,
        pr_operativa: prev.pr_legale,
        cap_operativa: prev.cap_legale,
      }));
    }
  }, [
    copySedeOperativa,
    form?.sede_legale,
    form?.citta_legale,
    form?.pr_legale,
    form?.cap_legale,
  ]);

  // Copia Sede Legale -> Studio
  useEffect(() => {
    setSuccess(false);

    if (copyStudio && form) {
      setForm((prev) => ({
        ...prev,
        indirizzo_studio: prev.sede_legale,
        citta_studio: prev.citta_legale,
        pr_studio: prev.pr_legale,
        cap_studio: prev.cap_legale,
      }));
    }
  }, [
    copyStudio,
    form?.sede_legale,
    form?.citta_legale,
    form?.pr_legale,
    form?.cap_legale,
  ]);
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    try {
      const res = await fetch(`/api/customers/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Errore durante l'aggiornamento");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        Caricamento...
      </div>
    );
  if (!form) return null;

  const roles = [
    {
      value: "CLIENTE",
      label: "Cliente",
      icon: User,
      description: "Gestisce i propri condomini",
    },
    {
      value: "OWNER",
      label: "Amministratore",
      icon: Users,
      description: "Gestisce condomini e amministratori",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 text-gray-600">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6">Modifica Amministratore</h2>

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* === DATI ANAGRAFICI === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-200 pb-2">
              Dati Anagrafici
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

          {/* === RUOLO === ← NUOVA SEZIONE */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-indigo-200 pb-2">
              Ruolo Utente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <label key={role.value} className="cursor-pointer group">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={form.role === role.value}
                    onChange={handleChange}
                    className="sr-only peer"
                    required
                  />
                  <div
                    className={`
                    p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 h-full
                    peer-checked:bg-gradient-to-br peer-checked:from-indigo-50 peer-checked:to-purple-50
                    peer-checked:border-indigo-300 peer-checked:shadow-md peer-checked:transform peer-checked:scale-[1.02]
                    group-hover:border-indigo-200 group-hover:shadow-sm
                    ${form.role === role.value ? "!bg-gradient-to-br !from-indigo-50 !to-purple-50 !border-indigo-300 !shadow-md !scale-[1.02]" : "border-gray-200 bg-white"}
                  `}
                  >
                    <role.icon className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        {role.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {role.description}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* === SEDE LEGALE === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-200 pb-2">
              Sede Legale
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
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-200 pb-2">
              Sede Operativa
            </h2>
            <label className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-orange-400 text-orange-600 focus:ring-orange-500"
                checked={copySedeOperativa}
                onChange={(e) => setCopySedeOperativa(e.target.checked)}
              />
              <span>Uguale alla sede legale</span>
            </label>
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
                  disabled={copySedeOperativa}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              ))}
            </div>
          </section>

          {/* === STUDIO === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-purple-200 pb-2">
              Studio Professionale
            </h2>
            <label className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-purple-400 text-purple-600 focus:ring-purple-500"
                checked={copyStudio}
                onChange={(e) => setCopyStudio(e.target.checked)}
              />
              <span>Uguale alla sede legale</span>
            </label>
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
                  disabled={copyStudio && key !== "codice_univoco"}
                  className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              ))}
            </div>
          </section>

          {/* === PASSWORD CON GENERATORE === */}
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-200 pb-2">
              Password Sicura
            </h2>
            {/* Password section invariata... */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Inserisci o genera password (min 12 caratteri)"
                  value={form.password || ""}
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

              {generatedPassword && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 mb-1">
                    Password generata:
                  </p>
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
              Usa almeno 12 caratteri. Clicca 🔑 per generare automaticamente
              una password sicura.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-200 pb-2">
              Scadenza Password
            </h2>
            <div className="max-w-xs">
              <label className="block text-sm font-medium mb-2">
                Data scadenza
              </label>
              <input
                type="date"
                name="password_expiration"
                value={form.password_expiration}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                La password scadrà automaticamente dopo 1 anno di default.
              </p>
            </div>
          </section>

          {success && (
            <p className="text-green-500 mb-4">Aggiornamento completato!</p>
          )}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? "Caricamento..." : "Modifica amministratore"}
          </button>
        </form>
      </div>
    </div>
  );
}
