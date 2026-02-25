"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DataForm from "@/app/add-company/page";
import { mapDbToForm } from "@/app/utils/mappers/mapDbToForm";
import { useCondomini } from "../../context/CondominiContext";

export default function EditCondominioPage() {
  const { condomini } = useCondomini();
  const params = useParams();
  const id = params.id;

  // Trova il condominio direttamente dal context
  const condominio = condomini.find((c) => c.condominio_id === id);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCondominio() {
      if (condominio) {
        setForm(mapDbToForm(condominio));
        setLoading(false);
        return;
      }
    }

    loadCondominio();
  }, [condominio, id]);

  if (loading) return <p>Caricamento...</p>;
  if (!form) return <p>Condominio non trovato</p>;

  return <DataForm initialForm={form} mode="edit" condominioId={id} />;
}
