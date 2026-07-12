// server.js
// Minimal Express server. Its only job is to serve the static files in
// public/ (HTML, CSS, JS, word data). All app logic (flashcards, grading,
// progress tracking) runs entirely in the browser -- there is no database
// or API here on purpose, since the app doesn't need one.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve everything in this folder (index.html, style.css, script.js, words.js)
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`FlashEspañol running at http://localhost:${PORT}`);
});
