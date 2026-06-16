# API Contract

Most creator operations are Supabase client calls protected by RLS.

## Creator App

- `getTemplates(category?)`
- `createExperience(templateId)`
- `updateExperience(id, payload)`
- `createPage(experienceId, payload)`
- `updatePage(pageId, payload)`
- `reorderPages(experienceId, pageIds)`
- `publishExperience(id)`
- `getExperienceAnalytics(experienceId)`
- `createRazorpayOrder(plan)`
- `verifyRazorpayPayment(payload)`

## Public Web

- `GET /e/[slug]`: fetches a published experience and ordered pages.
- `GET /template/[id]`: previews a template.
- `GET /preview/[id]`: creator preview route.
- `POST /api/events`: accepts recipient analytics events.

## Event Payload

```ts
type TrackEventInput = {
  experienceId: string;
  visitorId: string;
  sessionId: string;
  eventType: EventType;
  pageId?: string;
  metadata?: Record<string, unknown>;
};
```
