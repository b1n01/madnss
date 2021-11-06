import { readdir, readFile, writeFile, mkdir, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();
const __dirname = dirname(fileURLToPath(import.meta.url));

var template = await readFile(join(__dirname, "template.html"), {
  encoding: "utf8",
});

/**
 * Create a folder if it does not exist
 *
 * @param {string} path Folder path
 */
const createFolder = async (path) => {
  if (!(await folderExist(path))) await mkdir(path);
};

/**
 * Check if a folder exists
 *
 * @param {string} path Folder path
 * @returns
 */
const folderExist = async (path) => {
  try {
    await stat(path);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Parse all .md files in the source folder to .html and put them
 * in the dest folder
 *
 * @param {string} source The source folder
 * @param {string} dest The destination folder
 */
export default async (source, dest) => {
  if (!(await folderExist(source))) {
    console.log(`Folder "${source}" not found`);
    process.exit(1);
  }

  await createFolder(dest);

  try {
    const files = await readdir(source);
    for (const file of files) {
      var stats = await stat(join(source, file));
      var isMd = file.split(".").pop() === "md";

      if (stats.isFile() && isMd) {
        const data = await readFile(join(source, file), {
          encoding: "utf8",
        });

        var result = md.render(data);
        var html = template.replace("<slot>", result);
        var name = file.replace(".md", ".html");

        writeFile(join(dest, name), html);
      }
    }

    console.log(`Build generated on ${dest}`);
  } catch (e) {
    console.log(e);
  }
};
