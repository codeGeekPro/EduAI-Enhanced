import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Star, Users, Play, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useCourses, useEnrollCourse } from '../hooks/useAPI';
import { useCoursesStore } from '../stores/coursesStore';
import { useUIStore } from '../stores/uiStore';

const CoursesPage: React.FC = () => {
  const { data: courses, isLoading, error } = useCourses();
  const enrollMutation = useEnrollCourse();
  
  const {
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    getFilteredCourses
  } = useCoursesStore();

  const [showFilters, setShowFilters] = useState(false);

  // Mettre à jour les cours dans le store
  useEffect(() => {
    if (courses) {
      useCoursesStore.getState().setCourses(courses);
    }
  }, [courses]);

  const filteredCourses = getFilteredCourses();

  const handleEnroll = async (courseId: string, courseName: string) => {
    try {
      await enrollMutation.mutateAsync(courseId);
    } catch (error) {
      console.error('Erreur inscription:', error);
    }
  };

  const categories = [
    'Tous',
    'Mathématiques',
    'Sciences',
    'Langues',
    'Histoire',
    'Informatique',
    'Arts'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement des cours</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Catalogue des Cours</h1>
        <p className="text-blue-100">
          Découvrez nos cours interactifs avec intelligence artificielle intégrée
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrer par catégorie"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'Tous' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ difficulty: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrer par niveau"
                >
                  <option value="">Tous niveaux</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix
                </label>
                <select
                  value={filters.price}
                  onChange={(e) => setFilters({ price: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrer par prix"
                >
                  <option value="all">Tous</option>
                  <option value="free">Gratuit</option>
                  <option value="paid">Payant</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note minimum
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ rating: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrer par note minimum"
                >
                  <option value={0}>Toutes</option>
                  <option value={4}>4+ étoiles</option>
                  <option value={4.5}>4.5+ étoiles</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
        </p>
        <select 
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          aria-label="Trier les cours"
        >
          <option>Trier par pertinence</option>
          <option>Plus récents</option>
          <option>Mieux notés</option>
          <option>Prix croissant</option>
          <option>Prix décroissant</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative">
              <img
                src={course.image || '/api/placeholder/400/250'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              {course.progress && course.progress.completion_percentage > 0 && (
                <div className="absolute top-2 right-2">
                  <div className="bg-white rounded-full px-2 py-1 text-xs font-medium text-green-600">
                    {course.progress.completion_percentage}% terminé
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.is_free 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {course.is_free ? 'Gratuit' : `${course.price}€`}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {course.category}
                </span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}h
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrolled_count} élèves
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.difficulty}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Par {course.instructor}
                </span>
                <Button
                  onClick={() => handleEnroll(course.id, course.title)}
                  disabled={enrollMutation.isPending}
                  size="sm"
                  className="flex items-center"
                >
                  {enrollMutation.isPending ? (
                    'Inscription...'
                  ) : course.progress && course.progress.completion_percentage > 0 ? (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Continuer
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-1" />
                      S'inscrire
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun cours trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilters({ category: '', difficulty: '', price: 'all', rating: 0 });
            }}
            variant="outline"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
