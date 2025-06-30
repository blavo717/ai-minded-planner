
import React, { memo } from 'react';

interface DataIndicatorProps {
  contextAvailable: boolean;
}

const DataIndicator = memo(({ contextAvailable }: DataIndicatorProps) => {
  if (!contextAvailable) {
    return null;
  }

  return (
    <div className="px-4 py-1 text-xs text-green-600 bg-green-50 border-t">
      ✅ Utilizando datos reales de Supabase
    </div>
  );
});

DataIndicator.displayName = 'DataIndicator';

export default DataIndicator;
