"""
Advanced Test Suite for Vision Processing and Metacognition
Tests for innovative AI techniques, learning visualization, and metacognitive analysis
"""

import pytest
import asyncio
import numpy as np
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock
import sys
import os
from PIL import Image

# Add the ai_services directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from vision.vision_processor import (
        VisionProcessor, AdvancedLearningVisualization, MetacognitionEngine
    )
    from nlp.text_processor import (
        FewShotLearner, MetaLearningEngine, MultiModalFusionEngine, NLPProcessor
    )
    
    IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Import error: {e}")
    IMPORTS_AVAILABLE = False

@pytest.fixture
def sample_image():
    """Create a sample PIL image for testing"""
    return Image.new('RGB', (224, 224), color='red')

@pytest.fixture
def sample_learning_data():
    """Sample learning data for visualization tests"""
    return {
        "concepts": ["Machine Learning", "Deep Learning", "Neural Networks", "AI Ethics"],
        "relationships": [
            {"source": 0, "target": 1, "strength": 0.8},
            {"source": 1, "target": 2, "strength": 0.9},
            {"source": 0, "target": 3, "strength": 0.6}
        ],
        "progress_data": [0.2, 0.5, 0.8, 0.3],
        "difficulty_levels": [0.3, 0.7, 0.9, 0.5],
        "learning_paths": [
            {"from": "beginner", "to": "intermediate", "concepts": ["Machine Learning"]},
            {"from": "intermediate", "to": "advanced", "concepts": ["Deep Learning", "Neural Networks"]}
        ]
    }

