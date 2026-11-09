import { COPY } from "./copy";

const app = document.getElementById("app");
if (app) {
  app.innerHTML = `<h1>${COPY.splash.title}</h1><p>${COPY.loading}</p>`;
}
