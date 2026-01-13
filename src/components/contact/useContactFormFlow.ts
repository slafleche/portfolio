'use client';

import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  buildInvalidFieldSummary,
  logContactFormDebugEvent,
} from './contactFormDebugLogger';
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
  const {
    getRegistrationsSnapshot,
    enableContinuousValidation,
    markSubmitAttempted,
    recordValidationResult,
    getValidationResultsSnapshot,
    validationResultsVersion,
  } = useFormBlocksContext();

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
  const hadInvalidSnapshotRef = useRef(false);
  const lastLoggedStatusRef = useRef<ContactFormSubmitStatus>('idle');

  const logSubmitResult = useCallback(
    (
      status: ContactFormSubmitStatus,
      validationResults: ContactFormBlockValidationResult[],
    ) => {
      if (status === 'idle') {
        lastLoggedStatusRef.current = status;
        return;
      }
      if (lastLoggedStatusRef.current === status) {
        return;
      }
      lastLoggedStatusRef.current = status;

      logContactFormDebugEvent('submit_result', {
        submitStatus: status,
        code: status,
        invalidFields: buildInvalidFieldSummary(
          validationResults.filter((result) => !result.valid),
        ),
      });
    },
    [],
  );

  const validateAll =
    useCallback((): ContactFormBlockValidationResult[] => {
      const registrations = getRegistrationsSnapshot();
      const results: ContactFormBlockValidationResult[] = [];

      registrations.forEach((registration) => {
        const contract = registration.getContract?.();
        if (!contract) return;
        const result = contract.validate();
        recordValidationResult(result);
        results.push(result);
      });

      return results;
    }, [
      getRegistrationsSnapshot,
      recordValidationResult,
    ]);

  useEffect(() => {
    const snapshot = getValidationResultsSnapshot();
    setLatestValidationResults(snapshot);

    if (snapshot.some((result) => !result.valid)) {
      hadInvalidSnapshotRef.current = true;
    }

    if (
      submitStatus === 'validation_error' &&
      hadInvalidSnapshotRef.current &&
      snapshot.length > 0 &&
      snapshot.every((result) => result.valid)
    ) {
      setInvalid(false);
      setSubmitStatus('idle');
      hadInvalidSnapshotRef.current = false;
    }
  }, [
    getValidationResultsSnapshot,
    submitStatus,
    validationResultsVersion,
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

      markSubmitAttempted();

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
          logSubmitResult('not_configured', validationResults);
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
          logSubmitResult('validation_error', validationResults);
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

          logSubmitResult(code, validationResults);

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
      logSubmitResult,
      markSubmitAttempted,
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
