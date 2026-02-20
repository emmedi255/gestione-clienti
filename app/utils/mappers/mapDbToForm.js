export function mapDbToForm(db) {
  return {
    intestazione: {
      data: db.data || new Date().toISOString().split("T")[0],
      condominio: db.condominio || "",
      citta: db.citta || "",
      cap: db.cap || "",
      provincia: db.provincia || "",
      cfCondominio: db.cf_condominio || "",
    },

    sezione01: {
      nessunDipendente: db.nessun_dipendente || false,
      portiere: {
        checked: db.portiere_checked || false,
        numero: db.portiere_numero || "",
      },
      pulizie: {
        checked: db.pulizie_checked || false,
        numero: db.pulizie_numero || "",
      },
      giardiniere: {
        checked: db.giardiniere_checked || false,
        numero: db.giardiniere_numero || "",
      },
      manutentore: {
        checked: db.manutentore_checked || false,
        numero: db.manutentore_numero || "",
      },
      altro: db.altro_dipendente || "",
    },

    sezione02: {
      portierato: db.portierato || false,
      consulenteLavoro: db.consulente_lavoro || false,
      videosorveglianza: db.videosorveglianza || false,
      letturaContatori: db.lettura_contatori || false,
      rspp: db.rspp || false,
      altro: db.altro_contratto || "",
    },

    sezione03: {
      elettronica: {
        enabled: db.elettronica_enabled || false,
        serverLocale: {
          checked: db.elettronica_server_locale || false,
          autenticazione: db.elettronica_server_locale_autenticazione || false,
          noAutenticazione: db.elettronica_server_locale_no_autenticazione || false,
          password: db.elettronica_server_locale_password || false,
          altro: db.elettronica_server_locale_password_altro
        },
        cloud: {
          checked: db.elettronica_cloud || false,
          autenticazione: db.elettronica_cloud_autenticazione || false,
          noAutenticazione: db.elettronica_cloud_no_autenticazione || false,
          password: db.elettronica_cloud_password || false,
          altro: db.elettronica_cloud_password_altro
        },
      },
      cartacea: {
        enabled: db.cartacea_enabled || false,
        archivio: db.cartacea_archivio || false,
        altro: db.cartacea_altro || "",
      },
      sicurezza: {
        armadio: db.sicurezza_armadio || false,
        backup: db.sicurezza_backup || false,
        password: db.sicurezza_password || false,
        cambioPassword: db.sicurezza_cambio_password || false,
        antivirus: db.sicurezza_antivirus || false,
        firewall: db.sicurezza_firewall || false,
        screensaver: db.sicurezza_screensaver || false,
        altro: db.sicurezza_altro || false,
      },
    },

    sezione04: db.piattaforme_web || false,

    sezione05: {
      amministratore: db.amministratore || "",
      specifica: db.specifica_responsabile || "",
    },

    sezione06: {
      dipendenti: db.dipendenti_autorizzati || false,
      smartWorking: db.smart_working|| false,
      autorizzato: db.autorizzato_nomina || false,
      fornitori: db.fornitori_nomina || false,
    },

    sezione07: {
      indirizzoStudio: db.indirizzo_studio || "",
      sedeLegale: db.sede_legale || "",
      sedeOperativa: db.sede_operativa || "",
      codiceUnivoco: db.codice_univoco || "",
    },

    sezione071: db.videosorveglianza_studio || false,

    sezione0711: {
      valore: db.autorizzazione_ispettorato || false,
      note: db.note_ispettorato || "",
    },

    sezione8: {
      addedFornitori:
        db.condomini_fornitori?.map((cf) => cf.fornitori) || [],
    },
  };
}
