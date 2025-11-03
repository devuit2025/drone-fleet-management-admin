"use client"

import { toast } from "sonner";

// Default toast
export const toastDefault = (message: string) => {
  toast(message);
};

// Success toast
export const toastSuccess = (message: string) => {
  toast.success(message);
};

// Info toast
export const toastInfo = (message: string) => {
  toast.info(message);
};

// Warning toast
export const toastWarning = (message: string) => {
  toast.warning(message);
};

// Error toast
export const toastError = (message: string) => {
  toast.error(message);
};

// Promise toast
export const toastPromise = async <T>(
  promise: () => Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: any) => string);
  }
) => {
  return toast.promise(promise, messages);
};
