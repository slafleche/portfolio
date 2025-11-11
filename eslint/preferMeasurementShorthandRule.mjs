const ruleName = 'prefer-m-shorthand';
const messageId = 'removePxArg';

/** @type {import('eslint').Rule.RuleModule} */
const preferMeasurementShorthandRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow passing explicit "px" units to m() since it defaults to pixels.',
			url: 'https://github.com/stephane-klein/portfolio',
		},
		fixable: 'code',
		schema: [],
		messages: {
			[messageId]:
				'm() defaults to px; remove the redundant second argument.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee.type !== 'Identifier' ||
					node.callee.name !== 'm'
				) {
					return;
				}
				if (node.arguments.length < 2) return;

				const unitArg = node.arguments[1];

				if (
					unitArg.type !== 'Literal' ||
					typeof unitArg.value !== 'string' ||
					unitArg.value.toLowerCase() !== 'px'
				) {
					return;
				}

				const firstArg = node.arguments[0];
				if (!firstArg?.range || !unitArg.range) return;

				context.report({
					node: unitArg,
					messageId,
					fix(fixer) {
						const start = firstArg.range[1];
						const end = unitArg.range[1];
						return fixer.removeRange([start, end]);
					},
				});
			},
		};
	},
};

export default {
	[ruleName]: preferMeasurementShorthandRule,
};
