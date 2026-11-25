"use client";

import { Accordion, AccordionItem } from "@sutra-ui/react";

export function BilingualFaq({
  id,
  title,
  items,
  hiId,
  hiTitle,
  hiItems,
}: {
  id: string;
  title: string;
  items: { question: string; answer: string }[];
  hiId: string;
  hiTitle: string;
  hiItems: { question: string; answer: string }[];
}) {
  return (
    <>
      <FaqBlock id={id} title={title} items={items} lang="en" />
      <FaqBlock id={hiId} title={hiTitle} items={hiItems} lang="hi" />
    </>
  );
}

function FaqBlock({
  id,
  title,
  items,
  lang,
}: {
  id: string;
  title: string;
  items: { question: string; answer: string }[];
  lang: "en" | "hi";
}) {
  return (
    <section className="sutra-faq i18n" lang={lang} aria-labelledby={id}>
      <h2 id={id} className="sutra-faq-title">
        {title}
      </h2>
      <Accordion type="single">
        {items.map((item) => (
          <AccordionItem key={item.question} value={item.question} title={item.question}>
            <p>{item.answer}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
