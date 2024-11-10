import { Stack, usePathname } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserProvider } from '../components/UserContext';

export default function RootLayout() {
  const pathname = usePathname();
  const isIndexPage = pathname === '/';

  return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <UserProvider>
            {!isIndexPage && <Header />}
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
              </Stack>
            {!isIndexPage && <Footer />}
          </UserProvider>
        </View>
      </SafeAreaView>
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
