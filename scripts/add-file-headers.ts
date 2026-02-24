import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.resolve(process.cwd(), "src");
const EXTENSIONS = [".ts", ".vue"];

function getAllFiles(dir: string): string[] {
  const results: string[] = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  }
  catch {
    return results;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath));
    }
    else if (EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

function getRelativePath(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

function processTypeScript(content: string, relativePath: string): string {
  const headerComment = `// ${relativePath}`;

  // Remove existing header comments (// src/... lines) anywhere in the file
  const lines = content.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    return !(trimmed.startsWith("// src/") && trimmed.endsWith(".ts"));
  });

  // Remove leading blank lines after filtering
  while (filtered.length > 0 && filtered[0].trim() === "") {
    filtered.shift();
  }

  // Build new content: header + blank line + rest
  return `${headerComment}\n\n${filtered.join("\n")}`;
}

function processVue(content: string, relativePath: string): string {
  const headerComment = `// ${relativePath}`;

  // Remove existing header comments inside <script> tag
  const lines = content.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    return !(trimmed.startsWith("// src/") && trimmed.endsWith(".vue"));
  });

  // Find <script setup> or <script> opening tag and insert header after it
  const result: string[] = [];
  let inserted = false;

  for (let i = 0; i < filtered.length; i++) {
    const line = filtered[i];
    result.push(line);

    if (!inserted && /^<script\b/.test(line.trim())) {
      // Remove blank lines immediately after script tag
      let nextIdx = i + 1;
      while (nextIdx < filtered.length && filtered[nextIdx].trim() === "") {
        nextIdx++;
      }

      // Insert header + blank line
      result.push(`  ${headerComment}`);
      result.push("");

      // Skip blank lines we already consumed
      i = nextIdx - 1;
      inserted = true;
    }
  }

  return result.join("\n");
}

function main(): void {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`src/ directory not found at ${SRC_DIR}`);
    process.exit(1);
  }

  const files = getAllFiles(SRC_DIR);
  let changed = 0;

  for (const filePath of files) {
    const relativePath = getRelativePath(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath);

    let newContent: string;
    if (ext === ".vue") {
      newContent = processVue(content, relativePath);
    }
    else {
      newContent = processTypeScript(content, relativePath);
    }

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, "utf-8");
      changed++;
    }
  }

  console.log(`✅ ${changed} files updated (${files.length} total scanned)`);
}

main();