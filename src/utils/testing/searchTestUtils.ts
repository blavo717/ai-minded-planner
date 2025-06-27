
import { Task } from '@/hooks/useTasks';

export interface SearchTestQuery {
  query: string;
  expectedRelevance: Array<{ taskId: string; minScore: number }>;
  description: string;
}

export class SearchTestUtils {
  static createMockLLMResponse(taskIds: string[], scores: number[], reasons: string[]) {
    return {
      content: JSON.stringify(
        taskIds.map((taskId, index) => ({
          task_id: taskId,
          relevance_score: scores[index] || 50,
          reason: reasons[index] || 'Mock response'
        }))
      )
    };
  }

  static generateTestQueries(): SearchTestQuery[] {
    return [
      {
        query: 'tareas urgentes',
        expectedRelevance: [],
        description: 'Should find high priority tasks'
      },
      {
        query: 'tareas pendientes',
        expectedRelevance: [],
        description: 'Should find pending status tasks'
      },
      {
        query: 'proyectos completados',
        expectedRelevance: [],
        description: 'Should find completed project tasks'
      },
      {
        query: 'tareas que vencen esta semana',
        expectedRelevance: [],
        description: 'Should find tasks due this week'
      },
      {
        query: 'desarrollo backend',
        expectedRelevance: [],
        description: 'Should find development-related tasks'
      }
    ];
  }

  static validateSearchResults(results: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (!result.task_id) {
        errors.push(`Result ${index} missing task_id`);
      }
      if (typeof result.relevance_score !== 'number') {
        errors.push(`Result ${index} missing or invalid relevance_score`);
      }
      if (result.relevance_score < 0 || result.relevance_score > 100) {
        errors.push(`Result ${index} relevance_score out of range (0-100)`);
      }
      if (!result.reason) {
        errors.push(`Result ${index} missing reason`);
      }
    });

    // Check if results are ordered by relevance (descending)
    for (let i = 1; i < results.length; i++) {
      if (results[i].relevance_score > results[i - 1].relevance_score) {
        errors.push(`Results not properly ordered by relevance at index ${i}`);
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static simulateTypingDelay(query: string): Promise<void> {
    // Simulate realistic typing speed (100-200ms per character)
    const delay = query.length * (100 + Math.random() * 100);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  static createFallbackSearchMock(tasks: Task[], query: string) {
    const searchTerm = query.toLowerCase();
    return tasks
      .filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .map(task => ({
        task,
        relevanceScore: 50,
        reason: 'Fallback text search'
      }));
  }
}
