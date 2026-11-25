import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, InlineError } from '@/components/feedback/EmptyState';
import { HeaderBar } from '@/components/layout/HeaderBar';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useActiveVendor } from '@/features/account/context/AccountContext';
import { canManageBusiness } from '@/features/account/utils/accountState';
import {
  getVendorPayoutDetails,
  registerChapaSubaccount,
} from '@/features/earnings/services/payoutService';
import { errorMessage } from '@/lib/query/queryError';
import { queryKeys } from '@/lib/query/queryKeys';
import { spacing } from '@/theme';

export function PayoutSettingsScreen() {
  const { vendor } = useActiveVendor();
  const queryClient = useQueryClient();
  const canManage = canManageBusiness(vendor.role);

  const payoutQuery = useQuery({
    queryKey: [...queryKeys.earnings(vendor.vendorId), 'payout'],
    queryFn: () => getVendorPayoutDetails(vendor.vendorId),
    enabled: canManage,
  });

  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!payoutQuery.data) return;
    setAccountName(payoutQuery.data.accountName ?? '');
    setAccountNumber(payoutQuery.data.accountNumber ?? '');
    setBankCode(payoutQuery.data.bankCode ?? '');
  }, [payoutQuery.data]);

  const save = useMutation({
    mutationFn: () =>
      registerChapaSubaccount({
        vendorId: vendor.vendorId,
        businessName: vendor.businessName,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankCode: bankCode.trim(),
      }),
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({
        queryKey: [...queryKeys.earnings(vendor.vendorId), 'payout'],
      });
    },
    onError: (error) => setFormError(errorMessage(error)),
  });

  if (!canManage) {
    return (
      <Screen edges={['top']} header={<HeaderBar title="Payouts" />}>
        <EmptyState
          icon="lock"
          title="Managers only"
          message="Only owners and managers can link a Chapa payout account."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']} header={<HeaderBar title="Chapa payouts" />}>
      <Card style={styles.card}>
        <AppText variant="headline">Marketplace split</AppText>
        <AppText color="textMuted">
          Link your bank account so booking deposits paid by couples via Chapa can split
          automatically (default 95% to you, 5% platform fee).
        </AppText>
        {payoutQuery.data?.chapaSubaccountId ? (
          <AppText variant="caption" color="success">
            Linked subaccount: {payoutQuery.data.chapaSubaccountId}
          </AppText>
        ) : (
          <AppText variant="caption" color="textMuted">
            No Chapa subaccount linked yet.
          </AppText>
        )}
      </Card>

      {payoutQuery.isError ? (
        <InlineError
          message={errorMessage(payoutQuery.error)}
          onRetry={() => void payoutQuery.refetch()}
        />
      ) : null}

      <View style={styles.form}>
        <TextField
          label="Account name"
          value={accountName}
          onChangeText={setAccountName}
          autoCapitalize="words"
        />
        <TextField
          label="Account number"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="number-pad"
        />
        <TextField
          label="Bank code"
          value={bankCode}
          onChangeText={setBankCode}
          hint="Use the bank code from Chapa’s banks list."
        />
        {formError ? (
          <AppText variant="caption" color="danger" accessibilityRole="alert">
            {formError}
          </AppText>
        ) : null}
        <Button
          label={payoutQuery.data?.chapaSubaccountId ? 'Update payout details' : 'Link Chapa payout'}
          loading={save.isPending}
          onPress={() => {
            if (!accountName.trim() || !accountNumber.trim() || !bankCode.trim()) {
              setFormError('Account name, number, and bank code are required.');
              return;
            }
            setFormError(null);
            save.mutate();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
});
