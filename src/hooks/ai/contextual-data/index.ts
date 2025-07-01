// =============================================================================
// CONTEXTUAL DATA HOOKS - INDEX OPTIMIZADO
// Hooks especializados para recolección y manejo de datos contextuales
// =============================================================================

// CORE HOOKS - Base contextual data functionality
export { useContextualDataCollection } from './useContextualDataCollection';
export { useContextualDataQueries } from './useContextualDataQueries';

// AGGREGATION HOOKS - Data processing and aggregation
export { useContextualDataAggregations } from './useContextualDataAggregations';

// CONFIGURATION HOOKS - Setup and configuration
export { useContextualDataConfig } from './useContextualDataConfig';

// AUTO-COLLECTION HOOKS - Automated data collection
export { useContextualDataAutoCollection } from './useContextualDataAutoCollection';

// =============================================================================
// NOTES:
// - Organized by functionality to prevent circular dependencies
// - Each hook has a specific, focused responsibility
// - Clear separation between collection, processing, and configuration
// - Follows the single responsibility principle
// =============================================================================