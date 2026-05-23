import { useState, useCallback } from 'react';
import type { AlertType } from '@/components/ui/custom-alert';

export interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export function useCustomAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
  });

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AlertState['buttons'],
      type: AlertType = 'info'
    ) => {
      setAlertState({
        visible: true,
        title,
        message,
        type,
        buttons,
      });
    },
    []
  );

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    alertState,
    showAlert,
    hideAlert,
  };
}
