import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Book, Target, TrendingUp, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Données de simulation améliorées
const featuredCourses = [
  { title: 'Mathématiques Interactives', icon: Book, description: 'Devenez un maître des chiffres grâce à des défis ludiques.', color: 'text-primary' },
  { title: 'Laboratoire de Sciences', icon: Target, description: 'Expérimentez la physique et la chimie comme jamais auparavant.', color: 'text-accent' },
  { title: 'Voyage à travers l\'histoire', icon: TrendingUp, description: 'Revivez les grands moments de l\'histoire à travers des récits captivants.', color: 'text-secondary' },
];

const progressData = [
  { name: 'Maths', progress: 75, fill: 'var(--color-primary)' },
  { name: 'Sciences', progress: 50, fill: 'var(--color-accent)' },
  { name: 'Histoire', progress: 85, fill: 'var(--color-secondary)' },
];

const HomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      {/* Section Héros */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
              L'éducation réinventée, <span className="text-primary">pour vous</span>.
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto lg:mx-0 mb-8">
              Plongez dans des leçons interactives, suivez vos progrès et libérez votre potentiel. Apprendre n'a jamais été aussi captivant.
            </p>
            <div className="flex justify-center lg:justify-start items-center space-x-4">
              <Button size="lg" variant="default">
                Commencer l'aventure <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <PlayCircle className="mr-2 h-5 w-5" /> Voir la démo
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <img src="/images/education_illustration.svg" alt="Apprentissage interactif" className="w-full h-auto" />
          </motion.div>
        </div>
      </section>

      {/* Section des Cours */}
      <section className="py-20 bg-card/50 dark:bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-center mb-12">Explorez nos mondes du savoir</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-full flex flex-col bg-background dark:bg-dark-bg shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer">
                    <CardHeader className="flex-row items-center space-x-4 p-6">
                      <course.icon className={`w-12 h-12 ${course.color}`} />
                      <CardTitle className="text-2xl">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 pt-0">
                      <p className="text-foreground/80">{course.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section des Progrès */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-center mb-12">Votre tableau de bord personnel</h2>
          <motion.div variants={itemVariants} className="w-full max-w-4xl mx-auto">
              <Card className="bg-white dark:bg-card shadow-lg rounded-lg">
                  <CardHeader>
                      <CardTitle>Progression Actuelle</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={progressData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false}/>
                          <YAxis stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                          <Tooltip 
                            cursor={{fill: 'rgba(var(--color-accent-rgb), 0.1)'}} 
                            contentStyle={{ 
                              backgroundColor: 'var(--background)', 
                              borderRadius: '0.5rem', 
                              border: '1px solid var(--color-accent)' 
                            }} 
                          />
                          <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
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
      </section>

      {/* Section CTA Final */}
      <section className="bg-primary/10 dark:bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-bold mb-4">Prêt à transformer votre avenir ?</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              Rejoignez des milliers d'apprenants et commencez votre voyage vers la connaissance dès aujourd'hui.
            </p>
            <Button size="lg">
              Inscrivez-vous gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
