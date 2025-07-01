import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Book, Target, TrendingUp, PlayCircle, Star, Users, Award, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Données de simulation améliorées inspirées de Kalvi
const featuredCourses = [
  { 
    title: 'Mathématiques Interactives', 
    icon: Book, 
    description: 'Maîtrisez les concepts mathématiques grâce à des exercices interactifs et des visualisations dynamiques.',
    students: '2,847',
    rating: 4.9,
    color: 'text-primary',
    badge: 'Populaire'
  },
  { 
    title: 'Laboratoire de Sciences', 
    icon: Target, 
    description: 'Explorez la physique et la chimie avec des expériences virtuelles immersives.',
    students: '1,923',
    rating: 4.8,
    color: 'text-success',
    badge: 'Nouveau'
  },
  { 
    title: 'Voyage dans l\'Histoire', 
    icon: TrendingUp, 
    description: 'Découvrez les civilisations et événements qui ont façonné notre monde.',
    students: '3,156',
    rating: 4.9,
    color: 'text-warning',
    badge: 'Tendance'
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
                Nouvelle expérience d'apprentissage
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                L'éducation du{' '}
                <span className="text-primary">futur</span>, aujourd'hui
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Transformez votre façon d'apprendre avec notre plateforme interactive. 
                Des cours personnalisés, des outils d'IA avancés et une communauté engagée.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="xl" 
                  icon={ArrowRight}
                  iconPosition="right"
                  className="animate-scale-in"
                >
                  Commencer gratuitement
                </Button>
                <Button 
                  variant="outline" 
                  size="xl"
                  icon={PlayCircle}
                  iconPosition="left"
                >
                  Voir la démo
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
                  🎯 100% Gratuit
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
                Découvrez nos cours
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Des expériences d'apprentissage conçues pour vous faire progresser, 
                quel que soit votre niveau de départ.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-full flex flex-col bg-card border-0 shadow-soft hover:shadow-large transition-all duration-300 cursor-pointer group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-opacity-10 ${course.color.replace('text-', 'bg-')}`}>
                            <course.icon className={`w-6 h-6 ${course.color}`} />
                          </div>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {course.badge}
                          </span>
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
                          <span>{course.students} étudiants</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
                Suivez vos progrès
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Visualisez vos performances et célébrez vos réussites avec notre tableau de bord interactif.
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
              Prêt à transformer votre avenir ?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Rejoignez plus de 12,000 apprenants qui font confiance à EduAI pour développer leurs compétences. 
              Commencez votre parcours d'apprentissage dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl"
                icon={ArrowRight}
                iconPosition="right"
              >
                Commencer maintenant
              </Button>
              <Button 
                variant="outline" 
                size="xl"
              >
                Découvrir les prix
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
