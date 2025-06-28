"""
Advanced Test Suite for Collaborative Learning Engine
Tests for AI-human collaboration, group formation, and metacognition features
"""

import pytest
import asyncio
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

# Add the ai_services directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from collaboration.collaborative_engine import (
        CollaborativeEngine, IntelligentGroupFormation, 
        CollaborativeInteractionEngine, GroupDynamicsMonitor,
        CollaborationMode, LearnerRole, CollaborativeSession
    )
    from vision.vision_processor import MetacognitionEngine, AdvancedLearningVisualization
    
    IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Import error: {e}")
    IMPORTS_AVAILABLE = False

@pytest.fixture
def sample_participants():
    """Sample participants for testing"""
    return [
        {
            "id": "user_1",
            "name": "Alice",
            "learning_style": "visual",
            "skill_level": 0.7,
            "interests": ["science", "technology"],
            "collaboration_preference": "high",
            "communication_style": "direct",
            "strengths": ["analytical thinking", "problem solving"],
            "growth_areas": ["communication"]
        },
        {
            "id": "user_2", 
            "name": "Bob",
            "learning_style": "auditory",
            "skill_level": 0.5,
            "interests": ["history", "literature"],
            "collaboration_preference": "moderate",
            "communication_style": "diplomatic",
            "strengths": ["creativity", "writing"],
            "growth_areas": ["technical skills"]
        },
        {
            "id": "user_3",
            "name": "Carol",
            "learning_style": "kinesthetic",
            "skill_level": 0.8,
            "interests": ["mathematics", "science"],
            "collaboration_preference": "low",
            "communication_style": "reserved",
            "strengths": ["logical reasoning", "attention to detail"],
            "growth_areas": ["teamwork"]
        },
        {
            "id": "user_4",
            "name": "David",
            "learning_style": "reading",
            "skill_level": 0.6,
            "interests": ["technology", "engineering"],
            "collaboration_preference": "high",
            "communication_style": "enthusiastic",
            "strengths": ["innovation", "leadership"],
            "growth_areas": ["patience"]
        }
    ]

