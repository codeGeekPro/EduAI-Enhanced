import ConceptMap from "../components/visualizations/ConceptMap";
import LearningJourney from "../components/visualizations/LearningJourney";

export default function DashboardPage() {
  // Données d'exemple pour la carte conceptuelle
  const conceptMapData = {
    nodes: [
      { id: "Mathématiques", group: "main", size: 3 },
      { id: "Algèbre", group: "branch", size: 2 },
      { id: "Géométrie", group: "branch", size: 2 },
      { id: "Équations", group: "leaf", size: 1 },
      { id: "Triangles", group: "leaf", size: 1 }
    ],
    links: [
      { source: "Mathématiques", target: "Algèbre", value: 2 },
      { source: "Mathématiques", target: "Géométrie", value: 2 },
      { source: "Algèbre", target: "Équations", value: 1 },
      { source: "Géométrie", target: "Triangles", value: 1 }
    ]
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Tableau de Bord de l'Apprentissage</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Carte Conceptuelle</h3>
          <ConceptMap data={conceptMapData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Parcours d'Apprentissage (3D)</h3>
          <LearningJourney />
        </div>
      </div>
    </div>
  );
}
