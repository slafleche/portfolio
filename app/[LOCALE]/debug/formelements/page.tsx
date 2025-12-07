'use client';

import { m } from 'css-calipers';
import { paddings, margins } from '@/styles/helpers/spacing.helper';

// Debug sandbox: inline every bit of styling so we don't share space with "real" styles.
// No shared CSS, no production polish—just enough layout to preview primitives in isolation.

// import { useCallback, useMemo, useRef } from 'react';

const rootStyle = {
  ...paddings({
    vertical: m(32),
    horizontal: m(16),
  }),
  maxWidth: 1200,
  ...margins({
    vertical: m(0),
    horizontal: 'auto',
  }),
} as const;

// const gridStyle = {
//   display: 'grid',
//   gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
//   gap: 24,
// } as const;

// const cardStyle = {
//   borderRadius: 8,
//   padding: 20,
//   border: '1px solid #eee',
//   display: 'flex',
//   flexDirection: 'column',
//   gap: 12,
// } as const;

// const labelStyle = {
//   fontSize: 13,
//   textTransform: 'uppercase',
//   color: '#fafafa',
// } as const;

// const useAutoResizeHandlers = () => {
//   const baseHeightRef = useRef<number | null>(null);

//   const onInit = useCallback((node: HTMLTextAreaElement) => {
//     baseHeightRef.current = node.scrollHeight;
//   }, []);

//   const onSync = useCallback((node: HTMLTextAreaElement) => {
//     node.style.height = 'auto';
//     const minimum = baseHeightRef.current ?? node.scrollHeight;
//     node.style.height = `${Math.max(node.scrollHeight, minimum)}px`;
//   }, []);

//   return useMemo(
//     () => ({
//       onInit,
//       onSync,
//     }),
//     [
//       onInit,
//       onSync,
//     ],
//   );
// };

export default function ContactFormDebugPagePlaceholder() {
  return (
    <main style={rootStyle}>
      <h1 style={{ fontSize: '40px', marginBottom: 16 }}>
        Contact Form — Debug Playground
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.6 }}>
        This playground is temporarily disabled while we refactor the
        form blocks.
      </p>
    </main>
  );
}
