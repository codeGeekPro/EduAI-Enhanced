import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Play, 
  ArrowRight, 
  Star, 
  Brain,
  Zap,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useI18nStore } from '../stores/i18nStore';
import { useAuthStore } from '../stores/authStore';

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  rating: number;
  students: number;
  instructor: string;
  category: string;
  isPopular?: boolean;
}

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

const HomePage: React.FC = () => {
  const { t } = useI18nStore();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const stats: StatItem[] = [
    { label: t('home.stats.availableCourses'), value: '500+', icon: BookOpen },
    { label: t('home.stats.activeStudents'), value: '10k+', icon: Users },
    { label: t('home.stats.certificatesIssued'), value: '2.5k+', icon: Award },
    { label: t('home.stats.averageRating'), value: '94%', icon: TrendingUp },
  ];

  const features: Feature[] = [
    {
      title: t('home.features.ai.title'),
      description: t('home.features.ai.description'),
      icon: Brain,
      color: 'from-purple-500 to-blue-500'
    },
    {
      title: t('home.features.microlearning.title'),
      description: t('home.features.microlearning.description'),
      icon: Target,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: t('home.features.progress.title'),
      description: t('home.features.progress.description'),
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: t('home.features.community.title'),
      description: t('home.features.community.description'),
      icon: Users,
      color: 'from-blue-500 to-purple-500'
    }
  ];

  const featuredCourses: Course[] = [
    {
      id: '1',
      title: t('courseData.programming.title'),
      description: t('courseData.programming.description'),
      image: '/api/placeholder/400/250',
      duration: '8h',
      rating: 4.9,
      students: 1200,
      instructor: t('courseData.programming.instructor'),
      category: 'Informatique',
      isPopular: true
    },
    {
      id: '2',
      title: t('courseData.mathematics.title'),
      description: t('courseData.mathematics.description'),
      image: '/api/placeholder/400/250',
      duration: '12h',
      rating: 4.8,
      students: 850,
      instructor: t('courseData.mathematics.instructor'),
      category: 'Mathématiques',
      isPopular: true
    },
    {
      id: '3',
      title: t('courseData.science.title'),
      description: t('courseData.science.description'),
      image: '/api/placeholder/400/250',
      duration: '10h',
      rating: 4.7,
      students: 950,
      instructor: t('courseData.science.instructor'),
      category: 'Data Science'
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleExploreCourses = () => {
    navigate('/courses');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                {isAuthenticated ? t('home.hero.accessDashboard') : t('home.hero.getStarted')}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleExploreCourses}
                className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg transition-all duration-200"
              >
                {t('home.hero.discoverCourses')}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t('home.courses.title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('home.courses.subtitle')}
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="hidden md:flex">
                {t('common.viewAllCourses')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.isPopular && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full">
                        🔥 {t('home.courses.popular')}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {course.rating}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.students}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('courses.by')} {course.instructor}
                    </span>
                    <Button size="sm" className="group-hover:bg-blue-700 transition-colors">
                      {t('courses.startCourse')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/courses">
              <Button variant="outline">
                {t('common.viewAllCourses')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Leroux",
                role: "Développeuse Web",
                content: "EduAI Enhanced a transformé ma façon d'apprendre. L'IA s'adapte parfaitement à mon rythme et me propose toujours le bon contenu au bon moment.",
                avatar: "/api/placeholder/60/60"
              },
              {
                name: "Thomas Dubois",
                role: "Data Scientist",
                content: "Les cours sont exceptionnels et la progression adaptative est remarquable. J'ai pu acquérir de nouvelles compétences en un temps record.",
                avatar: "/api/placeholder/60/60"
              },
              {
                name: "Sarah Martin",
                role: "Chef de Projet",
                content: "La qualité pédagogique est au rendez-vous. L'interface est intuitive et les certificats sont reconnus dans mon secteur.",
                avatar: "/api/placeholder/60/60"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à transformer votre apprentissage ?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'apprenants qui développent déjà leurs compétences 
            avec notre IA révolutionnaire. Commencez votre parcours dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Zap className="h-5 w-5 mr-2" />
              Commencer maintenant
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleExploreCourses}
              className="border-white text-white hover:bg-white hover:text-purple-600 shadow-lg transition-all duration-200"
            >
              Explorer les cours
            </Button>
          </div>
          <p className="text-purple-200 text-sm mt-6">
            ✨ Inscription gratuite • 🎯 Contenu personnalisé • 🏆 Certificats reconnus
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
