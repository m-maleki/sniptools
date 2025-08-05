import './crypto-tools.js';
import './json-editor.js';
import './jwt-decoder.js';
import './password-generator.js';
import './script.js';
import './text-differ.js';
import './unit-converter.js';
import './url-converter.js';
import './uuid-generator.js';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  return new Response("Welcome to SnipTools!", {
    headers: { 'content-type': 'text/plain' }
  });
}
