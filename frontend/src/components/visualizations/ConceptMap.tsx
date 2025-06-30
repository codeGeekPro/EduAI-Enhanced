import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

// Interface pour définir la structure des données attendues
export interface ConceptMapData {
  nodes: { id: string; group: string; size?: number }[];
  links: { source: string; target: string; value: number }[];
}

interface ConceptMapProps {
  data: ConceptMapData;
}

type ConceptMapNode = {
  id: string;
  group: string;
  degree: number;
  size?: number;
  x: number;
  y: number;
};

const ConceptMap: React.FC<ConceptMapProps> = ({ data }) => {
  const ref = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Utilisation de useMemo pour ne recalculer les données que si elles changent
  const processedData = useMemo(() => {
    // Ajoute une propriété 'degree' à chaque noeud pour la taille
    const nodes = data.nodes.map(n => ({ ...n, degree: 0 }));
    data.links.forEach(l => {
      const sourceNode = nodes.find(n => n.id === l.source);
      const targetNode = nodes.find(n => n.id === l.target);
      if (sourceNode) sourceNode.degree += 1;
      if (targetNode) targetNode.degree += 1;
    });
    return { nodes, links: data.links };
  }, [data]);


  useEffect(() => {
    if (!ref.current || !containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();

    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; user-select: none;')
      .attr('tabindex', 0) // Rendre le SVG focusable
      .attr('role', 'group')
      .attr('aria-label', 'Carte conceptuelle interactive. Utilisez les flèches pour naviguer, Entrée pour sélectionner, Échap pour désélectionner.');

    // Clear previous render
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(processedData.nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(processedData.links).id((d: any) => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    // Définir un marqueur pour les flèches
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 23)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(processedData.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrowhead)');

    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(processedData.nodes)
      .join('g');

    const node = nodeGroup.append('circle')
      .attr('r', d => 5 + (d.size || d.degree || 1) * 2) // Taille dynamique
      .attr('fill', d => d.group === 'main' ? 'hsl(45, 90%, 55%)' : 'hsl(210, 80%, 60%)')
      .attr('stroke', d => d.group === 'main' ? 'hsl(45, 100%, 45%)' : 'hsl(210, 100%, 50%)')
      .attr('stroke-width', 2)
      .attr('role', 'button')
      .attr('aria-label', d => `Concept: ${d.id}`);

    const labels = nodeGroup.append('text')
      .text(d => d.id)
      .attr('x', 0)
      .attr('y', d => - (10 + (d.size || d.degree || 1) * 2))
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .attr('paint-order', 'stroke')
      .attr('stroke', 'white')
      .attr('stroke-width', '3px');

    nodeGroup.append('title')
      .text(d => `Concept: ${d.id}
Groupe: ${d.group}`);

    // Création de l'info-bulle (tooltip)
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(255, 255, 255, 0.95)")
      .style("border", "1px solid #ccc")
      .style("border-radius", "8px")
      .style("padding", "12px")
      .style("font-family", "sans-serif")
      .style("font-size", "14px")
      .style("color", "#333")
      .style("box-shadow", "0 4px 8px rgba(0,0,0,0.1)")
      .style("pointer-events", "none") // Important pour ne pas interférer avec les autres événements de la souris
      .style("transition", "opacity 0.2s");

    // --- Interactivité de survol et de clic ---
    const linkedByIndex = new Map();
    processedData.links.forEach(d => {
        linkedByIndex.set(`${d.source},${d.target}`, 1);
    });

    let focusedNode: any = null;
    let keyboardHoveredNode: any = null; // Pour la navigation au clavier

    function isConnected(a: any, b: any) {
        return linkedByIndex.has(`${a.id},${b.id}`) || linkedByIndex.has(`${b.id},${a.id}`) || a.id === b.id;
    }

    function handleMouseOver(event: any, d: any) {
        if (focusedNode && focusedNode.id === d.id) return; // Ne pas changer l'opacité du noeud focus

        node.style('opacity', o => isConnected(d, o) ? 1 : 0.2);
        labels.style('opacity', o => isConnected(d, o) ? 1 : 0.2);
        link
            .style('stroke-opacity', o => o.source === d || o.target === d ? 1 : 0.1)
            .style('stroke', o => o.source === d || o.target === d ? '#333' : '#999');
        
        // Afficher et positionner l'info-bulle
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`<strong>${d.id}</strong><br/>Groupe: ${d.group}<br/>Connexions: ${d.degree}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function handleMouseOut() {
        // Cacher l'info-bulle
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);

        if (focusedNode) {
            // Garder le focus visible
            node.style('opacity', o => isConnected(focusedNode, o) ? 1 : 0.2);
            labels.style('opacity', o => isConnected(focusedNode, o) ? 1 : 0.2);
            link
                .style('stroke-opacity', o => o.source === focusedNode || o.target === focusedNode ? 1 : 0.1)
                .style('stroke', o => o.source === focusedNode || o.target === focusedNode ? '#333' : '#999');
        } else {
            node.style('opacity', 1);
            labels.style('opacity', 1);
            link.style('stroke-opacity', 0.8).style('stroke', '#999');
        }
    }

    function handleNodeClick(event: any, d: any) {
        if (event.defaultPrevented) return; // Ignorer le clic après un glisser-déposer

        // Gérer le focus
        if (focusedNode && focusedNode.id === d.id) {
            // Si on clique sur le noeud déjà focus, on déselectionne
            resetFocusAndZoom();
            return;
        }

        // Enlever le focus du noeud précédent
        if (focusedNode) {
            node.filter(n => n.id === focusedNode.id)
                .attr('stroke-width', 2)
                .attr('stroke', n => n.group === 'main' ? 'hsl(45, 100%, 45%)' : 'hsl(210, 100%, 50%)');
        }

        // Mettre le focus sur le nouveau noeud
        focusedNode = d;
        const selectedNode = node.filter(n => n.id === d.id);
        selectedNode.attr('stroke-width', 4)
            .attr('stroke', 'hsl(330, 100%, 70%)'); // Couleur de surbrillance

        // Appliquer l'effet de survol pour le noeud focus
        handleMouseOver(event, d);

        // Zoomer sur le noeud
        const scale = 2;
        const x = width / 2 - d.x * scale;
        const y = height / 2 - d.y * scale;

        svg.transition().duration(750).call(
            zoom.transform as any,
            d3.zoomIdentity.translate(x, y).scale(scale)
        );
    }

    function resetFocusAndZoom() {
        // Enlever le focus
        if (focusedNode) {
            node.filter(n => n.id === focusedNode.id)
                .attr('stroke-width', 2)
                .attr('stroke', n => n.group === 'main' ? 'hsl(45, 100%, 45%)' : 'hsl(210, 100%, 50%)');
            focusedNode = null;
        }
        // Restaurer l'apparence par défaut
        handleMouseOut();
        // Réinitialiser le zoom
        svg.transition().duration(750).call(
            zoom.transform as any,
            d3.zoomIdentity
        );
    }

    // --- Gestion de la navigation au clavier ---
    function findClosestNode(currentNode: any, direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
        if (!currentNode) return processedData.nodes[0];

        let closestNode: any = null;
        let minDistance = Infinity;

        (processedData.nodes as any[]).forEach(node => {
            if (node.id === currentNode.id) return;

            const dx = node.x - currentNode.x;
            const dy = node.y - currentNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let isDirectionMatch = false;
            switch (direction) {
                case 'ArrowUp': isDirectionMatch = dy < 0 && Math.abs(dy) > Math.abs(dx); break;
                case 'ArrowDown': isDirectionMatch = dy > 0 && Math.abs(dy) > Math.abs(dx); break;
                case 'ArrowLeft': isDirectionMatch = dx < 0 && Math.abs(dx) > Math.abs(dy); break;
                case 'ArrowRight': isDirectionMatch = dx > 0 && Math.abs(dx) > Math.abs(dy); break;
            }

            if (isDirectionMatch && distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        });

        return closestNode || currentNode; // Retourne le plus proche ou le courant s'il n'y en a pas
    }

    function highlightNode(nodeToHighlight: any, isKeyboard: boolean = false) {
        if (!nodeToHighlight) return;

        // Simuler le survol pour l'effet visuel
        handleMouseOver({} as MouseEvent, nodeToHighlight);

        // Mettre en évidence le noeud pour l'accessibilité
        node.attr('stroke', d => d.id === nodeToHighlight.id ? '#000' : (d.group === 'main' ? 'hsl(45, 100%, 45%)' : 'hsl(210, 100%, 50%)'))
            .attr('stroke-width', d => d.id === nodeToHighlight.id ? 3 : 2);
        
        if (isKeyboard) {
            keyboardHoveredNode = nodeToHighlight;
        }
    }

    svg.on('keydown', (event: KeyboardEvent) => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(event.key)) return;
        event.preventDefault();

        const startNode = keyboardHoveredNode || focusedNode || processedData.nodes[0];

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                const nextNode = findClosestNode(startNode, event.key);
                if (nextNode) {
                    highlightNode(nextNode, true);
                }
                break;
            case 'Enter':
                if (keyboardHoveredNode) {
                    handleNodeClick({} as MouseEvent, keyboardHoveredNode);
                }
                break;
            case 'Escape':
                resetFocusAndZoom();
                node.attr('stroke', d => d.group === 'main' ? 'hsl(45, 100%, 45%)' : 'hsl(210, 100%, 50%)').attr('stroke-width', 2);
                handleMouseOut();
                keyboardHoveredNode = null;
                break;
        }
    });


    nodeGroup
        .on('mouseover', (event, d) => {
            keyboardHoveredNode = null; // La souris prend le dessus
            handleMouseOver(event, d);
        })
        .on('mouseout', handleMouseOut)
        .on('click', handleNodeClick);

    // --- Fin de l'interactivité ---


    // Drag & Drop
    const drag = (simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) => {
      function dragstarted(event: d3.D3DragEvent<Element, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: d3.D3DragEvent<Element, any, any>, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: d3.D3DragEvent<Element, any, any>, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    }
    nodeGroup.call(drag(simulation) as any);

    // Zoom & Pan
    const zoom = d3.zoom()
      .scaleExtent([0.3, 5])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });
    svg.call(zoom as any);
    svg.on('dblclick.zoom', null); // Désactiver le zoom par double-clic par défaut
    svg.on('dblclick', resetFocusAndZoom);


    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

  }, [processedData]); // Se ré-exécute si les données changent

  return (
    <div ref={containerRef} style={{ width: '100%', height: '500px', position: 'relative' }}>
      <svg ref={ref} aria-label="Carte conceptuelle interactive"></svg>
    </div>
  );
};

export default ConceptMap;
