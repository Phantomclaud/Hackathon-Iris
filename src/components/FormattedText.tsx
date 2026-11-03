import React from 'react';

const HEADING = /^(?:#{1,3}\s*)?(?:\*\*)?([A-Z][A-Z0-9 &'()\/,.:-]{3,}?)(?:\*\*)?:?$/;
const BULLET = /^\s*[-•]\s+(.*)$/;

function renderInline(line: string, key: number) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${key}-${i}`} className="font-bold text-white">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={`${key}-${i}`}>{part}</React.Fragment>
    )
  );
}

export const FormattedText: React.FC<{ text: string }> = ({ text }) => (
  <div className="space-y-1.5 leading-relaxed">
    {text.split('\n').map((raw, i) => {
      const line = raw.trim();
      if (!line) return <div key={i} className="h-2" />;
      const heading = line.match(HEADING);
      if (heading) return <p key={i} className="font-bold text-white pt-2">{heading[1]}</p>;
      const bullet = line.match(BULLET);
      if (bullet) return <p key={i} className="pl-3">• {renderInline(bullet[1], i)}</p>;
      return <p key={i}>{renderInline(line, i)}</p>;
    })}
  </div>
);
