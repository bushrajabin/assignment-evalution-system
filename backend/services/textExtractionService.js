const fs = require("fs");
const path = require("path");

/**
 * Extracts plain text from a submitted file so it can be fed to the
 * AI evaluator. Supports .txt/code files natively, .pdf via pdf-parse.
 * Images are not OCR'd by default (no extra native deps required) —
 * if you want OCR, install `tesseract.js` and wire it in below.
 */
async function extractTextFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".pdf") {
      const pdfParse = require("pdf-parse");
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text.trim();
    }

    if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      // Optional OCR hook. Uncomment after `npm install tesseract.js`.
      // const Tesseract = require("tesseract.js");
      // const { data } = await Tesseract.recognize(filePath, "eng");
      // return data.text.trim();
      return "[Image submission received. OCR is not enabled on this server — " +
        "enable tesseract.js in services/textExtractionService.js to auto-extract text, " +
        "or ask the teacher to grade this submission manually.]";
    }

    // Plain text / code files
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch (err) {
    console.error("Text extraction failed:", err.message);
    return "";
  }
}

module.exports = { extractTextFromFile };
