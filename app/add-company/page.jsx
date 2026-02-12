"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { FornitoriSection } from "../fornitori-section/FornitoriSection";
import { HomeIcon, RefreshCw } from "lucide-react";

export default function DataForm({ initialForm = null, mode = "create", condominioId = null }) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(false);
  const [loadingBozza, setLoadingBozza] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  

  const defaultForm = {
    intestazione: { data: new Date().toISOString().split("T")[0], condominio: "", citta:"", cap:"", provincia:"", cfCondominio: "" },
    sezione01: { nessunDipendente: false, portiere: { checked: false, numero: "" }, pulizie: { checked: false, numero: "" }, giardiniere: { checked: false, numero: "" }, manutentore: { checked: false, numero: "" }, altro: "" },
    sezione02: { portierato: false, consulenteLavoro: false, videosorveglianza: false, letturaContatori: false, rspp: false, altro: "" },
    sezione03: { elettronica: { enabled: false, serverLocale: { checked: false, autenticazione: false }, cloud: { checked: false, autenticazione: false } }, cartacea: { enabled: false, archivio: false, altro: "" }, sicurezza: { armadio: false, backup: false, password: false, cambioPassword: false, antivirus: false, firewall: false, screensaver: false } },
    sezione04: false,
    sezione05: { amministratore: `${user?.name ?? ""} ${user?.cognome ?? ""}`.trim(), specifica: user.ragione_sociale },
    sezione06: { dipendenti: false, smartWorking: false, autorizzato: false, fornitori: false },
    sezione07: { indirizzoStudio: user.indirizzo_studio, sedeLegale: user.sede_legale, sedeOperativa: user.sede_operativa, codiceUnivoco: user.codice_univoco },
    sezione071: false,
    sezione0711: { valore: false, note: "" },
    sezione8: { addedFornitori: [] }
  };
const resetForm = () => {
  setForm(defaultForm);
  setError("");
  setSuccess("");
};

  const [form, setForm] = useState(() => {
    if (!initialForm) return defaultForm;
    return {
      ...defaultForm,
      ...initialForm,
      sezione01: { ...defaultForm.sezione01, ...initialForm.sezione01 },
      sezione02: { ...defaultForm.sezione02, ...initialForm.sezione02 },
      sezione03: { ...defaultForm.sezione03, ...initialForm.sezione03 },
      sezione05: { ...defaultForm.sezione05, ...initialForm.sezione05 },
      sezione06: { ...defaultForm.sezione06, ...initialForm.sezione06 },
      sezione07: { ...defaultForm.sezione07, ...initialForm.sezione07 },
      sezione0711: { ...defaultForm.sezione0711, ...initialForm.sezione0711 },
      sezione8: { ...defaultForm.sezione8, ...initialForm.sezione8 },
    };
  });

