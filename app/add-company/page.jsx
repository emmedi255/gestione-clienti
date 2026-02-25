"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { FornitoriSection } from "../fornitori-section/FornitoriSection";
import { HomeIcon, RefreshCw, FilePen } from "lucide-react";
import { provinceItaliane } from "../utils/provinceItaliane";
import DashboardLayout from "../components/DashboardLayout";

export default function DataForm({
  initialForm = null,
  mode = "create",
  condominioId = null,
}) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(false);
  const [creatingPdf, setCreatingPdf] = useState(false);
  const [loadingBozza, setLoadingBozza] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null); // 'serverLocale' o 'cloud'

  const openAuthModal = (type) => {
    setSelectedType(type);
    setShowAuthModal(true);
  };

  const closeAuthModal = (withAuth) => {
    if (selectedType) {
      update(["sezione03", "elettronica", selectedType, "checked"], true);
      update(
        ["sezione03", "elettronica", selectedType, "autenticazione"],
        withAuth,
      );
      update(
        ["sezione03", "elettronica", selectedType, "noAutenticazione"],
        !withAuth,
      );
    }
    setShowAuthModal(false);
    setSelectedType(null);
  };

  const defaultForm = {
    intestazione: {
      data: new Date().toISOString().split("T")[0],
      condominio: "",
      condominio_indirizzo: "",
      citta: "",
      cap: "",
      provincia: "",
      cfCondominio: "",
    },
    sezione01: {
      nessunDipendente: false,
      portiere: { checked: false, numero: "" },
      pulizie: { checked: false, numero: "" },
      giardiniere: { checked: false, numero: "" },
      manutentore: { checked: false, numero: "" },
      isAltro: false,
      altro: "",
    },
    sezione02: {
      portierato: false,
      consulenteLavoro: false,
      videosorveglianza: false,
      letturaContatori: false,
      rspp: false,
      isAltro: false,
      altro: "",
    },
    sezione03: {
      elettronica: {
        enabled: false,
        serverLocale: {
          checked: false,
          autenticazione: false,
          noAutenticazione: false,
          password: false,
          isAltro: false,
          altro: "",
        },
        cloud: {
          checked: false,
          autenticazione: false,
          noAutenticazione: false,
          password: false,
          isAltro: false,
          altro: "",
        },
      },
      cartacea: {
        enabled: false,
        archivio: false,
        isAltro: false,
        altro: "",
      },
      sicurezza: {
        armadio: false,
        backup: false,
        password: false,
        cambioPassword: false,
        antivirus: false,
        firewall: false,
        screensaver: false,
        isAltro: false,
        altro: "",
      },
    },
    sezione04: false,
    sezione05: {
      amministratore: `${`${user?.name ?? ""} ${user?.cognome ?? ""}`.trim()}`,
      specifica: user?.ragione_sociale ?? "",
    },
    sezione06: {
      dipendenti: false,
      fornitori: false,
      isAltro: false,
      altro: "",
    },
    sezione07: {
      indirizzoStudio:
        (user?.indirizzo_studio || "") +
        " " +
        (user?.cap_studio || "") +
        " " +
        (user?.citta_studio || "") +
        " " +
        (user?.pr_studio || ""),
      sedeLegale:
        (user?.sede_legale || "") +
        " " +
        (user?.cap_legale || "") +
        " " +
        (user?.citta_legale || "") +
        " " +
        (user?.pr_legale || ""),
      sedeOperativa:
        (user?.sede_operativa || "") +
        " " +
        (user?.cap_operativa || "") +
        " " +
        (user?.citta_operativa || "") +
        " " +
        (user?.pr_operativa || ""),
      codiceUnivoco: user?.codice_univoco || "",
    },
    sezione071: false,
    sezione0711: {
      valore: false,
      note: "",
    },
    sezione8: {
      addedFornitori: [],
    },
  };

  const [form, setForm] = useState(() => {
    if (!initialForm) return defaultForm;
    return {
      ...defaultForm,
      ...initialForm,
      sezione01: {
        ...defaultForm.sezione01,
        ...initialForm.sezione01,
      },
      sezione02: {
        ...defaultForm.sezione02,
        ...initialForm.sezione02,
      },
      sezione03: {
        ...defaultForm.sezione03,
        ...initialForm.sezione03,
      },
      sezione05: {
        ...defaultForm.sezione05,
        ...initialForm.sezione05,
      },
      sezione06: {
        ...defaultForm.sezione06,
        ...initialForm.sezione06,
      },
      sezione07: {
        ...defaultForm.sezione07,
        ...initialForm.sezione07,
      },
      sezione0711: {
        ...defaultForm.sezione0711,
        ...initialForm.sezione0711,
      },
      sezione8: {
        ...defaultForm.sezione8,
        ...initialForm.sezione8,
      },
    };
  });

  const resetForm = () => {
    setForm(defaultForm);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (!initialForm) return;

    setForm((prev) => ({
      ...prev,
      ...defaultForm,
      ...initialForm,
      sezione01: {
        ...defaultForm.sezione01,
        ...initialForm.sezione01,
      },
      sezione02: {
        ...defaultForm.sezione02,
        ...initialForm.sezione02,
      },
      sezione03: {
        ...defaultForm.sezione03,
        ...initialForm.sezione03,
      },
      sezione05: {
        ...defaultForm.sezione05,
        ...initialForm.sezione05,
      },
      sezione06: {
        ...defaultForm.sezione06,
        ...initialForm.sezione06,
      },
      sezione07: {
        ...defaultForm.sezione07,
        ...initialForm.sezione07,
      },
      sezione0711: {
        ...defaultForm.sezione0711,
        ...initialForm.sezione0711,
      },
      sezione8: {
        ...defaultForm.sezione8,
        ...initialForm.sezione8,
      },
    }));
  }, [initialForm]);

  useEffect(() => {
    setLoading(true);

    if (mode === "edit" && condominioId) {
      fetch(`/api/get-condominio-fornitori?condominioId=${condominioId}`)
        .then(async (res) => {
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error("Errore parsing JSON:", text);
            return { fornitori: [] };
          }
        })
        .then((data) => {
          if (data?.fornitori) {
            setLoading(false);
            setForm((prev) => ({
              ...prev,
              sezione8: {
                ...prev.sezione8,
                addedFornitori: data.fornitori,
              },
            }));
          }
        })
        .catch((err) => console.error("Errore fetch fornitori:", err));
    } else {
      setLoading(false);
    }
  }, [mode, condominioId]);

  // ------------------------- UTILITY -------------------------

  const update = (path, value) => {
    if (!Array.isArray(path) || path.length === 0) return;
    setForm((prev) => {
      const copy = structuredClone(prev);
      let ref = copy;
      path.slice(0, -1).forEach((k) => {
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
    update(path, !path.reduce((a, k) => a?.[k] ?? false, form));

  const Cb = ({ label, path, disabled = false }) => {
    const isChecked = path.reduce((a, k) => a?.[k] ?? false, form);
    return (
      <label
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50 ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-gray-100"
            : "hover:bg-blue-50"
        }`}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => !disabled && toggle(path)}
          disabled={disabled}
          className={`w-4 h-4 rounded border-2 focus:ring-2 transition-all ${
            disabled
              ? "border-gray-300 bg-gray-100 cursor-not-allowed"
              : "border-gray-300 focus:ring-blue-400 hover:border-blue-400"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            disabled ? "text-gray-500" : "text-gray-800"
          }`}
        >
          {label}
        </span>
      </label>
    );
  };

  // ------------------------- SUBMIT -------------------------

  const saveDraft = async () => {
    setLoadingBozza(true);
    setError("");
    setSuccess("");
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
    setCreatingPdf(true);
    try {
      const submitRes = await fetch("/api/submit-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user,
          form,
          condominioId,
        }),
      });
      const submitData = await submitRes.json();
      if (submitData.error) {
        throw new Error(submitData.error);
      }
      setSuccess("✅ Modulo salvato con successo!\n");
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (error) {
      setError(`❌ Errore: ${error.message}`);
      console.error("HandleSubmit error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading)
    return <p className="text-center mt-10 text-gray-600">Caricamento...</p>;

  if (!user)
    return <p className="text-center mt-10 text-red-500">Utente non loggato</p>;

  const resetSezione03 = () => {
    // elettronica
    update(["sezione03", "elettronica", "serverLocale", "checked"], false);
    update(
      ["sezione03", "elettronica", "serverLocale", "autenticazione"],
      false,
    );
    update(
      ["sezione03", "elettronica", "serverLocale", "noAutenticazione"],
      false,
    );
    update(["sezione03", "elettronica", "serverLocale", "password"], false);
    update(["sezione03", "elettronica", "serverLocale", "altro"], "");
    update(["sezione03", "elettronica", "serverLocale", "isAltro"], false);

    update(["sezione03", "elettronica", "cloud", "checked"], false);
    update(["sezione03", "elettronica", "cloud", "autenticazione"], false);
    update(["sezione03", "elettronica", "cloud", "noAutenticazione"], false);
    update(["sezione03", "elettronica", "cloud", "password"], false);
    update(["sezione03", "elettronica", "cloud", "altro"], "");
    update(["sezione03", "elettronica", "cloud", "isAltro"], false);

    // cartacea
    update(["sezione03", "cartacea", "archivio"], false);
    update(["sezione03", "cartacea", "altro"], "");
    update(["sezione03", "cartacea", "isAltro"], false);
  };

  // ------------------------- RENDER -------------------------

  return (
    <DashboardLayout>
      {creatingPdf && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-8">
          <div className="bg-white/95 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border-4 border-blue-200 max-w-md w-full mx-4 text-center animate-pulse">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FilePen className="w-16 h-16 text-white drop-shadow-2xl shadow-lg animate-[pulse_1.5s_infinite,tilt_2s_ease-in-out_infinite]" />
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
              Generazione Documenti in corso...
            </h2>

            <p className="text-lg font-semibold text-gray-700 mb-6">
              Attendere prego
            </p>

            <p className="text-xs text-gray-400 mt-4 font-medium">
              Non chiudere la pagina
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen py-10 text-gray-700">
        <form
          onSubmit={handleSubmit}
          className={`max-w-4xl mx-auto bg-white p-10 rounded-3xl space-y-12 ${
            creatingPdf || loading ? "opacity-60 pointer-events-none" : ""
          }`}
          style={{ pointerEvents: creatingPdf || loading ? "none" : "auto" }}
        >
          <h1 className="text-3xl font-bold text-center text-blue-700">
            Check-list Privacy
          </h1>

          {/* ------------------ INTESTAZIONE ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              Intestazione
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* DATA */}
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                value={form.intestazione.data}
                onChange={(e) =>
                  update(["intestazione", "data"], e.target.value)
                }
              />

              {/* CONDOMINIO */}
              <input
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="nome Condominio"
                value={form.intestazione.condominio ?? ""}
                required
                onChange={(e) =>
                  update(["intestazione", "condominio"], e.target.value)
                }
              />

              <input
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="indirizzo"
                value={form.intestazione.condominio_indirizzo ?? ""}
                required
                pattern="^(Via|Viale|Corso|Piazza|Piazzale|Largo)\s+([a-zA-Zàèìòù\s']{3,})\s+(\d+[a-zA-Z]?)(?:\s*/\s*[a-zA-Z0-9]{1,3})?$"
                title="rispettare formato indirizzo es. Via Roma,8"
                onChange={(e) =>
                  update(
                    ["intestazione", "condominio_indirizzo"],
                    e.target.value,
                  )
                }
              />

              {/* CITTÀ */}
              <input
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="Città"
                required
                value={form.intestazione.citta ?? ""}
                onChange={(e) =>
                  update(["intestazione", "citta"], e.target.value)
                }
              />

              {/* PROVINCIA */}
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 bg-white"
                value={form.intestazione.provincia ?? ""}
                required
                onChange={(e) =>
                  update(["intestazione", "provincia"], e.target.value)
                }
              >
                <option value="">Seleziona Provincia</option>
                {provinceItaliane.map((provincia) => (
                  <option key={provincia.sigla} value={provincia.sigla}>
                    {provincia.nome} ({provincia.sigla})
                  </option>
                ))}
              </select>

              {/* CAP */}
              <input
                type="text"
                maxLength={5}
                pattern="^\d{5}$"
                title="Inserisci un CAP valido a 5 cifre"
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="CAP"
                value={form.intestazione.cap ?? ""}
                onChange={(e) =>
                  update(
                    ["intestazione", "cap"],
                    e.target.value.replace(/\D/g, ""),
                  )
                }
              />

              {/* CF CONDOMINIO */}
              <input
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="CF Condominio"
                value={form.intestazione.cfCondominio ?? ""}
                pattern="^[0-9]{11}$"
                maxLength={11}
                title="il CF del condominio non rispetta lo standard"
                required
                onChange={(e) =>
                  update(
                    ["intestazione", "cfCondominio"],
                    e.target.value.toUpperCase(),
                  )
                }
              />
            </div>
          </section>

          {/* ------------------ SEZIONE 01 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 01 – DIPENDENTI CONDOMINIALI
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              {/* Nessun dipendente */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sezione01.nessunDipendente}
                  onChange={() => {
                    const newValue = !form.sezione01.nessunDipendente;
                    update(["sezione01", "nessunDipendente"], newValue);
                    if (newValue) {
                      [
                        "portiere",
                        "pulizie",
                        "giardiniere",
                        "manutentore",
                      ].forEach((role) => {
                        update(["sezione01", role, "checked"], false);
                        update(["sezione01", role, "numero"], "");
                      });
                      update(["sezione01", "altro"], "");
                      update(["sezione01", "isAltro"], false);
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-sm">Nessun dipendente</span>
              </label>

              {/* Ruoli */}
              {["portiere", "pulizie", "giardiniere", "manutentore"].map(
                (role) => {
                  const r = form.sezione01[role];
                  return (
                    <div key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={r.checked}
                        disabled={form.sezione01.nessunDipendente}
                        onChange={() => {
                          const newChecked = !r.checked;
                          update(["sezione01", role, "checked"], newChecked);
                          update(
                            ["sezione01", role, "numero"],
                            newChecked ? "1" : "",
                          );
                          if (newChecked) {
                            update(["sezione01", "nessunDipendente"], false);
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
                          onChange={(e) =>
                            update(
                              ["sezione01", role, "numero"],
                              Math.max(
                                1,
                                Number(e.target.value) || 1,
                              ).toString(),
                            )
                          }
                          className="border rounded-md px-2 py-1 w-20 focus:ring-2 focus:ring-blue-400"
                        />
                      )}
                    </div>
                  );
                },
              )}

              {/* Altro */}
              <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all">
                <input
                  disabled={form.sezione01.nessunDipendente}
                  type="checkbox"
                  checked={form.sezione01.isAltro || !!form.sezione01.altro}
                  onChange={(e) =>
                    update(["sezione01", "isAltro"], e.target.checked)
                  }
                  className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                />
                <span className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50">
                  Altro
                </span>
              </label>

              {(form.sezione01.isAltro || !!form.sezione01.altro) && (
                <input
                  type="text"
                  placeholder="Altro"
                  value={form.sezione01.altro ?? ""}
                  onChange={(e) =>
                    update(["sezione01", "altro"], e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 w-40 focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </section>

          {/* ------------------ SEZIONE 02 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 02 – CONTRATTI / FORNITORI
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              {[
                "portierato",
                "consulenteLavoro",
                "videosorveglianza",
                "letturaContatori",
                "rspp",
              ].map((key) => (
                <Cb
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  path={["sezione02", key]}
                />
              ))}

              <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={form.sezione02.isAltro || !!form.sezione02.altro}
                  onChange={(e) =>
                    update(["sezione02", "isAltro"], e.target.checked)
                  }
                  className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                />
                <span className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50">
                  Altro
                </span>
              </label>

              {(form.sezione02.isAltro || !!form.sezione02.altro) && (
                <input
                  type="text"
                  placeholder="Altro"
                  value={form.sezione02.altro ?? ""}
                  onChange={(e) =>
                    update(["sezione02", "altro"], e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </section>

          {/* ------------------ SEZIONE 03 ------------------ */}
          <section className="space-y-6">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 03 – MODALITÀ DI TRATTAMENTO DEI DATI PERSONALI
            </h2>

            {/* ELETTRONICA */}
            <div className="border rounded-xl shadow-sm p-4 bg-white">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-green-400"
                    checked={form.sezione03.elettronica.enabled}
                    onChange={() => {
                      const v = !form.sezione03.elettronica.enabled;
                      update(["sezione03", "elettronica", "enabled"], v);
                      if (!v) {
                        resetSezione03();
                      }
                    }}
                  />
                  <span>Elettronica</span>
                </label>
                <span
                  className={`transition ${
                    form.sezione03.elettronica.enabled ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              {form.sezione03.elettronica.enabled && (
                <div className="mt-4 space-y-4">
                  {/* SERVER LOCALE */}
                  <div className="border rounded-lg p-3">
                    <div
                      className={`flex items-center justify-between p-2 rounded-md transition-all w-full ${
                        form.sezione03.elettronica.serverLocale.checked
                          ? "bg-blue-50 border-2 border-blue-200"
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={
                            form.sezione03.elettronica.serverLocale.checked
                          }
                          onChange={() => {
                            const newChecked =
                              !form.sezione03.elettronica.serverLocale.checked;

                            if (newChecked) {
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "checked",
                                ],
                                true,
                              );
                            } else {
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "checked",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "autenticazione",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "noAutenticazione",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "password",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "serverLocale",
                                  "altro",
                                ],
                                "",
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="font-medium text-sm">
                          Server locale
                        </span>
                      </div>
                      <span
                        className={`transition transform text-sm ${
                          form.sezione03.elettronica.serverLocale.checked
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        ▼
                      </span>
                    </div>

                    {/* AUTENTICAZIONE */}
                    {form.sezione03.elettronica.serverLocale.checked && (
                      <div className="mt-3 pt-3 border-t border-gray-100 px-2 space-y-2">
                        <Cb
                          label="Con autenticazione"
                          disabled={
                            form.sezione03.elettronica.serverLocale
                              .noAutenticazione
                          }
                          path={[
                            "sezione03",
                            "elettronica",
                            "serverLocale",
                            "autenticazione",
                          ]}
                        />
                        <Cb
                          label="Senza autenticazione"
                          disabled={
                            form.sezione03.elettronica.serverLocale
                              .autenticazione
                          }
                          path={[
                            "sezione03",
                            "elettronica",
                            "serverLocale",
                            "noAutenticazione",
                          ]}
                        />
                      </div>
                    )}

                    {/* MISURE SICUREZZA SERVER LOCALE */}
                    {form.sezione03.elettronica.serverLocale.checked && (
                      <div className="mt-4 p-3 bg-blue-25 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2 text-sm">
                          Misure di sicurezza per il server locale
                        </h4>
                        <div className="flex flex-wrap gap-3 items-center">
                          <Cb
                            label="Password"
                            path={[
                              "sezione03",
                              "elettronica",
                              "serverLocale",
                              "password",
                            ]}
                          />
                          <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={
                                form.sezione03.elettronica.serverLocale
                                  .isAltro ||
                                !!form.sezione03.elettronica.serverLocale.altro
                              }
                              onChange={(e) =>
                                update(
                                  [
                                    "sezione03",
                                    "elettronica",
                                    "serverLocale",
                                    "isAltro",
                                  ],
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                            />
                            <span className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50">
                              Altro
                            </span>
                          </label>

                          {(form.sezione03.elettronica.serverLocale.isAltro ||
                            !!form.sezione03.elettronica.serverLocale
                              .altro) && (
                            <input
                              type="text"
                              placeholder="Altro..."
                              value={
                                form.sezione03.elettronica.serverLocale.altro ??
                                ""
                              }
                              onChange={(e) =>
                                update(
                                  [
                                    "sezione03",
                                    "elettronica",
                                    "serverLocale",
                                    "altro",
                                  ],
                                  e.target.value,
                                )
                              }
                              className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-400"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CLOUD */}
                  <div className="border rounded-lg p-3">
                    <div
                      className={`flex items-center justify-between p-2 rounded-md transition-all w-full ${
                        form.sezione03.elettronica.cloud.checked
                          ? "bg-green-50 border-2 border-green-200"
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={form.sezione03.elettronica.cloud.checked}
                          onChange={() => {
                            const newChecked =
                              !form.sezione03.elettronica.cloud.checked;

                            if (newChecked) {
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "checked",
                                ],
                                true,
                              );
                            } else {
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "checked",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "autenticazione",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "noAutenticazione",
                                ],
                                false,
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "password",
                                ],
                                false,
                              );
                              update(
                                ["sezione03", "elettronica", "cloud", "altro"],
                                "",
                              );
                              update(
                                [
                                  "sezione03",
                                  "elettronica",
                                  "cloud",
                                  "isAltro",
                                ],
                                false,
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-green-400"
                        />
                        <span className="font-medium text-sm">Cloud</span>
                      </div>
                      <span
                        className={`transition transform text-sm ${
                          form.sezione03.elettronica.cloud.checked
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        ▼
                      </span>
                    </div>

                    {/* AUTENTICAZIONE */}
                    {form.sezione03.elettronica.cloud.checked && (
                      <div className="mt-3 pt-3 border-t border-gray-100 px-2 space-y-2">
                        <Cb
                          label="Con autenticazione"
                          disabled={
                            form.sezione03.elettronica.cloud.noAutenticazione
                          }
                          path={[
                            "sezione03",
                            "elettronica",
                            "cloud",
                            "autenticazione",
                          ]}
                        />
                        <Cb
                          label="Senza autenticazione"
                          disabled={
                            form.sezione03.elettronica.cloud.autenticazione
                          }
                          path={[
                            "sezione03",
                            "elettronica",
                            "cloud",
                            "noAutenticazione",
                          ]}
                        />
                      </div>
                    )}

                    {/* MISURE SICUREZZA CLOUD */}
                    {form.sezione03.elettronica.cloud.checked && (
                      <div className="mt-4 p-3 bg-green-25 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2 text-sm">
                          Misure di sicurezza per il cloud
                        </h4>
                        <div className="flex flex-wrap gap-3 items-center">
                          <Cb
                            label="Password"
                            path={[
                              "sezione03",
                              "elettronica",
                              "cloud",
                              "password",
                            ]}
                          />
                          <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={
                                form.sezione03.elettronica.cloud.isAltro ||
                                !!form.sezione03.elettronica.cloud.altro
                              }
                              onChange={(e) =>
                                update(
                                  [
                                    "sezione03",
                                    "elettronica",
                                    "cloud",
                                    "isAltro",
                                  ],
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                            />
                            <span className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50">
                              Altro
                            </span>
                          </label>

                          {(form.sezione03.elettronica.cloud.isAltro ||
                            !!form.sezione03.elettronica.cloud.altro) && (
                            <input
                              type="text"
                              placeholder="Altro..."
                              value={
                                form.sezione03.elettronica.cloud.altro ?? ""
                              }
                              onChange={(e) =>
                                update(
                                  [
                                    "sezione03",
                                    "elettronica",
                                    "cloud",
                                    "altro",
                                  ],
                                  e.target.value,
                                )
                              }
                              className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-400"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CARTACEA */}
            <div className="border rounded-xl shadow-sm p-4 bg-white">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-green-400"
                    checked={form.sezione03.cartacea.enabled}
                    onChange={() => {
                      const v = !form.sezione03.cartacea.enabled;
                      update(["sezione03", "cartacea", "enabled"], v);
                      if (!v && !form.sezione03.elettronica.enabled) {
                        resetSezione03();
                      }
                    }}
                  />
                  <span>Cartacea</span>
                </label>
                <span
                  className={`transition ${
                    form.sezione03.cartacea.enabled ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </div>

              {form.sezione03.cartacea.enabled && (
                <div className="mt-4 flex flex-col md:flex-row md:items-center md:gap-4">
                  <span className="font-medium text-sm mb-2 md:mb-0 md:whitespace-nowrap">
                    Archivio cartaceo tenuto presso:
                  </span>
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Cb
                      label="sede amministratore"
                      path={["sezione03", "cartacea", "archivio"]}
                    />
                    <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={
                          form.sezione03.cartacea.isAltro ||
                          !!form.sezione03.cartacea.altro
                        }
                        onChange={(e) =>
                          update(
                            ["sezione03", "cartacea", "isAltro"],
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                      />
                      <span className="flex items-center gap-2">Altro</span>
                    </label>

                    {(form.sezione03.cartacea.isAltro ||
                      !!form.sezione03.cartacea.altro) && (
                      <input
                        type="text"
                        placeholder="specificare altro..."
                        value={form.sezione03.cartacea.altro ?? ""}
                        onChange={(e) =>
                          update(
                            ["sezione03", "cartacea", "altro"],
                            e.target.value,
                          )
                        }
                        className="border border-gray-300 px-3 py-2 rounded-md text-sm flex-1 min-w-[120px] focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SICUREZZA */}
            <h3 className="mt-4 font-bold">Misure di sicurezza adottate</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(form.sezione03.sicurezza)
                .filter((k) => k !== "altro")
                .filter((k) => k !== "isAltro")
                .map((k) => (
                  <Cb key={k} label={k} path={["sezione03", "sicurezza", k]} />
                ))}

              <label className="flex items-center p-2 rounded-md cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={
                    form.sezione03.sicurezza.isAltro ||
                    !!form.sezione03.sicurezza.altro
                  }
                  onChange={(e) =>
                    update(
                      ["sezione03", "sicurezza", "isAltro"],
                      e.target.checked,
                    )
                  }
                  className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                />
                <span className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-50">
                  altro
                </span>
              </label>

              {(form.sezione03.sicurezza.isAltro ||
                !!form.sezione03.sicurezza.altro) && (
                <input
                  type="text"
                  placeholder="specificare altro..."
                  value={form.sezione03.sicurezza.altro ?? ""}
                  onChange={(e) =>
                    update(["sezione03", "sicurezza", "altro"], e.target.value)
                  }
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm flex-1 min-w-[150px] focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </section>

          {/* ------------------ SEZIONE 04 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 04 – PIATTAFORME WEB
            </h2>
            <Cb
              label="Il condominio utilizza piattaforme per assemblee online?"
              path={["sezione04"]}
            />
          </section>

          {/* ------------------ SEZIONE 05 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 05 – NOMINA RESPONSABILE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Responsabile
                </label>

                <input
                  required
                  placeholder="Nome amministratore"
                  value={form.sezione05?.amministratore ?? ""}
                  onChange={(e) =>
                    update(["sezione05", "amministratore"], e.target.value)
                  }
                  className="border px-2 py-1 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Specificare ragione sociale (se esistente)
                </label>

                <input
                  placeholder="Es. Studio Rossi / Mario Rossi"
                  value={form.sezione05?.specifica ?? ""}
                  onChange={(e) =>
                    update(["sezione05", "specifica"], e.target.value)
                  }
                  className="border px-2 py-1 rounded-md"
                />
              </div>
            </div>
          </section>
          {/* ------------------ SEZIONE 06 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 06 – AUTORIZZATI AL TRATTAMENTO
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["dipendenti", "fornitori"].map((key) => (
                <Cb key={key} label={key} path={["sezione06", key]} />
              ))}
              <label className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={form.sezione06.isAltro || !!form.sezione06.altro}
                  onChange={(e) =>
                    update(["sezione06", "isAltro"], e.target.checked)
                  }
                  className="w-4 h-4 rounded border-2 focus:ring-2 transition-all"
                />
                <span className="flex items-center gap-2">Altro</span>
              </label>
              {(form.sezione06.isAltro || !!form.sezione06.altro) && (
                <input
                  type="text"
                  placeholder="specificare altro..."
                  value={form.sezione06.altro ?? ""}
                  onChange={(e) =>
                    update(["sezione06", "altro"], e.target.value)
                  }
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm flex-1 min-w-[150px] focus:ring-2 focus:ring-blue-400"
                />
              )}
            </div>
          </section>

          {/* ------------------ SEZIONE 07 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 07 – STUDIO AMMINISTRATORE
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "indirizzoStudio", label: "Indirizzo studio" },
                { key: "sedeLegale", label: "Sede legale" },
                { key: "sedeOperativa", label: "Sede operativa" },
                { key: "codiceUnivoco", label: "Codice univoco" },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    {label}
                  </label>

                  <input
                    required
                    placeholder={label}
                    value={form.sezione07?.[key] ?? ""}
                    onChange={(e) => update(["sezione07", key], e.target.value)}
                    className="border px-2 py-1 rounded-md"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ------------------ SEZIONE 07.1 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 07.1 – VIDEOSORVEGLIANZA
            </h2>
            <Cb label="Presenza videosorveglianza" path={["sezione071"]} />
          </section>

          {/* ------------------ SEZIONE 07.1.1 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 07.1.1 – ISPETTORATO DEL LAVORO
            </h2>
            <Cb
              label="Autorizzazione richiesta?"
              path={["sezione0711", "valore"]}
            />
            <textarea
              placeholder="Note"
              value={form.sezione0711?.note ?? ""}
              onChange={(e) => update(["sezione0711", "note"], e.target.value)}
              className="border px-2 py-1 rounded-md w-full h-24 resize-none"
            />
          </section>

          {/* ------------------ SEZIONE 08 ------------------ */}
          <section className="space-y-4">
            <h2 className="font-semibold text-lg border-b pb-1">
              SEZ. 08 – FORNITORI
            </h2>
            <FornitoriSection
              addedFornitori={
                Array.isArray(form.sezione8?.addedFornitori)
                  ? form.sezione8.addedFornitori
                  : []
              }
              setAddedFornitori={(list) =>
                update(["sezione8", "addedFornitori"], list)
              }
              userId={user.id}
            />
          </section>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
            {loading ? "Creazione documenti..." : "Salva e crea documenti"}
          </button>

          <button
            type="button"
            onClick={saveDraft}
            className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition"
          >
            {loadingBozza ? "Salvataggio..." : "Salva bozza"}
          </button>
        </form>

        <button
          onClick={() => {
            if (confirm("Vuoi svuotare il documento?")) {
              resetForm();
            }
          }}
          className="fixed bottom-6 right-30 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition"
        >
          <RefreshCw className="spin w-10 h-10" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirm("Vuoi tornare alla Home senza salvare?")) {
              router.push("/dashboard");
            }
          }}
          title="Torna alla Home"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition"
        >
          <HomeIcon className="home w-10 h-10" />
        </button>
      </div>
    </DashboardLayout>
  );
}
