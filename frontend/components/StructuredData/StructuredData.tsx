// Renders a schema.org JSON-LD block. dangerouslySetInnerHTML is the only
// way to put raw JSON inside a <script> tag in React — safe here because we
// only ever pass data we built ourselves (see lib/structuredData.ts), never
// raw user input. Still replacing every "<" with its unicode escape below:
// a literal "</script>" inside a product name/description would otherwise
// close the tag early. JSON-LD parsers resolve that escape back to "<"
// automatically, so this is invisible to them.
export default function StructuredData({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
