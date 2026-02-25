"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye, EyeOff, HomeIcon, User, Users } from "lucide-react";
import DashboardLayout from "../../../components/DashboardLayout";

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; // id dell'amministratore da modificare

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copySedeOperativa, setCopySedeOperativa] = useState(false);
  const [copyStudio, setCopyStudio] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // 🔹 Carica dati admin
  useEffect(() => {
    async function loadAdmin() {
      try {
        const res = await fetch(`/api/admins/${id}`);
        if (!res.ok) throw new Error("Admin non trovato");
        const data = await res.json();

        // Prepara la struttura del form come nel signup
        setForm({
          name: data.name || "",
          cognome: data.cognome || "",
          ragione_sociale: data.ragione_sociale || "",
          telefono: data.telefono || "",
          email: data.email || "",
          password: "", // vuota per sicurezza
          partita_iva: data.partita_iva || "",
          role: data.role || "CLIENTE",
          sede_legale: data.sede_legale || "",
          citta_legale: data.citta_legale || "",
          pr_legale: data.pr_legale || "",
          cap_legale: data.cap_legale || "",
          sede_operativa: data.sede_operativa || "",
          citta_operativa: data.citta_operativa || "",
          pr_operativa: data.pr_operativa || "",
          cap_operativa: data.cap_operativa || "",
          indirizzo_studio: data.indirizzo_studio || "",
          citta_studio: data.citta_studio || "",
          pr_studio: data.pr_studio || "",
          cap_studio: data.cap_studio || "",
          codice_univoco: data.codice_univoco || "",
          password_expiration: data.password_expiration
            ? data.password_expiration.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Errore durante il caricamento dell'amministratore");
        setLoading(false);
      }
    }

    loadAdmin();
  }, [id]);

  // 🔑 Generatore password e copia dati (come nel signup)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password" && generatedPassword) setGeneratedPassword("");
  };

  // Copia Sede Legale -> Sede Operativa
  useEffect(() => {
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

  // 🔹 Salvataggio modifiche
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (data.error) setError(data.error);
      else setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Errore durante l'aggiornamento");
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Caricamento...</p>;
  if (!form)
    return (
      <p className="text-center mt-10 text-red-500">
        {error || "Admin non trovato"}
      </p>
    );

  return (
    <DashboardLayout>
      {/* Puoi riutilizzare tutto il markup del form del signup, cambiando solo `onSubmit` e testi */}
      <form onSubmit={handleUpdate} className="space-y-8">
        {/* ...qui inserisci tutte le sezioni del form come nel signup... */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Aggiorna amministratore"}
        </button>
      </form>

      {success && (
        <p className="text-center mt-6 text-green-600">
          ✅ Admin aggiornato con successo!
        </p>
      )}
    </DashboardLayout>
  );
}
