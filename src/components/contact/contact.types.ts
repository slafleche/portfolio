import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';

export type messageCentreScenarioCode = Exclude<
  FormServerResponseCode,
  'success'
>;

export type ContactFormmessageCentreDebugScenario =
  | messageCentreScenarioCode
  | {
      code: messageCentreScenarioCode;
      message?: string;
    };
