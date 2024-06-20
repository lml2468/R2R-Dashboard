import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { v5 as uuidv5 } from 'uuid';

export const setColor = (keyword: string): string => {
  switch (keyword) {
    case 'success':
      return 'bg-emerald-400';
    case 'failure':
      return 'bg-red-400';
    case 'Search':
      return 'bg-sky-500';
    case 'Embedding':
      return 'bg-orange-600';
    case 'RAG':
      return 'bg-indigo-400';
    case 'WARNING':
      return 'bg-amber-400';
    default:
      return 'bg-gray-400';
  }
};

export const setTextColor = (keyword: string): string => {
  switch (keyword) {
    case 'WARNING':
      return 'text-amber-800';
    default:
      return 'text-gray-800';
  }
};

export const isValidUrl = (value: string) => {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!urlPattern.test(value);
};

export const capitalizeFirstLetter = (string: string) => {
  if (!string) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

type ValidateFunction = (value: string) => boolean;
export const useValidation = (value: string, validate: ValidateFunction) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(validate(value));
  }, [value, validate]);

  const inputStyles = isValid ? 'border-green-700' : 'border-red-600';

  return { isValid, inputStyles };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateIdFromLabel(label: string): string {
  const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // UUID for DNS namespace
  return uuidv5(label, NAMESPACE_DNS);
}
