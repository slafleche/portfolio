'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  ContactFormBlockContract,
  ContactFormBlockValidationResult,
} from './types/form.types';

export type FormBlockRegistration = {
  key: string;
  focus?: () => void;
  getValue?: () => unknown;
  validate?: () => boolean;
  getValidationSummary?: () => string | null;
  // Indicates whether this block is currently in "live validation" mode.
  // Blocks typically compute this as (hasBlurred || continuousValidation),
  // where `hasBlurred` is local state and `continuousValidation` comes from
  // the form-blocks context after the first failed submit.
  liveValidation: boolean;
  getContract?: () => ContactFormBlockContract<unknown>;
};

type FormBlocksContextValue = {
  registerBlock: (registration: FormBlockRegistration) => () => void;
  // Global live-validation flag: false initially, then set to true by the
  // form shell (for example, after the first failed submit) to indicate that
  // all blocks should treat their validation as "live" while the form is
  // invalid.
  continuousValidation: boolean;
  enableContinuousValidation: () => void;
  getRegistrationsSnapshot: () => FormBlockRegistration[];
  recordValidationResult: (
    result: ContactFormBlockValidationResult,
  ) => void;
  getValidationResultsSnapshot: () => ContactFormBlockValidationResult[];
  validationResultsVersion: number;
  reportCatastrophic: (source: string, reason: string) => void;
};

const FormBlocksContext =
  createContext<FormBlocksContextValue | null>(null);

export function FormBlocksProvider({
  children,
  onCatastrophic,
}: {
  children: ReactNode;
  onCatastrophic?: (source: string, reason: string) => void;
}) {
  const [
    continuousValidation,
    setContinuousValidation,
  ] = useState<boolean>(false);
  const blocksRef = useRef(new Map<string, FormBlockRegistration>());
  const validationResultsRef = useRef(
    new Map<string, ContactFormBlockValidationResult>(),
  );
  const [
    validationResultsVersion,
    setValidationResultsVersion,
  ] = useState(0);

  const registerBlock = useCallback(
    (registration: FormBlockRegistration) => {
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
      getRegistrationsSnapshot: () =>
        Array.from(blocksRef.current.values()),
      recordValidationResult: (result) => {
        validationResultsRef.current.set(result.id, result);
        setValidationResultsVersion((version) => version + 1);
      },
      getValidationResultsSnapshot: () =>
        Array.from(validationResultsRef.current.values()),
      validationResultsVersion,
      reportCatastrophic: (source, reason) => {
        if (onCatastrophic) {
          onCatastrophic(source, reason);
        } else {
          // Helper for investigating catastrophic failures.
          // Source is the block key (for example, 'turnstile').
          // Reason is a free-form string for debugging.
          console.error('[contact][catastrophic]', {
            source,
            reason,
          });
        }
      },
    }),
    [
      continuousValidation,
      registerBlock,
      validationResultsVersion,
      onCatastrophic,
    ],
  );

  return (
    <FormBlocksContext.Provider value={value}>
      {children}
    </FormBlocksContext.Provider>
  );
}

type TestFormBlocksProviderProps = {
  children: ReactNode;
  onRegisterBlock?: (registration: FormBlockRegistration) => void;
};

export function TestFormBlocksProvider({
  children,
  onRegisterBlock,
}: TestFormBlocksProviderProps) {
  const [
    continuousValidation,
    setContinuousValidation,
  ] = useState<boolean>(false);
  const blocksRef = useRef(new Map<string, FormBlockRegistration>());
  const validationResultsRef = useRef(
    new Map<string, ContactFormBlockValidationResult>(),
  );
  const [
    validationResultsVersion,
    setValidationResultsVersion,
  ] = useState(0);

  const registerBlock = useCallback(
    (registration: FormBlockRegistration) => {
      blocksRef.current.set(registration.key, registration);
      if (onRegisterBlock) {
        onRegisterBlock(registration);
      }
      return () => {
        blocksRef.current.delete(registration.key);
      };
    },
    [
      onRegisterBlock,
    ],
  );

  const value = useMemo<FormBlocksContextValue>(
    () => ({
      registerBlock,
      continuousValidation,
      enableContinuousValidation: () => setContinuousValidation(true),
      getRegistrationsSnapshot: () =>
        Array.from(blocksRef.current.values()),
      recordValidationResult: (result) => {
        validationResultsRef.current.set(result.id, result);
        setValidationResultsVersion((version) => version + 1);
      },
      getValidationResultsSnapshot: () =>
        Array.from(validationResultsRef.current.values()),
      validationResultsVersion,
      reportCatastrophic: (source, reason) => {
        console.error('[contact][catastrophic]', {
          source,
          reason,
        });
      },
    }),
    [
      continuousValidation,
      registerBlock,
      validationResultsVersion,
    ],
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
    throw new Error(
      'useFormBlocksContext must be used within FormBlocksProvider',
    );
  }
  return context;
};

export const useFormBlock = (registration: FormBlockRegistration) => {
  const context = useFormBlocksContext();
  useEffect(() => {
    return context.registerBlock(registration);
  }, [
    context,
    registration,
  ]);

  const reportCatastrophic = useCallback(
    (reason: string) => {
      context.reportCatastrophic(registration.key, reason);
    },
    [
      context,
      registration.key,
    ],
  );

  return {
    continuousValidation: context.continuousValidation,
    enableContinuousValidation: context.enableContinuousValidation,
    recordValidationResult: context.recordValidationResult,
    reportCatastrophic,
  };
};
