import { useState } from 'react';
import { AxiosError } from 'axios';

export const useApiError = () => {
  const [error, setError] = useState('');

  const handleError = (err: unknown) => {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
    } else {
      setError('Something went wrong');
    }
  };

  const clearError = () => setError('');

  return { error, handleError, clearError };
};
