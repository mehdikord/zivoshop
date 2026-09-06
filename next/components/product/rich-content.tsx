"use client";

import Image from "next/image";
import type { RichBlock } from "@/types";

/**
 * Renders structured product description blocks (PRD §20).
 * Supports text, heading, list, image, and table blocks.
 */
export function RichContent({ blocks }: { blocks: RichBlock[] }) {
  return (
    <div className="prose-zivo space-y-5 text-sm leading-7 text-text-secondary">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "text":
            return (
              <p key={i} className="whitespace-pre-line">
                {block.text}
              </p>
            );
          case "heading":
            return (
              <h3
                key={i}
                className="text-base font-bold text-text"
              >
                {block.text}
              </h3>
            );
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1 pe-5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-secondary/70">
                    <tr>
                      {block.headers.map((h, j) => (
                        <th
                          key={j}
                          className="px-3 py-2 text-start font-semibold text-text"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {block.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k} className="px-3 py-1.5 text-text-secondary">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "image":
            return (
              <figure key={i}>
                <Image
                  src={block.src}
                  alt={block.alt}
                  width={600}
                  height={600}
                  className="w-full rounded-xl object-cover"
                />
                {block.alt ? (
                  <figcaption className="mt-2 text-center text-xs text-text-muted">
                    {block.alt}
                  </figcaption>
                ) : null}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
