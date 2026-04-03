import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/src/theme/colors';

const BRAND_LOGO_SOURCE = require('../../assets/images/resellerio-logo.png');

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
}>;

export function Screen({ children, scrollable = false, contentContainerStyle, footer }: ScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          style={styles.screenBody}
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footerWrap}>{footer}</View> : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
      {footer ? <View style={styles.footerWrap}>{footer}</View> : null}
    </SafeAreaView>
  );
}

type BrandedTitleProps = {
  title: string;
  size?: 'page' | 'hero';
};

export function BrandedTitle({ title, size = 'page' }: BrandedTitleProps) {
  return (
    <View style={styles.brandedTitleRow}>
      <View style={styles.brandedTitleLogoWrap}>
        <Image
          accessibilityLabel="ResellerIO logo"
          source={BRAND_LOGO_SOURCE}
          style={[
            styles.brandedTitleLogo,
            size === 'hero' ? styles.brandedTitleLogoHero : styles.brandedTitleLogoPage,
          ]}
        />
      </View>
      <Text
        selectable
        style={[
          styles.brandedTitleText,
          size === 'hero' ? styles.brandedTitleTextHero : styles.brandedTitleTextPage,
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

type ButtonProps = {
  label: string;
  kind?: 'primary' | 'secondary';
  disabled?: boolean;
  onPress: () => void;
};

export function Button({ label, kind = 'primary', disabled = false, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        kind === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        (disabled || pressed) && styles.buttonPressed,
      ]}
    >
      <Text style={kind === 'primary' ? styles.buttonPrimaryText : styles.buttonSecondaryText}>
        {label}
      </Text>
    </Pressable>
  );
}

type LinkTextProps = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

export function LinkText({ label, disabled = false, onPress }: LinkTextProps) {
  return (
    <Pressable
      accessibilityRole="link"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.linkWrap, (disabled || pressed) && styles.buttonPressed]}
    >
      <Text selectable style={[styles.linkText, disabled && styles.linkTextDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

type TextFieldProps = TextInputProps & {
  label: string;
  copyable?: boolean;
  copyValue?: string;
};

export function TextField({
  label,
  style,
  copyable = false,
  copyValue,
  value,
  multiline,
  ...props
}: TextFieldProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedCopyValue = String(copyValue ?? value ?? '');
  const canCopy = copyable && resolvedCopyValue.trim().length > 0;

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    if (!canCopy) {
      return;
    }

    await Clipboard.setStringAsync(resolvedCopyValue);
    setCopied(true);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1200);
  }

  return (
    <View style={{ gap: 8 }}>
      <Text selectable style={styles.fieldLabel}>
        {label}
      </Text>
      <View style={[styles.inputShell, multiline && styles.inputShellMultiline]}>
        <TextInput
          placeholderTextColor={colors.mutedText}
          style={[
            styles.input,
            copyable && styles.inputWithAction,
            multiline && styles.inputMultiline,
            style,
          ]}
          value={value}
          multiline={multiline}
          {...props}
        />
        {copyable ? (
          <Pressable
            accessibilityLabel={`Copy ${label}`}
            accessibilityRole="button"
            disabled={!canCopy}
            onPress={() => {
              void handleCopy();
            }}
            style={({ pressed }) => [
              styles.inputAction,
              multiline && styles.inputActionMultiline,
              (!canCopy || pressed) && styles.inputActionPressed,
            ]}
          >
            <Ionicons
              color={copied ? colors.accent : canCopy ? colors.mutedText : colors.border}
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <View style={styles.errorWrap}>
      <Text selectable style={styles.errorText}>
        {message}
      </Text>
    </View>
  );
}

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionCard({ eyebrow, title, description }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text selectable style={styles.sectionEyebrow}>
        {eyebrow}
      </Text>
      <Text selectable style={styles.sectionTitle}>
        {title}
      </Text>
      <Text selectable style={styles.sectionDescription}>
        {description}
      </Text>
    </View>
  );
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <Screen contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 14 }}>
        <ActivityIndicator color={colors.accent} size="small" />
        <Text style={{ color: colors.mutedText, fontSize: 15 }}>{label}</Text>
      </View>
    </Screen>
  );
}

type StandardBottomNavProps = {
  activeTab: 'home' | 'products' | 'inquiries' | 'settings';
};

const bottomNavItems: {
  key: StandardBottomNavProps['activeTab'];
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  href: '/home' | '/products' | '/inquiries' | '/settings';
}[] = [
  { key: 'home', label: 'Home', icon: 'grid-outline', href: '/home' },
  { key: 'products', label: 'Products', icon: 'pricetag-outline', href: '/products' },
  { key: 'inquiries', label: 'Inquiries', icon: 'mail-open-outline', href: '/inquiries' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline', href: '/settings' },
];

export function StandardBottomNav({ activeTab }: StandardBottomNavProps) {
  return (
    <View style={styles.standardBottomNav}>
      {bottomNavItems.map((item) => {
        const isActive = item.key === activeTab;

        return (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            onPress={() => {
              if (!isActive) {
                router.replace(item.href);
              }
            }}
            style={({ pressed }) => [
              styles.standardBottomNavItem,
              isActive && styles.standardBottomNavItemActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              color={isActive ? colors.accent : colors.mutedText}
              name={item.icon}
              size={20}
            />
            <Text selectable style={[styles.standardBottomNavLabel, isActive && styles.standardBottomNavLabelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type DialogModalProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}>;

export function DialogModal({
  visible,
  title,
  description,
  onClose,
  children,
}: DialogModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          accessibilityViewIsModal
          style={styles.modalCard}
          onPress={(event) => {
            event.stopPropagation();
          }}
        >
          <View style={{ gap: 8 }}>
            <Text style={styles.modalTitle}>{title}</Text>
            {description ? <Text style={styles.modalDescription}>{description}</Text> : null}
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  brandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandedTitleLogoWrap: {
    marginTop: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 4,
  },
  brandedTitleLogo: {
    borderRadius: 12,
  },
  brandedTitleLogoPage: {
    width: 30,
    height: 30,
  },
  brandedTitleLogoHero: {
    width: 34,
    height: 34,
  },
  brandedTitleText: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  brandedTitleTextPage: {
    fontSize: 31,
  },
  brandedTitleTextHero: {
    fontSize: 34,
  },
  screenBody: {
    flex: 1,
  },
  footerWrap: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 20,
  },
  standardBottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: 72,
    paddingHorizontal: 8,
    paddingBottom: 10,
    paddingTop: 8,
  },
  standardBottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 16,
    paddingVertical: 6,
  },
  standardBottomNavItemActive: {
    backgroundColor: colors.accentSoft,
  },
  standardBottomNavLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  standardBottomNavLabelActive: {
    color: colors.accent,
  },
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  linkWrap: {
    alignSelf: 'flex-start',
  },
  linkText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
  linkTextDisabled: {
    color: colors.mutedText,
    textDecorationLine: 'none',
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  inputShell: {
    position: 'relative',
    borderRadius: 18,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  inputShellMultiline: {
    minHeight: 110,
  },
  inputWithAction: {
    paddingRight: 52,
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  inputAction: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  inputActionMultiline: {
    top: 11,
    marginTop: 0,
  },
  inputActionPressed: {
    opacity: 0.6,
  },
  errorWrap: {
    borderRadius: 18,
    backgroundColor: '#fde7df',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    gap: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  sectionEyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sectionDescription: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 24, 17, 0.42)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    gap: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  modalDescription: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
});
