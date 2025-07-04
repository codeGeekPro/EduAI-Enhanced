import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useI18nStore } from '../stores/i18nStore';
import { 
  TrendingUp, 
  Trophy, 
  Clock, 
  Target, 
  Star,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const ProgressPage = () => {
  const { t } = useI18nStore();

  // Données de simulation pour les progrès (traduites dynamiquement)
  const monthlyProgress = [
    { name: t('progress.months.jan'), heures: 12, cours: 2 },
    { name: t('progress.months.feb'), heures: 19, cours: 3 },
    { name: t('progress.months.mar'), heures: 25, cours: 4 },
    { name: t('progress.months.apr'), heures: 32, cours: 5 },
    { name: t('progress.months.may'), heures: 28, cours: 4 },
    { name: t('progress.months.jun'), heures: 35, cours: 6 },
  ];

  const weeklyActivity = [
    { day: t('progress.days.mon'), minutes: 45 },
    { day: t('progress.days.tue'), minutes: 30 },
    { day: t('progress.days.wed'), minutes: 60 },
    { day: t('progress.days.thu'), minutes: 25 },
    { day: t('progress.days.fri'), minutes: 40 },
    { day: t('progress.days.sat'), minutes: 75 },
    { day: t('progress.days.sun'), minutes: 20 },
  ];

  const achievements = [
    {
      id: 1,
      title: t('progress.achievementTitles.firstCourse'),
      description: t('progress.achievementDescriptions.firstCourse'),
      icon: BookOpen,
      earned: true,
      date: '15 May 2025',
      color: 'text-success bg-success/10',
    },
    {
      id: 2,
      title: t('progress.achievementTitles.studious'),
      description: t('progress.achievementDescriptions.studious'),
      icon: Calendar,
      earned: true,
      date: '22 May 2025',
      color: 'text-primary bg-primary/10',
    },
    {
      id: 3,
      title: t('progress.achievementTitles.mathematician'),
      description: t('progress.achievementDescriptions.mathematician'),
      icon: Target,
      earned: true,
      date: '1 June 2025',
      color: 'text-warning bg-warning/10',
    },
    {
      id: 4,
      title: t('progress.achievementTitles.perfectionist'),
      description: t('progress.achievementDescriptions.perfectionist'),
      icon: Star,
      earned: false,
      date: null,
      color: 'text-muted-foreground bg-muted',
    },
    {
      id: 5,
      title: t('progress.achievementTitles.champion'),
      description: t('progress.achievementDescriptions.champion'),
      icon: Trophy,
      earned: false,
      date: null,
      color: 'text-muted-foreground bg-muted',
    },
  ];

  const stats = [
    { label: t('progress.totalHours'), value: '127h', icon: Clock, color: 'text-primary' },
    { label: t('progress.completedCourses'), value: '8', icon: BookOpen, color: 'text-success' },
    { label: t('progress.overallProgress'), value: '87%', icon: TrendingUp, color: 'text-warning' },
    { label: t('progress.certificates'), value: '3', icon: Trophy, color: 'text-accent' },
  ];

  const subjectProgress = [
    { name: t('courseData.mathematics.title'), progress: 85, color: 'hsl(var(--primary))' },
    { name: t('courseData.science.title'), progress: 72, color: 'hsl(var(--success))' },
    { name: t('courseData.programming.title'), progress: 91, color: 'hsl(var(--warning))' },
    { name: t('courseData.history.title'), progress: 68, color: 'hsl(var(--accent))' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Effect to set width and background color for subject progress bars
  React.useEffect(() => {
    const bars = document.querySelectorAll<HTMLElement>('.subject-progress-bar');
    bars.forEach(bar => {
      const progress = bar.getAttribute('data-progress');
      const color = bar.getAttribute('data-color');
      if (progress) bar.style.width = `${progress}%`;
      if (color) bar.style.backgroundColor = color;
    });
  }, []);

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
            {t('progress.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('progress.subtitle')}
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t('progress.monthlyProgress')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="heures" fill="hsl(var(--primary))" name={t('progress.hours')} />
                      <Bar dataKey="cours" fill="hsl(var(--success))" name={t('progress.courses')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-success" />
                  {t('progress.weeklyActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="hsl(var(--success))" 
                        fill="hsl(var(--success))" 
                        fillOpacity={0.3}
                        name={t('progress.minutes')}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subject Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <Card className="bg-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {t('progress.subjectProgress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectProgress.map((subject, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-sm font-bold">{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-1000 ease-out subject-progress-bar"
                        data-progress={subject.progress}
                        data-color={subject.color}
                        style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                {t('progress.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      achievement.earned 
                        ? 'border-success/20 bg-success/5 hover:bg-success/10' 
                        : 'border-muted bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${achievement.color}`}>
                        <achievement.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-success font-medium">
                            {t('progress.earnedOn')} {achievement.date}
                          </p>
                        )}
                        {!achievement.earned && (
                          <p className="text-xs text-muted-foreground">
                            {t('progress.notEarned')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;
