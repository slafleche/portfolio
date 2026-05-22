import * as s from '@/styles/components/mockCssCalipersSnippet.css';

type Props = {
  ariaLabel: string;
};

type ChildrenProps = {
  children?: React.ReactNode;
};

function Line({ children }: ChildrenProps) {
  return <div className={s.line}>{children}</div>;
}

function Kw({ children }: ChildrenProps) {
  return <span className={s.keyword}>{children}</span>;
}

function Str({ children }: ChildrenProps) {
  return <span className={s.string}>{children}</span>;
}

function Num({ children }: ChildrenProps) {
  return <span className={s.number}>{children}</span>;
}

function Op({ children }: ChildrenProps) {
  return <span className={s.operator}>{children}</span>;
}

function Cm({ children }: ChildrenProps) {
  return <span className={s.comment}>{children}</span>;
}

function Mt({ children }: ChildrenProps) {
  return <span className={s.method}>{children}</span>;
}

function Pr({ children }: ChildrenProps) {
  return <span className={s.property}>{children}</span>;
}

export default function MockCssCalipersSnippet({ ariaLabel }: Props) {
  return (
    <div className={s.root} role="img" aria-label={ariaLabel}>
      <div className={s.code} aria-hidden="true">
        <Line>
          <Cm>
            {'// Type-safe spacing math. CSS emitted only at the edges.'}
          </Cm>
        </Line>
        <Line />
        <Line>
          <Kw>import</Kw>
          {' { '}m{' } '}
          <Kw>from</Kw>{' '}
          <Str>{'"css-calipers"'}</Str>;
        </Line>
        <Line />
        <Line>
          <Kw>const</Kw> paddingBase <Op>=</Op> <Mt>m</Mt>(<Num>4</Num>);{' '}
          <Cm>{'// defaults to px'}</Cm>
        </Line>
        <Line>
          <Kw>const</Kw> margins <Op>=</Op> paddingBase.<Mt>add</Mt>(
          <Num>4</Num>);
        </Line>
        <Line>
          <Kw>const</Kw> offset <Op>=</Op> paddingBase.<Mt>add</Mt>(margins).
          <Mt>multiply</Mt>(<Num>2</Num>).<Mt>subtract</Mt>(<Num>1</Num>);
        </Line>
        <Line />
        <Line>
          <Kw>const</Kw> rotation <Op>=</Op> <Mt>m</Mt>(<Num>45</Num>,{' '}
          <Str>{'"deg"'}</Str>);
        </Line>
        <Line>
          paddingBase.<Mt>add</Mt>(rotation);{' '}
          <Cm>{'// ✕ unit mismatch: px vs deg'}</Cm>
        </Line>
        <Line />
        <Line>
          <Kw>const</Kw> style <Op>=</Op> {'{'}
        </Line>
        <Line>
          {'  '}
          <Pr>padding</Pr>: paddingBase.<Mt>css</Mt>(),
        </Line>
        <Line>
          {'  '}
          <Pr>transform</Pr>:{' '}
          <Str>{'`rotate('}</Str>
          {'${'}rotation.<Mt>double</Mt>().<Mt>css</Mt>(){'}'}
          <Str>{')`'}</Str>,
        </Line>
        <Line>{'};'}</Line>
      </div>
    </div>
  );
}