useEffect(() => {
  if (mode === "edit" && condominioId) {
    fetch(`/api/get-condominio-fornitori?condominioId=${condominioId}`)
      .then(async res => {
        const text = await res.text();  // prendi il body come testo
        try {
          return JSON.parse(text);      // prova a fare il parse
        } catch (err) {
          console.error("Errore parsing JSON:", text);
          return { fornitori: [] };    // fallback se non è JSON
        }
      })
      .then(data => {

        if (data?.fornitori) {
          setForm(prev => ({
            ...prev,
            sezione8: { ...prev.sezione8, addedFornitori: data.fornitori }
          }));
        }
      })
      .catch(err => console.error("Errore fetch fornitori:", err));
  }
}, [mode, condominioId]);




  // ------------------------- UTILITY -------------------------
  const update = (path, value) => {
  if (!Array.isArray(path) || path.length === 0) return;

  setForm(prev => {
    const copy = structuredClone(prev);
    let ref = copy;

    path.slice(0, -1).forEach(k => {
      if (
        ref[k] === null ||
        typeof ref[k] !== "object" ||
        Array.isArray(ref[k])
      ) {
        ref[k] = {};
      }
      ref = ref[k];
    });

    ref[path[path.length - 1]] = value;
    return copy;
  });
};


  const toggle = (path) =>
    update(path, !path.reduce((a,k) => a?.[k] ?? false, form));

  const Cb = ({ label, path }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={path.reduce((a,k) => a?.[k] ?? false, form)}
        onChange={() => toggle(path)}
        className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
      />
      <span className="text-sm">{label}</span>
    </label>
  );

  

  // ------------------------- SUBMIT -------------------------
  const saveDraft = async () => {
    setLoadingBozza(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/save-condominio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, form, condominioId }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSuccess("Modulo salvato come bozza!");
    } catch {
      setError("Errore durante il salvataggio");
    } finally {
      setLoadingBozza(false);
      router.push("/dashboard");
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    // 1️⃣ Salva i dati del form su Supabase
    const submitRes = await fetch("/api/submit-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user: user, 
        form, 
        condominioId 
      }),
    });

    const submitData = await submitRes.json();
    if (submitData.error) {
      throw new Error(submitData.error);
    }

    // 2️⃣ Genera PDF Informativa Privacy
    // const pdfRes = await fetch("/api/generate-pdf", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     user: user,
    //     condominioId: condominioId || "nuovo",
    //     formData: form,
    //   }),
    // });

    // const pdfData = await pdfRes.json();
    // if (pdfData.error) {
    //   throw new Error(pdfData.error);
    // }

    // ✅ TUTTO OK!
    setSuccess(
      `✅ Modulo salvato con successo!\n`
    );

    // Redirect dopo 3 secondi
    setTimeout(() => router.push("/dashboard"), 3000);

  } catch (error) {
    setError(`❌ Errore: ${error.message}`);
    console.error("HandleSubmit error:", error);
  } finally {
    setLoading(false);
  }
};


  if (userLoading) return <p className="text-center mt-10 text-gray-600">Caricamento...</p>;
  if (!user) return <p className="text-center mt-10 text-red-500">Utente non loggato</p>;

  const resetSezione03 = () => {
  // elettronica
  update(["sezione03","elettronica","serverLocale","checked"], false);
  update(["sezione03","elettronica","serverLocale","autenticazione"], false);
  update(["sezione03","elettronica","cloud","checked"], false);
  update(["sezione03","elettronica","cloud","autenticazione"], false);

  // cartacea
  update(["sezione03","cartacea","archivio"], false);
  update(["sezione03","cartacea","altro"], "");

  // sicurezza
  Object.keys(form.sezione03?.sicurezza ?? {}).forEach(k => {
    update(["sezione03","sicurezza",k], false);
  });
};



  // ------------------------- RENDER -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 text-gray-700">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl space-y-12">
        <h1 className="text-3xl font-bold text-center text-blue-700">Check-list Privacy</h1>

        {/* ------------------ INTESTAZIONE ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">Intestazione</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
              value={form.intestazione.data}
              onChange={(e) => update(["intestazione","data"], e.target.value)}
            />
            {["condominio","citta","cap","provincia","cfCondominio"].map(key => (
              <input
                key={key}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={form.intestazione[key] ?? ""}
                onChange={(e) => update(["intestazione",key], e.target.value)}
              />
            ))}
          </div>
        </section>

        {/* ------------------ SEZIONE 01 ------------------ */}
       {/* ------------------ SEZIONE 01 ------------------ */}