@pytest.fixture
def sample_collaborative_session():
    """Sample collaborative session for testing"""
    return CollaborativeSession(
        session_id="test_session_001",
        participants=[
            {"id": "user_1", "name": "Alice"},
            {"id": "user_2", "name": "Bob"}
        ],
        mode=CollaborationMode.PEER_LEARNING,
        topic="Machine Learning Fundamentals",
        objectives=["Understand basic concepts", "Practice problem solving"],
        start_time=datetime.now(),
        duration_minutes=60,
        current_phase="knowledge_sharing",
        interaction_history=[
            {
                "participant_id": "user_1",
                "content": "I think machine learning is about pattern recognition",
                "timestamp": datetime.now(),
                "type": "contribution"
            },
            {
                "participant_id": "user_2", 
                "content": "That's interesting! Can you give an example?",
                "timestamp": datetime.now(),
                "type": "question"
            }
        ],
        shared_artifacts=[]
    )

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestIntelligentGroupFormation:
    """Test suite for intelligent group formation"""
    
    @pytest.fixture
    def group_formation(self):
        return IntelligentGroupFormation()
    
    @pytest.mark.asyncio
    async def test_form_optimal_groups_basic(self, group_formation, sample_participants):
        """Test basic group formation functionality"""
        result = await group_formation.form_optimal_groups(
            sample_participants, 
            group_size=2, 
            objective="peer_learning"
        )
        
        assert "groups" in result
        assert "effectiveness_predictions" in result
        assert len(result["groups"]) == 2  # 4 participants / 2 per group
        assert all(len(group) >= 2 for group in result["groups"])
        
    @pytest.mark.asyncio
    async def test_analyze_participants(self, group_formation, sample_participants):
        """Test participant analysis"""
        analyzed = await group_formation._analyze_participants(sample_participants)
        
        assert len(analyzed) == len(sample_participants)
        for participant in analyzed:
            assert "personality_traits" in participant
            assert "id" in participant
            assert "learning_style" in participant
            
    @pytest.mark.asyncio 
    async def test_diversity_score_calculation(self, group_formation):
        """Test diversity score calculation"""
        test_group = [
            {
                "skill_level": 0.3,
                "learning_style": "visual", 
                "interests": ["science"],
                "personality_traits": {"extroversion": 0.2, "openness": 0.8}
            },
            {
                "skill_level": 0.8,
                "learning_style": "auditory",
                "interests": ["history"], 
                "personality_traits": {"extroversion": 0.7, "openness": 0.3}
            }
        ]
        
        diversity_score = await group_formation._calculate_diversity_score(test_group, "peer_learning")
        
        assert 0 <= diversity_score <= 1
        assert diversity_score > 0.3  # Should have reasonable diversity
        
    @pytest.mark.asyncio
    async def test_different_formation_strategies(self, group_formation, sample_participants):
        """Test different group formation strategies"""
        strategies = ["optimal_diversity", "complementary_skills", "similar_interests"]
        
        for strategy in strategies:
            result = await group_formation.form_optimal_groups(
                sample_participants,
                group_size=2,
                strategy=strategy
            )
            
            assert "groups" in result
            assert result["formation_strategy"] == strategy
            assert len(result["groups"]) > 0

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestCollaborativeInteractionEngine:
    """Test suite for collaborative interaction engine"""
    
    @pytest.fixture
    def interaction_engine(self):
        return CollaborativeInteractionEngine()
    
    @pytest.mark.asyncio
    async def test_facilitate_collaboration(self, interaction_engine, sample_collaborative_session):
        """Test collaboration facilitation"""
        result = await interaction_engine.facilitate_collaboration(
            sample_collaborative_session,
            facilitation_style="adaptive"
        )
        
        assert "facilitation_approach" in result
        assert "actions_taken" in result
        assert "group_dynamics" in result
        assert "recommendations" in result
        assert "session_health" in result
        
    @pytest.mark.asyncio
    async def test_adaptive_facilitation_determination(self, interaction_engine, sample_collaborative_session):
        """Test adaptive facilitation approach determination"""
        # Test different dynamics scenarios
        test_dynamics = {
            "participation_balance": 0.2,  # Low balance
            "knowledge_sharing_rate": 0.5,
            "conflict_level": 0.1,
            "engagement_level": 0.6
        }
        
        approach = await interaction_engine._determine_adaptive_facilitation(
            test_dynamics, sample_collaborative_session
        )
        
        assert approach in interaction_engine.facilitation_strategies.keys()
        assert approach == "active_moderator"  # Should choose moderator for low balance
        
    @pytest.mark.asyncio
    async def test_different_facilitation_strategies(self, interaction_engine, sample_collaborative_session):
        """Test different facilitation strategies"""
        strategies = ["silent_observer", "active_moderator", "knowledge_synthesizer", "devil_advocate"]
        
        test_dynamics = {
            "participation_balance": 0.8,
            "knowledge_sharing_rate": 0.7,
            "conflict_level": 0.2,
            "engagement_level": 0.7,
            "quiet_participants": [],
            "dominant_speakers": []
        }
        
        for strategy in strategies:
            if strategy in interaction_engine.facilitation_strategies:
                actions = await interaction_engine.facilitation_strategies[strategy](
                    sample_collaborative_session, test_dynamics
                )
                
                assert isinstance(actions, list)
                # Each action should have required fields
                for action in actions:
                    assert "type" in action
                    assert "timing" in action

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestGroupDynamicsMonitor:
    """Test suite for group dynamics monitoring"""
    
    @pytest.fixture
    def dynamics_monitor(self):
        return GroupDynamicsMonitor()
    
    @pytest.mark.asyncio
    async def test_analyze_dynamics(self, dynamics_monitor, sample_collaborative_session):
        """Test group dynamics analysis"""
        result = await dynamics_monitor.analyze_dynamics(sample_collaborative_session)
        
        required_keys = [
            "participation_balance", "interaction_quality", "engagement_level",
            "knowledge_sharing_rate", "conflict_level", "collaboration_effectiveness"
        ]
        
        for key in required_keys:
            assert key in result
            if isinstance(result[key], (int, float)):
                assert 0 <= result[key] <= 1
                
    @pytest.mark.asyncio
    async def test_participation_analysis(self, dynamics_monitor, sample_collaborative_session):
        """Test participation pattern analysis"""
        # Add more interactions to test
        sample_collaborative_session.interaction_history.extend([
            {
                "participant_id": "user_1",
                "content": "Another contribution from Alice",
                "timestamp": datetime.now(),
                "type": "contribution"
            },
            {
                "participant_id": "user_1",
                "content": "And another one from Alice",
                "timestamp": datetime.now(), 
                "type": "contribution"
            }
        ])
        
        participation = await dynamics_monitor._analyze_participation(sample_collaborative_session)
        
        assert "balance_score" in participation
        assert "quiet_participants" in participation
        assert "dominant_speakers" in participation
        assert "contribution_distribution" in participation
        
        # Alice should be identified as dominant speaker (3 out of 4 contributions)
        dominant_ids = [p.get("id") for p in participation["dominant_speakers"]]
        assert "user_1" in dominant_ids

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestMetacognitionEngine:
    """Test suite for metacognition engine"""
    
    @pytest.fixture
    def metacognition_engine(self):
        return MetacognitionEngine()
    
    @pytest.fixture
    def sample_learning_session(self):
        return {
            "responses": [
                {
                    "content": "I think this is correct because of the pattern I see",
                    "timestamp": datetime.now(),
                    "type": "reasoning"
                },
                {
                    "content": "Wait, actually I need to reconsider this approach",
                    "timestamp": datetime.now(),
                    "type": "self_correction"
                },
                {
                    "content": "Why does this method work better than the previous one?",
                    "timestamp": datetime.now(),
                    "type": "questioning"
                }
            ],
            "time_metrics": {
                "average_response_time": 25,
                "total_time": 300
            },
            "strategies_applied": ["elaboration", "reflection", "questioning"],
            "performance": {
                "elaboration_score": 0.8,
                "reflection_score": 0.7,
                "questioning_score": 0.9
            }
        }
    
    @pytest.fixture
    def sample_student_profile(self):
        return {
            "id": "student_123",
            "learning_style": "reflective",
            "performance_history": [0.6, 0.7, 0.8],
            "preferences": {"feedback_frequency": "high"}
        }
    
    @pytest.mark.asyncio
    async def test_metacognitive_analysis(self, metacognition_engine, sample_learning_session, sample_student_profile):
        """Test comprehensive metacognitive analysis"""
        result = await metacognition_engine.metacognitive_analysis(
            sample_learning_session, sample_student_profile
        )
        
        required_keys = [
            "thinking_patterns", "strategy_effectiveness", "self_awareness_insights",
            "reflection_prompts", "recommendations", "metacognitive_score", "growth_opportunities"
        ]
        
        for key in required_keys:
            assert key in result
            
        assert 0 <= result["metacognitive_score"] <= 1
        assert isinstance(result["reflection_prompts"], list)
        assert isinstance(result["recommendations"], list)
        assert isinstance(result["growth_opportunities"], list)
        
    @pytest.mark.asyncio
    async def test_thinking_pattern_analysis(self, metacognition_engine, sample_learning_session):
        """Test thinking pattern analysis"""
        patterns = await metacognition_engine._analyze_thinking_patterns(sample_learning_session)
        
        assert "thinking_style" in patterns
        assert "response_depth" in patterns
        assert "reflection_frequency" in patterns
        assert "self_correction" in patterns
        assert "question_asking" in patterns
        
        # Should detect self-correction and questioning
        assert patterns["self_correction"] >= 1
        assert patterns["question_asking"] >= 1
        
    @pytest.mark.asyncio
    async def test_self_awareness_insights_generation(self, metacognition_engine):
        """Test self-awareness insights generation"""
        thinking_analysis = {
            "thinking_style": "deep_reflective",
            "reflection_frequency": 3,
            "self_correction": 2,
            "question_asking": 4
        }
        
        strategy_evaluation = {
            "overall_effectiveness": 0.8,
            "strategy_diversity": 4
        }
        
        insights = await metacognition_engine._generate_self_awareness_insights(
            thinking_analysis, strategy_evaluation
        )
        
        assert "awareness_level" in insights
        assert "strengths_awareness" in insights
        assert "weaknesses_awareness" in insights
        assert 0 <= insights["awareness_level"] <= 1
        
        # Should have high awareness level given the inputs
        assert insights["awareness_level"] > 0.7

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestAdvancedLearningVisualization:
    """Test suite for advanced learning visualization"""
    
    @pytest.fixture
    def learning_viz(self):
        return AdvancedLearningVisualization()
    
    @pytest.fixture
    def sample_learning_data(self):
        return {
            "concepts": ["Machine Learning", "Neural Networks", "Deep Learning", "AI Ethics"],
            "relationships": [
                {"source": 0, "target": 1, "strength": 0.8},
                {"source": 1, "target": 2, "strength": 0.9},
                {"source": 0, "target": 3, "strength": 0.6}
            ],
            "student_progress": [0.2, 0.5, 0.8, 0.3],
            "difficulty_levels": [0.3, 0.7, 0.9, 0.5]
        }
    
    @pytest.mark.asyncio
    async def test_create_learning_visualization(self, learning_viz, sample_learning_data):
        """Test learning visualization creation"""
        viz_types = ["concept_map", "learning_journey", "knowledge_growth", "skill_radar"]
        
        for viz_type in viz_types:
            result = await learning_viz.create_learning_visualization(
                sample_learning_data, viz_type
            )
            
            assert "visualization_type" in result
            assert "structure" in result
            assert "interactive_elements" in result
            assert "visual_data" in result
            assert "metadata" in result
            
            assert result["visualization_type"] == viz_type
            assert isinstance(result["interactive_elements"], list)
            
    @pytest.mark.asyncio
    async def test_visualization_structure_generation(self, learning_viz, sample_learning_data):
        """Test visualization structure generation"""
        network_template = {"type": "network", "layout": "hierarchical"}
        structure = await learning_viz._generate_visualization_structure(
            sample_learning_data, network_template
        )
        
        assert "nodes" in structure
        assert "edges" in structure
        assert "layout" in structure
        
        # Should have nodes for each concept
        assert len(structure["nodes"]) == len(sample_learning_data["concepts"])
        
        # Each node should have required properties
        for node in structure["nodes"]:
            assert "id" in node
            assert "label" in node
            assert "size" in node
            
    @pytest.mark.asyncio
    async def test_interactive_elements_addition(self, learning_viz, sample_learning_data):
        """Test addition of interactive elements"""
        structure = {
            "nodes": [
                {"id": 0, "label": "Test Concept"},
                {"id": 1, "label": "Another Concept"}
            ],
            "edges": []
        }
        
        interactive_elements = await learning_viz._add_interactive_elements(
            structure, sample_learning_data
        )
        
        assert len(interactive_elements) > 0
        
        # Should have hover tooltips for nodes
        tooltip_elements = [e for e in interactive_elements if e["type"] == "hover_tooltip"]
        assert len(tooltip_elements) == len(structure["nodes"])
        
        # Should have navigation elements
        nav_elements = [e for e in interactive_elements if e["type"] == "navigation"]
        assert len(nav_elements) > 0

