import { iterateSnapshotFiles } from "./snapshotLoader.service.js";

/*
 * Provider-neutral initial chunk size.
 *
 * This is CHARACTER based, not exact tokens.
 * Later Model Registry ke context limits ke
 * according dynamic token budgeting hoga.
 */
const DEFAULT_MAX_CHUNK_CHARS = 25_000;

/*
 * Ek individual file-part ko chunk se
 * slightly smaller rakhenge.
 */
const MAX_FILE_PART_CHARS = 22_000;

const splitLargeLine = ({ line, lineNumber, maxChars }) => {
  const parts = [];

  for (let offset = 0; offset < line.length; offset += maxChars) {
    parts.push({
      content: line.slice(offset, offset + maxChars),

      lineStart: lineNumber,
      lineEnd: lineNumber,
    });
  }

  return parts;
};

const splitFileIntoParts = ({
  path,
  content,
  maxChars = MAX_FILE_PART_CHARS,
}) => {
  const lines = content.split("\n");

  const parts = [];

  let currentContent = "";
  let currentStartLine = 1;

  const flushCurrent = (endLine) => {
    if (!currentContent) {
      return;
    }

    parts.push({
      path,

      lineStart: currentStartLine,

      lineEnd: endLine,

      content: currentContent,
    });

    currentContent = "";
  };

  for (let index = 0; index < lines.length; index++) {
    const lineNumber = index + 1;

    /*
     * Preserve newline except possibly
     * the final line.
     */
    const line = index < lines.length - 1 ? `${lines[index]}\n` : lines[index];

    /*
     * Extremely long/minified/generated line.
     */
    if (line.length > maxChars) {
      flushCurrent(lineNumber - 1);

      const largeLineParts = splitLargeLine({
        line,
        lineNumber,
        maxChars,
      });

      for (const part of largeLineParts) {
        parts.push({
          path,

          lineStart: part.lineStart,

          lineEnd: part.lineEnd,

          content: part.content,
        });
      }

      currentStartLine = lineNumber + 1;

      continue;
    }

    /*
     * Current part would become too large.
     */
    if (
      currentContent.length > 0 &&
      currentContent.length + line.length > maxChars
    ) {
      flushCurrent(lineNumber - 1);

      currentStartLine = lineNumber;
    }

    if (!currentContent) {
      currentStartLine = lineNumber;
    }

    currentContent += line;
  }

  flushCurrent(lines.length);

  return parts;
};

async function* buildSnapshotChunks({
  snapshot,

  maxChunkChars = DEFAULT_MAX_CHUNK_CHARS,
}) {
  let chunkIndex = 0;

  let currentFiles = [];
  let currentChars = 0;

  const createChunk = () => ({
    index: chunkIndex++,

    files: currentFiles,

    totalChars: currentChars,

    /*
     * Rough estimation only.
     * DO NOT use this for billing.
     */
    estimatedTokens: Math.ceil(currentChars / 4),
  });

  for await (const file of iterateSnapshotFiles({
    snapshot,
  })) {
    const fileParts = splitFileIntoParts({
      path: file.path,

      content: file.content,
    });

    for (const part of fileParts) {
      const partChars = part.content.length;

      /*
       * Existing chunk ko flush karo
       * if this part would exceed limit.
       */
      if (currentFiles.length > 0 && currentChars + partChars > maxChunkChars) {
        yield createChunk();

        currentFiles = [];
        currentChars = 0;
      }

      currentFiles.push({
        path: part.path,

        lineStart: part.lineStart,

        lineEnd: part.lineEnd,

        content: part.content,
      });

      currentChars += partChars;
    }
  }

  /*
   * Final partially-filled chunk.
   */
  if (currentFiles.length > 0) {
    yield createChunk();
  }
}

export { buildSnapshotChunks };
