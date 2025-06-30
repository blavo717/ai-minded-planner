
import React, { memo } from 'react';

interface DataIndicatorProps {
  contextAvailable: boolean;
}

// Componente vacío - ya no mostramos información de Supabase
const DataIndicator = memo(({ contextAvailable }: DataIndicatorProps) => {
  return null;
});

DataIndicator.displayName = 'DataIndicator';

export default DataIndicator;
