
import { MainInsightGenerator } from './insights/MainInsightGenerator';

// Re-export the main class for backward compatibility
export { MainInsightGenerator as InsightGenerator } from './insights/MainInsightGenerator';

// Create the default instance using the new structure
export const defaultInsightGenerator = new MainInsightGenerator();
