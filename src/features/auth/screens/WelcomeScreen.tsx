import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand/BrandMark';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, sizes, spacing } from '@/theme';

const heroImage = require('@/assets/images/brand/welcome-hero.jpg');

export function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityIgnoresInvertColors />
      <LinearGradient
        colors={['rgba(251,241,229,0.92)', 'rgba(251,241,229,0.55)', 'rgba(20,14,8,0)', 'rgba(20,14,8,0.78)']}
        locations={[0, 0.32, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <BrandMark size={96} ring={false} />
          <AppText variant="brand" align="center" accessibilityRole="header">
            Kiburan
          </AppText>
          <AppText variant="brandSub" align="center" color="heading">
            Vendor
          </AppText>
          <AppText variant="bodyMedium" align="center" color="text" style={styles.tagline}>
            Grow Your Business,{'\n'}Serve More Couples
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button label="Get Started" hero onPress={() => router.push('/register')} />
          <Button label="Sign In" variant="text" onPress={() => router.push('/sign-in')} style={styles.signIn} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.heading,
  },
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: sizes.maxContentWidth,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.screenPadding,
  },
  brand: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingTop: spacing.xxl * 2,
  },
  tagline: {
    marginTop: spacing.sm,
  },
  actions: {
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  signIn: {
    alignSelf: 'center',
  },
});
