import { api } from './api';

export const summarizeEmail = async (emailBody: string) => {
  return api.summarizeMail(emailBody);
};

export const getNavigationAdvice = async (currentLocation: string, destination: string, context: string) => {
  const response = await api.navigationAdvice({ currentLocation, destination, context });
  return response.advice;
};
