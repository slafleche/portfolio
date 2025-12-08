export type Message = {
  type: 'error' | 'warning' | 'info';
  code: string; // Internal code to identify the message
  text: string; // User-facing message text
  categoryError: string; // higher order error message. for example, the test may be a specific field is bad, but the category is invalid inputs
  scrollTarget?: string; // optional key of scroll & focus, use to turn submit into up arrow button
}

export type MessageCentreTransmission = {
  source: string; // either 'global' or the block key
  messages: Message[];
};

