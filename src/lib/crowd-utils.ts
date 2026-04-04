export const calculateWaitTime = (currentCrowd: number, capacity: number, baseWaitTime: number = 0.5) => {
  const occupancy = currentCrowd / capacity;
  
  // Base wait time in minutes
  let wait = currentCrowd * baseWaitTime;
  
  // Congestion factor: wait time increases non-linearly as it gets more crowded
  if (occupancy > 0.9) {
    wait *= 2.5; // Extreme congestion
  } else if (occupancy > 0.75) {
    wait *= 1.8; // High congestion
  } else if (occupancy > 0.5) {
    wait *= 1.3; // Moderate congestion
  } else if (occupancy > 0.25) {
    wait *= 1.1; // Slight congestion
  }
  
  // Minimum 1 minute if there's anyone there
  if (currentCrowd > 0 && wait < 1) wait = 1;
  
  // Rounding to nearest 5 for a more "general" feel if it's long, otherwise nearest 1
  const roundTo = wait > 15 ? 5 : 1;
  const minWait = Math.max(0, Math.floor(wait / roundTo) * roundTo);
  const maxWait = Math.ceil((wait + (wait * 0.2) + 2) / roundTo) * roundTo;
  
  let status: 'FAST' | 'MODERATE' | 'BUSY' | 'HECTIC' = 'FAST';
  if (occupancy > 0.9) status = 'HECTIC';
  else if (occupancy > 0.7) status = 'BUSY';
  else if (occupancy > 0.4) status = 'MODERATE';

  return {
    min: minWait,
    max: maxWait,
    label: status,
    display: minWait === 0 && maxWait === 0 ? 'No wait' : 
             minWait === maxWait ? `${minWait} min` : 
             `${minWait}-${maxWait} min`
  };
};
