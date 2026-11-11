import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import {
  ServicePhotoPicker,
  uploadPendingServicePhotos,
  type PendingPhoto,
} from '@/features/services/components/ServicePhotoPicker';
import { useCategories, useCreateService, useService, useUpdateService } from '@/features/services/hooks/useServices';
import type { VendorService } from '@/features/services/services/serviceCatalog';
import {
  serviceFormSchema,
  toServiceInput,
  type ServiceFormInput,
  type ServiceFormValues,
} from '@/features/services/validation/serviceSchema';
import { errorMessage } from '@/lib/query/queryError';
import { spacing } from '@/theme';

export function AddServiceScreen() {
  return <ServiceFormGate title="Add Service" />;
}

export function EditServiceScreen({ serviceId }: { serviceId: string }) {
  const { vendor } = useActiveVendor();
  const service = useService(vendor.vendorId, serviceId);

  if (service.isPending) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Edit Service" />}>
        <SkeletonCard height={320} />
      </Screen>
    );
  }
  if (service.isError) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Edit Service" />}>
        <InlineError message={errorMessage(service.error)} onRetry={() => void service.refetch()} />
      </Screen>
    );
  }
  if (!service.data) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Edit Service" />}>
        <EmptyState icon="briefcase" title="Service not found" message="It may have been deleted." />
      </Screen>
    );
  }
  return <ServiceFormGate title="Edit Service" service={service.data} />;
}

function ServiceFormGate({ title, service }: { title: string; service?: VendorService }) {
  const { vendor } = useActiveVendor();
  if (!canManageBusiness(vendor.role)) {
    return (
      <Screen edges={['top']} header={<HeaderBar title={title} />}>
        <EmptyState icon="lock" title="Managers only" message="Only owners and managers can add or edit services." />
      </Screen>
    );
  }
  return <ServiceForm title={title} vendorId={vendor.vendorId} service={service} />;
}

function ServiceForm({ title, vendorId, service }: { title: string; vendorId: string; service?: VendorService }) {
  const categories = useCategories();
  const create = useCreateService(vendorId);
  const update = useUpdateService(vendorId, service?.id ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [showMore, setShowMore] = useState(false);

  const { control, handleSubmit, formState } = useForm<ServiceFormInput, unknown, ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service?.title ?? '',
      categoryId: service?.categoryId ?? '',
      description: service?.description ?? '',
      basePrice: service?.basePrice != null ? String(service.basePrice) : '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const input = toServiceInput(values);
      if (service) {
        await update.mutateAsync(input);
        router.back();
        return;
      }

      const created = await create.mutateAsync(input);
      if (pendingPhotos.length) {
        const uploaded = await uploadPendingServicePhotos({
          vendorId,
          serviceId: created.id,
          pending: pendingPhotos,
        });
        if (!uploaded.ok) {
          setFormError(`${uploaded.message} The service was saved — add photos from Edit Service.`);
          router.replace({ pathname: '/services/[serviceId]/edit', params: { serviceId: created.id } });
          return;
        }
      }
      router.back();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title={title} />}>
      <ServicePhotoPicker
        vendorId={vendorId}
        serviceId={service?.id ?? null}
        pending={pendingPhotos}
        onPendingChange={setPendingPhotos}
      />

      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <TextField
            label="Service Name"
            required
            placeholder="e.g. Wedding Decoration"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <SelectField
            label="Category"
            required
            placeholder={categories.isPending ? 'Loading categories…' : 'Select a category'}
            options={(categories.data ?? []).map((category) => ({ value: category.id, label: category.name }))}
            value={field.value || null}
            onChange={field.onChange}
            disabled={!categories.data}
            error={fieldState.error?.message ?? (categories.isError ? errorMessage(categories.error) : undefined)}
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
            placeholder="What's included, style, coverage…"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="basePrice"
        render={({ field, fieldState }) => (
          <TextField
            label="Starting Price (ETB)"
            required
            keyboardType="decimal-pad"
            placeholder="15,000"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={fieldState.error?.message}
          />
        )}
      />

      {service ? (
        <View style={styles.links}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/services/${service.id}/packages` as Href)}>
            <AppText variant="bodyMedium" color="primaryDark">
              Manage packages
            </AppText>
          </Pressable>
        </View>
      ) : null}

      <Pressable accessibilityRole="button" onPress={() => setShowMore((value) => !value)}>
        <AppText variant="caption" color="textMuted">
          {showMore ? 'Hide notes' : 'More options'}
        </AppText>
      </Pressable>
      {showMore ? (
        <AppText variant="caption" color="textMuted">
          Price unit stays “package” for new services. Activate or deactivate from the services list menu.
        </AppText>
      ) : null}

      {formError ? (
        <AppText color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}

      <Button label="Save Service" onPress={() => void onSubmit()} loading={formState.isSubmitting} style={styles.save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  links: {
    gap: spacing.xs,
  },
  save: {
    marginTop: spacing.xs,
  },
});
