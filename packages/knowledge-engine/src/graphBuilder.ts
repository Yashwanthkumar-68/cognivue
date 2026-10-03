import { ConceptNode, ConceptEdge, KnowledgeGraph } from '@learnlens/schemas';

export class GraphBuilder {
  static computePrerequisiteChains(nodes: ConceptNode[], edges: ConceptEdge[]): Map<string, string[]> {
    const prereqMap = new Map<string, string[]>();
    for (const node of nodes) {
      prereqMap.set(node.id, []);
    }

    for (const edge of edges) {
      if (edge.type === 'prerequisite') {
        const current = prereqMap.get(edge.target) || [];
        current.push(edge.source);
        prereqMap.set(edge.target, current);
      }
    }
    return prereqMap;
  }

  static getTopologicalSort(nodes: ConceptNode[], edges: ConceptEdge[]): string[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const edge of edges) {
      if (edge.type === 'prerequisite' || edge.type === 'leads_to') {
        const list = adj.get(edge.source) || [];
        list.push(edge.target);
        adj.set(edge.source, list);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);
      for (const v of adj.get(u) || []) {
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    return order.length === nodes.length ? order : nodes.map(n => n.id);
  }
}
