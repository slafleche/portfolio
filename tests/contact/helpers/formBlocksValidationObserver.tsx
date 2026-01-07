import { useEffect, useRef } from 'react';

import {
  useFormBlocksContext,
} from '@/components/contact/formBlocks.context';
import type { ContactFormBlockValidationResult } from '@/components/contact/types/form.types';

type FormBlocksValidationObserverProps = {
  onUpdate: (
    results: ContactFormBlockValidationResult[],
  ) => void;
};

export const FormBlocksValidationObserver = ({
  onUpdate,
}: FormBlocksValidationObserverProps) => {
  const {
    validationResultsVersion,
    getValidationResultsSnapshot,
  } = useFormBlocksContext();

  const lastVersionRef = useRef(validationResultsVersion);

  useEffect(() => {
    if (validationResultsVersion === lastVersionRef.current) {
      return;
    }

    lastVersionRef.current = validationResultsVersion;
    onUpdate(getValidationResultsSnapshot());
  }, [
    getValidationResultsSnapshot,
    onUpdate,
    validationResultsVersion,
  ]);

  return null;
};

