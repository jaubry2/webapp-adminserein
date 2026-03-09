import type { infoFormulaire } from "~/types";

export const mdph_fields: infoFormulaire = {
  /**************************************************************************************************************/
  /* Intro */
  /**************************************************************************************************************/

  quoi_remplir_1: {
    "": ["est_premiere_demande", "est_changement_situation", "est_réévaluation"],
  },
  quoi_remplir_2: {
    "": ["est_renouvellement"],
  },
  quoi_remplir_3: {
    "": ["est_expression_aidant"],
  },
  deja_dossier: {
    "": ["est_deja_dossier_oui"],
  },
  dossier_departement: {
    "": ["dossier_departement"],
  },
  numero_dossier_mdph: {
    "": ["numero_dossier_mdph"],
  },
  /**************************************************************************************************************/
  /* A - Identite */
  /**************************************************************************************************************/
  /* A1 - Identité de l'enfant ou de l'adulte */
  demandeur_sexe: {
    "": ["est_demandeur_homme", "est_demandeur_femme"],
  },
  demandeur_nom_naissance: {
    "": ["demandeur_nom_naissance"],
  },
  demandeur_nom_usage: {
    "": ["demandeur_nom_usage"],
  },
  demandeur_prenom: {
    "": ["demandeur_prenom"],
  },
  demandeur_date_naissance: {
    "": ["demandeur_date_naissance_jour", "demandeur_date_naissance_mois", "demandeur_date_naissance_annee"],
  },
  demandeur_nationalite: {
    "": ["est_nationalite_francaise", "est_nationalite_eee", "est_nationalite_autre"],
  },
  demandeur_ville_naissance: {
    "": ["demandeur_ville_naissance"],
  },
  demandeur_departement_naissance: {
    "": ["demandeur_departement_naissance"],
  },
  demandeur_pays_naissance: {
    "": ["est_demandeur_pays_naissance_france", "est_demandeur_pays_naissance_autre"],
  },
  demandeur_pays_naissance_autre: {
    "": ["demandeur_pays_naissance_autre"],
  },
  demandeur_date_arrivee_france: {
    "": ["demandeur_date_arrivee_france_jour", "demandeur_date_arrivee_france_mois", "demandeur_date_arrivee_france_annee"],
  },
  demandeur_complement_adresse: {
    "": ["demandeur_complément_adresse"],
  },
  demandeur_adresse: {
    "": ["demandeur_adresse"],
  },
  demandeur_code_postal: {
    "": ["demandeur_code_postal_1", "demandeur_code_postal_2", "demandeur_code_postal_3", "demandeur_code_postal_4", "demandeur_code_postal_5"],
  },
  demandeur_ville: {
    "": ["demandeur_ville"],
  },
  demandeur_pays: {
    "": ["demandeur_pays"],
  },
  demandeur_numero_telephone: {
    "": ["demandeur_telephone"],
  },
  demandeur_mail: {
    "": ["demandeur_mail"],
  },
  demandeur_preferrence_contact: {
    "": ["est_preference_contact_mail", "est_preference_contact_telephone", "est_preference_contact_sms", "est_preference_contact_courrier"]
  },
  demandeur_organisme_hebergeur: {
    "": ["organisme_hebergeur"],
  },
  demandeur_prestation_familiale: {
    "": ["est_demandeur_allocataire_caf", "est_demandeur_allocataire_msa", "est_demandeur_allocataire_msa_autre"]
  },
  demandeur_numero_allocataire: {
    "": ["demandeur_numero_allocataire"],
  },
  demandeur_assurance_maladie: {
    "": ["est_demandeur_assure_cpam", "est_demandeur_assure_msa", "est_demandeur_assure_rsi", "est_demandeur_assure_autre"],
  },
  demandeur_assurance_maladie_autre: {
    "": ["demandeur_assure_autre"],
  },
  demandeur_numero_securite_sociale: {
    "": [
      "demandeur_numero_securite_sociale_1",
      "demandeur_numero_securite_sociale_2",
      "demandeur_numero_securite_sociale_3",
      "demandeur_numero_securite_sociale_4",
      "demandeur_numero_securite_sociale_5",
      "demandeur_numero_securite_sociale_6",
      "demandeur_numero_securite_sociale_7",
      "demandeur_numero_securite_sociale_8",
      "demandeur_numero_securite_sociale_9",
      "demandeur_numero_securite_sociale_10",
      "demandeur_numero_securite_sociale_11",
      "demandeur_numero_securite_sociale_12",
      "demandeur_numero_securite_sociale_13",
      "demandeur_numero_securite_sociale_14",
      "demandeur_numero_securite_sociale_15",
    ],
  },
  demandeur_numero_securite_sociale_enfant: {
    "": [
      "enfant_numero_securite_sociale_1",
      "enfant_numero_securite_sociale_2",
      "enfant_numero_securite_sociale_3",
      "enfant_numero_securite_sociale_4",
      "enfant_numero_securite_sociale_5",
      "enfant_numero_securite_sociale_6",
      "enfant_numero_securite_sociale_7",
      "enfant_numero_securite_sociale_8",
      "enfant_numero_securite_sociale_9",
      "enfant_numero_securite_sociale_10",
      "enfant_numero_securite_sociale_11",
      "enfant_numero_securite_sociale_12",
      "enfant_numero_securite_sociale_13",
      "enfant_numero_securite_sociale_14",
      "enfant_numero_securite_sociale_15",
    ],
  },
  /* A2 - Autorité parentale (Pour les mineurs) */
  representant_legal_1: {
    "": ["est_representant_legal_1"]
  },
  representant_legal_1_nom: {
    "": ["representant_legal_1_nom"],
  },
  representant_legal_1_prenom: {
    "": ["representant_legal_1_prenom"],
  },
  representant_legal_1_date_naissance: {
    "": ["representant_legal_1_date_naissance"],
  },
  representant_legal_1_adresse: {
    "": ["representant_legal_1_adresse"],
  },
  representant_legal_1_complement_adresse: {
    "": ["representant_legal_1_complement_adresse"],
  },
  representant_legal_1_code_postal: {
    "": ["representant_legal_1_code_postal"],
  },
  representant_legal_1_ville: {
    "": ["representant_legal_1_ville"],
  },
  representant_legal_1_pays: {
    "": ["representant_legal_1_pays"],
  },
  representant_legal_1_numero_telephone: {
    "": ["representant_legal_1_telephone"],
  },
  representant_legal_1_mail: {
    "": ["representant_legal_1_mail"],
  },
  representant_legal_2: {
    "": ["est_representant_legal_2"]
  },
  representant_legal_2_nom: {
    "": ["representant_legal_2_nom"],
  },
  representant_legal_2_prenom: {
    "": ["representant_legal_2_prenom"],
  },
  representant_legal_2_date_naissance: {
    "": ["representant_legal_2_date_naissance"],
  },
  representant_legal_2_adresse: {
    "": ["representant_legal_2_adresse"],
  },
  representant_legal_2_complement_adresse: {
    "": ["representant_legal_2_complement_adresse"],
  },
  representant_legal_2_code_postal: {
    "": ["representant_legal_2_code_postal"],
  },
  representant_legal_2_ville: {
    "": ["representant_legal_2_ville"],
  },
  representant_legal_2_pays: {
    "": ["representant_legal_2_pays"],
  },
  representant_legal_2_numero_telephone: {
    "": ["representant_legal_2_telephone"],
  },
  representant_legal_2_mail: {
    "": ["representant_legal_2_mail"],
  },
  /* A3 - Aide lors de la démarche */
  est_aide_demande: {
    "": ["est_aide_proche", "est_aide_association", "est_aide_autre"]
  },
  aide_nom_association: {
    "": ["aide_nom_association"],
  },
  aidant_nom_prenom: {
    "": ["aidant_nom_prenom"],
  },
  aidant_adresse: {
    "": ["aidant_adresse"],
  },
  aidant_complement_adresse: {
    "": ["aidant_complement_adresse"],
  },
  aidant_code_postal: {
    "": ["aidant_code_postal"],
  },
  aidant_ville: {
    "": ["aidant_ville"],
  },
  aidant_telephone: {
    "": ["aidant_telephone"],
  },
  aidant_mail: {
    "": ["aidant_mail"],
  },
  /* A4 - Mesure de protection */
  type_mesure_protection_representant_1: {
    "": ["type_mesure_protection_representant_1"],
  },
  mesure_protection_organisme_representant_1: {
    "": ["mesure_protection_organisme_representant_1"],
  },
  mesure_protection_nom_1: {
    "": ["mesure_protection_nom_1"],
  },
  mesure_protection_date_naissance_1: {
    "": ["mesure_protection_date_naissance_1"],
  },
  mesure_protection_adresse_1: {
    "": ["mesure_protection_adresse_1"],
  },
  mesure_protection_complement_adresse_1: {
    "": ["mesure_protection_complement_adresse_1"],
  },
  mesure_protection_code_postal_1: {
    "": ["mesure_protection_code_postal_1"],
  },
  mesure_protection_ville_1: {
    "": ["mesure_protection_ville_1"],
  },
  mesure_protection_telephone_1: {
    "": ["mesure_protection_telephone_1"],
  },
  mesure_protection_mail_1: {
    "": ["mesure_protection_mail_1"],
  },
  type_mesure_protection_representant_2: {
    "": ["type_mesure_protection_representant_2"],
  },
  mesure_protection_organisme_representant_2: {
    "": ["mesure_protection_organisme_representant_2"],
  },
  mesure_protection_nom_2: {
    "": ["mesure_protection_nom_2"],
  },
  mesure_protection_date_naissance_2: {
    "": ["mesure_protection_date_naissance_2"],
  },
  mesure_protection_adresse_2: {
    "": ["mesure_protection_adresse_2"],
  },
  mesure_protection_complement_adresse_2: {
    "": ["mesure_protection_complement_adresse_2"],
  },
  mesure_protection_code_postal_2: {
    "": ["mesure_protection_code_postal_2"],
  },
  mesure_protection_ville_2: {
    "": ["mesure_protection_ville_2"],
  },
  mesure_protection_telephone_2: {
    "": ["mesure_protection_telephone_2"],
  },
  mesure_protection_mail_2: {
    "": ["mesure_protection_mail_2"],
  },
  /* A5 - Situation Nécessitante */
  situation_logement: {
    "": ["est_vivre_domicile", "est_vivre_ecole", "est_sorti_hospitalisation"],
  },
  situation_travail: {
    "": ["est_perdre_travail", "est_trouver_travail"],
  },
  date_emploi_debut: {
    "": ["date_emploi_debut_jour", "date_emploi_debut_mois", "date_emploi_debut_annee"],
  },
  explication_difficultee_travail: {
    "": ["explication_difficultee"],
  },
  est_fin_de_droit: {
    "": ["est_fin_de_droit"],
  },
  droit_en_fin: {
    "": ["droit_en_fin"],
  },
  /* A - Document à joindre */

  /**************************************************************************************************************/
  /* B - Vie quotidienne */
  /**************************************************************************************************************/
  /* A1 - Identité de l'enfant ou de l'adulte */

};

