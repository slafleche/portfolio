const ruleName = 'aria-idref-helper-required';

const messageId = 'missingAriaIdCheck';

const ARIA_IDREF_ATTRIBUTES = new Set([
  'aria-activedescendant',
  'aria-controls',
  'aria-describedby',
  'aria-details',
  'aria-errormessage',
  'aria-flowto',
  'aria-labelledby',
  'aria-owns',
]);

const TEST_FUNCTION_NAMES = new Set(['it', 'test']);

const HELPER_NAME = 'checkMatchingId';

/** @type {import('eslint').Rule.RuleModule} */
const ariaIdRefHelperRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'When a test references ARIA IDREF attributes, require it to also call a shared helper that checks id ↔ aria wiring.',
    },
    schema: [],
    messages: {
      [messageId]:
        'This test uses ARIA IDREF attributes but does not call checkMatchingId(...) to verify id wiring.',
    },
  },
  create(context) {
    const filename = context.getFilename();
    const sourceCode = context.sourceCode;

    // Allow the helper implementation itself (will likely mention aria-* strings)
    if (filename.includes('ariaIdRef.helpers')) {
      return {};
    }

    /** @type {Map<import('estree').FunctionExpression | import('estree').ArrowFunctionExpression, { sawAria: boolean; sawHelper: boolean; firstAriaNode: import('estree').Literal | null }>} */
    const testCallbackStates = new Map();

    const isStringLiteral = (node) =>
      node &&
      node.type === 'Literal' &&
      typeof node.value === 'string';

    const getEnclosingTestCallback = (node) => {
      const ancestors = sourceCode.getAncestors(node);
      for (let i = ancestors.length - 1; i >= 0; i -= 1) {
        const ancestor = ancestors[i];
        if (
          ancestor &&
          (ancestor.type === 'FunctionExpression' ||
            ancestor.type === 'ArrowFunctionExpression') &&
          testCallbackStates.has(ancestor)
        ) {
          return ancestor;
        }
      }
      return null;
    };

    const ensureStateFor = (fnNode) => {
      if (!testCallbackStates.has(fnNode)) {
        testCallbackStates.set(fnNode, {
          sawAria: false,
          sawHelper: false,
          firstAriaNode: null,
        });
      }
      return testCallbackStates.get(fnNode);
    };

    return {
      CallExpression(node) {
        // Register it/test callbacks as "test functions"
        if (
          node.callee.type === 'Identifier' &&
          TEST_FUNCTION_NAMES.has(node.callee.name) &&
          node.arguments.length >= 2
        ) {
          const callback = node.arguments[1];
          if (
            callback &&
            (callback.type === 'FunctionExpression' ||
              callback.type === 'ArrowFunctionExpression')
          ) {
            ensureStateFor(callback);
          }
        }

        // Record usage of the helper within a test callback
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === HELPER_NAME
        ) {
          const fnNode = getEnclosingTestCallback(node);
          if (!fnNode) return;
          const state = ensureStateFor(fnNode);
          state.sawHelper = true;
        }
      },

      Literal(node) {
        if (!isStringLiteral(node)) return;
        if (!ARIA_IDREF_ATTRIBUTES.has(node.value)) return;

        const fnNode = getEnclosingTestCallback(node);
        if (!fnNode) return;

        const state = ensureStateFor(fnNode);
        if (!state.sawAria) {
          state.firstAriaNode = node;
        }
        state.sawAria = true;
      },

      'Program:exit'() {
        for (const [fnNode, state] of testCallbackStates.entries()) {
          if (state.sawAria && !state.sawHelper) {
            context.report({
              node: state.firstAriaNode ?? fnNode,
              messageId,
            });
          }
        }
      },
    };
  },
};

export default {
  [ruleName]: ariaIdRefHelperRule,
};
