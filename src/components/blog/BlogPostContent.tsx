"use client";

import { useMemo } from "react";

interface Props {
  content: string;
}

export default function BlogPostContent({ content }: Props) {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        result.push(
          <ul key={`list-${result.length}`} className="list-disc pl-6 mb-5 space-y-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-gray-600" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const formatInline = (line: string) => {
      return line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-green-900 font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      if (line.startsWith("## ")) {
        flushList();
        result.push(
          <h2 key={i} className="text-2xl font-bold text-green-900 mt-10 mb-4 font-[family-name:var(--font-heading)]">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        flushList();
        result.push(
          <h3 key={i} className="text-xl font-bold text-green-800 mt-8 mb-3 font-[family-name:var(--font-heading)]">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        listItems.push(line.slice(2));
      } else if (/^\d+\.\s/.test(line)) {
        flushList();
        const olItems: string[] = [line.replace(/^\d+\.\s/, "")];
        while (i + 1 < lines.length && /^\d+\.\s/.test(lines[i + 1].trim())) {
          i++;
          olItems.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        }
        result.push(
          <ol key={`ol-${i}`} className="list-decimal pl-6 mb-5 space-y-2">
            {olItems.map((item, j) => (
              <li key={j} className="text-gray-600" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ol>
        );
      } else if (line.startsWith("> ")) {
        flushList();
        result.push(
          <blockquote key={i} className="border-l-4 border-green-500 pl-5 my-6 italic text-gray-500">
            <p dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
          </blockquote>
        );
      } else if (line.startsWith("|")) {
        flushList();
        const tableLines: string[] = [line];
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
          i++;
          tableLines.push(lines[i].trim());
        }
        const headerCells = tableLines[0].split("|").filter(Boolean).map(c => c.trim());
        const dataRows = tableLines.slice(2);

        result.push(
          <div key={`table-${i}`} className="overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-green-50">
                  {headerCells.map((cell, j) => (
                    <th key={j} className="border border-green-200 px-4 py-2 text-left font-semibold text-green-900">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, j) => (
                  <tr key={j} className={j % 2 === 0 ? "bg-white" : "bg-green-50/50"}>
                    {row.split("|").filter(Boolean).map((cell, k) => (
                      <td key={k} className="border border-green-200 px-4 py-2 text-gray-600">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else {
        flushList();
        result.push(
          <p key={i} className="text-gray-600 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        );
      }
    }
    flushList();
    return result;
  }, [content]);

  return (
    <div className="prose-blog animate-on-scroll anim-fade-in-up is-visible">
      {elements}
    </div>
  );
}
