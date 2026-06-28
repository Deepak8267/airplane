insert into public.templates (
  name,
  slug,
  category,
  description,
  is_premium,
  template_type,
  default_theme,
  default_pages
) values
  (
    'Date Proposal',
    'date-proposal',
    'love',
    'A warm, playful invite for a special date.',
    false,
    'date_proposal',
    '{"id":"rose","name":"Rose","background":"#fff7f5","foreground":"#2f1b1b","accent":"#e85d75","muted":"#f7d8dc","fontFamily":"serif"}',
    '[{"pageType":"cover","title":"A little question","content":{"body":"I made something for you."},"mediaUrls":[],"settings":{}},{"pageType":"proposal","title":"Will you go on a date with me?","content":{"question":"Will you go on a date with me?"},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Can''t wait","content":{"finalMessage":"This is going to be lovely."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Marriage Proposal',
    'marriage-proposal',
    'love',
    'A proposal flow with a moving NO button and full analytics.',
    true,
    'marriage_proposal',
    '{"id":"champagne","name":"Champagne","background":"#fffaf0","foreground":"#2b2118","accent":"#c9973f","muted":"#f0dfb8","fontFamily":"serif"}',
    '[{"pageType":"cover","title":"For us","content":{"body":"Every memory brought me here."},"mediaUrls":[],"settings":{}},{"pageType":"memory","title":"My favorite memory","content":{"body":"Add the moment that says everything."},"mediaUrls":[],"settings":{}},{"pageType":"proposal","title":"Will You Marry Me?","content":{"question":"Will You Marry Me?"},"mediaUrls":[],"settings":{"moveNoButton":true}},{"pageType":"final","title":"Forever starts here","content":{"finalMessage":"You said yes."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Birthday Surprise',
    'birthday-surprise',
    'birthday',
    'A bright reveal for birthday wishes.',
    false,
    'birthday_surprise',
    '{"id":"confetti","name":"Confetti","background":"#f9fbff","foreground":"#182033","accent":"#ff7a59","muted":"#dbeafe","fontFamily":"rounded"}',
    '[{"pageType":"cover","title":"Happy birthday","content":{"body":"Tap through your surprise."},"mediaUrls":[],"settings":{}},{"pageType":"countdown","title":"Ready?","content":{"targetDate":""},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"You are celebrated","content":{"finalMessage":"Hope this day feels as special as you are."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Birthday Memory Book',
    'birthday-memory-book',
    'birthday',
    'A page-by-page collection of favorite birthday memories.',
    true,
    'birthday_memory_book',
    '{"id":"sunrise","name":"Sunrise","background":"#fffdf7","foreground":"#262626","accent":"#f97316","muted":"#fde68a","fontFamily":"sans"}',
    '[{"pageType":"cover","title":"Your memory book","content":{"body":"A few moments worth keeping."},"mediaUrls":[],"settings":{}},{"pageType":"memory","title":"Memory one","content":{"body":"Add a favorite photo and note."},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"More to come","content":{"finalMessage":"The best memories are still ahead."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Friendship Quiz',
    'friendship-quiz',
    'friends',
    'A light quiz to see how well your friend knows you.',
    false,
    'friendship_quiz',
    '{"id":"mint","name":"Mint","background":"#f4fff8","foreground":"#10231b","accent":"#10b981","muted":"#bbf7d0","fontFamily":"rounded"}',
    '[{"pageType":"cover","title":"Friendship check","content":{"body":"Let''s see how well you know me."},"mediaUrls":[],"settings":{}},{"pageType":"quiz","title":"First question","content":{"question":"What is my go-to comfort food?","answers":[{"id":"a","label":"Pizza"},{"id":"b","label":"Noodles"},{"id":"c","label":"Ice cream"}]},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"You made it","content":{"finalMessage":"Certified friend energy."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Best Friend Challenge',
    'best-friend-challenge',
    'friends',
    'A competitive best friend quiz flow.',
    true,
    'best_friend_challenge',
    '{"id":"electric","name":"Electric","background":"#f8fafc","foreground":"#111827","accent":"#2563eb","muted":"#bfdbfe","fontFamily":"sans"}',
    '[{"pageType":"cover","title":"Best friend challenge","content":{"body":"Your score awaits."},"mediaUrls":[],"settings":{}},{"pageType":"quiz","title":"Challenge round","content":{"question":"Which plan would I choose?","answers":[{"id":"a","label":"Movie night"},{"id":"b","label":"Road trip"},{"id":"c","label":"Cafe hopping"}]},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Result unlocked","content":{"finalMessage":"Best friend status: strong."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Family Memories',
    'family-memories',
    'family',
    'A simple family memory timeline.',
    false,
    'family_memories',
    '{"id":"garden","name":"Garden","background":"#fbfff5","foreground":"#1f2a1f","accent":"#65a30d","muted":"#d9f99d","fontFamily":"serif"}',
    '[{"pageType":"cover","title":"Family memories","content":{"body":"A few memories from the people who matter."},"mediaUrls":[],"settings":{}},{"pageType":"memory","title":"A day to remember","content":{"body":"Add your favorite family note."},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Always home","content":{"finalMessage":"Thank you for everything."},"mediaUrls":[],"settings":{}}]'
  ),
  (
    'Mystery Reveal',
    'mystery-reveal',
    'fun',
    'A suspenseful reveal with timed pages.',
    false,
    'mystery_reveal',
    '{"id":"midnight","name":"Midnight","background":"#111827","foreground":"#f9fafb","accent":"#22d3ee","muted":"#334155","fontFamily":"sans"}',
    '[{"pageType":"cover","title":"Something is waiting","content":{"body":"Open each clue."},"mediaUrls":[],"settings":{}},{"pageType":"countdown","title":"Almost there","content":{"targetDate":""},"mediaUrls":[],"settings":{}},{"pageType":"final","title":"Surprise","content":{"finalMessage":"The reveal is yours to customize."},"mediaUrls":[],"settings":{}}]'
  )
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  is_premium = excluded.is_premium,
  template_type = excluded.template_type,
  default_theme = excluded.default_theme,
  default_pages = excluded.default_pages,
  updated_at = now();
