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
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/validation/authSchemas';
import { spacing } from '@/theme';

/** Opened from the password-recovery deep link (`kiburan-vendor://reset-password`). */
export function ResetPasswordScreen() {
  const { updatePassword, isPasswordRecovery, clearPasswordRecovery, signOut } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { control, handleSubmit, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await updatePassword(values.password);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    clearPasswordRecovery();
    setDone(true);
  });

  if (!isPasswordRecovery && !done) {
    return (
      <Screen header={<HeaderBar title="Reset password" />}>
        <AppText color="textMuted">
          Open the reset link from your email to choose a new password. If the link expired, request a new one.
        </AppText>
        <Button label="Request a new link" onPress={() => router.replace('/forgot-password')} />
        <Button label="Sign In" variant="text" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen scroll header={<HeaderBar title="Choose a new password" showBack={false} />}>
      <View style={styles.intro}>
        <AppText color="textMuted">
          {done ? 'Your password was updated. Sign in with the new one.' : 'Pick a new password for your Kiburan account.'}
        </AppText>
      </View>

      {done ? (
        <Button
          label="Sign In"
          onPress={() => {
            void signOut().finally(() => router.replace('/sign-in'));
          }}
        />
      ) : (
        <>
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                label="New password"
                required
                secureTextEntry
                autoComplete="new-password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <TextField
                label="Confirm password"
                required
                secureTextEntry
                autoComplete="new-password"
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
          <Button label="Update password" onPress={() => void onSubmit()} loading={formState.isSubmitting} />
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
