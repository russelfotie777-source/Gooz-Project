"use client";

import { Fragment } from "react";
import LocaleLink from "@/lib/i18n/LocaleLink";
import { LEGAL_LINK_TARGETS, type LegalDocument, type LegalLinkTarget } from "@/lib/legal/legalContent";
import styles from "./LegalArticle.module.css";

// Domains mentioned across the legal pages (Shopitech, its parent company,
// and its payment provider) get turned into real links so readers can open
// each site's own policy directly, instead of just reading the name.
const LINKABLE_DOMAINS: Record<string, string> = {
  "shopitech.cm": "https://shopitech.cm",
  "itechservices.cm": "https://itechservices.cm",
  "corporate.maviance.cm": "https://corporate.maviance.cm",
};

const DOMAIN_PATTERN_SOURCE = "shopitech\\.cm|itechservices\\.cm|corporate\\.maviance\\.cm";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Cross-document mentions ("Politique de Confidentialité", "Conditions
// Générales d'Utilisation"...) are only auto-linked for targets the caller
// opts into via `internalLinks` — see the comment on LEGAL_LINK_TARGETS for
// why this can't just be always-on for every phrase.
function buildLinkPattern(internalLinks: LegalLinkTarget[]): { pattern: RegExp; phraseHrefs: Record<string, string> } {
  const phraseHrefs: Record<string, string> = {};
  for (const key of internalLinks) {
    const target = LEGAL_LINK_TARGETS[key];
    for (const phrase of target.phrases) phraseHrefs[phrase] = target.href;
  }

  const phraseSource = Object.keys(phraseHrefs)
    .map(escapeRegExp)
    .map((p) => `|${p}`)
    .join("");

  // Negative lookbehind excludes "shopitech.cm" when it's the domain half of
  // an email address (e.g. "contact@shopitech.cm"), which should stay plain text.
  const pattern = new RegExp(`(?<!@)(${DOMAIN_PATTERN_SOURCE}${phraseSource})`, "g");
  return { pattern, phraseHrefs };
}

function withLinks(
  text: string,
  keyPrefix: string,
  { pattern, phraseHrefs }: { pattern: RegExp; phraseHrefs: Record<string, string> }
): React.ReactNode {
  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    const domainUrl = LINKABLE_DOMAINS[part];
    if (domainUrl) {
      return (
        <a
          key={`${keyPrefix}-${index}`}
          href={domainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.inlineLink}
        >
          {part}
        </a>
      );
    }

    const internalHref = phraseHrefs[part];
    if (internalHref) {
      return (
        <LocaleLink key={`${keyPrefix}-${index}`} href={internalHref} className={styles.inlineLink}>
          {part}
        </LocaleLink>
      );
    }

    return <Fragment key={`${keyPrefix}-${index}`}>{part}</Fragment>;
  });
}

interface LegalArticleProps {
  content: LegalDocument;
  /** Mobile hides this: its topBar already shows the title. */
  showTitle?: boolean;
  /** Which cross-document phrase mentions (e.g. "Politique de Confidentialité") to turn into links. */
  internalLinks?: LegalLinkTarget[];
}

// Shared article body for every long-form legal page (Privacy Policy, Terms
// of Use): renders the intro, table of contents, and nested sections, and
// linkifies known domain mentions. Used by both the mobile and desktop
// wrapper of each page so the layout and linkifying logic live in one place.
export default function LegalArticle({ content, showTitle = true, internalLinks = [] }: LegalArticleProps) {
  const linkPattern = buildLinkPattern(internalLinks);

  return (
    <article className={styles.article}>
      {showTitle && <h1 className={styles.title}>{content.title}</h1>}
      <p className={styles.lastUpdated}>
        {content.lastUpdatedLabel} : {content.lastUpdated}
      </p>

      {content.intro.map((paragraph, index) => (
        <p key={index} className={styles.intro}>
          {withLinks(paragraph, `intro-${index}`, linkPattern)}
        </p>
      ))}

      <nav className={styles.toc} aria-label={content.tocLabel}>
        <p className={styles.tocTitle}>{content.tocLabel}</p>
        <ul className={styles.tocList}>
          {content.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className={styles.tocLink}>
                {section.heading}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {content.sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.section}>
          <h2 className={styles.sectionHeading}>{section.heading}</h2>

          {section.paragraphs?.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {withLinks(paragraph, `${section.id}-p-${index}`, linkPattern)}
            </p>
          ))}

          {section.bullets && (
            <ul className={styles.bullets}>
              {section.bullets.map((bullet, index) => (
                <li key={index} className={styles.bullet}>
                  {withLinks(bullet, `${section.id}-b-${index}`, linkPattern)}
                </li>
              ))}
            </ul>
          )}

          {section.subsections?.map((subsection, index) => (
            <div key={index} className={styles.subsection}>
              <h3 className={styles.subsectionHeading}>{subsection.heading}</h3>

              {subsection.paragraphs?.map((paragraph, pIndex) => (
                <p key={pIndex} className={styles.paragraph}>
                  {withLinks(paragraph, `${section.id}-${index}-p-${pIndex}`, linkPattern)}
                </p>
              ))}

              {subsection.bullets && (
                <ul className={styles.bullets}>
                  {subsection.bullets.map((bullet, bIndex) => (
                    <li key={bIndex} className={styles.bullet}>
                      {withLinks(bullet, `${section.id}-${index}-b-${bIndex}`, linkPattern)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
