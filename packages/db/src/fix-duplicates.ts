import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: "../../apps/server/.env" });

const { Client } = pg;

async function fixDuplicates() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("🔍 Recherche de doublons dans demande_acces_patient...");

  const duplicates = await client.query(`
    SELECT patient_id, professionnel_id, statut, COUNT(*) as cnt
    FROM demande_acces_patient
    GROUP BY patient_id, professionnel_id, statut
    HAVING COUNT(*) > 1
  `);

  if (duplicates.rows.length === 0) {
    console.log("✅ Aucun doublon trouvé.");
    await client.end();
    return;
  }

  console.log(`⚠️  ${duplicates.rows.length} combinaison(s) en double trouvée(s):`);
  for (const row of duplicates.rows) {
    console.log(`   patient=${row.patient_id}, pro=${row.professionnel_id}, statut=${row.statut} (${row.cnt}x)`);
  }

  // Keep the most recent row for each duplicate group, delete the rest
  const result = await client.query(`
    DELETE FROM demande_acces_patient
    WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY patient_id, professionnel_id, statut
          ORDER BY created_at DESC
        ) as rn
        FROM demande_acces_patient
      ) sub
      WHERE rn > 1
    )
  `);

  console.log(`🗑️  ${result.rowCount} doublon(s) supprimé(s).`);

  // Also drop the index if it exists, so db:push can recreate it cleanly
  await client.query(`
    DROP INDEX IF EXISTS demande_acces_patient_unique_par_statut
  `);
  console.log("🗑️  Index existant supprimé (sera recréé par db:push).");

  await client.end();
  console.log("✅ Nettoyage terminé. Vous pouvez maintenant relancer 'bun run db:push'.");
}

fixDuplicates().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
