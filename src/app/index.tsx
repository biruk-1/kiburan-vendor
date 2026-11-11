import { Redirect } from 'expo-router';

import { ErrorView, LoadingView } from '@/components/feedback/StatusView';
import { useAccount } from '@/features/account/context/AccountContext';
import { useAuth } from '@/features/auth/context/AuthContext';

/** Entry point and redirect anchor for every route guard: sends each account state to its home. */
export default function Index() {
  const { state, reload } = useAccount();
  const { signOut, isPasswordRecovery } = useAuth();

  if (isPasswordRecovery) return <Redirect href="/reset-password" />;

  switch (state.kind) {
    case 'restoring':
    case 'loading_businesses':
      return <LoadingView message="Loading your business…" />;
    case 'error':
      return (
        <ErrorView
          title="We couldn't load your business"
          message={state.message}
          onRetry={() => void reload()}
          secondaryLabel="Sign out"
          onSecondary={() => void signOut()}
        />
      );
    case 'signed_out':
      return <Redirect href="/welcome" />;
    case 'no_business':
      return <Redirect href="/create-business" />;
    case 'choose_business':
      return <Redirect href="/choose-business" />;
    case 'workspace':
      return <Redirect href="/home" />;
  }
}