@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestCollaborativeEngine:
    """Test suite for main collaborative engine"""
    
    @pytest.fixture
    def collaborative_engine(self):
        return CollaborativeEngine()
    
    @pytest.mark.asyncio
    async def test_create_collaborative_session(self, collaborative_engine, sample_participants):
        """Test collaborative session creation"""
        result = await collaborative_engine.create_collaborative_session(
            sample_participants,
            topic="Test Collaboration Topic",
            mode=CollaborationMode.PEER_LEARNING,
            auto_form_groups=True
        )
        
        assert "session_ids" in result
        assert "sessions" in result
        assert "collaboration_plan" in result
        assert "group_formation" in result
        assert "estimated_outcomes" in result
        
        assert len(result["session_ids"]) > 0
        assert len(result["sessions"]) == len(result["session_ids"])
        
    @pytest.mark.asyncio
    async def test_collaboration_plan_generation(self, collaborative_engine, sample_collaborative_session):
        """Test collaboration plan generation"""
        plan = await collaborative_engine._generate_collaboration_plan(
            sample_collaborative_session, CollaborationMode.PEER_LEARNING
        )
        
        assert "total_duration" in plan
        assert "phases" in plan
        assert "success_criteria" in plan
        assert "facilitation_guidelines" in plan
        
        assert len(plan["phases"]) > 0
        
        # Each phase should have required properties
        for phase in plan["phases"]:
            assert "name" in phase
            assert "duration" in phase
            assert "activities" in phase
            
        # Total duration should match sum of phase durations
        calculated_duration = sum(p["duration"] for p in plan["phases"])
        assert plan["total_duration"] == calculated_duration

