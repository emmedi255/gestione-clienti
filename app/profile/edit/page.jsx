"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import DashboardLayout from "../../components/DashboardLayout";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ ...user });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) setForm({ ...user, role: "CLIENTE" }); // forza role CLIENTE
  }, [user]);
  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-8 text-gray-600">Nessun utente loggato.</div>
      </DashboardLayout>
    );
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setUser(data.user); // aggiorna il contesto con tutti i dati
      document.cookie = `session_user=${JSON.stringify(data.user)}; path=/`;

      setSuccess("Profilo aggiornato!");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err) {
      alert("Errore aggiornamento: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-gray-600">Caricamento...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-8 text-gray-600">Nessun utente loggato.</div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6 text-gray-600">
        <h2 className="text-lg font-semibold mb-4">Modifica Profilo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dati Generali */}
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">
              Dati Generali
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cognome
                </label>
                <input
                  type="text"
                  value={form.cognome || ""}
                  onChange={(e) => updateField("cognome", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telefono
                </label>
                <input
                  type="text"
                  value={form.telefono || ""}
                  onChange={(e) => updateField("telefono", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ragione Sociale
                </label>
                <input
                  type="text"
                  value={form.ragione_sociale || ""}
                  onChange={(e) =>
                    updateField("ragione_sociale", e.target.value)
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Partita IVA
                </label>
                <input
                  type="text"
                  value={form.partita_iva || ""}
                  onChange={(e) => updateField("partita_iva", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Codice Univoco
                </label>
                <input
                  type="text"
                  value={form.codice_univoco || ""}
                  onChange={(e) =>
                    updateField("codice_univoco", e.target.value)
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Sedi */}
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">
              Sedi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sede Legale */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sede Legale
                </label>
                <input
                  type="text"
                  value={form.sede_legale || ""}
                  onChange={(e) => updateField("sede_legale", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CAP
                </label>
                <input
                  type="text"
                  value={form.cap_legale || ""}
                  onChange={(e) => updateField("cap_legale", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Città
                </label>
                <input
                  type="text"
                  value={form.citta_legale || ""}
                  onChange={(e) => updateField("citta_legale", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <input
                  type="text"
                  value={form.pr_legale || ""}
                  onChange={(e) => updateField("pr_legale", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Sede Operativa */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sede Operativa
                </label>
                <input
                  type="text"
                  value={form.sede_operativa || ""}
                  onChange={(e) =>
                    updateField("sede_operativa", e.target.value)
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CAP
                </label>
                <input
                  type="text"
                  value={form.cap_operativa || ""}
                  onChange={(e) => updateField("cap_operativa", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Città
                </label>
                <input
                  type="text"
                  value={form.citta_operativa || ""}
                  onChange={(e) =>
                    updateField("citta_operativa", e.target.value)
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <input
                  type="text"
                  value={form.pr_operativa || ""}
                  onChange={(e) => updateField("pr_operativa", e.target.value)}
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            {loading ? "Salvando..." : "Salva Modifiche"}
          </button>
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </form>
      </div>
    </DashboardLayout>
  );
}
