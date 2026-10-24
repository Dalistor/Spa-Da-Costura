import { EmptyState } from '../../ui';

// Registered for routes whose screens arrive in later specs; each one
// replaces this component in Navigator when its feature is implemented.
export function PendingScreen() {
  return (
    <EmptyState
      title="Em breve"
      message="Esta tela será liberada nas próximas etapas."
    />
  );
}
