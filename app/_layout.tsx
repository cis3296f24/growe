import { Stack, usePathname } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout() {
  const pathname = usePathname();
  const isIndexPage = pathname === '/';

  return (
    <LinearGradient
      colors={['#8E9F8D', '#596558']}
      style={styles.background}
      start={[0, 0]}
      end={[1, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {!isIndexPage && <Header />}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          {!isIndexPage && <Footer />}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
