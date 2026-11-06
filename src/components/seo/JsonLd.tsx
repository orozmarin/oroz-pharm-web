/** Ispisuje schema.org podatke kao <script type="application/ld+json">. */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify ne escapea "<", pa ga ručno escapeamo da sadržaj ne može zatvoriti <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
