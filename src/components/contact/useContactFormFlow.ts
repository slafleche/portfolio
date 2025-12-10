'use client';

import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useFormBlocksContext } from './formBlocks.context';
import type {
  ContactFormBlockPayload,
  ContactFormBlockValidationResult,
  ContactFormFlowSubmitHelper,
  ContactFormSubmitStatus,
} from './types/form.types';

type UseContactFormFlowOptions = {
  submitHelper: ContactFormFlowSubmitHelper;
  onSuccessStateChange?: (visible: boolean) => void;
};

export type ContactFormFlowState = {
  isSubmitting: boolean;
  invalid: boolean;
  submitStatus: ContactFormSubmitStatus;
  latestValidationResults: ContactFormBlockValidationResult[];
  latestPayload: ContactFormBlockPayload<unknown>[] | null;
};

export type ContactFormFlowApi = ContactFormFlowState & {
  handleSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
};

export function useContactFormFlow(
  options: UseContactFormFlowOptions,
): ContactFormFlowApi {
  const { submitHelper, onSuccessStateChange } = options;
  const { getRegistrationsSnapshot, enableContinuousValidation } =
    useFormBlocksContext();

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);
  const [
    invalid,
    setInvalid,
  ] = useState(false);
  const [
    submitStatus,
    setSubmitStatus,
  ] = useState<ContactFormSubmitStatus>('idle');
  const [
    latestValidationResults,
    setLatestValidationResults,
  ] = useState<ContactFormBlockValidationResult[]>([]);
  const [
    latestPayload,
    setLatestPayload,
  ] = useState<ContactFormBlockPayload<unknown>[] | null>(null);

  const inFlightRef = useRef(false);

  const validateAll =
    useCallback((): ContactFormBlockValidationResult[] => {
      const registrations = getRegistrationsSnapshot();
      const results: ContactFormBlockValidationResult[] = [];

      registrations.forEach((registration) => {
        const contract = registration.getContract?.();
        if (!contract) return;
        const result = contract.validate();
        results.push(result);
      });

      return results;
    }, [
      getRegistrationsSnapshot,
    ]);

  const collectPayload =
    useCallback((): ContactFormBlockPayload<unknown>[] => {
      const registrations = getRegistrationsSnapshot();
      const payloads: ContactFormBlockPayload<unknown>[] = [];

      registrations.forEach((registration) => {
        const contract = registration.getContract?.();
        if (!contract) return;
        const payload = contract.getPayload();
        payloads.push(payload);
      });

      return payloads;
    }, [
      getRegistrationsSnapshot,
    ]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      setIsSubmitting(true);

      try {
        const validationResults = validateAll();
        setLatestValidationResults(validationResults);

        if (validationResults.length === 0) {
          setInvalid(false);
          setLatestPayload(null);
          setSubmitStatus('not_configured');
          if (onSuccessStateChange) {
            onSuccessStateChange(false);
          }
          return;
        }

        const allValid = validationResults.every(
          (result) => result.valid,
        );

        if (!allValid) {
          setInvalid(true);
          setSubmitStatus('validation_error');
          enableContinuousValidation();
          return;
        }

        setInvalid(false);

        const payload = collectPayload();
        setLatestPayload(payload);

        try {
          const code = await submitHelper(payload);
          setSubmitStatus(code);

          const success = code === 'success';
          if (success) {
            setInvalid(false);
          } else if (code === 'validation_error') {
            setInvalid(true);
            enableContinuousValidation();
          }

          if (onSuccessStateChange) {
            onSuccessStateChange(success);
          }
        } catch {
          setSubmitStatus('generic_error');
          if (onSuccessStateChange) {
            onSuccessStateChange(false);
          }
        }
      } finally {
        inFlightRef.current = false;
        setIsSubmitting(false);
      }
    },
    [
      collectPayload,
      enableContinuousValidation,
      onSuccessStateChange,
      submitHelper,
      validateAll,
    ],
  );

  return {
    handleSubmit,
    isSubmitting,
    invalid,
    submitStatus,
    latestValidationResults,
    latestPayload,
  };
}
