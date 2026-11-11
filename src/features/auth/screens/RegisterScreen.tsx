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
import { registerSchema, type RegisterValues } from '@/features/auth/validation/authSchemas';
import { spacing } from '@/theme';

export function RegisterScreen() {
  const { signUp } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState, getValues } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await signUp(values);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    if (result.data.needsEmailConfirmation) {
      router.replace({ pathname: '/verify-email', params: { email: values.email } });
      return;
    }
    // Local projects auto-confirm; route guards move the new session into onboarding.
  });

  return (
    <Screen scroll header={<HeaderBar title="Create Account" />}>
      <View style={styles.intro}>
        <AppText color="textMuted">
          Create a Kiburan account, then register your business. Couples already on Kiburan can sign in with the same
          email.
        </AppText>
      </View>

      <Controller
        control={control}
        name="fullName"
        render={({ field, fieldState }) => (
          <TextField
            label="Full name"
            required
            autoComplete="name"
            textContentType="name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            required
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            label="Password"
            required
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint="At least 8 characters."
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
            textContentType="newPassword"
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

      <Button label="Create Account" onPress={() => void onSubmit()} loading={formState.isSubmitting} />
      <Button
        label="Sign In"
        variant="text"
        onPress={() =>
          router.replace({
            pathname: '/sign-in',
            params: getValues('email') ? { email: getValues('email') } : undefined,
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: spacing.xs,
  },
});
