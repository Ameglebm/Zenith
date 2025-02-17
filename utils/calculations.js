export const calculateCalories = (distance, time) => {
  const weight = 70; 
  const speed = distance / (time / 3600); 
  const MET = speed > 8 ? 9.8 : 8.0; 
  return ((MET * 3.5 * weight) / 200) * (time / 60);
};
