const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStr = '{const t=document.createElement("div");t.className="comments-placeholder",t.innerHTML="";const e=document.createElement("div");e.className="comments-placeholder__icon",e.innerHTML=\'<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue)" stroke-width="1.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>\',t.appendChild(e);const n=document.createElement("p");n.textContent="El formulario de comentarios estará disponible durante la expoferia.",t.appendChild(n),a.appendChild(t)}';

const newStr = '{const t=document.createElement("div");t.className="comments-intro card";const e=document.createElement("p");e.textContent="Completa el formulario para compartir tu opinión sobre la expoferia.",t.appendChild(e);const n=document.createElement("button");n.className="btn btn--primary",n.type="button",n.textContent="Abrir formulario de comentarios",t.appendChild(n);const r=document.createElement("div");r.className="comments-iframe-wrapper",r.hidden=!0;const s=document.createElement("div");s.className="comments-loading",s.textContent="Cargando formulario…",r.appendChild(s);n.addEventListener("click",()=>{n.hidden=!0,r.hidden=!1;const c=document.createElement("iframe");c.src="https://docs.google.com/forms/d/e/1FAIpQLSd8w3eNooySoeQjn7OEQEVFdbQmyPePeK_ij_RRTan5-Ootcw/viewform?embedded=true",c.className="comments-iframe",c.title="Formulario de comentarios — Google Forms",c.setAttribute("loading","lazy"),c.addEventListener("load",()=>{s.hidden=!0}),c.addEventListener("error",()=>{s.textContent="No se pudo cargar el formulario. Intenta abrirlo en una pestaña nueva."}),r.appendChild(c)});const o=document.createElement("a");o.href="https://docs.google.com/forms/d/e/1FAIpQLSd8w3eNooySoeQjn7OEQEVFdbQmyPePeK_ij_RRTan5-Ootcw/viewform",o.target="_blank",o.rel="noopener noreferrer",o.className="comments-external-link",o.textContent="Abrir en una pestaña nueva",o.innerHTML+=\' <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>\',t.appendChild(r),t.appendChild(o),a.appendChild(t)}';

if (html.includes(oldStr)) {
  html = html.replace(oldStr, newStr);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully replaced logic!');
} else {
  console.log('oldStr not found in index.html');
}
