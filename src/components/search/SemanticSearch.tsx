
import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useLLMService } from '@/hooks/useLLMService';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/use-toast';
import Logger, { LogCategory } from '@/utils/logger';
import { PerformanceMonitor } from '@/utils/performanceMonitor';
import { SearchTestUtils } from '@/utils/testing/searchTestUtils';

interface SemanticSearchProps {
  tasks: Task[];
  projects: Project[];
  onTaskSelect?: (task: Task) => void;
  onSearchResults?: (results: Task[]) => void;
}

interface SearchResult {
  task: Task;
  relevanceScore: number;
  reason: string;
}

const SemanticSearch = ({ tasks, projects, onTaskSelect, onSearchResults }: SemanticSearchProps) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  
  const { makeLLMRequest } = useLLMService();
  const debouncedQuery = useDebounce(query, 500);

  const performSemanticSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || tasks.length === 0) {
      Logger.debug(LogCategory.AI_SEARCH, 'Search skipped', {
        queryLength: searchQuery.trim().length,
        taskCount: tasks.length
      });
      setSearchResults([]);
      onSearchResults?.([]); 
      return;
    }

    Logger.info(LogCategory.AI_SEARCH, 'Starting semantic search', {
      query: searchQuery,
      taskCount: tasks.length
    });

    setIsSearching(true);
    setFallbackUsed(false);

    return PerformanceMonitor.measureAsync('semantic-search', async () => {
      try {
        const tasksContext = tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          tags: task.tags || [],
          project_name: projects.find(p => p.id === task.project_id)?.name || 'Sin proyecto',
          due_date: task.due_date,
          created_at: task.created_at
        }));

        const systemPrompt = `Eres un asistente de búsqueda semántica especializado en encontrar tareas relevantes basándote en consultas en lenguaje natural.

Analiza la consulta del usuario y encuentra las tareas más relevantes considerando:
1. Similitud semántica en título y descripción
2. Contexto del proyecto
3. Estado y prioridad de las tareas
4. Etiquetas y metadatos
5. Fechas relevantes

Responde SOLO con un JSON válido con un array de objetos que tengan:
- task_id: string (ID de la tarea)
- relevance_score: number (0-100, donde 100 es más relevante)
- reason: string (explicación breve de por qué es relevante)

Máximo 10 resultados, ordenados por relevancia descendente.`;

        const userPrompt = `Consulta de búsqueda: "${searchQuery}"

Tareas disponibles:
${JSON.stringify(tasksContext, null, 2)}

Encuentra las tareas más relevantes para esta consulta.`;

        Logger.debug(LogCategory.AI_SEARCH, 'Making LLM request', {
          systemPromptLength: systemPrompt.length,
          userPromptLength: userPrompt.length,
          tasksContextCount: tasksContext.length
        });

        const response = await makeLLMRequest({
          systemPrompt,
          userPrompt,
          functionName: 'semantic-search'
        });

        const results = JSON.parse(response.content);
        const validation = SearchTestUtils.validateSearchResults(results);
        
        if (!validation.valid) {
          Logger.error(LogCategory.AI_SEARCH, 'Invalid LLM response', {
            query: searchQuery,
            errors: validation.errors,
            responseLength: response.content.length
          });
          throw new Error(`Invalid LLM response: ${validation.errors.join(', ')}`);
        }

        const searchResults: SearchResult[] = results
          .map((result: any) => {
            const task = tasks.find(t => t.id === result.task_id);
            if (!task) return null;
            
            return {
              task,
              relevanceScore: result.relevance_score,
              reason: result.reason
            };
          })
          .filter(Boolean)
          .sort((a: SearchResult, b: SearchResult) => b.relevanceScore - a.relevanceScore);

        Logger.info(LogCategory.AI_SEARCH, 'LLM search completed', {
          query: searchQuery,
          resultsCount: searchResults.length,
          avgRelevanceScore: searchResults.length > 0 
            ? searchResults.reduce((sum, r) => sum + r.relevanceScore, 0) / searchResults.length 
            : 0
        });

        setSearchResults(searchResults);
        onSearchResults?.(searchResults.map(r => r.task));

        // Add to search history
        if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
          setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
        }

        return { success: true, count: searchResults.length };

      } catch (error) {
        Logger.error(LogCategory.AI_SEARCH, 'LLM search failed, using fallback', {
          query: searchQuery,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Fallback to simple text search
        const fallbackResults = SearchTestUtils.createFallbackSearchMock(tasks, searchQuery);
        
        Logger.info(LogCategory.AI_SEARCH, 'Fallback search completed', {
          query: searchQuery,
          resultsCount: fallbackResults.length
        });

        setSearchResults(fallbackResults);
        setFallbackUsed(true);
        onSearchResults?.(fallbackResults.map(r => r.task));

        toast({
          title: "Búsqueda con fallback",
          description: "La IA no está disponible, usando búsqueda por texto.",
          variant: "default",
        });

        return { success: false, count: fallbackResults.length };
      }
    }, { query: searchQuery, taskCount: tasks.length }).finally(() => {
      setIsSearching(false);
    });
  }, [tasks, projects, makeLLMRequest, onSearchResults, searchHistory]);

  useEffect(() => {
    if (debouncedQuery) {
      Logger.debug(LogCategory.AI_SEARCH, 'Debounced query triggered', {
        query: debouncedQuery,
        delay: 500
      });
      performSemanticSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      onSearchResults?.([]);
    }
  }, [debouncedQuery, performSemanticSearch]);

  const clearSearch = () => {
    Logger.info(LogCategory.AI_SEARCH, 'Search cleared');
    setQuery('');
    setSearchResults([]);
    setFallbackUsed(false);
    onSearchResults?.([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Busca tareas con lenguaje natural (ej: 'tareas urgentes de esta semana', 'proyectos pendientes')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {fallbackUsed && (
            <Badge variant="outline" className="text-xs px-1 py-0">
              Texto
            </Badge>
          )}
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && !query && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Búsquedas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(historyQuery)}
                  className="text-xs"
                >
                  {historyQuery}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {isSearching && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                {fallbackUsed ? 'Texto' : 'IA'}
              </Badge>
              {fallbackUsed && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                  Fallback
                </Badge>
              )}
            </div>
          </div>

          {searchResults.map((result, index) => {
            const project = projects.find(p => p.id === result.task.project_id);
            
            return (
              <Card 
                key={result.task.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  Logger.info(LogCategory.AI_SEARCH, 'Task selected from search', {
                    taskId: result.task.id,
                    relevanceScore: result.relevanceScore,
                    searchQuery: query
                  });
                  onTaskSelect?.(result.task);
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{result.task.title}</h4>
                        {result.task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {result.task.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {result.relevanceScore}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(result.task.priority)}`} />
                      <Badge variant="secondary" className={getStatusColor(result.task.status)}>
                        {result.task.status}
                      </Badge>
                      {project && (
                        <Badge variant="outline" style={{ borderColor: project.color }}>
                          {project.name}
                        </Badge>
                      )}
                      {result.task.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <strong>Relevancia:</strong> {result.reason}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isSearching && query && searchResults.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin resultados</h3>
            <p className="text-muted-foreground text-center">
              No se encontraron tareas que coincidan con tu búsqueda.
              <br />
              Intenta con otros términos o frases.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SemanticSearch;
