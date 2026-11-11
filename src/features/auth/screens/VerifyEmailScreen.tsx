import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/context/AuthContext';
import { otpSchema, type OtpValues } from '@/features/auth/validation/authSchemas';
import { spacing } from '@/theme';

/**
 * Email confirmation / passwordless code entry. Local Supabase often auto-confirms, so this
 * screen is mainly for hosted projects and for "Sign in with email code".
 */
export function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; mode?: string }>();
  const { verifyEmailOtp, requestEmailOtp } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const isSignIn = params.mode === 'sign-in';

  const { control, handleSubmit, formState, getValues } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: params.email ?? '', token: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await verifyEmailOtp(values);
    if (!result.ok) setFormError(result.error.message);
  });

  const onResend = async () => {
    setFormError(null);
    setResent(false);
    const email = getValues('email');
    const result = await requestEmailOtp(email);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    setResent(true);
  };

  return (
    <Screen scroll header={<HeaderBar title={isSignIn ? 'Email code' : 'Confirm email'} />}>
      <View style={styles.intro}>
        <AppText color="textMuted">
          {isSignIn
            ? 'Enter the 6-digit code we sent to your email to sign in.'
            : 'Enter the 6-digit code we sent to confirm your email, then continue to set up your business.'}
        </AppText>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            required
            autoCapitalize="none"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="token"
        render={({ field, fieldState }) => (
          <TextField
            label="6-digit code"
            required
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={fieldState.error?.message}
          />
        )}
      />

      {formError ? (
        <AppText color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}
      {resent ? (
        <AppText color="success" accessibilityLiveRegion="polite">
          Code sent. Check your inbox.
        </AppText>
      ) : null}

      <Button label="Continue" onPress={() => void onSubmit()} loading={formState.isSubmitting} />
      <Button label="Resend code" variant="outline" onPress={() => void onResend()} />
      <Button label="Back to Sign In" variant="text" onPress={() => router.replace('/sign-in')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.xs,
  },
});
