import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import {
  useSetVendorCover,
  useSetVendorLogo,
  useUpdateVendorProfile,
  useVendorDetails,
} from '@/features/business-profile/hooks/useBusinessQueries';
import { pickVendorImage, uploadVendorPublicImage } from '@/features/business-profile/services/vendorStorage';
import {
  businessProfileSchema,
  type BusinessProfileInput,
  type BusinessProfileValues,
} from '@/features/business-profile/validation/businessProfileSchema';
import { useCategories } from '@/features/services/hooks/useServices';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';
import { isRemoteImage } from '@/utils/media';

export function BusinessProfileScreen() {
  const { vendor } = useActiveVendor();
  const details = useVendorDetails(vendor.vendorId);

  if (!canManageBusiness(vendor.role)) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Business Profile" />}>
        <EmptyState icon="lock" title="Managers only" message="Only owners and managers can edit the business profile." />
      </Screen>
    );
  }

  if (details.isPending) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Business Profile" />}>
        <SkeletonCard height={420} />
      </Screen>
    );
  }

  if (details.isError || !details.data) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Business Profile" />}>
        <InlineError message={errorMessage(details.error)} onRetry={() => void details.refetch()} />
      </Screen>
    );
  }

  return (
    <BusinessProfileForm
      key={`${details.data.id}-${details.data.logoUrl ?? ''}-${details.data.coverUrl ?? ''}-${details.data.businessName}`}
      vendorId={vendor.vendorId}
      details={details.data}
    />
  );
}

function BusinessProfileForm({
  vendorId,
  details,
}: {
  vendorId: string;
  details: NonNullable<ReturnType<typeof useVendorDetails>['data']>;
}) {
  const categories = useCategories();
  const update = useUpdateVendorProfile(vendorId);
  const setLogo = useSetVendorLogo(vendorId);
  const setCover = useSetVendorCover(vendorId);
  const [formError, setFormError] = useState<string | null>(null);
  const [mediaBusy, setMediaBusy] = useState<'logo' | 'cover' | null>(null);

  const { control, handleSubmit, formState } = useForm<BusinessProfileInput, unknown, BusinessProfileValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: details.businessName,
      categoryIds: details.categoryIds,
      city: details.city ?? '',
      description: details.description ?? '',
      phone: details.phone ?? '',
      email: details.email ?? '',
      address: details.address ?? '',
      websiteUrl: details.websiteUrl ?? '',
      instagramUrl: details.instagramUrl ?? '',
    },
  });

  const onSave = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await update.mutateAsync(values);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  const uploadImage = async (kind: 'logo' | 'cover') => {
    setFormError(null);
    setMediaBusy(kind);
    try {
      const picked = await pickVendorImage();
      if (!picked.ok) {
        setFormError(picked.error.message);
        return;
      }
      if (!picked.data) return;

      const uploaded = await uploadVendorPublicImage({ vendorId, kind, picked: picked.data });
      if (!uploaded.ok) {
        setFormError(uploaded.error.message);
        return;
      }

      if (kind === 'logo') {
        await setLogo.mutateAsync({ publicUrl: uploaded.data.publicUrl, previousUrl: details.logoUrl });
      } else {
        await setCover.mutateAsync({ publicUrl: uploaded.data.publicUrl, previousUrl: details.coverUrl });
      }
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setMediaBusy(null);
    }
  };

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title="Business Profile" />}>
      <AppText color="textMuted">
        Couples see this information on your public listing once you are verified and published.
      </AppText>

      <View style={styles.mediaRow}>
        <MediaButton
          label="Logo"
          uri={details.logoUrl}
          loading={mediaBusy === 'logo'}
          onPress={() => void uploadImage('logo')}
          tall={false}
        />
        <MediaButton
          label="Cover"
          uri={details.coverUrl}
          loading={mediaBusy === 'cover'}
          onPress={() => void uploadImage('cover')}
          tall
        />
      </View>

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
            <View style={styles.chips}>
              {(categories.data ?? []).map((category) => {
                const active = field.value.includes(category.id);
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    onPress={() => {
                      field.onChange(
                        active ? field.value.filter((id) => id !== category.id) : [...field.value, category.id],
                      );
                    }}
                    style={[styles.chip, active && styles.chipActive]}>
                    <AppText variant="caption" color={active ? 'onPrimary' : 'heading'}>
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
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="phone-pad"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="address"
        render={({ field, fieldState }) => (
          <TextField
            label="Address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="websiteUrl"
        render={({ field, fieldState }) => (
          <TextField
            label="Website"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="instagramUrl"
        render={({ field, fieldState }) => (
          <TextField
            label="Instagram"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="none"
          />
        )}
      />

      {formError ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}

      <Button label="Save profile" loading={update.isPending || formState.isSubmitting} onPress={() => void onSave()} />
    </Screen>
  );
}

function MediaButton({
  label,
  uri,
  loading,
  onPress,
  tall,
}: {
  label: string;
  uri: string | null;
  loading: boolean;
  onPress: () => void;
  tall: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Change ${label.toLowerCase()}`}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.mediaCard, tall && styles.coverCard, pressed && styles.pressed]}>
      {isRemoteImage(uri) ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <AppText variant="caption" color="textMuted" align="center">
          Add {label.toLowerCase()}
        </AppText>
      )}
      <View style={styles.mediaLabel}>
        <AppText variant="caption" color="onPrimary">
          {loading ? 'Uploading…' : label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverCard: {
    flex: 1.4,
  },
  mediaLabel: {
    position: 'absolute',
    left: spacing.xs,
    bottom: spacing.xs,
    backgroundColor: colors.overlay,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  field: {
    gap: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
});
