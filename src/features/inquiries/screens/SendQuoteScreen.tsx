import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
import { useInquiry, useSendQuote } from '@/features/inquiries/hooks/useInquiries';
import {
  sendQuoteSchema,
  type SendQuoteInput,
  type SendQuoteValues,
} from '@/features/inquiries/validation/quoteSchema';
import { usePackages, useServices } from '@/features/services/hooks/useServices';
import { errorMessage } from '@/lib/query/queryError';
import { spacing } from '@/theme';

export function SendQuoteScreen({ inquiryId }: { inquiryId: string }) {
  const { vendor } = useActiveVendor();
  const canManage = canManageBusiness(vendor.role);
  const inquiry = useInquiry(vendor.vendorId, inquiryId);
  const send = useSendQuote(vendor.vendorId, inquiryId);
  const services = useServices(vendor.vendorId);
  const primaryServiceId = inquiry.data?.serviceId ?? services.data?.[0]?.id ?? '';
  const packages = usePackages(vendor.vendorId, primaryServiceId);
  const [formError, setFormError] = useState<string | null>(null);

  const packageOptions = useMemo(
    () => [
      { value: '', label: 'No package' },
      ...(packages.data ?? [])
        .filter((item) => item.isActive)
        .map((item) => ({
          value: item.id,
          label: item.price == null ? item.name : `${item.name} · ETB ${item.price}`,
        })),
    ],
    [packages.data],
  );

  const { control, handleSubmit, formState } = useForm<SendQuoteInput, unknown, SendQuoteValues>({
    resolver: zodResolver(sendQuoteSchema),
    defaultValues: {
      amount: '',
      packageId: '',
      description: '',
      validUntil: '',
    },
  });

  if (!canManage) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Send quote" />}>
        <EmptyState icon="lock" title="Managers only" message="Only owners and managers can send quotes." />
      </Screen>
    );
  }

  if (inquiry.isPending) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Send quote" />}>
        <SkeletonCard height={280} />
      </Screen>
    );
  }

  if (inquiry.isError) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Send quote" />}>
        <InlineError message={errorMessage(inquiry.error)} onRetry={() => void inquiry.refetch()} />
      </Screen>
    );
  }

  if (!inquiry.data) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Send quote" />}>
        <EmptyState icon="message-square" title="Inquiry not found" />
      </Screen>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await send.mutateAsync({
        amount: Number(values.amount),
        packageId: values.packageId || null,
        description: values.description || null,
        validUntil: values.validUntil || null,
      });
      router.back();
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title="Send quote" />}>
      <AppText color="textMuted">
        Quote for {inquiry.data.couple.coupleLabel ?? 'this inquiry'}. The couple accepts quotes in the Kiburan
        wedding app; that creates a pending booking for you.
      </AppText>

      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            label="Amount (ETB)"
            required
            keyboardType="decimal-pad"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="packageId"
        render={({ field }) => (
          <SelectField
            label="Package"
            placeholder={packages.isPending ? 'Loading packages…' : 'Optional package'}
            options={packageOptions}
            value={field.value || null}
            onChange={field.onChange}
            disabled={!primaryServiceId}
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
        name="validUntil"
        render={({ field, fieldState }) => (
          <TextField
            label="Valid until"
            placeholder="YYYY-MM-DD"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoCapitalize="none"
          />
        )}
      />

      {formError ? (
        <AppText color="danger" accessibilityRole="alert">
          {formError}
        </AppText>
      ) : null}

      <Button label="Send quote" loading={formState.isSubmitting} onPress={() => void onSubmit()} style={{ marginTop: spacing.xs }} />
    </Screen>
  );
}
