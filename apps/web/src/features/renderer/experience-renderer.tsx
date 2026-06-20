"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCountdownParts } from "@airplane/shared";
import type { ExperiencePage, PublicExperiencePayload, Theme } from "@airplane/shared";
import { trackRendererEvent } from "./tracking";

export function ExperienceRenderer({ payload, preview = false }: { payload: PublicExperiencePayload; preview?: boolean }) {
  const [index, setIndex] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [visitor, setVisitor] = useState<string | null>(null);
  const [session] = useState(() => createClientId());
  const page = payload.pages[index] ?? getFallbackPage(payload.pages);
  const isLast = index === payload.pages.length - 1;
  const theme = payload.experience.theme;

  useEffect(() => {
    setVisitor(getOrCreateVisitor());
  }, []);

  useEffect(() => {
    if (preview || !visitor) {
      return;
    }

    void trackRendererEvent({
      experienceId: payload.experience.id,
      visitorId: visitor,
      sessionId: session,
      eventType: "experience_viewed"
    });
  }, [payload.experience.id, preview, session, visitor]);

  useEffect(() => {
    if (!preview && page && visitor) {
      void trackRendererEvent({
        experienceId: payload.experience.id,
        visitorId: visitor,
        sessionId: session,
        pageId: page.id,
        eventType: "page_viewed"
      });
    }
  }, [page, payload.experience.id, preview, session, visitor]);

  function next() {
    if (isLast) {
      if (!preview && visitor) {
        void trackRendererEvent({
          experienceId: payload.experience.id,
          visitorId: visitor,
          sessionId: session,
          eventType: "experience_completed",
          metadata: { completionTimeSeconds: Math.round((Date.now() - startedAt) / 1000) }
        });
      }
      return;
    }

    setIndex((value) => Math.min(value + 1, payload.pages.length - 1));
  }

  function handleContinue() {
    if (!preview && visitor) {
      void trackRendererEvent({
        experienceId: payload.experience.id,
        visitorId: visitor,
        sessionId: session,
        pageId: page.id,
        eventType: "button_clicked",
        metadata: { label: isLast ? "Finish" : page.content.ctaLabel ?? "Continue" }
      });
    }

    next();
  }

  function handleQuizAnswer(answerId: string, answerLabel: string) {
    if (!preview && visitor) {
      void trackRendererEvent({
        experienceId: payload.experience.id,
        visitorId: visitor,
        sessionId: session,
        pageId: page.id,
        eventType: "quiz_answered",
        metadata: { answerId, answerLabel }
      });
    }

    next();
  }

  function handleNoAttempt() {
    const nextAttempts = noAttempts + 1;
    setNoAttempts(nextAttempts);
    setNoPosition({
      x: Math.round(Math.random() * 180 - 90),
      y: Math.round(Math.random() * 140 - 70)
    });

    if (!preview && visitor) {
      void trackRendererEvent({
        experienceId: payload.experience.id,
        visitorId: visitor,
        sessionId: session,
        pageId: page.id,
        eventType: "proposal_no_attempted",
        metadata: { attemptNumber: nextAttempts }
      });
    }
  }

  function handleYes() {
    if (!preview && visitor) {
      void trackRendererEvent({
        experienceId: payload.experience.id,
        visitorId: visitor,
        sessionId: session,
        pageId: page.id,
        eventType: "proposal_answered_yes",
        metadata: {
          noAttempts,
          completionTimeSeconds: Math.round((Date.now() - startedAt) / 1000)
        }
      });
    }
    next();
  }

  return (
    <main
      className="min-h-dvh overflow-hidden px-5 py-6"
      style={{ background: theme.background, color: theme.foreground, fontFamily: getThemeFontFamily(theme.fontFamily) }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-xl flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.section
            key={page.id}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col gap-5"
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <PageBody
              coverPhotoUrl={payload.experience.coverPhotoUrl}
              onQuizAnswer={handleQuizAnswer}
              page={page}
              recipientName={payload.experience.recipientName}
              theme={theme}
            />
            {page.pageType === "proposal" ? (
              <div className="relative mt-2 flex min-h-24 items-center gap-3">
                <button className="h-14 flex-1 rounded-lg px-5 text-base font-black text-white" style={{ background: theme.accent }} onClick={handleYes}>
                  YES
                </button>
                <motion.button
                  animate={{ x: noPosition.x, y: noPosition.y }}
                  className="h-14 flex-1 rounded-lg border border-black/15 bg-white px-5 text-base font-black"
                  onClick={handleNoAttempt}
                  style={{ background: theme.muted, color: theme.foreground }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                >
                  NO
                </motion.button>
              </div>
            ) : (
              <button className="mt-2 h-14 rounded-lg px-5 text-base font-black text-white" style={{ background: theme.accent }} onClick={handleContinue}>
                {isLast ? "Finish" : page.content.ctaLabel ?? "Continue"}
              </button>
            )}
            {payload.experience.watermarkEnabled ? <p className="pt-2 text-center text-xs font-bold opacity-60">Made with AIRPLANE</p> : null}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}

function getFallbackPage(pages: ExperiencePage[]) {
  const page = pages[0];

  if (!page) {
    throw new Error("Experience has no pages.");
  }

  return page;
}

function PageBody({
  coverPhotoUrl,
  onQuizAnswer,
  page,
  recipientName,
  theme
}: {
  coverPhotoUrl: string | null;
  onQuizAnswer: (answerId: string, answerLabel: string) => void;
  page: ExperiencePage;
  recipientName: string;
  theme: Theme;
}) {
  const mediaUrl = page.mediaUrls[0] ?? (page.pageType === "cover" ? coverPhotoUrl : null);

  if (page.pageType === "quiz") {
    return (
      <>
        <p className="text-sm font-black uppercase text-current opacity-60">{recipientName}</p>
        <h1 className="text-4xl font-black leading-tight tracking-normal">{page.content.question ?? page.title}</h1>
        <div className="grid gap-3">
          {(page.content.answers ?? []).map((answer) => (
            <button
              key={answer.id}
              className="rounded-lg border border-black/10 p-4 text-left font-bold"
              onClick={() => onQuizAnswer(answer.id, answer.label)}
              style={{ background: theme.muted, color: theme.foreground }}
            >
              {answer.label}
            </button>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {mediaUrl ? (
        <img alt="" className="mb-2 max-h-[48dvh] w-full rounded-lg object-cover shadow-xl shadow-black/10" src={mediaUrl} />
      ) : null}
      <p className="text-sm font-black uppercase text-current opacity-60">{recipientName}</p>
      <h1 className="text-5xl font-black leading-tight tracking-normal">{page.content.question ?? page.title}</h1>
      <p className="text-lg leading-8 opacity-80">{page.content.body ?? page.content.finalMessage}</p>
      {page.pageType === "countdown" && page.content.targetDate ? <CountdownPanel targetDate={page.content.targetDate} /> : null}
    </>
  );
}

function CountdownPanel({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [targetDate]);

  if (now === null) {
    return (
      <div className="grid grid-cols-4 gap-2" aria-label="Countdown loading">
        {COUNTDOWN_LABELS.map((label) => <CountdownUnit key={label} label={label} value="--" />)}
      </div>
    );
  }

  const countdown = getCountdownParts(targetDate, now);

  if (!countdown.isValid) {
    return <p className="text-2xl font-black">Coming soon</p>;
  }

  if (countdown.isComplete) {
    return <p className="text-3xl font-black">It&apos;s time!</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Countdown">
      <CountdownUnit label="Days" value={countdown.days.toString().padStart(2, "0")} />
      <CountdownUnit label="Hours" value={countdown.hours.toString().padStart(2, "0")} />
      <CountdownUnit label="Minutes" value={countdown.minutes.toString().padStart(2, "0")} />
      <CountdownUnit label="Seconds" value={countdown.seconds.toString().padStart(2, "0")} />
    </div>
  );
}

function CountdownUnit({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-20 min-w-0 flex-col items-center justify-center rounded-lg bg-white/70 px-1">
      <span className="text-2xl font-black tabular-nums">{value}</span>
      <span className="text-[10px] font-bold uppercase opacity-60">{label}</span>
    </div>
  );
}

const COUNTDOWN_LABELS = ["Days", "Hours", "Minutes", "Seconds"];

function getThemeFontFamily(fontFamily: Theme["fontFamily"]) {
  if (fontFamily === "serif") {
    return 'Georgia, Cambria, "Times New Roman", serif';
  }

  if (fontFamily === "rounded") {
    return 'ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif';
  }

  return 'Inter, ui-sans-serif, system-ui, sans-serif';
}

function getOrCreateVisitor() {
  const key = "airplane_visitor_id";
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.localStorage.setItem(key, next);
  return next;
}

function createClientId() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}
