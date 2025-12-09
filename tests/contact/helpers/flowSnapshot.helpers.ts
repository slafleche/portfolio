import type {
  ContactFormBlockValidationResult,
  ContactFormSubmitStatus,
} from '@/components/contact/types/form.types';

export type ContactFormFlowSnapshot = {
  submitStatus: ContactFormSubmitStatus;
  latestValidationResults: ContactFormBlockValidationResult[];
};

export type FlowSnapshotFactoryOptions = {
  submitStatus?: ContactFormSubmitStatus;
  latestValidationResults?: ContactFormBlockValidationResult[];
};

export function makeFlowSnapshot(
  options: FlowSnapshotFactoryOptions = {},
): ContactFormFlowSnapshot {
  const {
    submitStatus = 'idle',
    latestValidationResults = [],
  } = options;

  return {
    submitStatus,
    latestValidationResults,
  };
}

