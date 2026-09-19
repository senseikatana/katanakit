// ============================================================
//  demo/version-switcher.ts — Botón de selección de versión
//  para la página de demo.
//
//  El <select id="kk-version-select"> alterna entre:
//  - "dev": el SCSS vivo compilado por Vite (HMR).
//  - versiones publicadas: <link id="kk-version-css"> apuntando
//    a /versions/<tag>.css (compiladas con build:versions).
// ============================================================

import versions from './versions';

type StyleElement = HTMLStyleElement | HTMLLinkElement;

// Devuelve todos los stylesheets de la página salvo el de versiones.
function devStyles(): NodeListOf<HTMLLinkElement> {
  return document.querySelectorAll(
    'head link[rel="stylesheet"]:not(#kk-version-css)',
  );
}

function disableDevStyles(disabled: boolean): void {
  // En dev, Vite inyecta el SCSS como <style data-vite-dev-id>.
  document.querySelectorAll<HTMLStyleElement>('style[data-vite-dev-id]').forEach((el) => {
    toggleMedia(el, disabled);
  });
  // En build, Vite emite <link rel="stylesheet">.
  devStyles().forEach((el) => {
    toggleMedia(el, disabled);
  });
}

function toggleMedia(el: StyleElement, disabled: boolean): void {
  if (disabled) {
    if (!el.dataset.kkMedia) el.dataset.kkMedia = el.media || 'all';
    el.media = 'not all';
  } else if (el.dataset.kkMedia) {
    el.media = el.dataset.kkMedia;
    delete el.dataset.kkMedia;
  }
}

export function initVersionSwitcher(): void {
  const link = document.getElementById('kk-version-css') as HTMLLinkElement | null;
  const select = document.getElementById('kk-version-select') as HTMLSelectElement | null;
  if (!link || !select) return;

  for (const version of versions.released) {
    const option = document.createElement('option');
    option.value = version.tag;
    option.textContent = version.label;
    select.appendChild(option);
  }

  select.addEventListener('change', () => {
    const tag = select.value;
    if (tag === 'dev') {
      link.disabled = true;
      disableDevStyles(false);
    } else {
      link.href = `/versions/${tag}.css`;
      link.disabled = false;
      disableDevStyles(true);
    }
  });
}
