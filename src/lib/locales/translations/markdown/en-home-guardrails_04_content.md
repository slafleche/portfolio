Tests describe what the code is supposed to do. So when the AI rewrites a
function or refactors a component, the tests tell me whether the behavior still
holds. Vitest covers the unit layer, Storybook covers component states across
themes, and Playwright covers the end-to-end flows that matter. Together they
form the contract the AI has to honor.
