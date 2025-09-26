// useAuthBootstrap.ts
import { useFetchUserQuery } from '../services/auth';

export const useAuthBootstrap = () => {
  useFetchUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
};

