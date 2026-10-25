// Export et import de toutes les données de lecture (points, cagnotte, journal, carnet de mots, articles importés, réglages).
import { tout, remplacerTout } from "./store.js";
import { jour } from "./outils.js";

const FORMAT = 1;

export async function exporter() {
  const contenu = JSON.stringify({ app: "lecture", format: FORMAT, exporte_le: new Date().toISOString(), donnees: tout() }, null, 2);
  const nom = `lecture-sauvegarde-${jour()}.json`;
  const fichier = new File([contenu], nom, { type: "application/json" });
  // sur iPad : feuille de partage (Fichiers, AirDrop, mail…) ; sinon téléchargement
  if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
    try { await navigator.share({ files: [fichier], title: nom }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(fichier); lien.download = nom;
  document.body.append(lien); lien.click(); lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
}

export async function importerSauvegarde(texte) {
  const s = JSON.parse(texte);
  if (s.app !== "lecture" || !s.donnees) throw new Error("ce fichier n'est pas une sauvegarde de l'app");
  if (!confirm(`Remplacer toutes les données de cet iPad par la sauvegarde du ${new Date(s.exporte_le).toLocaleDateString("fr-FR")} ?`)) return false;
  await remplacerTout(s.donnees);
  return true;
}
