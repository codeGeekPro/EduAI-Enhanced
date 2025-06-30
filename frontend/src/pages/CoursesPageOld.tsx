import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Users, Star, Play } from 'lucide-react';
import { Button } from '../components/ui/Button';

const CoursesPage: React.FC = () => {
  const courses = [
    {
      id: 1,
      title: "Intelligence Artificielle pour Débutants",
      description: "Découvrez les fondamentaux de l'IA avec des exemples pratiques et des exercices interactifs.",
      duration: "2h 30min",
      level: "Débutant",
      students: 1247,
      rating: 4.8,
      image: "/api/placeholder/300/200",
      category: "Technologie",
      progress: 0
    },
    {
      id: 2,
      title: "Leadership et Management",
      description: "Développez vos compétences de leadership avec des simulations réalistes et du coaching IA.",
      duration: "3h 15min",
      level: "Intermédiaire",
      students: 892,
      rating: 4.9,
      image: "/api/placeholder/300/200",
      category: "Management",
      progress: 45
    },
    {
      id: 3,
      title: "Communication Efficace",
      description: "Améliorez vos compétences de communication avec des exercices vocaux et des simulations.",
      duration: "1h 45min",
      level: "Tous niveaux",
      students: 1534,
      rating: 4.7,
      image: "/api/placeholder/300/200",
      category: "Soft Skills",
      progress: 78
    },
    {
      id: 4,
      title: "Analyse de Données avec Python",
      description: "Maîtrisez l'analyse de données avec Python à travers des projets pratiques.",
      duration: "4h 20min",
      level: "Avancé",
      students: 623,
      rating: 4.6,
      image: "/api/placeholder/300/200",
      category: "Data Science",
      progress: 0
    },
    {
      id: 5,
      title: "Gestion du Stress et Bien-être",
      description: "Techniques de relaxation et de gestion du stress pour améliorer votre bien-être.",
      duration: "2h 10min",
      level: "Tous niveaux",
      students: 2156,
      rating: 4.9,
      image: "/api/placeholder/300/200",
      category: "Développement Personnel",
      progress: 0
    },
    {
      id: 6,
      title: "Marketing Digital",
      description: "Stratégies modernes de marketing digital avec des études de cas réels.",
      duration: "3h 40min",
      level: "Intermédiaire",
      students: 1089,
      rating: 4.5,
      image: "/api/placeholder/300/200",
      category: "Marketing",
      progress: 23
    }
  ];

  const categories = ["Tous", "Technologie", "Management", "Soft Skills", "Data Science", "Développement Personnel", "Marketing"];
  const [selectedCategory, setSelectedCategory] = React.useState("Tous");

  const filteredCourses = selectedCategory === "Tous" 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Débutant": return "bg-green-100 text-green-800";
      case "Intermédiaire": return "bg-yellow-100 text-yellow-800";
      case "Avancé": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Catalogue de Cours</h1>
          <p className="text-xl text-gray-600">
            Découvrez nos cours adaptatifs alimentés par l'IA pour accélérer votre apprentissage
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                <div className="text-sm text-gray-600">Cours disponibles</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {courses.reduce((sum, course) => sum + course.students, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Étudiants actifs</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">42h</div>
                <div className="text-sm text-gray-600">Contenu total</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900">4.7</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white opacity-50" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
                {course.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progression: {course.progress}%</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-green-500 h-2 rounded-full`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">{course.category}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-gray-600">{course.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()} étudiants
                  </div>
                </div>
                
                <Button className="w-full" variant={course.progress > 0 ? "default" : "outline"}>
                  <Play className="h-4 w-4 mr-2" />
                  {course.progress > 0 ? "Continuer" : "Commencer"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas ce que vous cherchez?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Notre IA peut créer des parcours d'apprentissage personnalisés selon vos besoins spécifiques. 
            Parlez-nous de vos objectifs!
          </p>
          <Button size="lg">
            Demander un cours personnalisé
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
