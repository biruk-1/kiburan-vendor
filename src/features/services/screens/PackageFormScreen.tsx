import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
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
  useCreatePackage,
  usePackage,
  useUpdatePackage,
} from '@/features/services/hooks/useServices';
import type { ServicePackage } from '@/features/services/services/packageCatalog';
import {
  packageFormSchema,
  toPackageInput,
  type PackageFormInput,
  type PackageFormValues,
} from '@/features/services/validation/packageSchema';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';

export function AddPackageScreen({ serviceId }: { serviceId: string }) {
  return <PackageFormGate serviceId={serviceId} title="Add Package" />;
}

export function EditPackageScreen({ serviceId, packageId }: { serviceId: string; packageId: string }) {
  const { vendor } = useActiveVendor();
  const pkg = usePackage(vendor.vendorId, serviceId, packageId);

  if (pkg.isPending) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Edit Package" />}>
        <SkeletonCard height={280} />
      </Screen>
    );
  }
  if (pkg.isError) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Edit Package" />}>
        <InlineError message={errorMessage(pkg.error)} onRetry={() => void pkg.refetch()} />
      </Screen>
    );
  }
  if (!pkg.data) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Edit Package" />}>
        <EmptyState icon="package" title="Package not found" message="It may have been deleted." />
      </Screen>
    );
  }
  return <PackageFormGate serviceId={serviceId} title="Edit Package" pkg={pkg.data} />;
}

function PackageFormGate({
  serviceId,
  title,
  pkg,
}: {
  serviceId: string;
  title: string;
  pkg?: ServicePackage;
}) {
  const { vendor } = useActiveVendor();
  if (!canManageBusiness(vendor.role)) {
    return (
      <Screen edges={['top']} header={<HeaderBar title={title} />}>
        <EmptyState icon="lock" title="Managers only" message="Only owners and managers can edit packages." />
      </Screen>
    );
  }
  return <PackageForm vendorId={vendor.vendorId} serviceId={serviceId} title={title} pkg={pkg} />;
}

function PackageForm({
  vendorId,
  serviceId,
  title,
  pkg,
}: {
  vendorId: string;
  serviceId: string;
  title: string;
  pkg?: ServicePackage;
}) {
  const create = useCreatePackage(vendorId, serviceId);
  const update = useUpdatePackage(vendorId, serviceId, pkg?.id ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<PackageFormInput, unknown, PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: pkg?.name ?? '',
      description: pkg?.description ?? '',
      inclusionsText: pkg?.inclusions.join('\n') ?? '',
      price: pkg?.price != null ? String(pkg.price) : '',
      isActive: pkg?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const input = toPackageInput(values);
      if (pkg) await update.mutateAsync(input);
      else await create.mutateAsync(input);
      router.back();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title={title} />}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="Package name"
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
        name="price"
        render={({ field, fieldState }) => (
          <TextField
            label="Price (ETB)"
            keyboardType="decimal-pad"
            placeholder="Leave blank for price on request"
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
        name="inclusionsText"
        render={({ field, fieldState }) => (
          <TextField
            label="Inclusions"
            multiline
            hint="One item per line, or separate with commas."
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: field.value }}
            onPress={() => field.onChange(!field.value)}
            style={styles.switchRow}>
            <View style={styles.switchText}>
              <AppText variant="bodyMedium">Active on listing</AppText>
              <AppText variant="caption" color="textMuted">
                Inactive packages stay saved but are hidden from couples.
              </AppText>
            </View>
            <View style={[styles.switchTrack, field.value && styles.switchOn]}>
              <View style={[styles.switchThumb, field.value && styles.switchThumbOn]} />
            </View>
          </Pressable>
        )}
      />

      {formError ? (
        <AppText color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}

      <Button label="Save package" loading={formState.isSubmitting} onPress={() => void onSubmit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  switchText: {
    flex: 1,
    gap: spacing.xxs,
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
});
