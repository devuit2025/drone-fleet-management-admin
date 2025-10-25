import { useQuery } from '@tanstack/react-query';
import { api } from './axios';

export const fetchTodos = async () => {
  console.log("Fetching todos from API...");
  const { data } = await api.get("/todos");
  return data;
};

export const useTodos = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: false,       // don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // don't refetch on window focus
  });