# Integration tests
@pytest.mark.skipif(not IMPORTS_AVAILABLE, reason="Required modules not available")
class TestIntegrationScenarios:
    """Integration tests for complete collaborative learning scenarios"""
    
    @pytest.mark.asyncio
    async def test_complete_collaboration_workflow(self, sample_participants):
        """Test complete collaboration workflow from start to finish"""
        engine = CollaborativeEngine()
        
        # 1. Create collaborative session
        session_result = await engine.create_collaborative_session(
            sample_participants,
            topic="AI in Education",
            mode=CollaborationMode.PEER_LEARNING
        )
        
        assert "error" not in session_result
        session = session_result["sessions"][0]
        
        # 2. Facilitate interactions
        facilitation_result = await engine.interaction_engine.facilitate_collaboration(
            session, "adaptive"
        )
        
        assert "error" not in facilitation_result
        
        # 3. Monitor dynamics
        dynamics = await engine.interaction_engine.group_dynamics_monitor.analyze_dynamics(session)
        
        assert "error" not in dynamics
        assert "participation_balance" in dynamics
        
        # 4. Analyze effectiveness (if analytics available)
        if hasattr(engine, 'collaboration_analytics'):
            effectiveness = await engine.collaboration_analytics.analyze_collaboration_effectiveness(
                session.session_id
            )
            # Note: This might return an error due to missing session data, which is acceptable
    
    @pytest.mark.asyncio 
    async def test_metacognitive_learning_integration(self):
        """Test integration of metacognitive analysis with collaborative learning"""
        metacognition = MetacognitionEngine()
        
        learning_session = {
            "responses": [
                {"content": "I learned that collaboration improves understanding", "type": "reflection"},
                {"content": "Why do different perspectives help so much?", "type": "questioning"}
            ],
            "time_metrics": {"average_response_time": 30},
            "strategies_applied": ["collaboration", "reflection"],
            "performance": {"collaboration_score": 0.8, "reflection_score": 0.7}
        }
        
        student_profile = {
            "id": "test_student", 
            "learning_style": "collaborative",
            "performance_history": [0.6, 0.7, 0.8]
        }
        
        result = await metacognition.metacognitive_analysis(learning_session, student_profile)
        
        assert "error" not in result
        assert result["metacognitive_score"] > 0.5  # Should show good metacognitive development

if __name__ == "__main__":
    # Run specific test if module is available
    if IMPORTS_AVAILABLE:
        print("Running collaboration engine tests...")
        pytest.main([__file__, "-v"])
    else:
        print("Required modules not available. Skipping tests.")