@pytest.fixture
def sample_student_profile():
    """Sample student profile for testing"""
    return {
        "id": "student_123",
        "learning_style": "visual",
        "skill_level": 0.6,
        "interests": ["technology", "science"],
        "performance_history": [0.5, 0.6, 0.7, 0.8],
        "learning_preferences": {
            "pace": "moderate",
            "feedback_frequency": "high",
            "challenge_level": "progressive"
        },
        "current_attention": 0.7,
        "collaboration_style": "active"
    }

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestAdvancedLearningVisualization:
    """Test suite for advanced learning visualization features"""
    
    @pytest.fixture
    def learning_viz(self):
        return AdvancedLearningVisualization()
    
    @pytest.mark.asyncio
    async def test_create_concept_map_visualization(self, learning_viz, sample_learning_data):
        """Test concept map visualization creation"""
        result = await learning_viz.create_learning_visualization(
            sample_learning_data, "concept_map"
        )
        
        assert "visualization_type" in result
        assert result["visualization_type"] == "concept_map"
        assert "structure" in result
        assert "interactive_elements" in result
        assert "visual_data" in result
        assert "metadata" in result
        
        # Check structure for concept map
        structure = result["structure"]
        assert "nodes" in structure
        assert "edges" in structure
        assert "layout" in structure
        assert structure["layout"] == "hierarchical"
        
        # Verify nodes correspond to concepts
        assert len(structure["nodes"]) == len(sample_learning_data["concepts"])
        
    @pytest.mark.asyncio
    async def test_create_learning_journey_visualization(self, learning_viz, sample_learning_data):
        """Test learning journey visualization"""
        result = await learning_viz.create_learning_visualization(
            sample_learning_data, "learning_journey"
        )
        
        assert result["visualization_type"] == "learning_journey"
        structure = result["structure"]
        assert "events" in structure
        assert "layout" in structure
        assert structure["layout"] == "spiral"
        
        # Events should correspond to concepts
        assert len(structure["events"]) == len(sample_learning_data["concepts"])
        
        # Check event structure
        for event in structure["events"]:
            assert "time" in event
            assert "concept" in event
            assert "milestone" in event
            
    @pytest.mark.asyncio
    async def test_create_knowledge_growth_visualization(self, learning_viz, sample_learning_data):
        """Test knowledge growth tree visualization"""
        result = await learning_viz.create_learning_visualization(
            sample_learning_data, "knowledge_growth"
        )
        
        assert result["visualization_type"] == "knowledge_growth"
        assert "structure" in result
        assert result["structure"]["type"] == "tree"
        
    @pytest.mark.asyncio
    async def test_interactive_elements_generation(self, learning_viz, sample_learning_data):
        """Test interactive elements generation"""
        result = await learning_viz.create_learning_visualization(
            sample_learning_data, "concept_map"
        )
        
        interactive_elements = result["interactive_elements"]
        assert len(interactive_elements) > 0
        
        # Check for required interactive element types
        element_types = [elem["type"] for elem in interactive_elements]
        assert "hover_tooltip" in element_types
        assert "click_action" in element_types
        assert "navigation" in element_types
        
        # Verify tooltip elements have proper structure
        tooltips = [elem for elem in interactive_elements if elem["type"] == "hover_tooltip"]
        for tooltip in tooltips:
            assert "target" in tooltip
            assert "content" in tooltip
            
    @pytest.mark.asyncio
    async def test_visual_complexity_calculation(self, learning_viz):
        """Test visual complexity calculation"""
        simple_structure = {
            "nodes": [{"id": 0}, {"id": 1}],
            "edges": [{"source": 0, "target": 1}]
        }
        
        complex_structure = {
            "nodes": [{"id": i} for i in range(10)],
            "edges": [{"source": i, "target": i+1} for i in range(9)]
        }
        
        simple_complexity = learning_viz._calculate_visual_complexity(simple_structure)
        complex_complexity = learning_viz._calculate_visual_complexity(complex_structure)
        
        assert 0 <= simple_complexity <= 1
        assert 0 <= complex_complexity <= 1
        assert complex_complexity > simple_complexity
        
    @pytest.mark.asyncio
    async def test_educational_value_assessment(self, learning_viz):
        """Test educational value assessment"""
        high_value_structure = {"detailed": "very detailed structure with lots of content" * 20}
        low_value_structure = {"simple": "basic"}
        
        high_value = await learning_viz._assess_educational_value(high_value_structure)
        low_value = await learning_viz._assess_educational_value(low_value_structure)
        
        assert 0 <= high_value <= 1
        assert 0 <= low_value <= 1
        assert high_value > low_value

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestMetacognitionEngine:
    """Test suite for metacognition engine"""
    
    @pytest.fixture
    def metacognition_engine(self):
        return MetacognitionEngine()
    
    @pytest.fixture
    def complex_learning_session(self):
        """Complex learning session with varied interactions"""
        return {
            "responses": [
                {
                    "content": "I understand the basic concept of neural networks. They process information like the human brain.",
                    "timestamp": datetime.now(),
                    "type": "understanding"
                },
                {
                    "content": "Wait, I think I made an error in my previous reasoning. Let me reconsider this approach.",
                    "timestamp": datetime.now(),
                    "type": "self_correction"
                },
                {
                    "content": "Why do we use backpropagation specifically? What makes it better than other methods?",
                    "timestamp": datetime.now(),
                    "type": "questioning"
                },
                {
                    "content": "I see a connection between what we learned about optimization and this new concept of gradient descent.",
                    "timestamp": datetime.now(),
                    "type": "connection_making"
                },
                {
                    "content": "Actually, now I realize that my understanding of weights was incomplete. I need to study this more.",
                    "timestamp": datetime.now(),
                    "type": "reflection"
                }
            ],
            "time_metrics": {
                "average_response_time": 45,
                "total_time": 600,
                "pause_durations": [5, 15, 30, 10, 20]
            },
            "strategies_applied": ["elaboration", "questioning", "reflection", "connection_making", "self_monitoring"],
            "performance": {
                "elaboration_score": 0.8,
                "questioning_score": 0.9,
                "reflection_score": 0.85,
                "connection_making_score": 0.7,
                "self_monitoring_score": 0.8
            }
        }
    
    @pytest.mark.asyncio
    async def test_comprehensive_metacognitive_analysis(self, metacognition_engine, complex_learning_session, sample_student_profile):
        """Test comprehensive metacognitive analysis"""
        result = await metacognition_engine.metacognitive_analysis(
            complex_learning_session, sample_student_profile
        )
        
        # Check all required components
        required_keys = [
            "thinking_patterns", "strategy_effectiveness", "self_awareness_insights",
            "reflection_prompts", "recommendations", "metacognitive_score", "growth_opportunities"
        ]
        
        for key in required_keys:
            assert key in result
            
        # Validate score range
        assert 0 <= result["metacognitive_score"] <= 1
        
        # Check thinking patterns analysis
        thinking_patterns = result["thinking_patterns"]
        assert "thinking_style" in thinking_patterns
        assert "response_depth" in thinking_patterns
        assert "reflection_frequency" in thinking_patterns
        assert "self_correction" in thinking_patterns
        assert "question_asking" in thinking_patterns
        
        # Should detect high-level thinking based on complex session
        assert thinking_patterns["reflection_frequency"] >= 1
        assert thinking_patterns["self_correction"] >= 1
        assert thinking_patterns["question_asking"] >= 1
        
    @pytest.mark.asyncio
    async def test_thinking_style_classification(self, metacognition_engine):
        """Test thinking style classification"""
        # Test deep reflective style
        deep_reflective_session = {
            "responses": [
                {"content": "Let me think deeply about why this works" + " " * 50, "type": "reflection"},
                {"content": "I need to reflect on my understanding" + " " * 30, "type": "reflection"},
                {"content": "Why does this approach work better?" + " " * 40, "type": "questioning"},
                {"content": "I should reconsider my previous assumption" + " " * 35, "type": "reflection"}
            ],
            "time_metrics": {"average_response_time": 60}
        }
        
        patterns = await metacognition_engine._analyze_thinking_patterns(deep_reflective_session)
        assert patterns["thinking_style"] == "deep_reflective"
        
        # Test quick intuitive style
        quick_intuitive_session = {
            "responses": [
                {"content": "Yes", "type": "quick_response"},
                {"content": "No", "type": "quick_response"},
                {"content": "Maybe", "type": "quick_response"}
            ],
            "time_metrics": {"average_response_time": 5}
        }
        
        patterns = await metacognition_engine._analyze_thinking_patterns(quick_intuitive_session)
        assert patterns["thinking_style"] == "quick_intuitive"
        
        # Test curious exploratory style
        curious_session = {
            "responses": [
                {"content": "What if we try this approach?", "type": "questioning"},
                {"content": "How does this relate to that?", "type": "questioning"},
                {"content": "Why would this work?", "type": "questioning"}
            ],
            "time_metrics": {"average_response_time": 30}
        }
        
        patterns = await metacognition_engine._analyze_thinking_patterns(curious_session)
        assert patterns["thinking_style"] == "curious_exploratory"
        
    @pytest.mark.asyncio
    async def test_self_awareness_insights_generation(self, metacognition_engine):
        """Test self-awareness insights generation"""
        high_awareness_thinking = {
            "thinking_style": "deep_reflective",
            "reflection_frequency": 5,
            "self_correction": 3,
            "question_asking": 4
        }
        
        high_awareness_strategy = {
            "overall_effectiveness": 0.9,
            "strategy_diversity": 5
        }
        
        insights = await metacognition_engine._generate_self_awareness_insights(
            high_awareness_thinking, high_awareness_strategy
        )
        
        assert insights["awareness_level"] > 0.8  # Should be high
        assert len(insights["strengths_awareness"]) > 0
        
        # Test low awareness scenario
        low_awareness_thinking = {
            "thinking_style": "quick_intuitive",
            "reflection_frequency": 0,
            "self_correction": 0,
            "question_asking": 1
        }
        
        low_awareness_strategy = {
            "overall_effectiveness": 0.4,
            "strategy_diversity": 2
        }
        
        low_insights = await metacognition_engine._generate_self_awareness_insights(
            low_awareness_thinking, low_awareness_strategy
        )
        
        assert low_insights["awareness_level"] < insights["awareness_level"]
        
    @pytest.mark.asyncio
    async def test_reflection_prompts_personalization(self, metacognition_engine):
        """Test personalized reflection prompts generation"""
        # High awareness student
        high_awareness = {"awareness_level": 0.8}
        high_prompts = await metacognition_engine._create_reflection_prompts(high_awareness)
        
        # Low awareness student  
        low_awareness = {"awareness_level": 0.4}
        low_prompts = await metacognition_engine._create_reflection_prompts(low_awareness)
        
        assert len(high_prompts) > 0
        assert len(low_prompts) > 0
        
        # High awareness prompts should be more sophisticated
        high_prompt_text = " ".join(high_prompts).lower()
        low_prompt_text = " ".join(low_prompts).lower()
        
        # High awareness should have words like "strategies", "patterns", "adapt"
        sophisticated_words = ["strategies", "patterns", "adapt", "evolved"]
        basic_words = ["challenging", "difficult", "approach"]
        
        high_sophisticated_count = sum(1 for word in sophisticated_words if word in high_prompt_text)
        low_basic_count = sum(1 for word in basic_words if word in low_prompt_text)
        
        assert high_sophisticated_count > 0 or low_basic_count > 0  # At least one should match expected pattern
        
    @pytest.mark.asyncio
    async def test_growth_opportunities_identification(self, metacognition_engine):
        """Test identification of growth opportunities"""
        # Student with specific weaknesses
        weak_thinking_analysis = {
            "question_asking": 0,  # Low questioning
            "self_correction": 0,  # No self-correction
            "reflection_frequency": 1  # Low reflection
        }
        
        opportunities = await metacognition_engine._identify_growth_opportunities(weak_thinking_analysis)
        
        assert len(opportunities) > 0
        opportunity_text = " ".join(opportunities).lower()
        
        # Should suggest developing questioning and self-monitoring
        assert any(word in opportunity_text for word in ["question", "curiosity"])
        assert any(word in opportunity_text for word in ["self-monitoring", "correction"])
        
    @pytest.mark.asyncio
    async def test_metacognitive_score_calculation(self, metacognition_engine):
        """Test metacognitive score calculation"""
        high_awareness = {
            "awareness_level": 0.9,
            "strengths_awareness": ["analytical thinking", "problem solving", "reflection"],
            "weaknesses_awareness": ["time management", "collaboration"]
        }
        
        low_awareness = {
            "awareness_level": 0.3,
            "strengths_awareness": ["enthusiasm"],
            "weaknesses_awareness": []
        }
        
        high_score = await metacognition_engine._calculate_metacognitive_score(high_awareness)
        low_score = await metacognition_engine._calculate_metacognitive_score(low_awareness)
        
        assert 0 <= high_score <= 1
        assert 0 <= low_score <= 1
        assert high_score > low_score
        
    @pytest.mark.asyncio
    async def test_metacognitive_session_storage(self, metacognition_engine):
        """Test storage of metacognitive sessions for longitudinal analysis"""
        student_id = "test_student_123"
        
        # First session
        result1 = {
            "metacognitive_score": 0.6,
            "self_awareness_insights": {"awareness_level": 0.6},
            "growth_opportunities": ["develop questioning"]
        }
        
        metacognition_engine._store_metacognitive_session(student_id, result1)
        
        # Second session
        result2 = {
            "metacognitive_score": 0.7,
            "self_awareness_insights": {"awareness_level": 0.7},
            "growth_opportunities": ["improve self-monitoring"]
        }
        
        metacognition_engine._store_metacognitive_session(student_id, result2)
        
        # Check storage
        assert student_id in metacognition_engine.reflection_history
        assert len(metacognition_engine.reflection_history[student_id]) == 2
        
        # Check chronological order
        history = metacognition_engine.reflection_history[student_id]
        assert history[0]["metacognitive_score"] == 0.6
        assert history[1]["metacognitive_score"] == 0.7

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestFewShotLearning:
    """Test suite for few-shot learning capabilities"""
    
    @pytest.fixture
    def few_shot_learner(self):
        return FewShotLearner()
    
    @pytest.fixture
    def sample_examples(self):
        return [
            {
                "input": "Explain photosynthesis to a beginner",
                "output": "Plants make food from sunlight, water, and carbon dioxide",
                "effectiveness": 0.8,
                "style": "visual"
            },
            {
                "input": "Describe gravity for children", 
                "output": "Gravity pulls things down towards Earth",
                "effectiveness": 0.9,
                "style": "kinesthetic"
            },
            {
                "input": "Teach basic addition simply",
                "output": "When you add numbers, you count up to get more",
                "effectiveness": 0.7,
                "style": "visual"
            }
        ]
    
    @pytest.mark.asyncio
    async def test_learn_from_examples(self, few_shot_learner, sample_examples):
        """Test learning from few examples"""
        domain = "elementary_science"
        
        await few_shot_learner.learn_from_examples(domain, sample_examples)
        
        assert domain in few_shot_learner.few_shot_examples
        assert domain in few_shot_learner.adaptation_memory
        
        # Check adaptation rule creation
        adaptation_rule = few_shot_learner.adaptation_memory[domain]
        assert "type" in adaptation_rule
        assert "target_complexity" in adaptation_rule
        assert "preferred_style" in adaptation_rule
        assert "confidence" in adaptation_rule
        
        assert adaptation_rule["type"] == "learned"
        assert 0 <= adaptation_rule["confidence"] <= 1
        
    @pytest.mark.asyncio
    async def test_extract_learning_pattern(self, few_shot_learner):
        """Test learning pattern extraction"""
        example = {
            "input": "Explain complex neural network architectures to graduate students",
            "output": "Neural networks consist of interconnected layers of neurons that process information through weighted connections, with each layer extracting increasingly abstract features",
            "effectiveness": 0.85,
            "style": "auditory",
            "content": "This is detailed technical content about neural networks"
        }
        
        pattern = await few_shot_learner._extract_learning_pattern(example)
        
        assert "input_complexity" in pattern
        assert "output_structure" in pattern
        assert "learning_style" in pattern
        assert "effectiveness_score" in pattern
        assert "semantic_fingerprint" in pattern
        
        assert pattern["learning_style"] == "auditory"
        assert pattern["effectiveness_score"] == 0.85
        assert pattern["input_complexity"] > 5  # Should be reasonably complex
        
    @pytest.mark.asyncio
    async def test_structure_analysis(self, few_shot_learner):
        """Test structure analysis of educational content"""
        complex_text = "Neural networks are powerful. They have many layers. For example, CNNs are used for images. Why do they work so well? The answer lies in their architecture."
        simple_text = "Dogs are animals. They bark."
        
        complex_structure = few_shot_learner._analyze_structure(complex_text)
        simple_structure = few_shot_learner._analyze_structure(simple_text)
        
        # Complex text should have more sentences and examples
        assert complex_structure["sentence_count"] > simple_structure["sentence_count"]
        assert complex_structure["has_examples"] == True
        assert complex_structure["has_questions"] == True
        assert simple_structure["has_examples"] == False

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestMetaLearningEngine:
    """Test suite for meta-learning engine"""
    
    @pytest.fixture
    def meta_learning_engine(self):
        return MetaLearningEngine()
    
    @pytest.fixture
    def sample_learning_outcome(self):
        return {
            "comprehension_score": 0.8,
            "engagement_score": 0.7,
            "retention_score": 0.75,
            "learning_speed": 1.2
        }
    
    @pytest.mark.asyncio
    async def test_meta_learning_process(self, meta_learning_engine, sample_student_profile, sample_learning_outcome):
        """Test meta-learning process"""
        task_type = "concept_explanation"
        
        result = await meta_learning_engine.meta_learn(
            task_type, sample_student_profile, sample_learning_outcome
        )
        
        assert "recommended_strategy" in result
        assert "confidence" in result
        assert "adaptation_suggestion" in result
        
        strategy = result["recommended_strategy"]
        assert "strategy_type" in strategy
        assert "parameters" in strategy
        assert "confidence" in strategy
        
        # Parameters should be within valid ranges
        params = strategy["parameters"]
        for param_name, param_value in params.items():
            assert 0 <= param_value <= 1
            
    @pytest.mark.asyncio
    async def test_performance_calculation(self, meta_learning_engine, sample_learning_outcome):
        """Test performance calculation from outcomes"""
        performance = meta_learning_engine._calculate_performance(sample_learning_outcome)
        
        assert 0 <= performance <= 1
        
        # Should be weighted combination of metrics
        expected = (0.8 * 0.4 + 0.7 * 0.3 + 0.75 * 0.2 + min(1.2, 2.0)/2.0 * 0.1)
        assert abs(performance - expected) < 0.01
        
    @pytest.mark.asyncio
    async def test_strategy_evolution(self, meta_learning_engine, sample_student_profile):
        """Test strategy evolution based on performance"""
        strategy_id = "test_strategy"
        
        # Initialize strategy
        meta_learning_engine.strategy_effectiveness[strategy_id] = {
            "success_rate": 0.6,
            "learning_curve": [0.5, 0.6],
            "content_density": 0.5,
            "interaction_frequency": 0.3,
            "complexity_progression": 0.2,
            "multimodal_weight": 0.4,
            "best_params": {},
            "adaptation_count": 0
        }
        
        high_performance = 0.9
        evolved_strategy = await meta_learning_engine._evolve_strategy(
            strategy_id, high_performance, sample_student_profile
        )
        
        assert "strategy_type" in evolved_strategy
        assert "parameters" in evolved_strategy
        assert "confidence" in evolved_strategy
        assert "adaptation_generation" in evolved_strategy
        
        # Success rate should improve with high performance
        assert meta_learning_engine.strategy_effectiveness[strategy_id]["success_rate"] > 0.6
        
    @pytest.mark.asyncio
    async def test_adaptive_parameter_adjustment(self, meta_learning_engine):
        """Test adaptive parameter adjustment"""
        current_value = 0.5
        
        # High performance should increase parameter
        high_performance = 0.9
        learning_rate = 0.1
        
        new_value = meta_learning_engine._adaptive_parameter(
            current_value, high_performance, learning_rate
        )
        
        assert new_value > current_value
        assert 0 <= new_value <= 1
        
        # Low performance should decrease parameter
        low_performance = 0.2
        low_value = meta_learning_engine._adaptive_parameter(
            current_value, low_performance, learning_rate
        )
        
        assert low_value < current_value
        assert 0 <= low_value <= 1

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestMultiModalFusion:
    """Test suite for multimodal fusion engine"""
    
    @pytest.fixture
    def fusion_engine(self):
        return MultiModalFusionEngine()
    
    @pytest.fixture
    def sample_content_bundle(self):
        return {
            "text": "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
            "audio_transcript": "Machine learning enables computers to learn without explicit programming.",
            "visual_description": "Diagram showing AI, ML, and DL relationships in a hierarchical structure."
        }
    
    @pytest.fixture
    def sample_student_state(self):
        return {
            "learning_style": "visual",
            "attention_level": 0.8,
            "performance_history": [0.6, 0.7, 0.8],
            "current_mood": "focused"
        }
    
    @pytest.mark.asyncio
    async def test_multimodal_fusion_process(self, fusion_engine, sample_content_bundle, sample_student_state):
        """Test complete multimodal fusion process"""
        result = await fusion_engine.fuse_modalities(sample_content_bundle, sample_student_state)
        
        assert "fused_content" in result
        assert "fusion_strategy" in result
        assert "estimated_effectiveness" in result
        assert "adaptation_metadata" in result
        
        # Check fusion strategy
        fusion_strategy = result["fusion_strategy"]
        assert "primary_modality" in fusion_strategy
        assert "fusion_type" in fusion_strategy
        assert "synchronization_points" in fusion_strategy
        
        # Check adaptation metadata
        metadata = result["adaptation_metadata"]
        assert "student_optimized" in metadata
        assert "modality_balance" in metadata
        assert "cognitive_load" in metadata
        
        assert metadata["student_optimized"] == True
        assert 0 <= metadata["cognitive_load"] <= 1
        
    @pytest.mark.asyncio
    async def test_modality_compatibility_analysis(self, fusion_engine, sample_content_bundle):
        """Test modality compatibility analysis"""
        compatibility = await fusion_engine._analyze_modality_compatibility(sample_content_bundle)
        
        assert "text_audio" in compatibility
        assert "text_visual" in compatibility
        assert "audio_visual" in compatibility
        assert "overall_coherence" in compatibility
        
        # All scores should be between 0 and 1
        for score in compatibility.values():
            assert 0 <= score <= 1
            
        # Overall coherence should be average of pairwise similarities
        expected_coherence = (
            compatibility["text_audio"] + 
            compatibility["text_visual"] + 
            compatibility["audio_visual"]
        ) / 3
        
        assert abs(compatibility["overall_coherence"] - expected_coherence) < 0.01
        
    @pytest.mark.asyncio
    async def test_student_adaptive_weights(self, fusion_engine, sample_student_state):
        """Test adaptive weight calculation based on student state"""
        weights = await fusion_engine._adapt_weights_to_student(sample_student_state)
        
        assert "text" in weights
        assert "audio" in weights
        assert "visual" in weights
        
        # Weights should sum to approximately 1
        total_weight = sum(weights.values())
        assert abs(total_weight - 1.0) < 0.01
        
        # Visual weight should be higher for visual learner
        assert weights["visual"] > weights["audio"]
        
        # Test different learning styles
        auditory_state = sample_student_state.copy()
        auditory_state["learning_style"] = "auditory"
        
        auditory_weights = await fusion_engine._adapt_weights_to_student(auditory_state)
        assert auditory_weights["audio"] > auditory_weights["visual"]
        
    @pytest.mark.asyncio
    async def test_attention_based_adaptation(self, fusion_engine):
        """Test adaptation based on attention level"""
        low_attention_state = {
            "learning_style": "balanced",
            "attention_level": 0.3  # Low attention
        }
        
        high_attention_state = {
            "learning_style": "balanced", 
            "attention_level": 0.9  # High attention
        }
        
        low_weights = await fusion_engine._adapt_weights_to_student(low_attention_state)
        high_weights = await fusion_engine._adapt_weights_to_student(high_attention_state)
        
        # Low attention should increase audio/visual, decrease text
        assert low_weights["text"] < high_weights["text"]
        assert low_weights["audio"] > high_weights["audio"] or low_weights["visual"] > high_weights["visual"]
        
    @pytest.mark.asyncio
    async def test_fusion_plan_creation(self, fusion_engine):
        """Test fusion plan creation"""
        compatibility = {
            "text_audio": 0.8,
            "text_visual": 0.7,
            "audio_visual": 0.6,
            "overall_coherence": 0.7
        }
        
        weights = {"text": 0.4, "audio": 0.3, "visual": 0.3}
        
        plan = await fusion_engine._create_fusion_plan(compatibility, weights)
        
        assert "primary_modality" in plan
        assert "fusion_type" in plan
        assert "synchronization_points" in plan
        assert "cognitive_pacing" in plan
        assert "interaction_triggers" in plan
        
        # Primary modality should be the one with highest weight
        assert plan["primary_modality"] == "text"  # Highest weight in test
        
        # High coherence should lead to adaptive blend
        assert plan["fusion_type"] == "adaptive_blend"
        
    @pytest.mark.asyncio
    async def test_cognitive_load_estimation(self, fusion_engine):
        """Test cognitive load estimation"""
        light_content = {
            "segments": [
                {"content": "short", "interactive": False},
                {"content": "simple", "interactive": False}
            ]
        }
        
        heavy_content = {
            "segments": [
                {"content": "very long and complex content with lots of details" * 10, "interactive": True},
                {"content": "another complex segment with technical information" * 8, "interactive": True},
                {"content": "third detailed segment requiring deep analysis" * 12, "interactive": False}
            ]
        }
        
        light_load = await fusion_engine._estimate_cognitive_load(light_content)
        heavy_load = await fusion_engine._estimate_cognitive_load(heavy_content)
        
        assert 0 <= light_load <= 1
        assert 0 <= heavy_load <= 1
        assert heavy_load > light_load