<section className="space-y-4">
  <h2 className="font-semibold text-lg border-b pb-1">SEZ. 01 – DIPENDENTI CONDOMINIALI</h2>
  <div className="flex flex-wrap items-center gap-6">
    
    {/* Nessun dipendente */}
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={form.sezione01.nessunDipendente}
        onChange={() => {
          const newValue = !form.sezione01.nessunDipendente;
          update(["sezione01","nessunDipendente"], newValue);

          if (newValue) {
            // Reset di tutti i ruoli
            ["portiere","pulizie","giardiniere","manutentore"].forEach(role => {
              update(["sezione01", role, "checked"], false);
              update(["sezione01", role, "numero"], "");
            });
            update(["sezione01","altro"], "");
          }
        }}
        className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
      />
      <span className="text-sm">Nessun dipendente</span>
    </label>

    {/* Ruoli */}
    {["portiere","pulizie","giardiniere","manutentore"].map(role => {
      const r = form.sezione01[role];

      return (
        <div key={role} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={r.checked}
            disabled={form.sezione01.nessunDipendente}
            onChange={() => {
              const newChecked = !r.checked;
              // Toggle solo la proprietà checked senza sovrascrivere l'oggetto
              update(["sezione01", role, "checked"], newChecked);

              // Imposta numero minimo 1 se checkato, altrimenti ""
              update(["sezione01", role, "numero"], newChecked ? "1" : "");

              if (newChecked) {
                update(["sezione01","nessunDipendente"], false);
              }
            }}
            className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
          />
          <span className="text-sm capitalize">{role}</span>

          {r.checked && !form.sezione01.nessunDipendente && (
            <input
              type="number"
              min={1}
              value={r.numero}
              onChange={e =>
                update(
                  ["sezione01", role, "numero"],
                  Math.max(1, Number(e.target.value) || 1).toString()
                )
              }
              className="border rounded-md px-2 py-1 w-20 focus:ring-2 focus:ring-blue-400"
            />
          )}
        </div>
      );
    })}

    {/* Altro */}
    <input
      type="text"
      placeholder="Altro"
      disabled={form.sezione01.nessunDipendente}
      value={form.sezione01.altro ?? ""}
      onChange={e => update(["sezione01","altro"], e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:ring-2 focus:ring-blue-400"
    />
  </div>
</section>


        {/* ------------------ SEZIONE 02 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 02 – CONTRATTI / FORNITORI</h2>
          <div className="flex flex-wrap items-center gap-6">
            {["portierato","consulenteLavoro","videosorveglianza","letturaContatori","rspp"].map(key => (
              <Cb key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} path={["sezione02",key]} />
            ))}
            <input
              type="text"
              placeholder="Altro"
              value={form.sezione02.altro ?? ""}
              onChange={e => update(["sezione02","altro"], e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </section>

        {/* ------------------ SEZIONE 03 ------------------ */}
        <section className="space-y-6">
  <h2 className="font-semibold text-lg border-b pb-1">
    SEZ. 03 – MODALITÀ DI TRATTAMENTO DEI DATI PERSONALI
  </h2>

  {/* ================= ELETTRONICA ================= */}
  <div className="border rounded-xl shadow-sm p-4 bg-white">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.sezione03.elettronica.enabled}
          onChange={() => {
            const v = !form.sezione03.elettronica.enabled;
            update(["sezione03","elettronica","enabled"], v);

            if (!v && !form.sezione03.cartacea.enabled) {
              resetSezione03();
            }
          }}
        />
        <span>Elettronica</span>
      </label>
      <span className={`transition ${form.sezione03.elettronica.enabled ? "rotate-180" : ""}`}>▼</span>
    </div>

    {form.sezione03.elettronica.enabled && (
      <div className="flex flex-wrap gap-6 mt-4">
        <Cb
          label="Server locale"
          path={["sezione03","elettronica","serverLocale","checked"]}
        />
        <Cb
          
          label="Autenticazione server locale"
          path={["sezione03","elettronica","serverLocale","autenticazione"]}

          className="border px-2 py-1 rounded-md"
        />

        <Cb
          label="Cloud"
          path={["sezione03","elettronica","cloud","checked"]}
        />
        <Cb
          label="Autenticazione cloud"
          path={["sezione03","elettronica","cloud","autenticazione",]}

          className="border px-2 py-1 rounded-md"
        />
      </div>
    )}
  </div>

  {/* ================= CARTACEA ================= */}
  <div className="border rounded-xl shadow-sm p-4 bg-white">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.sezione03.cartacea.enabled}
          onChange={() => {
            const v = !form.sezione03.cartacea.enabled;
            update(["sezione03","cartacea","enabled"], v);

            if (!v && !form.sezione03.elettronica.enabled) {
              resetSezione03();
            }
          }}
        />
        <span>Cartacea</span>
      </label>
      <span className={`transition ${form.sezione03.cartacea.enabled ? "rotate-180" : ""}`}>▼</span>
    </div>

    {form.sezione03.cartacea.enabled && (
      <div className="flex gap-6 mt-4">
        <Cb
          label="Archivio cartaceo presente"
          path={["sezione03","cartacea","archivio"]}
        />
        <input
          type="text"
          placeholder="Altro"
          value={form.sezione03.cartacea.altro ?? ""}
          onChange={e =>
            update(["sezione03","cartacea","altro"], e.target.value)
          }
          className="border px-2 py-1 rounded-md"
        />
      </div>
    )}
  </div>

  {/* ================= SICUREZZA ================= */}
  <h3 className="mt-4 font-bold">Misure di sicurezza adottate</h3>
  <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 `}>
    {Object.keys(form.sezione03.sicurezza).map(k => (
      <Cb
        key={k}
        label={k}
        path={["sezione03","sicurezza",k]}
      />
    ))}
  </div>
</section>


        {/* ------------------ SEZIONE 04 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 04 – PIATTAFORME WEB</h2>
          <Cb label="Il condominio utilizza piattaforme per assemblee online?" path={["sezione04"]}/>
        </section>

        {/* ------------------ SEZIONE 05 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 05 – NOMINA RESPONSABILE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Amministratore" value={form.sezione05?.amministratore ?? ""} onChange={e=>update(["sezione05","amministratore"], e.target.value)} className="border px-2 py-1 rounded-md"/>
            <input placeholder="Specificare studio o persona fisica" value={form.sezione05?.specifica ?? ""} onChange={e=>update(["sezione05","specifica"], e.target.value)} className="border px-2 py-1 rounded-md"/>
          </div>
        </section>

        {/* ------------------ SEZIONE 06 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 06 – AUTORIZZATI AL TRATTAMENTO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["dipendenti","smartWorking","autorizzato","fornitori"].map(key => <Cb key={key} label={key} path={["sezione06",key]}/>)}
          </div>
        </section>

        {/* ------------------ SEZIONE 07 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 07 – STUDIO AMMINISTRATORE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["indirizzoStudio","sedeLegale","sedeOperativa","codiceUnivoco"].map(key => (
              <input key={key} placeholder={key} value={form.sezione07?.[key] ?? ""} onChange={e=>update(["sezione07",key], e.target.value)} className="border px-2 py-1 rounded-md"/>
            ))}
          </div>
        </section>

        {/* ------------------ SEZIONE 07.1 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 07.1 – VIDEOSORVEGLIANZA</h2>
          <Cb label="Presenza videosorveglianza" path={["sezione071"]}/>
        </section>

        {/* ------------------ SEZIONE 07.1.1 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 07.1.1 – ISPETTORATO DEL LAVORO</h2>
          <Cb label="Autorizzazione richiesta?" path={["sezione0711","valore"]}/>
          <textarea placeholder="Note" value={form.sezione0711?.note ?? ""} onChange={e=>update(["sezione0711","note"], e.target.value)} className="border px-2 py-1 rounded-md w-full h-24 resize-none"/>
        </section>

        {/* ------------------ SEZIONE 08 ------------------ */}
        <section className="space-y-4">
          <h2 className="font-semibold text-lg border-b pb-1">SEZ. 08 – FORNITORI</h2>
          <FornitoriSection
            addedFornitori={Array.isArray(form.sezione8?.addedFornitori) ? form.sezione8.addedFornitori : []}
            setAddedFornitori={list => update(["sezione8","addedFornitori"], list)}
            userId={user.id}
          />
        </section>

        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
          {loading ? "Invio..." : "Salva e crea documenti"}
        </button>
        <button type="button" onClick={saveDraft} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition">
          {loadingBozza ? "Salvataggio..." : "Salva bozza"}
        </button>
      </form>

<button
 onClick={() => { if (confirm("Vuoi svuotare il documento?")) { resetForm(); } }} 
  className="fixed bottom-6 right-30 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition "
>
  <RefreshCw className="spin w-10 h-10" />
  
</button>
<button type="button"
 onClick={() => { if (confirm("Vuoi tornare alla Home senza salvare?")) { router.push("/dashboard"); } }} 
 title="Torna alla Home" className=" fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition " > 
 <HomeIcon className="home w-10 h-10"/> 
 </button>
    </div>
  )
}
