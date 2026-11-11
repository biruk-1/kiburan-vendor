import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand/BrandMark';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/context/AuthContext';
import { signInSchema, type SignInValues } from '@/features/auth/validation/authSchemas';
import { spacing } from '@/theme';

export function SignInScreen() {
  const { signIn, requestEmailOtp } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const [formError, setFormError] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const { control, handleSubmit, formState, getValues } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: params.email ?? '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await signIn(values);
    if (!result.ok) setFormError(result.error.message);
  });

  const onEmailCode = async () => {
    setFormError(null);
    const email = getValues('email').trim();
    if (!email) {
      setFormError('Enter your email first.');
      return;
    }
    setOtpBusy(true);
    const result = await requestEmailOtp(email);
    setOtpBusy(false);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    router.push({ pathname: '/verify-email', params: { email, mode: 'sign-in' } });
  };

  return (
    <Screen scroll contentStyle={styles.content} header={<HeaderBar title="" />}>
      <View style={styles.brand}>
        <BrandMark size={72} />
        <AppText variant="brand" align="center">
          Kiburan
        </AppText>
        <AppText variant="brandSub" align="center" color="text">
          Vendor
        </AppText>
        <AppText color="textMuted" align="center">
          Sign in with your Kiburan account to manage your business.
        </AppText>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
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
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={fieldState.error?.message}
          />
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Forgot password"
        onPress={() => router.push('/forgot-password')}
        style={styles.forgot}>
        <AppText variant="label" color="primaryDark">
          Forgot password?
        </AppText>
      </Pressable>

      {formError ? (
        <AppText color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}

      <Button label="Sign In" onPress={() => void onSubmit()} loading={formState.isSubmitting} />
      <Button label="Sign in with email code" variant="outline" loading={otpBusy} onPress={() => void onEmailCode()} />
      <Button label="Create Account" variant="text" onPress={() => router.push('/register')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
});
