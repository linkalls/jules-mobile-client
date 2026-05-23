import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export type AlertType = 'success' | 'error' | 'info';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose: () => void;
  isDark: boolean;
}

export function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  buttons,
  onClose,
  isDark,
}: CustomAlertProps) {
  const scaleValue = React.useRef(new Animated.Value(0.9)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 7,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, scaleValue, opacityValue]);

  if (!modalVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IconSymbol name="checkmark.circle.fill" size={32} color={Colors.light.success} />;
      case 'error':
        return <IconSymbol name="exclamationmark.circle.fill" size={32} color={Colors.light.error} />;
      default:
        return <IconSymbol name="info.circle.fill" size={32} color={Colors.light.primary} />;
    }
  };

  const defaultButtons = buttons || [
    { text: 'OK', onPress: onClose, style: 'default' }
  ];

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: opacityValue }]} />
        <Animated.View
          style={[
            styles.alertBox,
            isDark ? styles.alertBoxDark : styles.alertBoxLight,
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          <Text style={[styles.title, isDark ? styles.textDark : styles.textLight]}>
            {title}
          </Text>

          {message ? (
            <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>
              {message}
            </Text>
          ) : null}

          <View style={[styles.buttonContainer, defaultButtons.length > 2 && styles.buttonContainerVertical]}>
            {defaultButtons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isDestructive && styles.buttonDestructive,
                    isCancel && (isDark ? styles.buttonCancelDark : styles.buttonCancelLight),
                    (defaultButtons.length === 2) && styles.buttonHalf,
                    (defaultButtons.length > 2) && styles.buttonFull
                  ]}
                  onPress={() => {
                    btn.onPress();
                    if (btn.onPress !== onClose) {
                      onClose();
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && (isDark ? styles.buttonTextCancelDark : styles.buttonTextCancelLight)
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  alertBox: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  alertBoxLight: {
    backgroundColor: '#ffffff',
  },
  alertBoxDark: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  textLight: {
    color: '#0f172a',
  },
  textDark: {
    color: '#f8fafc',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  messageLight: {
    color: '#64748b',
  },
  messageDark: {
    color: '#94a3b8',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHalf: {
    flex: 1,
  },
  buttonFull: {
    width: '100%',
  },
  buttonDestructive: {
    backgroundColor: Colors.light.error,
  },
  buttonCancelLight: {
    backgroundColor: '#f1f5f9',
  },
  buttonCancelDark: {
    backgroundColor: '#334155',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDestructive: {
    color: '#ffffff',
  },
  buttonTextCancelLight: {
    color: '#475569',
  },
  buttonTextCancelDark: {
    color: '#cbd5e1',
  },
});
