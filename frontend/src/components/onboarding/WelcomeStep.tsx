import React, { useState } from 'react';
import { ChevronRight, ArrowRight, Sparkles, Users, BookOpen, Target } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const welcomeSlides = [
    {
      title: "Bienvenue dans EduAI Enhanced",
      subtitle: "Votre assistant d'apprentissage intelligent",
      description: "Découvrez une nouvelle façon d'apprendre avec l'intelligence artificielle à vos côtés.",
      icon: <Sparkles className="w-16 h-16 text-blue-500" />,
      features: [
        "Apprentissage personnalisé adapté à votre rythme",
        "Assistant IA disponible 24h/24 pour répondre à vos questions",
        "Suivi de progression intelligent et recommandations"
      ]
    },
    {
      title: "Apprentissage Collaboratif",
      subtitle: "Apprenez ensemble, grandissez ensemble",
      description: "Rejoignez une communauté d'apprenants passionnés et partagez vos connaissances.",
      icon: <Users className="w-16 h-16 text-green-500" />,
      features: [
        "Discussions en temps réel avec d'autres étudiants",
        "Projets collaboratifs et défis d'équipe",
        "Mentorat peer-to-peer et support communautaire"
      ]
    },
    {
      title: "Ressources Illimitées",
      subtitle: "Accédez à un océan de connaissances",
      description: "Explorez notre vaste bibliothèque de cours, exercices et contenus interactifs.",
      icon: <BookOpen className="w-16 h-16 text-purple-500" />,
      features: [
        "Milliers de cours dans tous les domaines",
        "Exercices interactifs et quiz adaptatifs",
        "Contenus multimédias et simulations"
      ]
    },
    {
      title: "Objectifs Personnalisés",
      subtitle: "Définissez et atteignez vos buts d'apprentissage",
      description: "Créez un parcours sur mesure qui correspond à vos aspirations et objectifs.",
      icon: <Target className="w-16 h-16 text-orange-500" />,
      features: [
        "Planification d'objectifs SMART",
        "Suivi de progression en temps réel",
        "Recommandations personnalisées basées sur l'IA"
      ]
    }
  ];

  const nextSlide = () => {
    if (currentSlide < welcomeSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onNext();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = welcomeSlides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Étape 1 sur 4 - Bienvenue
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Slide Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Content */}
            <div className="flex-1 p-8 lg:p-12">
              <div className="text-center lg:text-left">
                {/* Icon */}
                <div className="flex justify-center lg:justify-start mb-6">
                  {currentSlideData.icon}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {currentSlideData.title}
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl text-gray-600 mb-6">
                  {currentSlideData.subtitle}
                </h2>

                {/* Description */}
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  {currentSlideData.description}
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {currentSlideData.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600 p-8 lg:p-12 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="mb-6">
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-6xl">
                      {currentSlide === 0 && '🚀'}
                      {currentSlide === 1 && '🤝'}
                      {currentSlide === 2 && '📚'}
                      {currentSlide === 3 && '🎯'}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {currentSlide === 0 && "Commencez votre voyage"}
                  {currentSlide === 1 && "Connectez-vous"}
                  {currentSlide === 2 && "Explorez et apprenez"}
                  {currentSlide === 3 && "Atteignez vos objectifs"}
                </h3>
                <p className="text-white text-opacity-90">
                  {currentSlide === 0 && "L'apprentissage intelligent vous attend"}
                  {currentSlide === 1 && "Avec une communauté bienveillante"}
                  {currentSlide === 2 && "Des ressources illimitées à portée de main"}
                  {currentSlide === 3 && "Votre succès est notre priorité"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex space-x-2">
                {welcomeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide 
                        ? 'bg-blue-500 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Passer l'introduction
                </button>

                {currentSlide > 0 && (
                  <button
                    onClick={prevSlide}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Précédent
                  </button>
                )}

                <button
                  onClick={nextSlide}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {currentSlide < welcomeSlides.length - 1 ? (
                    <>
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Commencer
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
