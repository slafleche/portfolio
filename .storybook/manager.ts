import { addons } from 'storybook/manager-api';

addons.setConfig({
  showPanel: false,
  // Force-hide the addons panel even if a previous session persisted it open.
  layoutCustomisations: {
    showPanel: () => false,
  },
});
