import { Feather } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectField } from '@/components/ui/SelectField';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { TextField } from '@/components/ui/TextField';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import {
  useAvailability,
  useCreateAvailability,
  useDeleteAvailability,
  useUpdateAvailability,
} from '@/features/availability/hooks/useAvailability';
import type { AvailabilityWindow } from '@/features/availability/services/availabilityService';
import {
  availabilityFormSchema,
  splitIsoToForm,
  toAvailabilityInput,
  type AvailabilityFormInput,
  type AvailabilityFormValues,
} from '@/features/availability/validation/availabilitySchema';
import { useServices } from '@/features/services/hooks/useServices';
import { errorMessage } from '@/lib/query/queryError';
import { colors, spacing } from '@/theme';
import { formatDay, formatTime } from '@/utils/format';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'tentative', label: 'Tentative' },
  { value: 'booked', label: 'Booked' },
] as const;

const STATUS_TONE = {
  available: 'success',
  unavailable: 'danger',
  tentative: 'warning',
  booked: 'info',
} as const;

export function AvailabilityScreen() {
  const { vendor } = useActiveVendor();
  const canManage = canManageBusiness(vendor.role);
  const windows = useAvailability(vendor.vendorId);
  const services = useServices(vendor.vendorId);
  const create = useCreateAvailability(vendor.vendorId);
  const update = useUpdateAvailability(vendor.vendorId);
  const remove = useDeleteAvailability(vendor.vendorId);

  const [editing, setEditing] = useState<AvailabilityWindow | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AvailabilityWindow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const serviceNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const service of services.data ?? []) map.set(service.id, service.title);
    return map;
  }, [services.data]);

  const { control, handleSubmit, formState, reset } = useForm<AvailabilityFormInput, unknown, AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      serviceId: '',
      date: toDateInput(new Date()),
      startTime: '09:00',
      endTime: '17:00',
      status: 'unavailable',
      notes: '',
    },
  });

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
    reset({
      serviceId: '',
      date: toDateInput(new Date()),
      startTime: '09:00',
      endTime: '17:00',
      status: 'unavailable',
      notes: '',
    });
  };

  const openEdit = (window: AvailabilityWindow) => {
    setEditing(window);
    setShowForm(true);
    reset({
      serviceId: window.serviceId ?? '',
      ...splitIsoToForm(window.startsAt, window.endsAt),
      status: window.status,
      notes: window.notes ?? '',
    });
  };

  const onSave = handleSubmit(async (values) => {
    setActionError(null);
    try {
      const input = toAvailabilityInput(values);
      if (editing) await update.mutateAsync({ windowId: editing.id, input });
      else await create.mutateAsync(input);
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      setActionError(errorMessage(error));
    }
  });

  if (!canManage) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Availability" />}>
        <EmptyState
          icon="lock"
          title="Managers only"
          message="Only owners and managers can edit availability windows."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title="Availability" />}>
      <AppText color="textMuted">
        Block days you are unavailable, or mark open windows. Overlaps are not blocked by the database — keep windows
        clear yourself. Booked windows from real bookings are not auto-created yet.
      </AppText>

      <Button label={showForm ? 'Close form' : 'Add window'} variant={showForm ? 'outline' : 'primary'} onPress={() => (showForm ? setShowForm(false) : openCreate())} />

      {showForm ? (
        <Card style={styles.form}>
          <AppText variant="headline">{editing ? 'Edit window' : 'New window'}</AppText>
          <Controller
            control={control}
            name="date"
            render={({ field, fieldState }) => (
              <TextField
                label="Date"
                required
                placeholder="YYYY-MM-DD"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                autoCapitalize="none"
              />
            )}
          />
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Controller
                control={control}
                name="startTime"
                render={({ field, fieldState }) => (
                  <TextField
                    label="Start"
                    required
                    placeholder="09:00"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
            <View style={styles.timeField}>
              <Controller
                control={control}
                name="endTime"
                render={({ field, fieldState }) => (
                  <TextField
                    label="End"
                    required
                    placeholder="17:00"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <SelectField
                label="Status"
                required
                options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="serviceId"
            render={({ field }) => (
              <SelectField
                label="Service (optional)"
                placeholder="Whole business"
                options={[
                  { value: '', label: 'Whole business' },
                  ...(services.data ?? []).map((service) => ({ value: service.id, label: service.title })),
                ]}
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field, fieldState }) => (
              <TextField
                label="Notes"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          {actionError ? (
            <AppText variant="caption" color="danger" accessibilityRole="alert">
              {actionError}
            </AppText>
          ) : null}
          <Button label="Save window" loading={formState.isSubmitting} onPress={() => void onSave()} />
        </Card>
      ) : null}

      {windows.isPending ? (
        <SkeletonCard height={180} />
      ) : windows.isError ? (
        <InlineError message={errorMessage(windows.error)} onRetry={() => void windows.refetch()} />
      ) : windows.data.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No upcoming windows"
          message="Add unavailable or available time ranges so your team can plan around them."
        />
      ) : (
        windows.data.map((window) => {
          const start = new Date(window.startsAt);
          const end = new Date(window.endsAt);
          return (
            <Card key={window.id} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.text}>
                  <AppText variant="headline">{formatDay(start)}</AppText>
                  <AppText color="textMuted">
                    {formatTime(start)} – {formatTime(end)}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {window.serviceId ? (serviceNames.get(window.serviceId) ?? 'Service') : 'Whole business'}
                    {window.notes ? ` · ${window.notes}` : ''}
                  </AppText>
                </View>
                <StatusPill label={window.status} tone={STATUS_TONE[window.status]} />
              </View>
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={() => openEdit(window)} style={styles.action}>
                  <Feather name="edit-2" size={16} color={colors.primaryDark} />
                  <AppText variant="caption" color="primaryDark">
                    Edit
                  </AppText>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setPendingDelete(window)} style={styles.action}>
                  <Feather name="trash-2" size={16} color={colors.danger} />
                  <AppText variant="caption" color="danger">
                    Delete
                  </AppText>
                </Pressable>
              </View>
            </Card>
          );
        })
      )}

      <ActionSheet
        visible={Boolean(pendingDelete)}
        title="Delete window?"
        message="This removes the availability entry. It does not change bookings."
        onClose={() => setPendingDelete(null)}
        actions={[
          {
            label: 'Delete window',
            icon: 'trash-2',
            destructive: true,
            onPress: () => {
              if (!pendingDelete) return;
              void remove.mutateAsync(pendingDelete.id).catch((error) => setActionError(errorMessage(error)));
            },
          },
        ]}
      />
    </Screen>
  );
}

function toDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeField: {
    flex: 1,
  },
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
