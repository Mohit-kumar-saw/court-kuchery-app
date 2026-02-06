import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    await login(phone || '9876543210', password || 'dummy');
    router.replace(ROUTES.TABS.ROOT);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
         <Image source={require('@/assets/court/court-k-logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={AppColors.primaryLight} />
          <TextInput
            style={styles.input}
            placeholder="Phone No."
            placeholderTextColor={AppColors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={AppColors.primaryLight} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={AppColors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsRow}>
          <Text style={styles.optionText}>Remember me</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupPrompt}>Not have an account ?</Text>
          <Link href={ROUTES.AUTH.SIGNUP} asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: AppColors.primary,
    marginLeft: 4,
  },
  logo: {
    width: 210,
    height: 74,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoOval: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: AppColors.primary,
    gap: 12,
  },
  logoCourt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  logoKutchery: {
    fontSize: 16,
    fontStyle: 'italic',
    color: AppColors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.text,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionText: {
    fontSize: 14,
    color: AppColors.text,
  },
  linkText: {
    fontSize: 14,
    color: AppColors.primary,
  },
  loginButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  signupPrompt: {
    fontSize: 15,
    color: AppColors.textSecondary,
  },
  signupLink: {
    fontSize: 15,
    color: AppColors.primary,
    fontWeight: '600',
  },
});
