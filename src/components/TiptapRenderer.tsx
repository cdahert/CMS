import Image from "next/image";
import type { Json } from "@/integrations/supabase/types";

interface TiptapRendererProps {
  content: Json;
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function renderMark(
  text: string,
  marks: { type: string; attrs?: Record<string, unknown> }[]
): React.ReactNode {
  let result: React.ReactNode = text;
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = <strong>{result}</strong>;
        break;
      case "italic":
        result = <em>{result}</em>;
        break;
      case "code":
        result = (
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            {result}
          </code>
        );
        break;
      case "link":
        result = (
          <a
            href={mark.attrs?.href as string}
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {result}
          </a>
        );
        break;
    }
  }
  return result;
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  if (node.type === "text") {
    if (node.marks && node.marks.length > 0) {
      return (
        <span key={index}>{renderMark(node.text ?? "", node.marks)}</span>
      );
    }
    return node.text;
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <div key={index}>{children}</div>;
    case "paragraph":
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {children}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const sizes: Record<number, string> = {
        1: "text-3xl font-bold mb-4",
        2: "text-2xl font-bold mb-3",
        3: "text-xl font-bold mb-2",
      };
      const className = sizes[level] ?? sizes[1];
      if (level === 1) return <h1 key={index} className={className}>{children}</h1>;
      if (level === 2) return <h2 key={index} className={className}>{children}</h2>;
      if (level === 3) return <h3 key={index} className={className}>{children}</h3>;
      if (level === 4) return <h4 key={index} className={className}>{children}</h4>;
      if (level === 5) return <h5 key={index} className={className}>{children}</h5>;
      return <h6 key={index} className={className}>{children}</h6>;
    }
    case "bulletList":
      return (
        <ul key={index} className="mb-4 ml-6 list-disc space-y-1">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index} className="mb-4 ml-6 list-decimal space-y-1">
          {children}
        </ol>
      );
    case "listItem":
      return <li key={index}>{children}</li>;
    case "blockquote":
      return (
        <blockquote
          key={index}
          className="mb-4 border-l-4 border-primary pl-4 italic text-muted-foreground"
        >
          {children}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre
          key={index}
          className="mb-4 overflow-x-auto rounded-lg bg-muted p-4"
        >
          <code className="text-sm">{children}</code>
        </pre>
      );
    case "image":
      return (
        <figure key={index} className="mb-4">
          <Image
            src={node.attrs?.src as string}
            alt={(node.attrs?.alt as string) ?? ""}
            width={800}
            height={400}
            className="rounded-lg"
            unoptimized
          />
        </figure>
      );
    case "horizontalRule":
      return <hr key={index} className="my-6 border-border" />;
    default:
      return <div key={index}>{children}</div>;
  }
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  const doc = content as unknown as TiptapNode;
  if (!doc || !doc.content) {
    return <p className="text-muted-foreground">Sin contenido</p>;
  }
  return (
    <div className="prose prose-invert max-w-none">
      {doc.content.map((node, i) => renderNode(node, i))}
    </div>
  );
}
