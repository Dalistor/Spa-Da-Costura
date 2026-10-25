import { createContext, useContext, type ReactNode } from 'react';
import type { JobRepository } from '../domain';

const JobRepositoryContext = createContext<JobRepository | null>(null);

/** Provided by the app's composition code, which builds the repository. */
export function JobRepositoryProvider({
  repository,
  children,
}: {
  repository: JobRepository;
  children: ReactNode;
}) {
  return (
    <JobRepositoryContext.Provider value={repository}>
      {children}
    </JobRepositoryContext.Provider>
  );
}

export function useJobRepository(): JobRepository {
  const repository = useContext(JobRepositoryContext);
  if (!repository) {
    throw new Error(
      'useJobRepository must be used inside JobRepositoryProvider',
    );
  }
  return repository;
}
