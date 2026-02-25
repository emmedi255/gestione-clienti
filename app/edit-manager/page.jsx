"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditAdminForm({ id }) {
  const router = useRouter();
  const [form, setForm] = useState(null); // inizialmente null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dati esistenti dell'utente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/profile/${id}`);
        const data = await res.json();
        if (data.error) setError(data.error);
        else setForm(data);
      } catch (err) {
        setError("Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!form) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/profile/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else router.push("/condo-managers");
    } catch (err) {
      setError("Errore durante l'aggiornamento");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      {Object.keys(form).map((key) => (
        <input
          key={key}
          name={key}
          value={form[key]}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-full"
        />
      ))}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Aggiorna
      </button>
    </form>
  );
}
