// Pure-CSS hover tooltip rendering wotlkdb tooltip HTML.
export default function Tooltip({ html, children, className = "" }: { html: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={`tt-wrap ${className}`}>
      {children}
      {html && <span className="tt-box" dangerouslySetInnerHTML={{ __html: html }} />}
    </span>
  );
}
