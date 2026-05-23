import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { CustomAlert } from '@/components/ui/custom-alert';
import { useCustomAlert, type AlertState } from '@/hooks/use-custom-alert';
import type { AlertType } from '@/components/ui/custom-alert';

interface AlertContextType {
  showAlert: (
    title: string,
    message?: string,
    buttons?: AlertState['buttons'],
    type?: AlertType
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const { alertState, showAlert, hideAlert } = useCustomAlert();
  const isDark = useColorScheme() === 'dark';

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert {...alertState} isDark={isDark} onClose={hideAlert} />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
