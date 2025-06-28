import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ConceptMap: React.FC = () => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const data = {
      nodes: [
        { id: 'IA', group: 'main' },
        { id: 'ML', group: 'sub' },
        { id: 'DL', group: 'sub' },
        { id: 'NLP', group: 'sub' },
        { id: 'Vision', group: 'sub' },
      ],
      links: [
        { source: 'IA', target: 'ML', value: 1 },
        { source: 'IA', target: 'DL', value: 1 },
        { source: 'ML', target: 'DL', value: 1 },
        { source: 'IA', target: 'NLP', value: 1 },
        { source: 'IA', target: 'Vision', value: 1 },
      ],
    };

    const width = 500;
    const height = 300;

    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid black');

    // Clear previous render
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => d.group === 'main' ? 'red' : 'blue');

    node.append('title')
      .text((d: any) => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

  }, []);

  return <svg ref={ref}></svg>;
};

export default ConceptMap;
