import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
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

type ScreenProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ children, scrollable = false, contentContainerStyle }: ScreenProps) {
  if (scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
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

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedText}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <View style={styles.errorWrap}>
      <Text style={styles.errorText}>{message}</Text>
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
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 20,
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
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
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
