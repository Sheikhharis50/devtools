export const formatTime = (hours: number, minutes: number, seconds: number) => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${period}`;
};

export const getTimeForTimezone = (offset: number) => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const timeInZone = new Date(utc + (3600000 * offset));
  
  return {
    hours: timeInZone.getHours(),
    minutes: timeInZone.getMinutes(),
    seconds: timeInZone.getSeconds(),
  };
};