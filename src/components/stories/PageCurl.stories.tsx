import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';

import { colorVars } from '@/tokens/global.tokens';

import PageCurl from '../PageCurl';

const removeFrozenAnimationOverrides = () => {
  if (typeof document === 'undefined') return;

  const styles = Array.from(document.querySelectorAll('style'));
  for (const style of styles) {
    const text = style.textContent ?? '';
    if (
      text.includes('html, body { background: #000 !important; }') &&
      text.includes('animation: none !important') &&
      text.includes('transition: none !important')
    ) {
      style.remove();
    }
  }
};

const forceNoReducedMotionMatchMedia = () => {
  if (typeof window === 'undefined') return () => {};
  const originalMatchMedia = window.matchMedia.bind(window);

  window.matchMedia = ((query: string) => {
    if (query.includes('prefers-reduced-motion')) {
      const mql: MediaQueryList = {
        media: query,
        matches: false,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      };
      return mql;
    }
    return originalMatchMedia(query);
  }) as typeof window.matchMedia;

  return () => {
    window.matchMedia = originalMatchMedia;
  };
};

const WithFullMotion: Decorator = (Story) => {
  const restoreMatchMedia = forceNoReducedMotionMatchMedia();

  function FullMotionDecorator() {
    useEffect(() => {
      removeFrozenAnimationOverrides();
      return restoreMatchMedia;
    }, []);
    return <Story />;
  }

  return <FullMotionDecorator />;
};

const meta: Meta<typeof PageCurl> = {
  title: 'Components/PageCurl',
  component: PageCurl,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [WithFullMotion],
};

export default meta;

type Story = StoryObj<typeof PageCurl>;

export const Default: Story = {
  name: 'Default',
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        backgroundColor: colorVars.black.css(),
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <PageCurl
        href="/"
        label="Back to home"
        mockHtmlAlt="HTML closing tag"
      />
    </div>
  ),
};
