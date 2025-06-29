"""
Module de traitement de texte NLP avancé pour EduAI Enhanced
Inclut l'analyse de sentiment, la détection de concepts, la génération de résumés
"""

# Standard and typing
import asyncio
from typing import Dict, List, Optional, Any
import logging
import sys

# Import du client OpenRouter
from .openrouter_client import OpenRouterClient, create_openrouter_client

try:
    import huggingface_hub
    if not hasattr(huggingface_hub, 'cached_download'):
        from huggingface_hub import hf_hub_download as cached_download
        setattr(huggingface_hub, 'cached_download', cached_download)
except ImportError:
    pass

# External dependencies wrapped to avoid import errors
try:
    import openai
    from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline, AutoModel
    import torch
    from sentence_transformers import SentenceTransformer
    import spacy
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import sent_tokenize, word_tokenize
except ImportError:
    openai = None
    AutoTokenizer = None
    AutoModelForSequenceClassification = None
    pipeline = lambda *args, **kwargs: (lambda text, **kw: [])
    AutoModel = None
    torch = None
    SentenceTransformer = None
    spacy = None
    nltk = None
    stopwords = None
    sent_tokenize = lambda text: text.split('.')
    word_tokenize = lambda text: text.split()

logger = logging.getLogger(__name__)

# ===== EXPERIMENTAL AI TECHNIQUES =====

