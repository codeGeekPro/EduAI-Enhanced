import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Book, Target, TrendingUp, PlayCircle, Star, Users, Award, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useImageGeneration } from '../hooks/useImageGeneration';
import { useI18nStore } from '../stores/i18nStore';
import { useEffect } from 'react';

// Données de simulation améliorées inspirées de Kalvi
const featuredCourses = [
  { 
    title: 'Mathématiques Interactives', 
    icon: Book, 
    description: 'Maîtrisez les concepts mathématiques grâce à des exercices interactifs et des visualisations dynamiques.',
    students: '2,847',
    rating: 4.9,
    color: 'text-primary',
    badge: 'Populaire',
    imagePrompt: 'mathematics equations, geometric shapes, numbers, educational style',
    fallbackCategory: 'mathematics' as const,
  },
  { 
    title: 'Laboratoire de Sciences', 
    icon: Target, 
    description: 'Explorez la physique et la chimie avec des expériences virtuelles immersives.',
    students: '1,923',
    rating: 4.8,
    color: 'text-success',
    badge: 'Nouveau',
    imagePrompt: 'laboratory, scientific equipment, molecules, chemistry, physics experiments',
    fallbackCategory: 'science' as const,
  },
  { 
    title: 'Programmation Créative', 
    icon: TrendingUp, 
    description: 'Apprenez à coder de manière ludique avec des projets créatifs et interactifs.',
    students: '3,156',
    rating: 4.9,
    color: 'text-warning',
    badge: 'Tendance',
    imagePrompt: 'programming code, computer screen, coding symbols, software development',
    fallbackCategory: 'programming' as const,
  },
];

const progressData = [
  { name: 'Maths', progress: 85, fill: 'hsl(var(--primary))' },
  { name: 'Sciences', progress: 72, fill: 'hsl(var(--success))' },
  { name: 'Histoire', progress: 91, fill: 'hsl(var(--warning))' },
  { name: 'Français', progress: 78, fill: 'hsl(var(--accent))' },
];

const stats = [
  { icon: Users, label: 'Étudiants actifs', value: '12,000+' },
  { icon: Book, label: 'Cours disponibles', value: '150+' },
  { icon: Award, label: 'Certificats délivrés', value: '5,000+' },
  { icon: Star, label: 'Note moyenne', value: '4.9/5' },
];

const HomePage = () => {
  const { generateImage, getImageResult, preloadFallbackImages } = useImageGeneration();
  const { t } = useI18nStore();
  
  // Données de simulation améliorées inspirées de Kalvi
  const featuredCourses = [
    { 
      title: t('courseData.mathematics.title'), 
      icon: Book, 
      description: t('courseData.mathematics.description'),
      students: '2,847',
      rating: 4.9,
      color: 'text-primary',
      badge: t('home.courses.popular'),
      imagePrompt: 'mathematics equations, geometric shapes, numbers, educational style',
      fallbackCategory: 'mathematics' as const,
    },
    { 
      title: t('courseData.science.title'), 
      icon: Target, 
      description: t('courseData.science.description'),
      students: '1,923',
      rating: 4.8,
      color: 'text-success',
      badge: t('home.courses.new'),
      imagePrompt: 'laboratory, scientific equipment, molecules, chemistry, physics experiments',
      fallbackCategory: 'science' as const,
    },
    { 
      title: t('courseData.programming.title'), 
      icon: TrendingUp, 
      description: t('courseData.programming.description'),
      students: '3,156',
      rating: 4.9,
      color: 'text-warning',
      badge: t('home.courses.trending'),
      imagePrompt: 'programming code, computer screen, coding symbols, software development',
      fallbackCategory: 'programming' as const,
    },
  ];

  const progressData = [
    { name: 'Maths', progress: 85, fill: 'hsl(var(--primary))' },
    { name: 'Sciences', progress: 72, fill: 'hsl(var(--success))' },
    { name: 'Histoire', progress: 91, fill: 'hsl(var(--warning))' },
    { name: 'Français', progress: 78, fill: 'hsl(var(--accent))' },
  ];

  const stats = [
    { icon: Users, label: t('home.stats.activeStudents'), value: '12,000+' },
    { icon: Book, label: t('home.stats.availableCourses'), value: '150+' },
    { icon: Award, label: t('home.stats.certificatesIssued'), value: '5,000+' },
    { icon: Star, label: t('home.stats.averageRating'), value: '4.9/5' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Génère les images au chargement du composant
  useEffect(() => {
    preloadFallbackImages();
    
    // Génère une image pour chaque cours avec un délai pour éviter la surcharge
    featuredCourses.forEach((course, index) => {
      setTimeout(() => {
        generateImage(
          `course-${index}`,
          {
            prompt: course.imagePrompt,
            width: 400,
            height: 240,
          },
          course.fallbackCategory
        );
      }, index * 1000); // Délai de 1 seconde entre chaque génération
    });
  }, [generateImage, preloadFallbackImages]);

  return (
    <div className="min-h-screen bg-background">
      {/* Section Héros avec arrière-plan grille */}
      <section className="relative overflow-hidden grid-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                {t('home.hero.badge')}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                {t('home.hero.title', { future: t('home.hero.future') })}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="xl" 
                  icon={ArrowRight}
                  iconPosition="right"
                  className="animate-scale-in"
                >
                  {t('home.hero.startFree')}
                </Button>
                <Button 
                  variant="outline" 
                  size="xl"
                  icon={PlayCircle}
                  iconPosition="left"
                >
                  {t('home.hero.watchDemo')}
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative"
            >
              <div className="relative">
                <img 
                  src="/images/education_illustration.svg" 
                  alt="Apprentissage interactif" 
                  className="w-full h-auto max-w-lg mx-auto"
                />
                <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-semibold shadow-large">
                  {t('home.hero.freeBadge')}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section des Cours */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {t('home.courses.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.courses.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => {
                const imageResult = getImageResult(`course-${index}`);
                
                return (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="h-full flex flex-col bg-card border-0 shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer group overflow-hidden">
                      {/* Image générée ou fallback */}
                      <div className="relative h-48 overflow-hidden">
                        {imageResult.isLoading ? (
                          <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <img 
                            src={imageResult.imageUrl || `/images/${course.fallbackCategory}-fallback.svg`}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              // Fallback en cas d'erreur d'image
                              e.currentTarget.src = `/images/${course.fallbackCategory}-fallback.svg`;
                            }}
                          />
                        )}
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 dark:bg-black/90 text-primary text-xs font-medium rounded-full backdrop-blur-sm">
                            {course.badge}
                          </span>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-opacity-10 ${course.color.replace('text-', 'bg-')}`}>
                            <course.icon className={`w-5 h-5 ${course.color}`} />
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-warning">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{course.students} {t('home.courses.students')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section des Progrès */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('home.progress.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.progress.subtitle')}
              </p>
            </div>
            
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
              <Card className="bg-card border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="text-xl">Progression par matière</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={14} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={14} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderRadius: '0.75rem', 
                          border: '1px solid hsl(var(--border))',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          color: 'hsl(var(--card-foreground))'
                        }} 
                      />
                      <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section CTA Final */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl"
                icon={ArrowRight}
                iconPosition="right"
              >
                {t('home.cta.startToday')}
              </Button>
              <Button 
                variant="outline" 
                size="xl"
              >
                {t('home.cta.learnMore')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
