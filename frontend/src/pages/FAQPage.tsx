import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Search } from 'lucide-react';

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData = [
    {
      category: "Micro-apprentissage avec EduAI Enhanced",
      questions: [
        {
          question: "Qu'est-ce que la micro-pédagogie?",
          answer: "La micro-pédagogie est une stratégie d'apprentissage qui fournit de petits morceaux de contenu ciblés en rafales courtes (généralement 2-5 minutes). Elle est conçue pour s'intégrer dans le flux de travail, rendant l'apprentissage plus digeste et la rétention plus efficace. Cette approche s'aligne avec la façon dont le cerveau moderne préfère consommer l'information à notre ère numérique."
        },
        {
          question: "Qu'est-ce qu'EduAI Enhanced?",
          answer: "EduAI Enhanced est une plateforme d'apprentissage adaptative alimentée par l'IA qui fournit une formation personnalisée à travers du contenu en petites bouchées, un renforcement espacé et des parcours d'apprentissage adaptatifs. Elle est conçue pour les organisations d'entreprise pour améliorer la rétention des connaissances et le changement de comportement à travers des méthodes d'apprentissage scientifiquement étayées."
        },
        {
          question: "La micro-pédagogie consiste-t-elle simplement à diviser de longs cours en petits morceaux?",
          answer: "Non, la micro-pédagogie efficace ne consiste pas simplement à découper le contenu existant. Elle est spécialement conçue pour fournir des objectifs d'apprentissage spécifiques dans un format condensé en utilisant un contenu engageant et ciblé. Chaque module de micro-apprentissage devrait être autonome avec un résultat d'apprentissage clair tout en s'intégrant dans un parcours d'apprentissage plus large."
        },
        {
          question: "Que signifie \"micro-apprentissage adaptatif\"?",
          answer: "Le micro-apprentissage adaptatif signifie que le système de micro-apprentissage choisit le matériel d'apprentissage à présenter à chaque apprenant en examinant les activités passées de cet apprenant. L'application change et évolue à mesure que chaque apprenant individuel progresse, ou recule, dans sa compréhension de la matière ou dans l'acquisition de nouvelles compétences. Dans le micro-apprentissage adaptatif, aucun deux utilisateurs ne reçoivent exactement les mêmes questions, les mêmes modules d'apprentissage, ou le même feedback, parce qu'aucune deux personnes n'apprennent à la même vitesse ou de la même manière."
        }
      ]
    },
    {
      category: "Conception Mobile-First",
      questions: [
        {
          question: "Que signifie mobile-first?",
          answer: "Chez EduAI Enhanced, mobile-first a une signification précise. Nos applications ne sont pas des applications web responsives. Ce sont des applications natives écrites directement sur les OS iOS et Android. Nos applications iOS sont écrites 100% en Swift. Notre application Android est une implémentation native Java Android pure. Seules les applications natives peuvent utiliser toutes les capacités avancées de vos appareils mobiles."
        },
        {
          question: "EduAI Enhanced est-elle juste une application mobile?",
          answer: "Non, EduAI Enhanced est une plateforme d'apprentissage complète avec des composants mobiles et de bureau. Bien que nous ayons construit nos applications mobiles natives depuis le début (pas des wrappers web), nous offrons également une expérience web complète. Toutes les activités d'apprentissage se synchronisent de manière transparente entre les appareils, permettant aux utilisateurs de basculer entre mobile et bureau selon leur contexte."
        },
        {
          question: "Comment fonctionne l'apprentissage hors ligne?",
          answer: "Les applications mobiles d'EduAI Enhanced supportent la fonctionnalité hors ligne. Le contenu est téléchargé quand la connectivité est disponible et stocké de manière sécurisée sur l'appareil. Les apprenants peuvent compléter des activités, des évaluations et voir du contenu sans connexion internet. Quand la connectivité est restaurée, les données se synchronisent automatiquement avec la plateforme EduAI Enhanced."
        }
      ]
    },
    {
      category: "Renforcement de l'Entraînement",
      questions: [
        {
          question: "Qu'est-ce que le renforcement de l'entraînement?",
          answer: "Après avoir terminé un cours en classe ou en ligne, les gens commencent à oublier ce qu'ils ont appris. Rapidement. Il est beaucoup moins cher d'aider vos employés à retenir ce qu'ils ont appris que de leur enseigner à nouveau ou de les envoyer sur des cours de remise à niveau. Le renforcement de l'entraînement est la prévention de l'oubli."
        },
        {
          question: "Comment fonctionne le renforcement de l'entraînement?",
          answer: "Le renforcement de l'entraînement est basé sur les principes des sciences cognitives comme la répétition espacée et la pratique de récupération. EduAI Enhanced utilise l'IA pour programmer des interventions d'apprentissage à des intervalles optimaux après la formation initiale, incitant les apprenants à rappeler et appliquer l'information avant qu'ils l'oublient naturellement."
        },
        {
          question: "Pourquoi le renforcement est-il nécessaire après la formation?",
          answer: "La recherche montre que les gens oublient environ 70% de ce qu'ils apprennent dans les 24 heures et jusqu'à 90% dans une semaine sans renforcement. Les événements de formation traditionnels à usage unique, peu importe leur engagement, souffrent de cette 'courbe d'oubli'. Le renforcement systématique est essentiel pour la rétention des connaissances et le changement de comportement."
        }
      ]
    },
    {
      category: "Apprentissage Adaptatif avec IA",
      questions: [
        {
          question: "Comment l'IA personnalise-t-elle la formation?",
          answer: "L'IA agentique d'EduAI Enhanced personnalise l'apprentissage de multiples façons: identifier les lacunes de connaissances à travers des évaluations adaptatives, analyser les modèles d'apprentissage individuels pour fournir des formats de contenu préférés, recommander du contenu pertinent basé sur le rôle et les performances, créer des horaires de renforcement optimaux, et ajuster la difficulté basée sur la compétence."
        },
        {
          question: "L'IA nécessite-t-elle des données étendues pour être efficace?",
          answer: "Bien que l'IA d'EduAI Enhanced devienne plus puissante avec plus de données, elle fournit de la valeur dès le premier jour. Le système commence avec les meilleures pratiques des sciences cognitives et de la recherche en apprentissage, puis se personnalise progressivement en recueillant des données sur les modèles d'apprentissage individuels et organisationnels."
        },
        {
          question: "Qu'est-ce qui rend les capacités IA d'EduAI Enhanced uniques?",
          answer: "EduAI Enhanced est native IA, construite dès le départ avec l'intelligence artificielle à son cœur. Notre plateforme présente des évaluations multimodales (texte, voix, image, vidéo), des simulations IA réalistes, une mémoire contextuelle qui évolue avec chaque apprenant, et une intelligence multi-modèles qui orchestre différents systèmes IA pour une performance optimale."
        }
      ]
    },
    {
      category: "Expérience d'Apprentissage",
      questions: [
        {
          question: "Quels types de contenu et formats d'apprentissage EduAI Enhanced supporte-t-elle?",
          answer: "EduAI Enhanced supporte une large gamme de types de contenu—incluant des diapositives d'amorce, des simulations interactives, des scénarios de coaching vocal, l'apprentissage vidéo, des défis gamifiés, des cartes flash, des banques de questions, des évaluations ouvertes, et des quiz interactifs. Nos outils de création alimentés par l'IA permettent une création de contenu rapide sans sacrifier l'engagement ou l'efficacité d'apprentissage."
        },
        {
          question: "En quoi le coaching d'EduAI Enhanced diffère-t-il des méthodes de formation traditionnelles?",
          answer: "Le coaching IA d'EduAI Enhanced fournit un feedback personnalisé en temps réel à travers des scénarios vocaux et des simulations interactives. Contrairement à la formation traditionnelle universelle, notre IA s'adapte aux performances de chaque apprenant, fournissant des conseils contextuels et créant des environnements de pratique réalistes qui construisent la confiance et la compétence."
        },
        {
          question: "Comment fonctionne le coaching vocal d'EduAI Enhanced?",
          answer: "Le coaching vocal d'EduAI Enhanced utilise une IA avancée pour créer une pratique de conversation réaliste à travers des interactions vocales naturelles. Cela construit la confiance dans des scénarios du monde réel comme les appels de vente, le service client, ou les conversations de leadership. L'IA fournit un feedback nuancé sur le style de communication, le ton et le contenu."
        }
      ]
    }
  ];

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Questions Fréquemment Posées</h1>
          <p className="text-xl text-gray-600">
            Trouvez des réponses à toutes vos questions sur EduAI Enhanced
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {filteredFAQ.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {category.questions.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 1000 + itemIndex; // Unique index
                  const isExpanded = expandedItems.includes(globalIndex);
                  
                  return (
                    <div key={itemIndex}>
                      <button
                        onClick={() => toggleExpanded(globalIndex)}
                        className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {item.question}
                          </h3>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune question trouvée pour "{searchTerm}"</p>
            <p className="text-gray-400 mt-2">Essayez d'autres mots-clés ou parcourez toutes les catégories.</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vous n'avez pas trouvé votre réponse?
          </h2>
          <p className="text-gray-600 mb-6">
            Notre équipe de support est là pour vous aider. Contactez-nous et nous vous répondrons rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Nous contacter
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Centre d'aide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
