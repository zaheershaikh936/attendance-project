import { queryKeys } from './keys';

export function useGetCompanies() {
  return (args?: {
    adminOnly?: boolean;
    includeAdmins?: boolean;
  }) => {
    const [queryKey] = queryKeys.companies('GET', args);
    return useQuery(queryKey);
  };
}

export function useGetCompany(id: string) {
  return (args?: { includeAdmins?: boolean }) => {
    const [queryKey] = queryKeys.companies('GET', { id, ...args });
    return useQuery(queryKey);
  };
}

export function useCreateCompany() {
  return () => {
    const [queryKey] = queryKeys.companies('CREATE', null);
    return useMutation(queryKey);
  };
}

export function useUpdateCompany(id: string) {
  return (args?: { partial?: boolean }) => {
    const [queryKey] = queryKeys.companies('UPDATE', { id, ...args });
    return useMutation(queryKey);
  };
}

export function useDeleteCompany(id: string) {
  return () => {
    const [queryKey] = queryKeys.companies('DELETE', { id });
    return useMutation(queryKey);
  };
}