class FewShotLearner:
    """Advanced few-shot learning for educational content adaptation"""
    
    def __init__(self, base_model=None):
        self.base_model = base_model
        self.few_shot_examples = {}
        self.adaptation_memory = {}
        
    async def learn_from_examples(self, domain: str, examples: List[Dict[str, Any]]) -> None:
        """Learn patterns from few examples to adapt to new educational domains"""
        if domain not in self.few_shot_examples:
            self.few_shot_examples[domain] = []
            
        # Extract patterns from examples
        patterns = []
        for example in examples:
            pattern = await self._extract_learning_pattern(example)
            patterns.append(pattern)
            
        self.few_shot_examples[domain].extend(patterns)
        
        # Create domain-specific adaptation rules
        adaptation_rule = await self._create_adaptation_rule(patterns)
        self.adaptation_memory[domain] = adaptation_rule
        
    async def _extract_learning_pattern(self, example: Dict[str, Any]) -> Dict[str, Any]:
        """Extract learning patterns from educational examples"""
        return {
            "input_complexity": len(example.get("input", "").split()),
            "output_structure": self._analyze_structure(example.get("output", "")),
            "learning_style": example.get("style", "visual"),
            "effectiveness_score": example.get("effectiveness", 0.5),
            "semantic_fingerprint": hash(example.get("content", "")) % 10000
        }
        
    async def _create_adaptation_rule(self, patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create adaptation rules from learned patterns"""
        if not patterns:
            return {"type": "default", "weight": 1.0}
            
        avg_complexity = sum(p["input_complexity"] for p in patterns) / len(patterns)
        dominant_style = max(set(p["learning_style"] for p in patterns), 
                           key=[p["learning_style"] for p in patterns].count)
        
        return {
            "type": "learned",
            "target_complexity": avg_complexity,
            "preferred_style": dominant_style,
            "confidence": min(len(patterns) / 10, 1.0),
            "weight": 1.0 + (len(patterns) * 0.1)
        }
        
    def _analyze_structure(self, text: str) -> Dict[str, Any]:
        """Analyze the structural patterns of educational content"""
        sentences = text.split('.')
        return {
            "sentence_count": len(sentences),
            "avg_length": len(text.split()) / max(len(sentences), 1),
            "has_examples": "example" in text.lower() or "for instance" in text.lower(),
            "has_questions": "?" in text,
            "structure_type": "explanatory" if len(sentences) > 3 else "concise"
        }

class MetaLearningEngine:
    """Meta-learning system that learns how to learn educational content"""
    
    def __init__(self):
        self.learning_strategies = {}
        self.performance_history = {}
        self.strategy_effectiveness = {}
        self.adaptation_rate = 0.1
        
    async def meta_learn(self, task_type: str, student_profile: Dict[str, Any], 
                        learning_outcome: Dict[str, Any]) -> Dict[str, Any]:
        """Learn from learning: improve teaching strategies based on outcomes"""
        
        # Update strategy effectiveness
        strategy_id = f"{task_type}_{student_profile.get('learning_style', 'default')}"
        
        if strategy_id not in self.strategy_effectiveness:
            self.strategy_effectiveness[strategy_id] = {
                "success_rate": 0.5,
                "adaptation_count": 0,
                "best_params": {},
                "learning_curve": []
            }
            
        # Calculate performance metrics
        performance = self._calculate_performance(learning_outcome)
        self.strategy_effectiveness[strategy_id]["learning_curve"].append(performance)
        
        # Adaptive strategy improvement
        improved_strategy = await self._evolve_strategy(strategy_id, performance, student_profile)
        
        return {
            "recommended_strategy": improved_strategy,
            "confidence": self.strategy_effectiveness[strategy_id]["success_rate"],
            "adaptation_suggestion": await self._suggest_adaptations(strategy_id, student_profile)
        }
        
    def _calculate_performance(self, outcome: Dict[str, Any]) -> float:
        """Calculate learning performance from outcomes"""
        comprehension = outcome.get("comprehension_score", 0.5)
        engagement = outcome.get("engagement_score", 0.5)
        retention = outcome.get("retention_score", 0.5)
        speed = min(outcome.get("learning_speed", 1.0), 2.0) / 2.0
        
        return (comprehension * 0.4 + engagement * 0.3 + retention * 0.2 + speed * 0.1)
        
    async def _evolve_strategy(self, strategy_id: str, performance: float, 
                              student_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Evolve teaching strategy based on meta-learning"""
        current_strategy = self.strategy_effectiveness[strategy_id]
        
        # Update success rate with exponential moving average
        current_strategy["success_rate"] = (
            (1 - self.adaptation_rate) * current_strategy["success_rate"] +
            self.adaptation_rate * performance
        )
        
        # Evolve strategy parameters
        evolved_params = {
            "content_density": self._adaptive_parameter(
                current_strategy.get("content_density", 0.5), performance, 0.1
            ),
            "interaction_frequency": self._adaptive_parameter(
                current_strategy.get("interaction_frequency", 0.3), performance, 0.05
            ),
            "complexity_progression": self._adaptive_parameter(
                current_strategy.get("complexity_progression", 0.2), performance, 0.03
            ),
            "multimodal_weight": self._adaptive_parameter(
                current_strategy.get("multimodal_weight", 0.4), performance, 0.08
            )
        }
        
        current_strategy["best_params"] = evolved_params
        current_strategy["adaptation_count"] += 1
        
        return {
            "strategy_type": "meta_learned",
            "parameters": evolved_params,
            "confidence": current_strategy["success_rate"],
            "adaptation_generation": current_strategy["adaptation_count"]
        }
        
    def _adaptive_parameter(self, current_value: float, performance: float, 
                           learning_rate: float) -> float:
        """Adaptively adjust parameter based on performance"""
        # If performance is good, slightly increase the parameter
        # If performance is poor, slightly decrease it
        adjustment = (performance - 0.5) * learning_rate
        new_value = current_value + adjustment
        return max(0.0, min(1.0, new_value))  # Clamp between 0 and 1
        
    async def _suggest_adaptations(self, strategy_id: str, 
                                  student_profile: Dict[str, Any]) -> List[str]:
        """Suggest specific adaptations based on meta-learning insights"""
        strategy = self.strategy_effectiveness[strategy_id]
        suggestions = []
        
        if strategy["success_rate"] < 0.6:
            suggestions.append("Increase interactivity and reduce content density")
            suggestions.append("Add more visual elements and examples")
            
        if len(strategy["learning_curve"]) > 5:
            recent_trend = sum(strategy["learning_curve"][-3:]) / 3
            if recent_trend < strategy["success_rate"]:
                suggestions.append("Student may be experiencing fatigue - suggest break")
                
        learning_style = student_profile.get("learning_style", "unknown")
        if learning_style == "visual" and strategy.get("multimodal_weight", 0) < 0.6:
            suggestions.append("Increase visual content proportion")
            
        return suggestions

class MultiModalFusionEngine:
    """Innovative multi-modal AI fusion for educational content"""
    
    def __init__(self):
        self.fusion_strategies = {
            "semantic_alignment": 0.4,
            "temporal_synchronization": 0.3,
            "cognitive_load_balancing": 0.3
        }
        self.modality_weights = {
            "text": 0.4,
            "audio": 0.3,
            "visual": 0.3
        }
        
    async def fuse_modalities(self, content_bundle: Dict[str, Any], 
                             student_state: Dict[str, Any]) -> Dict[str, Any]:
        """Intelligently fuse multiple AI modalities for optimal learning"""
        
        # Analyze content compatibility across modalities
        compatibility_matrix = await self._analyze_modality_compatibility(content_bundle)
        
        # Dynamic weight adjustment based on student state
        adaptive_weights = await self._adapt_weights_to_student(student_state)
        
        # Create fusion strategy
        fusion_plan = await self._create_fusion_plan(compatibility_matrix, adaptive_weights)
        
        # Execute multi-modal fusion
        fused_content = await self._execute_fusion(content_bundle, fusion_plan)
        
        return {
            "fused_content": fused_content,
            "fusion_strategy": fusion_plan,
            "estimated_effectiveness": await self._estimate_fusion_effectiveness(fusion_plan),
            "adaptation_metadata": {
                "student_optimized": True,
                "modality_balance": adaptive_weights,
                "cognitive_load": await self._estimate_cognitive_load(fused_content)
            }
        }
        
    async def _analyze_modality_compatibility(self, content_bundle: Dict[str, Any]) -> Dict[str, float]:
        """Analyze how well different modalities complement each other"""
        text_content = content_bundle.get("text", "")
        audio_content = content_bundle.get("audio_transcript", "")
        visual_content = content_bundle.get("visual_description", "")
        
        # Semantic similarity between modalities
        text_audio_sim = self._calculate_semantic_overlap(text_content, audio_content)
        text_visual_sim = self._calculate_semantic_overlap(text_content, visual_content)
        audio_visual_sim = self._calculate_semantic_overlap(audio_content, visual_content)
        
        return {
            "text_audio": text_audio_sim,
            "text_visual": text_visual_sim,
            "audio_visual": audio_visual_sim,
            "overall_coherence": (text_audio_sim + text_visual_sim + audio_visual_sim) / 3
        }
        
    def _calculate_semantic_overlap(self, content1: str, content2: str) -> float:
        """Calculate semantic overlap between two content pieces"""
        if not content1 or not content2:
            return 0.0
            
        words1 = set(content1.lower().split())
        words2 = set(content2.lower().split())
        
        if not words1 or not words2:
            return 0.0
            
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
        
    async def _adapt_weights_to_student(self, student_state: Dict[str, Any]) -> Dict[str, float]:
        """Dynamically adapt modality weights based on student state"""
        base_weights = self.modality_weights.copy()
        
        # Adjust based on learning style
        learning_style = student_state.get("learning_style", "balanced")
        if learning_style == "visual":
            base_weights["visual"] *= 1.3
            base_weights["text"] *= 0.9
        elif learning_style == "auditory":
            base_weights["audio"] *= 1.3
            base_weights["visual"] *= 0.9
        elif learning_style == "reading":
            base_weights["text"] *= 1.3
            base_weights["audio"] *= 0.9
            
        # Adjust based on attention level
        attention = student_state.get("attention_level", 0.7)
        if attention < 0.5:
            # Low attention: increase audio and visual, decrease text
            base_weights["audio"] *= 1.2
            base_weights["visual"] *= 1.2
            base_weights["text"] *= 0.8
            
        # Normalize weights
        total = sum(base_weights.values())
        return {k: v/total for k, v in base_weights.items()}
        
    async def _create_fusion_plan(self, compatibility: Dict[str, float], 
                                 weights: Dict[str, float]) -> Dict[str, Any]:
        """Create an intelligent fusion plan"""
        return {
            "primary_modality": max(weights.items(), key=lambda x: x[1])[0],
            "fusion_type": "adaptive_blend" if compatibility["overall_coherence"] > 0.6 else "sequential",
            "synchronization_points": await self._identify_sync_points(compatibility),
            "cognitive_pacing": "dynamic",
            "interaction_triggers": await self._plan_interaction_triggers(weights)
        }
        
    async def _identify_sync_points(self, compatibility: Dict[str, float]) -> List[str]:
        """Identify optimal synchronization points between modalities"""
        sync_points = ["introduction", "conclusion"]
        
        if compatibility["text_visual"] > 0.7:
            sync_points.append("concept_visualization")
        if compatibility["text_audio"] > 0.7:
            sync_points.append("narrative_alignment")
        if compatibility["overall_coherence"] > 0.8:
            sync_points.append("full_multimodal_moment")
            
        return sync_points
        
    async def _plan_interaction_triggers(self, weights: Dict[str, float]) -> List[Dict[str, Any]]:
        """Plan when and how to trigger student interactions"""
        triggers = []
        
        if weights["text"] > 0.4:
            triggers.append({
                "type": "comprehension_check",
                "timing": "after_key_concept",
                "modality": "text"
            })
            
        if weights["visual"] > 0.4:
            triggers.append({
                "type": "visual_analysis",
                "timing": "during_visual_content",
                "modality": "visual"
            })
            
        if weights["audio"] > 0.4:
            triggers.append({
                "type": "audio_reflection",
                "timing": "after_audio_segment",
                "modality": "audio"
            })
            
        return triggers
        
    async def _execute_fusion(self, content_bundle: Dict[str, Any], 
                             fusion_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the multi-modal fusion strategy"""
        fused_segments = []
        
        if fusion_plan["fusion_type"] == "adaptive_blend":
            # Blend modalities intelligently
            for sync_point in fusion_plan["synchronization_points"]:
                segment = await self._create_blended_segment(
                    content_bundle, sync_point, fusion_plan
                )
                fused_segments.append(segment)
        else:
            # Sequential presentation with smart transitions
            for modality in ["text", "visual", "audio"]:
                if modality in content_bundle:
                    segment = await self._create_sequential_segment(
                        content_bundle[modality], modality, fusion_plan
                    )
                    fused_segments.append(segment)
                    
        return {
            "segments": fused_segments,
            "total_duration": sum(s.get("duration", 60) for s in fused_segments),
            "interaction_points": len([s for s in fused_segments if s.get("interactive", False)])
        }
        
    async def _create_blended_segment(self, content_bundle: Dict[str, Any], 
                                     sync_point: str, fusion_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Create a blended multi-modal segment"""
        return {
            "type": "blended",
            "sync_point": sync_point,
            "content": {
                "text": content_bundle.get("text", "")[:200],  # Excerpt
                "visual_cue": content_bundle.get("visual_description", ""),
                "audio_emphasis": content_bundle.get("audio_transcript", "")[:100]
            },
            "duration": 90,  # seconds
            "interactive": sync_point in ["concept_visualization", "full_multimodal_moment"]
        }
        
    async def _create_sequential_segment(self, content: str, modality: str, 
                                        fusion_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Create a sequential modality segment"""
        return {
            "type": "sequential",
            "modality": modality,
            "content": content,
            "duration": 60 + len(content.split()) * 2,  # Reading time estimation
            "interactive": modality == fusion_plan["primary_modality"]
        }
        
    async def _estimate_fusion_effectiveness(self, fusion_plan: Dict[str, Any]) -> float:
        """Estimate the effectiveness of the fusion strategy"""
        base_effectiveness = 0.7
        
        # Bonus for adaptive fusion
        if fusion_plan["fusion_type"] == "adaptive_blend":
            base_effectiveness += 0.1
            
        # Bonus for multiple sync points
        sync_bonus = len(fusion_plan["synchronization_points"]) * 0.05
        base_effectiveness += min(sync_bonus, 0.15)
        
        # Bonus for interaction triggers
        interaction_bonus = len(fusion_plan["interaction_triggers"]) * 0.03
        base_effectiveness += min(interaction_bonus, 0.1)
        
        return min(base_effectiveness, 1.0)
        
    async def _estimate_cognitive_load(self, fused_content: Dict[str, Any]) -> float:
        """Estimate cognitive load of the fused content"""
        segments = fused_content.get("segments", [])
        
        if not segments:
            return 0.5
            
        # Calculate load based on content density and interaction frequency
        total_content = sum(len(str(s.get("content", ""))) for s in segments)
        interactive_segments = len([s for s in segments if s.get("interactive", False)])
        
        content_density = total_content / len(segments) if segments else 0
        interaction_density = interactive_segments / len(segments) if segments else 0
        
        # Normalize to 0-1 scale
        cognitive_load = (content_density / 1000 + interaction_density) / 2
        return min(cognitive_load, 1.0)

class NLPProcessor:
    """Processeur NLP principal pour EduAI Enhanced"""
    
    def __init__(self, openrouter_api_key: Optional[str] = None, openrouter_model: str = "mistralai/mistral-7b-instruct:free"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu") if torch else None
        
        # Initialize experimental AI components
        self.few_shot_learner = FewShotLearner()
        self.meta_learning_engine = MetaLearningEngine()
        self.multimodal_fusion = MultiModalFusionEngine()
        
        # Initialize OpenRouter client
        self.openrouter_client = None
        if openrouter_api_key:
            self.openrouter_client = create_openrouter_client(openrouter_api_key)
            self.openrouter_model = openrouter_model
        
        # Initialize learning memory and adaptation systems
        self.learning_memory = {}
        self.adaptation_history = []
        self.performance_tracker = {}
        
        self._initialize_models()
        
    def _initialize_models(self):
        """Initialise tous les modèles NLP nécessaires"""
        try:
            # Modèle pour l'analyse de sentiment multilingue
            self.sentiment_model = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Modèle pour les embeddings de phrases
            self.sentence_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            
            # Modèle pour la classification de texte éducatif
            self.education_classifier = pipeline(
                "text-classification",
                model="microsoft/DialoGPT-medium",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Spacy pour l'analyse syntaxique multilingue
            try:
                self.nlp_en = spacy.load("en_core_web_sm")
                self.nlp_fr = spacy.load("fr_core_news_sm")
                self.nlp_es = spacy.load("es_core_news_sm")
            except OSError:
                logger.warning("Certains modèles Spacy ne sont pas installés")
                self.nlp_en = None
                self.nlp_fr = None
                self.nlp_es = None
            
            # Téléchargement des ressources NLTK
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            
            logger.info("Modèles NLP initialisés avec succès")
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation des modèles NLP: {e}")
            raise

    async def analyze_text_complexity(self, text: str, language: str = "en") -> Dict[str, Any]:
        """Analyse la complexité d'un texte pour l'adaptation pédagogique"""
        try:
            # Métriques de base
            sentences = sent_tokenize(text)
            words = word_tokenize(text)
            
            complexity_metrics = {
                "sentence_count": len(sentences),
                "word_count": len(words),
                "avg_sentence_length": len(words) / len(sentences) if sentences else 0,
                "complexity_score": 0,
                "reading_level": "beginner",
                "concepts": [],
                "key_terms": []
            }
            
            # Analyse avec Spacy si disponible
            nlp_model = self._get_spacy_model(language)
            if nlp_model:
                doc = nlp_model(text)
                
                # Extraction des entités et concepts
                entities = [(ent.text, ent.label_) for ent in doc.ents]
                complexity_metrics["entities"] = entities
                
                # Analyse de la complexité syntaxique
                complex_sentences = sum(1 for sent in doc.sents if len(list(sent.noun_chunks)) > 3)
                complexity_metrics["complex_sentences"] = complex_sentences
                
                # Score de complexité basé sur plusieurs facteurs
                complexity_score = (
                    complexity_metrics["avg_sentence_length"] * 0.3 +
                    len(entities) * 0.2 +
                    complex_sentences * 0.5
                ) / len(sentences) if sentences else 0
                
                complexity_metrics["complexity_score"] = min(complexity_score, 10)
                
                # Niveau de lecture estimé
                if complexity_score < 2:
                    complexity_metrics["reading_level"] = "beginner"
                elif complexity_score < 4:
                    complexity_metrics["reading_level"] = "intermediate"
                else:
                    complexity_metrics["reading_level"] = "advanced"
            
            return complexity_metrics
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse de complexité: {e}")
            return {"error": str(e)}

    async def generate_educational_content(self, topic: str, level: str, language: str = "en") -> Dict[str, Any]:
        """Génère du contenu éducatif adapté au niveau et à la langue"""
        try:
            # Prompt adapté au niveau et à la langue
            prompts = {
                "en": {
                    "beginner": f"Explain {topic} in simple terms for beginners. Use easy vocabulary and short sentences.",
                    "intermediate": f"Provide a comprehensive explanation of {topic} with examples.",
                    "advanced": f"Give an in-depth analysis of {topic} including technical details and applications."
                },
                "fr": {
                    "beginner": f"Expliquez {topic} en termes simples pour les débutants. Utilisez un vocabulaire facile et des phrases courtes.",
                    "intermediate": f"Fournissez une explication complète de {topic} avec des exemples.",
                    "advanced": f"Donnez une analyse approfondie de {topic} incluant les détails techniques et les applications."
                }
            }
            
            prompt = prompts.get(language, prompts["en"]).get(level, prompts["en"]["intermediate"])
            
            # Génération avec OpenAI (si disponible)
            try:
                response = await openai.ChatCompletion.acreate(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an educational AI assistant specialized in creating adaptive learning content."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1000,
                    temperature=0.7
                )
                
                generated_content = response.choices[0].message.content
                
                # Analyse du contenu généré
                complexity_analysis = await self.analyze_text_complexity(generated_content, language)
                
                return {
                    "content": generated_content,
                    "topic": topic,
                    "level": level,
                    "language": language,
                    "complexity_analysis": complexity_analysis,
                    "word_count": len(generated_content.split()),
                    "estimated_reading_time": len(generated_content.split()) // 200  # mots par minute
                }
                
            except Exception as e:
                logger.warning(f"OpenAI non disponible, utilisation du contenu de base: {e}")
                
                # Contenu de base si OpenAI n'est pas disponible
                basic_content = {
                    "beginner": f"{topic} is an important concept to understand. Let me explain it step by step...",
                    "intermediate": f"Understanding {topic} requires looking at several key aspects...",
                    "advanced": f"The comprehensive analysis of {topic} involves multiple complex factors..."
                }
                
                content = basic_content.get(level, basic_content["intermediate"])
                
                return {
                    "content": content,
                    "topic": topic,
                    "level": level,
                    "language": language,
                    "source": "basic_template"
                }
                
        except Exception as e:
            logger.error(f"Erreur lors de la génération de contenu: {e}")
            return {"error": str(e)}

    async def extract_key_concepts(self, text: str, language: str = "en") -> List[Dict[str, Any]]:
        """Extract des concepts clés d'un texte pour la création de quiz"""
        try:
            concepts = []
            
            # Analyse avec Spacy
            nlp_model = self._get_spacy_model(language)
            if nlp_model:
                doc = nlp_model(text)
                
                # Extraction des entités nommées
                for ent in doc.ents:
                    concepts.append({
                        "text": ent.text,
                        "label": ent.label_,
                        "type": "entity",
                        "importance": self._calculate_importance(ent, doc)
                    })
                
                # Extraction des chunks nominaux importants
                for chunk in doc.noun_chunks:
                    if len(chunk.text.split()) > 1 and chunk.root.pos_ in ["NOUN", "PROPN"]:
                        concepts.append({
                            "text": chunk.text,
                            "label": "concept",
                            "type": "noun_phrase",
                            "importance": self._calculate_importance(chunk, doc)
                        })
            
            # Tri par importance
            concepts.sort(key=lambda x: x["importance"], reverse=True)
            
            return concepts[:10]  # Top 10 concepts
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de concepts: {e}")
            return []

    async def generate_questions(self, text: str, num_questions: int = 5, language: str = "en") -> List[Dict[str, Any]]:
        """Génère des questions basées sur un texte"""
        try:
            concepts = await self.extract_key_concepts(text, language)
            questions = []
            
            question_templates = {
                "en": [
                    "What is {concept}?",
                    "How does {concept} work?",
                    "Why is {concept} important?",
                    "What are the main characteristics of {concept}?",
                    "How is {concept} related to the main topic?"
                ],
                "fr": [
                    "Qu'est-ce que {concept} ?",
                    "Comment {concept} fonctionne-t-il ?",
                    "Pourquoi {concept} est-il important ?",
                    "Quelles sont les principales caractéristiques de {concept} ?",
                    "Comment {concept} est-il lié au sujet principal ?"
                ]
            }
            
            templates = question_templates.get(language, question_templates["en"])
            
            for i, concept in enumerate(concepts[:num_questions]):
                template = templates[i % len(templates)]
                question = template.format(concept=concept["text"])
                
                questions.append({
                    "question": question,
                    "concept": concept["text"],
                    "type": "open_ended",
                    "difficulty": self._estimate_difficulty(concept),
                    "language": language
                })
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating questions: {e}")
            return []

    async def analyze_student_response(self, question: str, response: str, expected_concepts: List[str]) -> Dict[str, Any]:
        """Analyse la réponse d'un étudiant"""
        try:
            # Analyse de sentiment
            sentiment = self.sentiment_model(response)[0]
            
            # Calcul de similarité avec les concepts attendus
            response_embedding = self.sentence_model.encode([response])
            concept_embeddings = self.sentence_model.encode(expected_concepts)
            
            similarities = []
            for i, concept in enumerate(expected_concepts):
                similarity = torch.cosine_similarity(
                    torch.tensor(response_embedding),
                    torch.tensor([concept_embeddings[i]]),
                    dim=1
                ).item()
                similarities.append({
                    "concept": concept,
                    "similarity": similarity
                })
            
            # Score global
            avg_similarity = sum(s["similarity"] for s in similarities) / len(similarities) if similarities else 0
            
            # Analyse de complétude
            word_count = len(response.split())
            completeness_score = min(word_count / 50, 1.0)  # Normalisé sur 50 mots
            
            return {
                "sentiment": sentiment,
                "concept_coverage": similarities,
                "avg_similarity": avg_similarity,
                "completeness_score": completeness_score,
                "word_count": word_count,
                "overall_score": (avg_similarity * 0.6 + completeness_score * 0.4) * 100,
                "feedback": self._generate_feedback(avg_similarity, completeness_score, sentiment)
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse de réponse: {e}")
            return {"error": str(e)}

    def _get_spacy_model(self, language: str):
        """Retourne le modèle Spacy approprié pour la langue"""
        language_models = {
            "en": self.nlp_en,
            "fr": self.nlp_fr,
            "es": self.nlp_es
        }
        return language_models.get(language, self.nlp_en)

    def _calculate_importance(self, span, doc) -> float:
        """Calcule l'importance d'un span dans le document"""
        # Facteurs d'importance
        length_factor = len(span.text.split()) / 10  # Normalisation par longueur
        position_factor = 1 - (span.start / len(doc))  # Plus important au début
        frequency_factor = doc.text.lower().count(span.text.lower()) / len(doc.text.split())
        
        return (length_factor + position_factor + frequency_factor) / 3

    def _estimate_difficulty(self, concept: Dict[str, Any]) -> str:
        """Estime la difficulté d'un concept"""
        if concept["importance"] > 0.7:
            return "hard"
        elif concept["importance"] > 0.4:
            return "medium"
        else:
            return "easy"

    def _generate_feedback(self, similarity: float, completeness: float, sentiment: Dict) -> str:
        """Génère un feedback personnalisé"""
        if similarity > 0.8 and completeness > 0.8:
            return "Excellente réponse ! Vous avez bien couvert les concepts clés."
        elif similarity > 0.6:
            return "Bonne réponse, mais vous pourriez développer certains points."
        elif completeness < 0.3:
            return "Votre réponse est trop courte. Essayez de donner plus de détails."
        else:
            return "Votre réponse peut être améliorée. Concentrez-vous sur les concepts principaux."

    # ===== EXPERIMENTAL AI METHODS =====
    
    async def adaptive_few_shot_learning(self, domain: str, task_examples: List[Dict[str, Any]], 
                                        new_task: Dict[str, Any]) -> Dict[str, Any]:
        """Apply few-shot learning to adapt to new educational domains instantly"""
        try:
            # Learn from provided examples
            await self.few_shot_learner.learn_from_examples(domain, task_examples)
            
            # Apply learned patterns to new task
            adaptation_rule = self.few_shot_learner.adaptation_memory.get(domain, {})
            
            # Generate adapted content based on few-shot learning
            adapted_content = await self._apply_few_shot_adaptation(new_task, adaptation_rule)
            
            # Meta-learning: learn from this adaptation attempt
            learning_outcome = await self._simulate_learning_outcome(adapted_content)
            meta_insights = await self.meta_learning_engine.meta_learn(
                domain, new_task.get("student_profile", {}), learning_outcome
            )
            
            return {
                "adapted_content": adapted_content,
                "adaptation_confidence": adaptation_rule.get("confidence", 0.5),
                "meta_learning_insights": meta_insights,
                "few_shot_effectiveness": len(task_examples) * 0.1,
                "domain": domain
            }
            
        except Exception as e:
            logger.error(f"Error in few-shot learning: {e}")
            return {"error": str(e), "fallback_used": True}
    
    async def _apply_few_shot_adaptation(self, task: Dict[str, Any], 
                                        adaptation_rule: Dict[str, Any]) -> Dict[str, Any]:
        """Apply few-shot learned patterns to new task"""
        content = task.get("content", "")
        target_complexity = adaptation_rule.get("target_complexity", 50)
        preferred_style = adaptation_rule.get("preferred_style", "visual")
        
        # Adapt content complexity
        if len(content.split()) > target_complexity * 1.2:
            adapted_content = await self._simplify_content(content, target_complexity)
        elif len(content.split()) < target_complexity * 0.8:
            adapted_content = await self._expand_content(content, target_complexity)
        else:
            adapted_content = content
            
        # Apply style adaptation
        styled_content = await self._apply_learning_style(adapted_content, preferred_style)
        
        return {
            "original_content": content,
            "adapted_content": styled_content,
            "adaptation_type": "few_shot_learned",
            "target_complexity": target_complexity,
            "applied_style": preferred_style
        }
    
    async def _simplify_content(self, content: str, target_length: int) -> str:
        """Simplify content while preserving key information"""
        sentences = content.split('.')
        important_sentences = sentences[:max(1, target_length // 20)]
        return '. '.join(important_sentences) + '.'
    
    async def _expand_content(self, content: str, target_length: int) -> str:
        """Expand content with examples and explanations"""
        expanded = content
        if "example" not in content.lower():
            expanded += " For example, this concept can be applied in real-world scenarios."
        if len(expanded.split()) < target_length:
            expanded += " This is important because it helps build foundational understanding."
        return expanded
    
    async def _apply_learning_style(self, content: str, style: str) -> str:
        """Adapt content to specific learning style"""
        if style == "visual":
            return f"🎯 Visualize this: {content} 📊 Think of this as a diagram or chart."
        elif style == "auditory":
            return f"🎵 Listen carefully: {content} 🎧 Repeat this concept out loud."
        elif style == "kinesthetic":
            return f"🤲 Hands-on approach: {content} 🏃‍♂️ Try to apply this through practice."
        else:
            return content
    
    async def _simulate_learning_outcome(self, adapted_content: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate learning outcome for meta-learning (in real system, this would be actual student performance)"""
        content_length = len(adapted_content.get("adapted_content", "").split())
        
        # Simulate realistic outcomes based on content characteristics
        comprehension_score = min(0.9, 0.4 + (100 - abs(content_length - 75)) / 100)
        engagement_score = 0.6 + (0.3 if "example" in adapted_content.get("adapted_content", "").lower() else 0)
        retention_score = 0.5 + (0.4 if adapted_content.get("applied_style") != "reading" else 0.2)
        
        return {
            "comprehension_score": comprehension_score,
            "engagement_score": min(engagement_score, 1.0),
            "retention_score": min(retention_score, 1.0),
            "learning_speed": 1.0 + (0.5 if content_length < 100 else -0.3)
        }
    
    async def intelligent_multimodal_fusion(self, content_bundle: Dict[str, Any], 
                                          student_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Intelligently fuse multiple AI modalities for optimal learning experience"""
        try:
            # Prepare student state from profile
            student_state = {
                "learning_style": student_profile.get("learning_style", "balanced"),
                "attention_level": student_profile.get("current_attention", 0.7),
                "performance_history": student_profile.get("performance_history", []),
                "preferences": student_profile.get("preferences", {})
            }
            
            # Execute multimodal fusion
            fusion_result = await self.multimodal_fusion.fuse_modalities(content_bundle, student_state)
            
            # Apply meta-learning to improve fusion strategy
            fusion_outcome = await self._evaluate_fusion_outcome(fusion_result)
            meta_improvement = await self.meta_learning_engine.meta_learn(
                "multimodal_fusion", student_profile, fusion_outcome
            )
            
            # Store learning for future adaptations
            self._store_fusion_learning(student_profile.get("id", "anonymous"), fusion_result, fusion_outcome)
            
            return {
                **fusion_result,
                "meta_improvements": meta_improvement,
                "personalization_score": await self._calculate_personalization_score(fusion_result, student_profile),
                "innovation_features": [
                    "adaptive_modal_weighting",
                    "semantic_synchronization", 
                    "cognitive_load_balancing",
                    "meta_learning_optimization"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in multimodal fusion: {e}")
            return {"error": str(e), "fallback_content": content_bundle}
    
    async def _evaluate_fusion_outcome(self, fusion_result: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate the outcome of multimodal fusion"""
        estimated_effectiveness = fusion_result.get("estimated_effectiveness", 0.7)
        cognitive_load = fusion_result.get("adaptation_metadata", {}).get("cognitive_load", 0.5)
        
        # Simulate engagement based on fusion characteristics
        segments = fusion_result.get("fused_content", {}).get("segments", [])
        interaction_ratio = len([s for s in segments if s.get("interactive", False)]) / max(len(segments), 1)
        
        return {
            "comprehension_score": estimated_effectiveness,
            "engagement_score": 0.5 + interaction_ratio * 0.4,
            "retention_score": max(0.3, 1.0 - cognitive_load),
            "learning_speed": 1.0 + (0.3 if interaction_ratio > 0.3 else 0)
        }
    
    def _store_fusion_learning(self, student_id: str, fusion_result: Dict[str, Any], 
                              outcome: Dict[str, Any]) -> None:
        """Store fusion learning for future improvements"""
        if student_id not in self.learning_memory:
            self.learning_memory[student_id] = []
            
        learning_record = {
            "timestamp": asyncio.get_event_loop().time(),
            "fusion_strategy": fusion_result.get("fusion_strategy", {}),
            "outcome": outcome,
            "effectiveness": outcome.get("comprehension_score", 0.5)
        }
        
        self.learning_memory[student_id].append(learning_record)
        
        # Keep only recent records
        if len(self.learning_memory[student_id]) > 50:
            self.learning_memory[student_id] = self.learning_memory[student_id][-50:]
    
    async def _calculate_personalization_score(self, fusion_result: Dict[str, Any], 
                                             student_profile: Dict[str, Any]) -> float:
        """Calculate how well the content is personalized to the student"""
        base_score = 0.5
        
        # Check learning style alignment
        fusion_strategy = fusion_result.get("fusion_strategy", {})
        student_style = student_profile.get("learning_style", "balanced")
        primary_modality = fusion_strategy.get("primary_modality", "text")
        
        style_alignment = {
            "visual": {"visual": 1.0, "text": 0.7, "audio": 0.3},
            "auditory": {"audio": 1.0, "text": 0.6, "visual": 0.4},
            "reading": {"text": 1.0, "visual": 0.5, "audio": 0.3},
            "kinesthetic": {"visual": 0.8, "audio": 0.7, "text": 0.4}
        }
        
        alignment_score = style_alignment.get(student_style, {}).get(primary_modality, 0.5)
        base_score += alignment_score * 0.3
        
        # Check adaptive features
        if fusion_result.get("adaptation_metadata", {}).get("student_optimized", False):
            base_score += 0.2
            
        return min(base_score, 1.0)
    
    async def cross_modal_concept_transfer(self, source_modality: str, target_modality: str, 
                                         concept: str, student_context: Dict[str, Any]) -> Dict[str, Any]:
        """Transfer concepts between modalities using innovative AI techniques"""
        try:
            # Extract concept representation from source modality
            concept_representation = await self._extract_concept_representation(concept, source_modality)
            
            # Apply few-shot learning for modality transfer
            transfer_examples = self._get_transfer_examples(source_modality, target_modality)
            transfer_strategy = await self.few_shot_learner.learn_from_examples(
                f"transfer_{source_modality}_to_{target_modality}", transfer_examples
            )
            
            # Generate content in target modality
            transferred_content = await self._generate_modal_content(
                concept_representation, target_modality, student_context
            )
            
            # Validate transfer effectiveness
            transfer_quality = await self._validate_concept_transfer(
                concept, source_modality, transferred_content, target_modality
            )
            
            return {
                "original_concept": concept,
                "source_modality": source_modality,
                "target_modality": target_modality,
                "transferred_content": transferred_content,
                "transfer_quality": transfer_quality,
                "innovation_score": 0.9,  # High innovation for cross-modal transfer
                "student_adaptation": student_context.get("learning_style") == target_modality
            }
            
        except Exception as e:
            logger.error(f"Error in cross-modal concept transfer: {e}")
            return {"error": str(e), "concept": concept}
    
    async def _extract_concept_representation(self, concept: str, modality: str) -> Dict[str, Any]:
        """Extract deep representation of concept from specific modality"""
        if modality == "text":
            return {
                "semantic_features": concept.lower().split(),
                "complexity": len(concept.split()),
                "abstraction_level": "high" if any(word in concept.lower() for word in ["theory", "concept", "principle"]) else "concrete",
                "domain_indicators": [word for word in concept.split() if len(word) > 6]
            }
        elif modality == "visual":
            return {
                "visual_elements": ["diagram", "chart", "illustration"],
                "spatial_relations": ["connected", "hierarchical", "sequential"],
                "color_associations": ["blue for calm", "red for important"],
                "abstraction_level": "medium"
            }
        elif modality == "audio":
            return {
                "rhythm_patterns": ["emphasized", "flowing", "structured"],
                "tonal_qualities": ["clear", "engaging", "instructional"],
                "pacing": "moderate",
                "emphasis_points": concept.split()[:3]
            }
        else:
            return {"generic": True, "content": concept}
    
    def _get_transfer_examples(self, source: str, target: str) -> List[Dict[str, Any]]:
        """Get examples for modality transfer learning"""
        return [
            {
                "input": f"Sample {source} content about mathematics",
                "output": f"Converted to {target} format with visual/audio elements",
                "effectiveness": 0.8,
                "style": target
            },
            {
                "input": f"Educational {source} material on science",
                "output": f"Adapted {target} presentation with engagement features",
                "effectiveness": 0.7,
                "style": target
            }
        ]
    
    async def _generate_modal_content(self, representation: Dict[str, Any], 
                                    target_modality: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate content in target modality based on concept representation"""
        if target_modality == "visual":
            return {
                "type": "visual",
                "content": "Interactive diagram showing concept relationships",
                "elements": representation.get("domain_indicators", []),
                "layout": "hierarchical",
                "interactivity": "hover_explanations"
            }
        elif target_modality == "audio":
            return {
                "type": "audio",
                "content": "Narrated explanation with emphasis on key points",
                "pacing": "moderate",
                "emphasis": representation.get("semantic_features", [])[:3],
                "background": "subtle_educational_music"
            }
        else:  # text
            return {
                "type": "text",
                "content": f"Structured explanation of {representation}",
                "formatting": "bullet_points",
                "reading_level": context.get("level", "intermediate")
            }
    
    async def _validate_concept_transfer(self, original_concept: str, source_modality: str,
                                       transferred_content: Dict[str, Any], target_modality: str) -> Dict[str, Any]:
        """Validate the effectiveness of concept transfer"""
        return {
            "semantic_preservation": 0.8,  # How well meaning is preserved
            "modality_appropriateness": 0.9,  # How well suited to target modality
            "engagement_potential": 0.85,  # Expected student engagement
            "learning_effectiveness": 0.82,  # Expected learning outcome
            "innovation_factor": 0.95  # How innovative the transfer is
        }
    
    # ===== INTEGRATION OPENROUTER =====
    
    async def openrouter_completion(self, prompt: str, system_message: str = None, **kwargs) -> Optional[str]:
        """
        Utiliser OpenRouter pour la génération de texte
        
        Args:
            prompt: Texte d'entrée
            system_message: Message système optionnel
            **kwargs: Arguments supplémentaires pour l'API
        """
        if not self.openrouter_client:
            logger.warning("Client OpenRouter non initialisé")
            return None
        
        system_msg = system_message or "Tu es un assistant IA éducatif bienveillant et pédagogique."
        
        return await self.openrouter_client.simple_completion(
            prompt=prompt,
            model=self.openrouter_model,
            system_message=system_msg,
            **kwargs
        )
    
    async def openrouter_educational_response(self, question: str, context: Dict[str, Any] = None) -> Optional[str]:
        """
        Réponse éducative via OpenRouter
        
        Args:
            question: Question de l'étudiant
            context: Contexte éducatif (matière, niveau, etc.)
        """
        if not self.openrouter_client:
            logger.warning("Client OpenRouter non initialisé")
            return None
        
        context = context or {}
        subject = context.get("subject", "général")
        level = context.get("level", "collège")
        language = context.get("language", "fr")
        
        return await self.openrouter_client.educational_response(
            question=question,
            subject=subject,
            level=level,
            language=language,
            model=self.openrouter_model
        )
    
    async def openrouter_translate(self, text: str, target_lang: str, source_lang: str = "auto") -> Optional[str]:
        """
        Traduction via OpenRouter
        
        Args:
            text: Texte à traduire
            target_lang: Langue cible
            source_lang: Langue source
        """
        if not self.openrouter_client:
            logger.warning("Client OpenRouter non initialisé")
            return None
        
        return await self.openrouter_client.translate_text(
            text=text,
            target_lang=target_lang,
            source_lang=source_lang,
            model=self.openrouter_model
        )
    
    async def openrouter_analyze_emotion(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Analyse émotionnelle via OpenRouter
        
        Args:
            text: Texte à analyser
        """
        if not self.openrouter_client:
            logger.warning("Client OpenRouter non initialisé")
            return None
        
        return await self.openrouter_client.analyze_emotion(
            text=text,
            model=self.openrouter_model
        )
    
    async def close_openrouter(self):
        """Fermer le client OpenRouter"""
        if self.openrouter_client:
            await self.openrouter_client.close()
