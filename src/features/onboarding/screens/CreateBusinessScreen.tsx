import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAccount } from '@/features/account/context/AccountContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCategories } from '@/features/services/hooks/useServices';
import { createVendor, submitVendorForVerification } from '@/features/onboarding/services/onboardingService';
import {
  createBusinessSchema,
  type CreateBusinessInput,
  type CreateBusinessValues,
} from '@/features/onboarding/validation/createBusinessSchema';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';

export function CreateBusinessScreen() {
  const { user, signOut } = useAuth();
  const { reload, selectVendor } = useAccount();
  const categories = useCategories();
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { control, handleSubmit, formState } = useForm<CreateBusinessInput, unknown, CreateBusinessValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      businessName: '',
      categoryIds: [],
      city: '',
      description: '',
      phone: '',
      email: user?.email ?? '',
    },
  });

  const save = async (values: CreateBusinessValues, submitForReview: boolean) => {
    setFormError(null);
    setSubmittingReview(submitForReview);
    try {
      const created = await createVendor({
        businessName: values.businessName,
        categoryIds: values.categoryIds,
        city: values.city,
        description: values.description,
        phone: values.phone || null,
        email: values.email || null,
      });
      if (!created.ok) {
        setFormError(created.error.message);
        return;
      }

      if (submitForReview) {
        const submitted = await submitVendorForVerification(created.data.id);
        if (!submitted.ok) {
          // Business exists as a draft; let the owner open it and retry submission later.
          await reload();
          await selectVendor(created.data.id);
          setFormError(`${submitted.error.message} Your draft was saved — you can submit again from the dashboard.`);
          return;
        }
      }

      await reload();
      await selectVendor(created.data.id);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <Screen scroll header={<HeaderBar title="Register your business" showBack={false} />}>
      <AppText color="textMuted">
        Tell couples who you are. New businesses start as drafts. Submitting sends them for Kiburan review before they
        can appear in the marketplace.
      </AppText>

      <Controller
        control={control}
        name="businessName"
        render={({ field, fieldState }) => (
          <TextField
            label="Business name"
            required
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="categoryIds"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <AppText variant="label" color="heading">
              Categories <AppText variant="label" color="danger">*</AppText>
            </AppText>
            <AppText variant="caption" color="textMuted">
              Pick every category you offer. You can refine services later.
            </AppText>
            <View style={styles.chips}>
              {(categories.data ?? []).map((category) => {
                const active = field.value.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    onPress={() => {
                      const next = active
                        ? field.value.filter((value) => value !== category.id)
                        : [...field.value, category.id];
                      field.onChange(next);
                    }}
                    style={[styles.chip, active && styles.chipActive]}>
                    <AppText variant="label" color={active ? 'onPrimary' : 'textMuted'}>
                      {category.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            {fieldState.error ? (
              <AppText variant="caption" color="danger">
                {fieldState.error.message}
              </AppText>
            ) : null}
            {categories.isError ? (
              <AppText variant="caption" color="danger">
                {errorMessage(categories.error)}
              </AppText>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field, fieldState }) => (
          <TextField
            label="City"
            required
            placeholder="Addis Ababa"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <TextField
            label="Description"
            required
            multiline
            placeholder="What you offer, your style, and the areas you cover…"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <TextField
            label="Phone"
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint="Phone or email is required."
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Business email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      {formError ? (
        <AppText color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}

      <Button
        label="Save draft & continue"
        variant="outline"
        loading={formState.isSubmitting && !submittingReview}
        disabled={formState.isSubmitting}
        onPress={() => void handleSubmit((values) => save(values, false))()}
      />
      <Button
        label="Submit for review"
        loading={formState.isSubmitting && submittingReview}
        disabled={formState.isSubmitting}
        onPress={() => void handleSubmit((values) => save(values, true))()}
      />
      <Button label="Sign Out" variant="text" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
