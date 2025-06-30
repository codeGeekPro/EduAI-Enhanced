import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Users, 
  Smartphone, 
  Award, 
  BarChart3,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Mic,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                EduAI Enhanced - Plateforme d'Apprentissage 
                <span className="text-yellow-300"> Adaptative par IA</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Transformez l'éducation avec notre micro-pédagogie personnalisée par IA. 
                Obtenez de vrais changements de comportement et des résultats mesurables.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Play className="mr-2 h-5 w-5" />
                  Démo Gratuite
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Link to="/register" className="flex items-center">
                    Commencer Gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Brain className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">IA Adaptive</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Mic className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Coach Vocal</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Micro-apprentissage</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Résultats Rapides</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Capacités Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EduAI Enhanced est une plateforme d'apprentissage native IA avec des évaluations multimodales, 
              des simulations réalistes et une mémoire contextuelle qui évolue avec chaque apprenant.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Personnalisation IA",
                description: "IA agentique qui s'adapte aux modèles d'apprentissage individuels et aux performances"
              },
              {
                icon: Mic,
                title: "Évaluations Multimodales",
                description: "Support pour les interactions texte, voix, image et vidéo"
              },
              {
                icon: Smartphone,
                title: "Applications Mobiles Natives",
                description: "Conception vraiment mobile-first avec capacités hors ligne"
              },
              {
                icon: Users,
                title: "Coaching Vocal",
                description: "Pratique de conversation réaliste et feedback IA"
              },
              {
                icon: BookOpen,
                title: "Simulations Interactives",
                description: "Environnements de pratique sécurisés pour les scénarios à enjeux élevés"
              },
              {
                icon: Award,
                title: "Renforcement Espacé",
                description: "Stratégies de rétention basées sur la science"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Pourquoi EduAI Enhanced?
              </h2>
              <div className="space-y-6">
                {[
                  "Amélioration de 70-90% de la rétention des connaissances",
                  "Taux d'engagement significativement plus élevés",
                  "Changement de comportement mesurable",
                  "Amélioration des performances au travail",
                  "Analytics détaillées sur l'efficacité de l'apprentissage"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <BarChart3 className="h-16 w-16 text-blue-600 mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Résultats Prouvés</h3>
              <p className="text-gray-600 mb-6">
                Les organisations voient typiquement des améliorations significatives 
                dans la rétention des connaissances, les taux d'engagement et les performances au travail.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">90%</div>
                  <div className="text-sm text-gray-600">Rétention</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">5x</div>
                  <div className="text-sm text-gray-600">Engagement</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">70%</div>
                  <div className="text-sm text-gray-600">Performance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie Dubois",
                role: "Directrice Formation, TechCorp",
                content: "EduAI Enhanced a révolutionné notre approche de la formation. Les résultats sont impressionnants.",
                rating: 5
              },
              {
                name: "Jean Martin",
                role: "Manager RH, InnovateCo",
                content: "L'IA adaptative permet vraiment de personnaliser l'apprentissage pour chaque employé.",
                rating: 5
              },
              {
                name: "Sophie Leroy",
                role: "Formatrice, EduGroupe",
                content: "Le coaching vocal et les simulations offrent une expérience d'apprentissage unique.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à transformer votre formation?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Rejoignez les organisations qui révolutionnent leur approche de l'apprentissage 
            avec EduAI Enhanced.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
              Demander une Démo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/register">
                Essai Gratuit 30 Jours
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/faq">
                FAQ
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
