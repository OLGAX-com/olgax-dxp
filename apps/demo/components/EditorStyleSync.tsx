"use client";

import { useEffect, type ReactNode } from "react";

const STYLE_SELECTOR = 'link[rel="stylesheet"], style';
const MIRROR_ATTRIBUTE = "data-puck-style-mirror";
const PUCK_OWN_STYLE_ATTRIBUTE = "data-puck-style-source";
const RETRY_LIMIT = 30;

const keyOf = (element: Element) =>
  element.tagName === "LINK"
    ? `link:${element.getAttribute("href")}`
    : `style:${(element.textContent ?? "").trim()}`;

// The stylesheet's actual rules, or null while it is still loading.
function rulesOf(element: Element): string | null {
  const sheet = (element as HTMLLinkElement | HTMLStyleElement).sheet;
  if (!sheet) return null;
  try {
    return Array.from(sheet.cssRules, (rule) => rule.cssText).join("");
  } catch {
    return null;
  }
}

function isSiteStyle(element: Element) {
  if (element.hasAttribute(PUCK_OWN_STYLE_ATTRIBUTE)) return false;
  return element.tagName !== "STYLE" || Boolean(element.textContent?.trim());
}

function addMirror(frameDocument: Document, source: Element) {
  const mirror = source.cloneNode(true) as Element;
  mirror.setAttribute(MIRROR_ATTRIBUTE, "true");
  frameDocument.head.append(mirror);
}

// Puck copies this page's stylesheets into the preview iframe once, and never refreshes them.
// During development Next serves a hot-updated stylesheet at the same URL, so the copy goes
// stale and blocks lose their styles in the editor until a reload. This compares the copies
// with the page's real stylesheets and replaces any that differ or are missing.
function StyleSync({ frameDocument }: { frameDocument: Document }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let retries = 0;

    const reconcile = () => {
      let pending = false;

      const host = Array.from(document.querySelectorAll(STYLE_SELECTOR)).filter(isSiteStyle);
      const copies = Array.from(frameDocument.head.querySelectorAll(`[${MIRROR_ATTRIBUTE}]`));
      const hostKeys = new Set(host.map(keyOf));

      copies.forEach((copy) => {
        if (!hostKeys.has(keyOf(copy))) copy.remove();
      });

      host.forEach((source) => {
        const key = keyOf(source);
        const matching = copies.filter((copy) => copy.isConnected && keyOf(copy) === key);
        if (matching.length === 0) return addMirror(frameDocument, source);

        const wanted = rulesOf(source);
        if (wanted === null) {
          pending = true; // the page's own stylesheet is still loading
          return;
        }
        if (matching.some((copy) => rulesOf(copy) === null)) {
          pending = true; // a copy is still loading - leave Puck's setup alone
          return;
        }
        const current = matching.filter((copy) => rulesOf(copy) === wanted);
        if (current.length > 0) {
          matching.filter((copy) => !current.includes(copy)).forEach((copy) => copy.remove());
        } else {
          matching.forEach((copy) => copy.remove());
          addMirror(frameDocument, source);
        }
      });

      if (pending && retries++ < RETRY_LIMIT) schedule(300);
    };

    const schedule = (delay = 150) => {
      clearTimeout(timer);
      timer = setTimeout(reconcile, delay);
    };

    const onChange = () => {
      retries = 0;
      schedule();
    };

    const observer = new MutationObserver(onChange);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["href", "media"],
    });
    observer.observe(frameDocument.head, { childList: true });
    schedule(1500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [frameDocument]);

  return null;
}

// Passed to Puck as `overrides.iframe`.
export function EditorStyleSync({
  children,
  document: frameDocument,
}: {
  children: ReactNode;
  document?: Document;
}) {
  return (
    <>
      {frameDocument ? <StyleSync frameDocument={frameDocument} /> : null}
      {children}
    </>
  );
}
