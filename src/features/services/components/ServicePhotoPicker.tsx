import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActionSheet } from '@/components/ui/ActionSheet';
import { AppText } from '@/components/ui/AppText';
import { Thumb } from '@/components/ui/Thumb';
import { pickVendorImage, uploadVendorPublicImage } from '@/features/business-profile/services/vendorStorage';
import {
  useAddServicePhoto,
  useDeleteServicePhoto,
  useServicePhotos,
} from '@/features/services/hooks/useServices';
import { addServicePhoto, type ServicePhoto } from '@/features/services/services/serviceMedia';
import { errorMessage } from '@/lib/query/queryError';
import { colors, radii, spacing } from '@/theme';

type Props = {
  vendorId: string;
  /** When null (new service), photos are held locally until the service is created. */
  serviceId: string | null;
  pending: PendingPhoto[];
  onPendingChange: (photos: PendingPhoto[]) => void;
};

export type PendingPhoto = {
  key: string;
  uri: string;
  mimeType: string | null;
  width: number;
  height: number;
};

export function ServicePhotoPicker({ vendorId, serviceId, pending, onPendingChange }: Props) {
  const photos = useServicePhotos(vendorId, serviceId ?? '', Boolean(serviceId));
  const addPhoto = useAddServicePhoto(vendorId, serviceId ?? '');
  const removePhoto = useDeleteServicePhoto(vendorId, serviceId ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ServicePhoto | null>(null);

  const onAdd = async () => {
    setError(null);
    setBusy(true);
    try {
      const picked = await pickVendorImage();
      if (!picked.ok) {
        setError(picked.error.message);
        return;
      }
      if (!picked.data) return;

      if (!serviceId) {
        onPendingChange([
          ...pending,
          {
            key: `${Date.now()}-${pending.length}`,
            uri: picked.data.uri,
            mimeType: picked.data.mimeType,
            width: picked.data.width,
            height: picked.data.height,
          },
        ]);
        return;
      }

      const uploaded = await uploadVendorPublicImage({
        vendorId,
        kind: 'service',
        serviceId,
        picked: picked.data,
      });
      if (!uploaded.ok) {
        setError(uploaded.error.message);
        return;
      }
      await addPhoto.mutateAsync(uploaded.data.publicUrl);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Upload service photos"
        disabled={busy || addPhoto.isPending}
        onPress={() => void onAdd()}
        style={({ pressed }) => [styles.dropzone, pressed && styles.pressed]}>
        <Feather name="camera" size={26} color={colors.primaryDark} />
        <AppText variant="headline">{busy ? 'Uploading…' : 'Upload Photos'}</AppText>
        <AppText variant="caption" color="textMuted" align="center">
          {serviceId
            ? 'JPG or PNG. Photos are resized before upload.'
            : 'Pick photos now — they upload after you save the service.'}
        </AppText>
      </Pressable>

      {error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}

      <View style={styles.grid}>
        {(photos.data ?? []).map((photo) => (
          <Pressable
            key={photo.id}
            accessibilityRole="button"
            accessibilityLabel="Service photo. Tap to delete."
            onPress={() => setPendingDelete(photo)}
            style={styles.cell}>
            <Thumb uri={photo.url} style={styles.thumb} />
          </Pressable>
        ))}
        {pending.map((photo) => (
          <Pressable
            key={photo.key}
            accessibilityRole="button"
            accessibilityLabel="Pending photo. Tap to remove."
            onPress={() => onPendingChange(pending.filter((item) => item.key !== photo.key))}
            style={styles.cell}>
            <Image source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
          </Pressable>
        ))}
      </View>

      <ActionSheet
        visible={Boolean(pendingDelete)}
        title="Remove photo?"
        message="This deletes the photo from this service."
        onClose={() => setPendingDelete(null)}
        actions={[
          {
            label: 'Delete photo',
            icon: 'trash-2',
            destructive: true,
            onPress: () => {
              if (!pendingDelete || !serviceId) return;
              void removePhoto
                .mutateAsync({ mediaId: pendingDelete.id, publicUrl: pendingDelete.url })
                .catch((err) => setError(errorMessage(err)));
            },
          },
        ]}
      />
    </View>
  );
}

/** Uploads pending local picks after a new service is created. */
export async function uploadPendingServicePhotos(input: {
  vendorId: string;
  serviceId: string;
  pending: PendingPhoto[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  for (const photo of input.pending) {
    const uploaded = await uploadVendorPublicImage({
      vendorId: input.vendorId,
      kind: 'service',
      serviceId: input.serviceId,
      picked: {
        uri: photo.uri,
        mimeType: photo.mimeType,
        width: photo.width,
        height: photo.height,
      },
    });
    if (!uploaded.ok) return { ok: false, message: uploaded.error.message };
    const saved = await addServicePhoto(input.vendorId, input.serviceId, uploaded.data.publicUrl);
    if (!saved.ok) return { ok: false, message: saved.error.message };
  }
  return { ok: true };
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  dropzone: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  cell: {
    width: 88,
    height: 88,
    borderRadius: radii.thumb,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
});
