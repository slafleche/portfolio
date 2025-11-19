'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type FormBlockRegistration = {
  key: string;
  focus?: () => void;
  getValue?: () => unknown;
  validate?: () => boolean;
  requestFocusBefore?: () => void;
  requestFocusAfter?: () => void;
};

type FormBlocksContextValue = {
  registerBlock: (registration: FormBlockRegistration) => () => void;
  continuousValidation: boolean;
  enableContinuousValidation: () => void;
};

const FormBlocksContext = createContext<FormBlocksContextValue | null>(null);

export function FormBlocksProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [continuousValidation, setContinuousValidation] =
    useState<boolean>(false);
  const blocksRef = useRef(new Map<string, FormBlockRegistration>());

  const registerBlock = useCallback(
    (registration: FormBlockRegistration) => {
      if (
        process.env.NODE_ENV !== 'production' &&
        (!registration.requestFocusBefore || !registration.requestFocusAfter)
      ) {
        console.warn(
          `FormBlock "${registration.key}" is missing focus boundary handlers.`,
        );
      }
      blocksRef.current.set(registration.key, registration);
      return () => {
        blocksRef.current.delete(registration.key);
      };
    },
    [],
  );

  const value = useMemo<FormBlocksContextValue>(
    () => ({
      registerBlock,
      continuousValidation,
      enableContinuousValidation: () => setContinuousValidation(true),
    }),
    [continuousValidation, registerBlock],
  );

  return (
    <FormBlocksContext.Provider value={value}>
      {children}
    </FormBlocksContext.Provider>
  );
}

export const useFormBlocksContext = () => {
  const context = useContext(FormBlocksContext);
  if (!context) {
    throw new Error('useFormBlocksContext must be used within FormBlocksProvider');
  }
  return context;
};

export const useFormBlock = (registration: FormBlockRegistration) => {
  const context = useFormBlocksContext();
  useEffect(() => {
    return context.registerBlock(registration);
  }, [context, registration]);
  return {
    continuousValidation: context.continuousValidation,
    enableContinuousValidation: context.enableContinuousValidation,
  };
};
