import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback/EmptyState';
import { LargeTitleHeader } from '@/components/layout/HeaderBar';
import { colors, sizes } from '@/theme';

/**
 * Kiburan has no messaging tables or realtime channel yet (backend proposal P5), so this screen
 * states that plainly instead of rendering sample conversations.
 */
export function MessagesScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.inner}>
        <LargeTitleHeader title="Messages" />
        <View style={styles.body}>
          <EmptyState
            icon="message-circle"
            title="Messaging isn't available yet"
            message="Couples can't message vendors in Kiburan yet. New inquiries are counted on your dashboard."
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: sizes.screenPadding,
  },
});
