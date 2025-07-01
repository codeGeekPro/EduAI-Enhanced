import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useI18nStore } from '../stores/i18nStore';
import { 
  Book, 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Star, 
  PlayCircle,
  CheckCircle,
  BookOpen,
  Award
} from 'lucide-react';

const CoursesPage = () => {
  const { t, language } = useI18nStore();
  
  const courses = [
    {
      id: 1,
      title: t('courseData.mathematics.title'),
      description: t('courseData.mathematics.description'),
      instructor: t('courseData.mathematics.instructor'),
      duration: '12 weeks',
      level: t('courses.intermediate'),
      students: 2847,
      rating: 4.9,
      progress: 65,
      image: '/images/math-fallback.svg',
      lessons: 48,
      category: 'Sciences',
      price: t('courses.free'),
      tags: language === 'en' ? ['Algebra', 'Geometry', 'Statistics'] : ['Algèbre', 'Géométrie', 'Statistiques'],
      nextLesson: t('courseData.mathematics.nextLesson'),
    },
    {
      id: 2,
      title: t('courseData.science.title'),
      description: t('courseData.science.description'),
      instructor: t('courseData.science.instructor'),
      duration: '10 weeks',
      level: t('courses.beginner'),
      students: 1923,
      rating: 4.8,
      progress: 80,
      image: '/images/science-fallback.svg',
      lessons: 35,
      category: 'Sciences',
      price: t('courses.free'),
      tags: language === 'en' ? ['Chemistry', 'Physics', 'Experiments'] : ['Chimie', 'Physique', 'Expériences'],
      nextLesson: t('courseData.science.nextLesson'),
    },
    {
      id: 3,
      title: t('courseData.programming.title'),
      description: t('courseData.programming.description'),
      instructor: t('courseData.programming.instructor'),
      duration: '16 weeks',
      level: t('courses.beginner'),
      students: 3156,
      rating: 4.9,
      progress: 45,
      image: '/images/programming-fallback.svg',
      lessons: 52,
      category: 'Computer Science',
      price: t('courses.free'),
      tags: language === 'en' ? ['JavaScript', 'Python', 'Projects'] : ['JavaScript', 'Python', 'Projets'],
      nextLesson: t('courseData.programming.nextLesson'),
    },
    {
      id: 4,
      title: t('courseData.history.title'),
      description: t('courseData.history.description'),
      instructor: t('courseData.history.instructor'),
      duration: '14 weeks',
      level: t('courses.intermediate'),
      students: 2234,
      rating: 4.7,
      progress: 30,
      image: '/images/education_illustration.svg',
      lessons: 42,
      category: 'Humanities',
      price: t('courses.free'),
      tags: language === 'en' ? ['Antiquity', 'Middle Ages', 'Modern Era'] : ['Antiquité', 'Moyen Âge', 'Époque moderne'],
      nextLesson: t('courseData.history.nextLesson'),
    },
    {
      id: 5,
      title: t('courseData.art.title'),
      description: t('courseData.art.description'),
      instructor: t('courseData.art.instructor'),
      duration: '8 weeks',
      level: t('courses.allLevels'),
      students: 1567,
      rating: 4.8,
      progress: 0,
      image: '/images/education_illustration.svg',
      lessons: 28,
      category: 'Arts',
      price: t('courses.free'),
      tags: language === 'en' ? ['Drawing', 'Color', 'Composition'] : ['Dessin', 'Couleur', 'Composition'],
      nextLesson: t('courseData.art.nextLesson'),
    },
    {
      id: 6,
      title: t('courseData.philosophy.title'),
      description: t('courseData.philosophy.description'),
      instructor: t('courseData.philosophy.instructor'),
      duration: '12 weeks',
      level: t('courses.advanced'),
      students: 892,
      rating: 4.9,
      progress: 0,
      image: '/images/education_illustration.svg',
      lessons: 36,
      category: 'Humanities',
      price: t('courses.free'),
      tags: language === 'en' ? ['Ethics', 'Metaphysics', 'Logic'] : ['Éthique', 'Métaphysique', 'Logique'],
      nextLesson: t('courseData.philosophy.nextLesson'),
    },
  ];
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const getLevelColor = (level: string) => {
    if (level === t('courses.beginner')) return 'text-success bg-success/10';
    if (level === t('courses.intermediate')) return 'text-warning bg-warning/10';
    if (level === t('courses.advanced')) return 'text-danger bg-danger/10';
    return 'text-primary bg-primary/10';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('courses.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('courses.subtitle')}
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {courses.length}
            </div>
            <div className="text-sm text-muted-foreground">{t('courses.availableCourses')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {courses.reduce((sum, course) => sum + course.students, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{t('courses.enrolledStudents')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {courses.reduce((sum, course) => sum + course.lessons, 0)}
            </div>
            <div className="text-sm text-muted-foreground">{t('courses.totalLessons')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent mb-1">
              4.8
            </div>
            <div className="text-sm text-muted-foreground">{t('courses.averageRating')}</div>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course) => (
            <motion.div key={course.id} variants={cardVariants}>
              <Card className="h-full flex flex-col bg-card border-0 shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer group">
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-black/90 text-primary text-xs font-medium rounded-full backdrop-blur-sm">
                      {course.price}
                    </span>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">{course.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('courses.by')} {course.instructor}
                  </p>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Progress Bar (if enrolled) */}
                  {course.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{t('courses.progress')}</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Course Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Course Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons} {t('courses.lessons')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>{t('courses.certificate')}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {course.progress > 0 ? (
                      <Button 
                        className="w-full"
                        onClick={() => alert('Continue course: ' + course.title)}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {t('courses.continue')}
                      </Button>
                    ) : (
                      <Button 
                        variant="secondary"
                        className="w-full"
                        onClick={() => alert('Start course: ' + course.title)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('courses.startCourse')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CoursesPage;
