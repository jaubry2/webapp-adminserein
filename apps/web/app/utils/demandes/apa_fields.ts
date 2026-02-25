import type { infoFormulaire } from "~/types";

export const apa_fields: infoFormulaire = {
    /**************************************************************************************************************/
    /* Identite du demandeur */
    /**************************************************************************************************************/

    demandeur_sexe: { "": ["est_demandeur_femme", "est_demandeur_homme"] },
    demandeur_nom_naissance: { "": ["demandeur_nom_naissance"] },
    demandeur_nom_usage: { "": ["demandeur_nom_usage"] },
    demandeur_prenom: { "": ["demandeur_prenom"] },
    demandeur_date_naissance: {
        "": [
            "demandeur_date_naissance_jour_1",
            "demandeur_date_naissance_jour_2",
            "demandeur_date_naissance_mois_1",
            "demandeur_date_naissance_mois_2",
            "demandeur_date_naissance_annee_1",
            "demandeur_date_naissance_annee_2",
            "demandeur_date_naissance_annee_3",
            "demandeur_date_naissance_annee_4",
        ],
    },
    demandeur_ville_naissance: { "": ["demandeur_ville_naissance"] },
    demandeur_departement_naissance: { "": ["demandeur_departement_naissance"] },
    demandeur_pays_naissance: { "": ["demandeur_pays_naissance"] },
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
    demandeur_caisse_retraite: {
        "": [
            "est_demandeur_retraite_assurance_maladie",
            "est_demandeur_retraite_fonction_publique",
            "est_demandeur_retraite_msa",
            "est_demandeur_retraite_autre",
        ],
    },
    demandeur_caisse_retraite_autre: { "": ["demandeur_retraite_autre"] },
    /* */
    /**************************************************************************************************************/
    /* Coordonnées du demandeur */
    /**************************************************************************************************************/

    demandeur_numero_telephone: {
        "": [
            "demandeur_telephone_1",
            "demandeur_telephone_2",
            "demandeur_telephone_3",
            "demandeur_telephone_4",
            "demandeur_telephone_5",
            "demandeur_telephone_6",
            "demandeur_telephone_7",
            "demandeur_telephone_8",
            "demandeur_telephone_9",
            "demandeur_telephone_10",
        ],
    },
    demandeur_mail: { "": ["demandeur_mail"] },
    demandeur_lieu_residence: {
        "": [
            "est_demandeur_domicile_demandeur",
            "est_demandeur_domicile_famille",
            "est_demandeur_domicile_accueillant",
            "est_demandeur_domicile_residence",
            "est_demandeur_domicile_autre",
            "demandeur_domicile_autre",
        ],
    },
    demandeur_lieu_residence_autre: { "": ["demandeur_domicile_autre"] },
    demandeur_adresse: { "": ["demandeur_adresse"] },
    demandeur_code_postal: {
        "": [
            "demandeur_code_postal_1",
            "demandeur_code_postal_2",
            "demandeur_code_postal_3",
            "demandeur_code_postal_4",
            "demandeur_code_postal_5",
        ],
    },
    demandeur_ville: { "": ["demandeur_ville"] },
    demandeur_adresse_batiment: { "": ["demandeur_adresse_batiment"] },
    demandeur_adresse_etage: { "": ["demandeur_adresse_etage"] },
    demandeur_adresse_digicode: { "": ["demandeur_adresse_digicode"] },
    /* */
    /**************************************************************************************************************/
    /* Ancienne adresse */
    /**************************************************************************************************************/

    demandeur_old_adresse: { "": ["demandeur_old_adresse"] },
    demandeur_old_code_postal: {
        "": [
            "demandeur_old_code_postal_1",
            "demandeur_old_code_postal_2",
            "demandeur_old_code_postal_3",
            "demandeur_old_code_postal_4",
            "demandeur_old_code_postal_5",
        ],
    },
    demandeur_old_ville: { "": ["demandeur_old_ville"] },
    demandeur_date_arrivee: {
        "": [
            "demandeur_date_arrivee_adresse_jour_1",
            "demandeur_date_arrivee_adresse_jour_2",
            "demandeur_date_arrivee_adresse_mois_1",
            "demandeur_date_arrivee_adresse_mois_2",
            "demandeur_date_arrivee_adresse_annee_1",
            "demandeur_date_arrivee_adresse_annee_2",
            "demandeur_date_arrivee_adresse_annee_3",
            "demandeur_date_arrivee_adresse_annee_4",
        ],
    },
    /* */
    /**************************************************************************************************************/
    /* Coordonnées du demandeur */
    /**************************************************************************************************************/

    demandeur_situation_familiale: {
        "": [
            "est_demandeur_celibataire",
            "est_demandeur_marie",
            "est_demandeur_pacse",
            "est_demandeur_concubinage",
            "est_demandeur_divorce_separe",
            "est_demandeur_veuf",
        ],
    },
    conjoint_sexe: { "": ["est_conjoint_femme", "est_conjoint_homme"] },
    conjoint_nom_naissance: { "": ["conjoint_nom_naissance"] },
    conjoint_nom_usage: { "": ["conjoint_nom_usage"] },
    conjoint_prenom: { "": ["conjoint_prenom"] },
    conjoint_date_naissance: {
        "": [
            "conjoint_date_naissance_jour_1",
            "conjoint_date_naissance_jour_2",
            "conjoint_date_naissance_mois_1",
            "conjoint_date_naissance_mois_2",
            "conjoint_date_naissance_annee_1",
            "conjoint_date_naissance_annee_2",
            "conjoint_date_naissance_annee_3",
            "conjoint_date_naissance_annee_4",
        ],
    },
    conjoint_ville_naissance: { "": ["conjoint_ville_naissance"] },
    conjoint_departement_naissance: { "": ["conjoint_departement_naissance"] },
    conjoint_pays_naissance: { "": ["conjoint_pays_naissance"] },
    conjoint_numero_securite_sociale: {
        "": [
            "conjoint_numero_securite_sociale_1",
            "conjoint_numero_securite_sociale_2",
            "conjoint_numero_securite_sociale_3",
            "conjoint_numero_securite_sociale_4",
            "conjoint_numero_securite_sociale_5",
            "conjoint_numero_securite_sociale_6",
            "conjoint_numero_securite_sociale_7",
            "conjoint_numero_securite_sociale_8",
            "conjoint_numero_securite_sociale_9",
            "conjoint_numero_securite_sociale_10",
            "conjoint_numero_securite_sociale_11",
            "conjoint_numero_securite_sociale_12",
            "conjoint_numero_securite_sociale_13",
            "conjoint_numero_securite_sociale_14",
            "conjoint_numero_securite_sociale_15",
        ],
    },
    conjoint_domicile: {
        "": [
            "est_conjoint_domicile_identique_demandeur",
            "est_conjoint_domicile_accueillant",
            "est_conjoint_domicile_ehpad",
            "est_conjoint_domicile_autre",
        ],
    },
    conjoint_domicile_ehpad_date_entree: {
        "": [
            "conjoint_domicile_ehpad_date_entree_jour_1",
            "conjoint_domicile_ehpad_date_entree_jour_2",
            "conjoint_domicile_ehpad_date_entree_mois_1",
            "conjoint_domicile_ehpad_date_entree_mois_2",
            "conjoint_domicile_ehpad_date_entree_annee_1",
            "conjoint_domicile_ehpad_date_entree_annee_2",
            "conjoint_domicile_ehpad_date_entree_annee_3",
            "conjoint_domicile_ehpad_date_entree_annee_4",
        ],
    },
    conjoint_domicile_autre: { "": ["conjoint_domicile_autre"] },
    /* */
    /**************************************************************************************************************/
    /* Coordonnées du demandeur */
    /**************************************************************************************************************/

    mesure_protection: {
        "": [
            "est_demandeur_mesure_protection_prononcee",
            "est_demandeur_mesure_protection_demandee",
            "est_demandeur_mesure_protection_non",
        ],
    },
    mesure_protection_type: {
        "": [
            "est_demandeur_mesure_protection_sauvegarde_justice",
            "est_demandeur_mesure_protection_curatelle_simple",
            "est_demandeur_mesure_protection_curatelle_renforcee",
            "est_demandeur_mesure_protection_tutelle",
            "est_demandeur_mesure_protection_habitation_familiale",
            "est_demandeur_mesure_protection_mandat_protection",
        ],
    },
    organisme_mesure_protection_nom: {
        "": ["organisme_mesure_protection_nom"],
    },
    personne_organisme_mesure_protection_sexe: {
        "": [
            "est_personne_organisme_mesure_protection_femme",
            "est_personne_organisme_mesure_protection_homme",
        ],
    },
    personne_organisme_mesure_protection_nom: {
        "": ["personne_organisme_mesure_protection_nom"],
    },
    personne_organisme_mesure_protection_prenom: {
        "": ["personne_organisme_mesure_protection_prenom"],
    },
    personne_organisme_mesure_protection_adresse: {
        "": ["personne_organisme_mesure_protection_adresse"],
    },
    personne_organisme_mesure_protection_code_postal: {
        "": [
            "personne_organisme_mesure_protection_code_postal_1",
            "personne_organisme_mesure_protection_code_postal_2",
            "personne_organisme_mesure_protection_code_postal_3",
            "personne_organisme_mesure_protection_code_postal_4",
            "personne_organisme_mesure_protection_code_postal_5",
        ],
    },
    personne_organisme_mesure_protection_ville: {
        "": ["personne_organisme_mesure_protection_ville"],
    },
    personne_organisme_mesure_protection_telephone: {
        "": [
            "personne_organisme_mesure_protection_telephone_1",
            "personne_organisme_mesure_protection_telephone_2",
            "personne_organisme_mesure_protection_telephone_3",
            "personne_organisme_mesure_protection_telephone_4",
            "personne_organisme_mesure_protection_telephone_5",
            "personne_organisme_mesure_protection_telephone_6",
            "personne_organisme_mesure_protection_telephone_7",
            "personne_organisme_mesure_protection_telephone_8",
            "personne_organisme_mesure_protection_telephone_9",
            "personne_organisme_mesure_protection_telephone_10",
        ],
    },
    personne_organisme_mesure_protection_mail: {
        "": ["personne_organisme_mesure_protection_mail"],
    },
    /* */
    /**************************************************************************************************************/
    /* Personne proche à contacter */
    /**************************************************************************************************************/

    personne_proche_sexe: {
        "": ["est_personne_proche_femme", "est_personne_proche_homme"],
    },
    personne_proche_nom: { "": ["personne_proche_nom"] },
    personne_proche_prenom: { "": ["personne_proche_prenom"] },
    personne_proche_adresse: { "": ["personne_proche_adresse"] },
    personne_proche_code_postal: {
        "": [
            "personne_proche_code_postal_1",
            "personne_proche_code_postal_2",
            "personne_proche_code_postal_3",
            "personne_proche_code_postal_4",
            "personne_proche_code_postal_5",
        ],
    },
    personne_proche_ville: { "": ["personne_proche_ville"] },
    personne_proche_telephone: {
        "": [
            "personne_proche_telephone_1",
            "personne_proche_telephone_2",
            "personne_proche_telephone_3",
            "personne_proche_telephone_4",
            "personne_proche_telephone_5",
            "personne_proche_telephone_6",
            "personne_proche_telephone_7",
            "personne_proche_telephone_8",
            "personne_proche_telephone_9",
            "personne_proche_telephone_10",
        ],
    },
    personne_proche_mail: { "": ["personne_proche_mail"] },
    personne_proche_lien: {
        "": [
            "est_personne_proche_lien_enfant",
            "est_personne_proche_lien_conjoint",
            "est_personne_proche_lien_ami",
            "est_personne_proche_lien_voisin",
            "est_personne_proche_lien_autre",
        ],
    },
    personne_proche_lien_autre: { "": ["personne_proche_lien_autre"] },
    /* */
    /**************************************************************************************************************/
    /* Identification de l'organisme à contacter*/
    /**************************************************************************************************************/

    est_identification_organisme_lever: {
        "": [
            "est_identification_organisme_lever_oui",
            "est_identification_organisme_lever_non",
        ],
    },
    est_identification_organisme_habiller: {
        "": [
            "est_identification_organisme_habiller_oui",
            "est_identification_organisme_habiller_non",
        ],
    },
    est_identification_organisme_toilette: {
        "": [
            "est_identification_organisme_toilette_oui",
            "est_identification_organisme_toilette_non",
        ],
    },
    est_identification_organisme_manger: {
        "": [
            "est_identification_organisme_manger_oui",
            "est_identification_organisme_manger_non",
        ],
    },
    /* */
    /**************************************************************************************************************/
    /* Autres prestations demandées */
    /**************************************************************************************************************/

    demandeur_actp: {
        "": ["est_demandeur_actp_oui", "est_demandeur_actp_non"],
    },
    demandeur_aide_sociale_departementale: {
        "": [
            "est_demandeur_aide_sociale_departementale_oui",
            "est_demandeur_aide_sociale_departementale_non",
        ],
    },
    demandeur_mtp: {
        "": ["est_demandeur_mtp_oui", "est_demandeur_mtp_non"],
    },
    demandeur_pch: {
        "": ["est_demandeur_pch_oui", "est_demandeur_pch_non"],
    },
    demandeur_pcrtp: {
        "": ["est_demandeur_pcrtp_oui", "est_demandeur_pcrtp_non"],
    },
    /* */
    /**************************************************************************************************************/
    /* Bien immobilier et autre */
    /**************************************************************************************************************/
    demandeur_residence_principal_adresse: {
        "": ["demandeur_residence_principal_adresse"],
    },
    demandeur_residence_principal_code_postal: {
        "": [
            "demandeur_residence_principal_code_postal_1",
            "demandeur_residence_principal_code_postal_2",
            "demandeur_residence_principal_code_postal_3",
            "demandeur_residence_principal_code_postal_4",
            "demandeur_residence_principal_code_postal_5",
        ],
    },
    demandeur_residence_principal_ville: {
        "": ["demandeur_residence_principal_ville"],
    },
    demandeur_residence_principale_proprietaire: {
        "": [
            "est_demandeur_residence_principale_proprietaire",
            "est_demandeur_residence_principale_locataire",
        ],
    },
    habitant_residence_principal: {
        "": [
            "est_residence_principale_habite_famille",
            "est_residence_principale_habite_tiers",
            "est_residence_principale_habite_non_louee",
        ],
    },
    demandeur_residence_1_adresse: { "": ["demandeur_residence_1_adresse"] },
    demandeur_residence_1_code_postal: {
        "": [
            "demandeur_residence_1_code_postal_1",
            "demandeur_residence_1_code_postal_2",
            "demandeur_residence_1_code_postal_3",
            "demandeur_residence_1_code_postal_4",
            "demandeur_residence_1_code_postal_5",
        ],
    },
    demandeur_residence_1_ville: { "": ["demandeur_residence_1_ville"] },
    demandeur_residence_2_adresse: { "": ["demandeur_residence_2_adresse"] },
    demandeur_residence_2_code_postal: {
        "": [
            "demandeur_residence_2_code_postal_1",
            "demandeur_residence_2_code_postal_2",
            "demandeur_residence_2_code_postal_3",
            "demandeur_residence_2_code_postal_4",
            "demandeur_residence_2_code_postal_5",
        ],
    },
    demandeur_residence_2_ville: { "": ["demandeur_residence_2_ville"] },
    demandeur_residence_3_adresse: { "": ["demandeur_residence_3_adresse"] },
    demandeur_residence_3_code_postal: {
        "": [
            "demandeur_residence_3_code_postal_1",
            "demandeur_residence_3_code_postal_2",
            "demandeur_residence_3_code_postal_3",
            "demandeur_residence_3_code_postal_4",
            "demandeur_residence_3_code_postal_5",
        ],
    },
    demandeur_residence_3_ville: { "": ["demandeur_residence_3_ville"] },
    demandeur_bien_1: {
        "": ["demandeur_bien_1"],
    },
    demandeur_bien_prix_1: { "": ["demandeur_bien_prix_1"] },
    demandeur_bien_2: {
        "": ["demandeur_bien_2"],
    },
    demandeur_bien_prix_2: { "": ["demandeur_bien_prix_2"] },
    demandeur_bien_3: {
        "": ["demandeur_bien_3"],
    },
    demandeur_bien_prix_3: { "": ["demandeur_bien_prix_3"] },
    /* */
    /**************************************************************************************************************/
    /* CMI */
    /**************************************************************************************************************/

    demandeur_cmi_stationnement: {
        "": [
            "est_demandeur_cmi_stationnement_oui",
            "est_demandeur_cmi_stationnement_non",
        ],
    },
    demandeur_cmi_priorite_invalidite: {
        "": [
            "est_demandeur_cmi_priorite_invalidite_oui",
            "est_demandeur_cmi_priorite_invalidite_non",
        ],
    },
    demandeur_cmi_renouveller: {
        "": [
            "est_demandeur_cmi_renouveller_oui",
            "est_demandeur_cmi_renouveller_non",
        ],
    },
    /* */
    /**************************************************************************************************************/
    /* Signature */
    /**************************************************************************************************************/
    personne_signature_sexe: {
        "": ["est_signature_femme", "est_signature_homme"],
    },
    personne_signature_nom: { "": ["signature_nom"] },
    personne_signature_prenom: { "": ["signature_prenom"] },
    personne_signature_pour: {
        "": ["est_signature_pour_soi", "est_signature_pour_quelquun"],
    },
    personne_signature_pour_quelquun: { "": ["signature_pour_personne"] },
    /* */
};
const apa = {
    signature: [
        "signature_lieu",
        "signature_date_jour_1",
        "signature_date_jour_2",
        "signature_date_mois_1",
        "signature_date_mois_2",
        "signature_date_annee_1",
        "signature_date_annee_2",
        "signature_date_annee_3",
        "signature_date_annee_4",
        "signature",
    ],
};
