import ConceptMap from "../components/visualizations/ConceptMap";
import LearningJourney from "../components/visualizations/LearningJourney";

export default function DashboardPage() {
  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Tableau de Bord de l'Apprentissage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Carte Conceptuelle</h3>
          <ConceptMap />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Parcours d'Apprentissage (3D)</h3>
          <LearningJourney />
        </div>
      </div>
    </div>
  );
}
