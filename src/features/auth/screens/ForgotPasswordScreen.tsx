import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/context/AuthContext';
import { emailOnlySchema, type EmailOnlyValues } from '@/features/auth/validation/authSchemas';
import { spacing } from '@/theme';

export function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState } = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    setSent(true);
  });

  return (
    <Screen scroll header={<HeaderBar title="Reset password" />}>
      <View style={styles.intro}>
        <AppText color="textMuted">
          We&apos;ll email a reset link if an account exists for that address. For privacy, the same message is shown
          either way.
        </AppText>
      </View>

      {sent ? (
        <>
          <AppText color="success" accessibilityLiveRegion="polite">
            If that email has a Kiburan account, a reset link is on its way.
          </AppText>
          <Button label="Back to Sign In" onPress={() => router.replace('/sign-in')} />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                label="Email"
                required
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
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
          <Button label="Send reset link" onPress={() => void onSubmit()} loading={formState.isSubmitting} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.xs,
  },
});
