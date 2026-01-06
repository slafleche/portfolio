import * as s from '@/styles/components/mockEndHTML.css';

type MockEndHTMLProps = {
  ariaLabel: string;
};

type TokenProps = {
  children?: React.ReactNode;
};

function Row({ children }: TokenProps) {
  return <div className={s.row}>{children}</div>;
}

function Indent({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={s.indent} />
      ))}
    </>
  );
}

function Guide() {
  return <span className={s.guide} />;
}

function Tag({ children }: TokenProps) {
  return <span className={s.tag}>{children}</span>;
}

function Attr({ children }: TokenProps) {
  return <span className={s.attr}>{children}</span>;
}

function Value({ children }: TokenProps) {
  return <span className={s.value}>{children}</span>;
}

function Comment({ children }: TokenProps) {
  return <span className={s.comment}>{children}</span>;
}

function Text({ children }: TokenProps) {
  return <span className={s.text}>{children}</span>;
}

function Disc({ children }: TokenProps) {
  return <span className={s.disc}>{children}</span>;
}

function Ellipsis({ children }: TokenProps) {
  return <span className={s.ellipsis}>{children}</span>;
}

function Hint({ children }: TokenProps) {
  return <span className={s.hint}>{children}</span>;
}

export default function MockEndHTML({ ariaLabel }: MockEndHTMLProps) {
  return (
    <div className={s.root} role="img" aria-label={ariaLabel}>
      <div className={s.rows} aria-hidden="true">
        <Row>
          <Indent />
          <Guide />
          <Tag>{'</section>'}</Tag>
        </Row>
        <Row>
          <Indent count={2} />
          <Guide />
          <Tag>{'</main>'}</Tag>
        </Row>
        <Row>
          <Indent count={2} />
          <Tag>{'<footer'}</Tag>
          <Text> </Text>
          <Attr>{'class'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"siteFooter"'}</Value>
          <Tag>{'>'}</Tag>
        </Row>
        <Row>
          <Indent count={3} />
          <Guide />
          <Tag>{'<div'}</Tag>
          <Text> </Text>
          <Attr>{'class'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"footerInner"'}</Value>
          <Tag>{'>'}</Tag>
        </Row>
        <Row>
          <Indent count={3} />
          <Indent />
          <Guide />
          <Tag>{'</div>'}</Tag>
        </Row>
        <Row>
          <Indent count={2} />
          <Tag>{'</footer>'}</Tag>
        </Row>
        <Row>
          <Indent count={2} />
          <Comment>{'<!-- scripts -->'}</Comment>
        </Row>
        <Row>
          <Indent count={2} />
          <Tag>{'<script'}</Tag>
          <Text> </Text>
          <Attr>{'type'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"module"'}</Value>
          <Text> </Text>
          <Attr>{'src'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"/assets/app.9f2c3a1.js"'}</Value>
          <Tag>{'></script>'}</Tag>
        </Row>
        <Row>
          <Indent count={2} />
          <Disc>{'▸'}</Disc>
          <Tag>{'<script'}</Tag>
          <Text> </Text>
          <Attr>{'src'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"/assets/vendor.2b81d90.js"'}</Value>
          <Tag>{'>'}</Tag>
          <Ellipsis>{'…'}</Ellipsis>
          <Tag>{'</script>'}</Tag>
          <Hint>{'collapsed'}</Hint>
        </Row>
        <Row>
          <Indent count={2} />
          <Disc>{'▸'}</Disc>
          <Tag>{'<script'}</Tag>
          <Text> </Text>
          <Attr>{'id'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"__NEXT_DATA__"'}</Value>
          <Text> </Text>
          <Attr>{'type'}</Attr>
          <Tag>{'='}</Tag>
          <Value>{'"application/json"'}</Value>
          <Tag>{'>'}</Tag>
          <Ellipsis>{'…'}</Ellipsis>
          <Tag>{'</script>'}</Tag>
          <Hint>{'collapsed'}</Hint>
        </Row>
        <Row>
          <Indent count={1} />
          <Tag>{'</body>'}</Tag>
        </Row>
        <Row>
          <Tag>{'</html>'}</Tag>
        </Row>
      </div>
    </div>
  );
}