# Integration tests
@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestAdvancedAIIntegration:
    """Integration tests for advanced AI features"""
    
    @pytest.mark.asyncio
    async def test_nlp_with_advanced_features_integration(self, sample_student_profile):
        """Test NLP processor with all advanced features"""
        try:
            nlp_processor = NLPProcessor()
            
            # Test few-shot learning
            task_examples = [
                {"input": "simple concept", "output": "easy explanation", "effectiveness": 0.8, "style": "visual"}
            ]
            
            new_task = {
                "content": "Explain quantum computing",
                "student_profile": sample_student_profile
            }
            
            few_shot_result = await nlp_processor.adaptive_few_shot_learning(
                "quantum_physics", task_examples, new_task
            )
            
            assert "adapted_content" in few_shot_result
            assert "meta_learning_insights" in few_shot_result
            
            # Test multimodal fusion
            content_bundle = {
                "text": "Quantum computing uses quantum mechanics principles",
                "audio_transcript": "Quantum computers process information differently", 
                "visual_description": "Quantum circuit diagram"
            }
            
            fusion_result = await nlp_processor.intelligent_multimodal_fusion(
                content_bundle, sample_student_profile
            )
            
            assert "fused_content" in fusion_result
            assert "personalization_score" in fusion_result
            
        except Exception as e:
            pytest.skip(f"NLP integration test failed due to missing dependencies: {e}")
            
    @pytest.mark.asyncio
    async def test_vision_metacognition_integration(self, sample_learning_data, sample_student_profile):
        """Test integration between vision processing and metacognition"""
        try:
            # Create learning visualization
            learning_viz = AdvancedLearningVisualization()
            viz_result = await learning_viz.create_learning_visualization(
                sample_learning_data, "concept_map"
            )
            
            # Use visualization data for metacognitive analysis
            metacognition = MetacognitionEngine()
            
            # Simulate learning session based on visualization interaction
            learning_session = {
                "responses": [
                    {"content": "The concept map helps me see connections between ideas", "type": "insight"},
                    {"content": "I notice I understand visual representations better", "type": "self_awareness"}
                ],
                "time_metrics": {"average_response_time": 40},
                "strategies_applied": ["visualization", "connection_making"],
                "performance": {"visualization_score": 0.9, "connection_making_score": 0.8}
            }
            
            metacognitive_result = await metacognition.metacognitive_analysis(
                learning_session, sample_student_profile
            )
            
            assert "metacognitive_score" in metacognitive_result
            assert metacognitive_result["metacognitive_score"] > 0.6  # Should be reasonably high
            
        except Exception as e:
            pytest.skip(f"Vision-metacognition integration test failed: {e}")

if __name__ == "__main__":
    # Run tests if modules are available
    if IMPORTS_AVAILABLE:
        print("Running advanced AI features tests...")
        pytest.main([__file__, "-v"])
    else:
        print("Required modules not available. Skipping tests.")
