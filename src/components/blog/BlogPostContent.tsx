import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";

interface Props {
  content: unknown;
}

export default function BlogPostContent({ content }: Props) {
  return (
    <div className="prose-blog animate-on-scroll anim-fade-in-up is-visible">
      <RichText data={content as SerializedEditorState} />
    </div>
  );
}
