"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function DataForm() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [company, setCompany] = useState("");
  const [vat, setVat] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!user) {
      setError("Utente non loggato");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/submit-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          company,
          vat_number: vat,
          address,
        }),
      });

      // Log per debug completo
      console.log("Response status:", res.status, res.ok);

      const text = await res.text(); // Leggi come testo per debug
      console.log("Response text:", text);

      let data;
      try {
        data = JSON.parse(text); // Prova a parsare JSON
      } catch (parseErr) {
        console.error("Errore parsing JSON:", parseErr);
        setError("Server non ha restituito JSON valido");
        return;
      }

      if (data.error) setError(data.error);
      else setSuccess(data.message);

    } catch (err) {
      console.error("Errore fetch:", err);
      setError("Errore durante l'invio dei dati");
    } finally {
      setLoading(false);
      router.back()
    }
  };

  if (userLoading) {
    return <p className="text-center mt-10 text-gray-500 font-medium">Caricamento utente...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-500 font-medium">Utente non loggato</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-500 mb-6">Inserisci Dati Azienda</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Azienda"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Partita IVA"
            value={vat}
            onChange={(e) => setVat(e.target.value)}
            required
            className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Indirizzo"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {loading ? "Caricamento..." : "Invia e genera PDF/Excel"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            Torna alla home
          </button>
        </form>
      </div>
    </div>
  );
}
