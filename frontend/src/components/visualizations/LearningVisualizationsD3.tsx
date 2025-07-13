/**
 * 🎨 Visualisations D3.js pour l'Apprentissage Immersif
 * Graphiques interactifs et animations sophistiquées
 */

import * as d3 from 'd3';
import { useEffect, useRef, useState, useCallback } from 'react';

// Types pour les données de visualisation
export interface LearningNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'concept' | 'skill' | 'topic' | 'achievement';
  level: number;
  mastery: number; // 0-1
  connections: string[];
  position?: { x: number; y: number };
  color?: string;
  size?: number;
  // d3.SimulationNodeDatum properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LearningPath {
  id: string;
  nodes: LearningNode[];
  progress: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ProgressData {
  date: Date;
  score: number;
  topics: string[];
  timeSpent: number;
}

/**
 * 🌐 Hook pour graphique de réseau de connaissances
 */
export const useKnowledgeNetwork = (
  nodes: LearningNode[],
  width: number = 800,
  height: number = 600
) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<LearningNode, undefined> | null>(null);

  const createNetwork = useCallback(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Nettoyer le SVG existant
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Créer les liens entre les nœuds
    const links = nodes.flatMap(node =>
      node.connections.map(targetId => ({
        source: node.id,
        target: targetId,
      }))
    ).filter(link => 
      nodes.some(node => node.id === link.target)
    );

    // Configuration de la simulation de force
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    // Conteneur principal avec zoom
    const container = svg.append('g');

    // Comportement de zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Création des liens
    const linkElements = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Création des nœuds
    const nodeElements = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, LearningNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Cercles des nœuds avec couleur basée sur la maîtrise
    nodeElements.append('circle')
      .attr('r', d => 10 + d.level * 5)
      .attr('fill', d => {
        const hue = d.mastery * 120; // Vert pour maîtrisé, rouge pour non-maîtrisé
        return `hsl(${hue}, 70%, 50%)`;
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Labels des nœuds
    nodeElements.append('text')
      .text(d => d.name)
      .attr('x', 0)
      .attr('y', 0)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .attr('pointer-events', 'none');

    // Barres de progression de maîtrise
    nodeElements.append('rect')
      .attr('x', -15)
      .attr('y', 20)
      .attr('width', 30)
      .attr('height', 4)
      .attr('fill', '#ddd')
      .attr('rx', 2);

    nodeElements.append('rect')
      .attr('x', -15)
      .attr('y', 20)
      .attr('width', d => d.mastery * 30)
      .attr('height', 4)
      .attr('fill', d => d.mastery > 0.7 ? '#4CAF50' : d.mastery > 0.4 ? '#FF9800' : '#F44336')
      .attr('rx', 2);

    // Tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('pointer-events', 'none');

    nodeElements
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`
          <strong>${d.name}</strong><br/>
          Type: ${d.type}<br/>
          Niveau: ${d.level}<br/>
          Maîtrise: ${Math.round(d.mastery * 100)}%
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Animation de la simulation
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      tooltip.remove();
    };
  }, [nodes, width, height]);

  useEffect(() => {
    return createNetwork();
  }, [createNetwork]);

  return { svgRef, simulation: simulationRef.current };
};

/**
 * 📊 Hook pour graphique de progression temporelle
 */
export const useProgressChart = (
  data: ProgressData[],
  width: number = 800,
  height: number = 400
) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Nettoyer le SVG existant
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.score) as number])
      .range([innerHeight, 0]);

    // Générateur de ligne
    const line = d3.line<ProgressData>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Générateur d'aire
    const area = d3.area<ProgressData>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Dégradé pour l'aire
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'progressGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', 0).attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3B82F6')
      .attr('stop-opacity', 0.1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3B82F6')
      .attr('stop-opacity', 0.8);

    // Aire sous la courbe
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#progressGradient)')
      .attr('d', area);

    // Ligne de progression
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Points de données
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.score))
      .attr('r', 5)
      .attr('fill', '#3B82F6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((domainValue: Date | d3.NumberValue, index: number) => {
        if (domainValue instanceof Date) {
          return d3.timeFormat('%d/%m')(domainValue);
        }
        // If domainValue is a number, convert to date if possible, else show as number
        if (typeof domainValue === 'number') {
          const date = new Date(domainValue);
          return d3.timeFormat('%d/%m')(date);
        }
        return String(domainValue);
      }));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Labels des axes
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Score de progression');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Date');

  }, [data, width, height]);

  return { svgRef };
};

/**
 * 🎯 Hook pour graphique radar de compétences
 */
export const useSkillRadarChart = (
  skills: { name: string; value: number; maxValue: number }[],
  size: number = 300
) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || skills.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = 40;
    const radius = (size - 2 * margin) / 2;
    const centerX = size / 2;
    const centerY = size / 2;

    const svg = d3.select(svgRef.current)
      .attr('width', size)
      .attr('height', size);

    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Échelle radiale
    const angleScale = d3.scaleLinear()
      .domain([0, skills.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, d3.max(skills, d => d.maxValue) as number])
      .range([0, radius]);

    // Grille circulaire
    const gridLevels = 5;
    for (let i = 1; i <= gridLevels; i++) {
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', (radius / gridLevels) * i)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    }

    // Axes
    skills.forEach((skill, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);

      // Labels
      const labelRadius = radius + 20;
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('dy', '.35em')
        .attr('text-anchor', labelX > 0 ? 'start' : 'end')
        .style('font-size', '12px')
        .text(skill.name);
    });

    // Générateur de ligne pour le radar
    const lineGenerator = d3.lineRadial<{ angle: number; radius: number }>()
      .angle(d => d.angle)
      .radius(d => d.radius)
      .curve(d3.curveLinearClosed);

    // Données pour le radar
    const radarData = skills.map((skill, i) => ({
      angle: angleScale(i),
      radius: radiusScale(skill.value),
    }));

    // Zone de compétences
    g.append('path')
      .datum(radarData)
      .attr('d', lineGenerator)
      .attr('fill', '#3B82F6')
      .attr('fill-opacity', 0.3)
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2);

    // Points de données
    g.selectAll('.skill-point')
      .data(radarData)
      .enter().append('circle')
      .attr('class', 'skill-point')
      .attr('cx', d => Math.cos(d.angle - Math.PI / 2) * d.radius)
      .attr('cy', d => Math.sin(d.angle - Math.PI / 2) * d.radius)
      .attr('r', 4)
      .attr('fill', '#3B82F6')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

  }, [skills, size]);

  return { svgRef };
};

/**
 * 🌊 Hook pour graphique en cascade (learning milestones)
 */
export const useMilestoneWaterfall = (
  milestones: { name: string; value: number; cumulative: number }[],
  width: number = 600,
  height: number = 400
) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || milestones.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3.scaleBand()
      .domain(milestones.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(milestones, d => d.cumulative) as number])
      .range([innerHeight, 0]);

    // Barres
    g.selectAll('.milestone-bar')
      .data(milestones)
      .enter().append('rect')
      .attr('class', 'milestone-bar')
      .attr('x', d => xScale(d.name) as number)
      .attr('y', d => yScale(d.cumulative))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.cumulative))
      .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
      .attr('opacity', 0.7);

    // Connecteurs
    for (let i = 0; i < milestones.length - 1; i++) {
      const current = milestones[i];
      const next = milestones[i + 1];
      
      const x1 = (xScale(current.name) as number) + xScale.bandwidth();
      const x2 = xScale(next.name) as number;
      const y = yScale(current.cumulative);

      g.append('line')
        .attr('x1', x1)
        .attr('x2', x2)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3');
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    g.append('g')
      .call(d3.axisLeft(yScale));

  }, [milestones, width, height]);

  return { svgRef };
};

/**
 * 🎮 Composant React pour visualisations interactives
 */
export const InteractiveLearningViz: React.FC<{
  data: LearningNode[];
  progressData: ProgressData[];
  skills: { name: string; value: number; maxValue: number }[];
}> = ({ data, progressData, skills }) => {
  const [activeView, setActiveView] = useState<'network' | 'progress' | 'skills'>('network');
  
  const { svgRef: networkRef } = useKnowledgeNetwork(data);
  const { svgRef: progressRef } = useProgressChart(progressData);
  const { svgRef: skillsRef } = useSkillRadarChart(skills);

  return (
    <div className="learning-visualizations">
      <div className="visualization-controls">
        <button 
          onClick={() => setActiveView('network')}
          className={`btn ${activeView === 'network' ? 'active' : ''}`}
        >
          Réseau de Connaissances
        </button>
        <button 
          onClick={() => setActiveView('progress')}
          className={`btn ${activeView === 'progress' ? 'active' : ''}`}
        >
          Progression Temporelle
        </button>
        <button 
          onClick={() => setActiveView('skills')}
          className={`btn ${activeView === 'skills' ? 'active' : ''}`}
        >
          Radar de Compétences
        </button>
      </div>

      <div className="visualization-container">
        {activeView === 'network' && (
          <div className="network-view">
            <h3>Réseau de Connaissances Interactif</h3>
            <svg ref={networkRef}></svg>
          </div>
        )}
        
        {activeView === 'progress' && (
          <div className="progress-view">
            <h3>Évolution de la Progression</h3>
            <svg ref={progressRef}></svg>
          </div>
        )}
        
        {activeView === 'skills' && (
          <div className="skills-view">
            <h3>Profil de Compétences</h3>
            <svg ref={skillsRef}></svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveLearningViz;
