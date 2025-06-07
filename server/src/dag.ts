import fs from 'fs/promises';
import { db } from "../../shared/db";

export interface DependencyGraph {
  [clusterId: number]: number[];
}

let graph: DependencyGraph = {};

/**
 * Load dependency graph from JSON file.
 * The file should contain an object mapping cluster ids to arrays of
 * prerequisite cluster ids. Example: { "2": [1], "3": [2] }.
 */
export async function loadGraph(filePath: string) {
  const json = await fs.readFile(filePath, 'utf8');
  graph = JSON.parse(json);
}

// helper for tests to inject a graph without reading from disk
export function setGraph(g: DependencyGraph) {
  graph = g;
}

function collectPrereqs(id: number, visited = new Set<number>()) {
  const deps = graph[id] || [];
  for (const d of deps) {
    if (!visited.has(d)) {
      visited.add(d);
      collectPrereqs(d, visited);
    }
  }
  return visited;
}

/**
 * Return true if all prerequisite clusters are mastered for the user.
 */
export async function canUnlock(userId: number, clusterId: number): Promise<boolean> {
  const prereqs = Array.from(collectPrereqs(clusterId));
  for (const pre of prereqs) {
    const state = await db.clusterState.findFirst({ where: { userId, clusterId: pre } });
    if (!state || !state.mastered) {
      return false;
    }
  }
  return true;
}
