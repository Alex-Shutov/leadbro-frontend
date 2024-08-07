import { convertToMinutes } from './format.time';

export const compareTime = (actualTime, deadlineTime) => {
  const actualTimeInMinutes = convertToMinutes(actualTime);
  const deadlineTimeInMinutes = convertToMinutes(deadlineTime);
  return actualTimeInMinutes > deadlineTimeInMinutes;
};
