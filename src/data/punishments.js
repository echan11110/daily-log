export const PUNISHMENT_TIERS = [
  {
    id: 'perfect',
    label: 'PERFECT DAY',
    color: '#10B981',
    glow: 'rgba(16,185,129,.25)',
    border: 'rgba(16,185,129,.35)',
    verdict: 'You are free. You have earned your rest.',
    items: null,
  },
  {
    id: 'minor',
    label: 'MINOR SLIP',
    color: '#FBBF24',
    glow: 'rgba(251,191,36,.18)',
    border: 'rgba(251,191,36,.3)',
    verdict: 'A small stumble. Pay the price.',
    items: [
      '20 push-ups — before you sleep, not tomorrow',
      'No snacks for the rest of the day',
      'Write down exactly WHY you missed each task',
    ],
  },
  {
    id: 'slacker',
    label: 'SLACKER SENTENCE',
    color: '#F97316',
    glow: 'rgba(249,115,22,.2)',
    border: 'rgba(249,115,22,.3)',
    verdict: 'Mediocrity is a choice. So is this.',
    items: [
      '30 burpees — right now, not in the morning',
      'Cold shower (2 minutes minimum)',
      'No social media tonight',
      'Set your alarm 30 minutes earlier tomorrow — do it now',
    ],
  },
  {
    id: 'disappointing',
    label: 'DISAPPOINTING',
    color: '#EF4444',
    glow: 'rgba(239,68,68,.2)',
    border: 'rgba(239,68,68,.3)',
    verdict: 'You let yourself down. Sit with that.',
    items: [
      '50 push-ups + 50 squats (no breaks longer than 60s)',
      'Cold shower (3 minutes minimum)',
      'No phone after 9pm',
      'Wake up 1 hour earlier tomorrow — set the alarm right now',
      'Write 200 words on what went wrong today, handwritten',
    ],
  },
  {
    id: 'unacceptable',
    label: 'UNACCEPTABLE',
    color: '#DC2626',
    glow: 'rgba(220,38,38,.25)',
    border: 'rgba(220,38,38,.4)',
    verdict: 'This is not who you said you wanted to be.',
    items: [
      '100 push-ups in sets — finish them, no skipping',
      'Cold shower (5 minutes — time it)',
      'Delete social media apps for 24 hours',
      'Wake up at 5:00 AM tomorrow — set it now while reading this',
      'No junk food for 48 hours',
      'Text or call someone you respect and tell them you failed today',
    ],
  },
  {
    id: 'disgrace',
    label: 'TOTAL DISGRACE',
    color: '#B91C1C',
    glow: 'rgba(185,28,28,.3)',
    border: 'rgba(185,28,28,.5)',
    verdict: 'You have disgraced yourself. Atone for it.',
    items: [
      '150 push-ups + 50 burpees spread across today and tomorrow',
      'Cold shower every morning for 3 days',
      'No phone except calls for 24 hours — airplane mode',
      'Wake up at 5:00 AM for 3 consecutive days — log it here each day',
      'No entertainment (Netflix, YouTube, games) for 48 hours',
      'Write a 500-word reflection on your laziness — pen and paper',
      'Donate $10 to any charity',
    ],
  },
  {
    id: 'catastrophe',
    label: 'CATASTROPHIC FAILURE',
    color: '#991B1B',
    glow: 'rgba(153,27,27,.35)',
    border: 'rgba(153,27,27,.55)',
    verdict: 'You have failed on a spectacular scale. Suffer accordingly.',
    items: [
      '200 push-ups + 100 squats + 50 burpees — spread through the day',
      'Cold shower twice daily for 5 days',
      'Sleep on the floor tonight — no mattress, no pillow',
      'Wake up at 4:30 AM for 5 consecutive days',
      'No home WiFi for 48 hours (mobile data for work only)',
      'No entertainment of any kind for 72 hours',
      'Write a 1000-word letter to your future self about this failure',
      'Delete all social media apps for 7 days',
      'Donate $25',
    ],
  },
  {
    id: 'absolute',
    label: 'ABSOLUTE CATASTROPHE',
    color: '#7F1D1D',
    glow: 'rgba(127,29,29,.4)',
    border: 'rgba(239,68,68,.5)',
    verdict: 'You have reached a new depth of failure. This is historic.',
    items: [
      '300 push-ups + 200 squats + 100 burpees — all of them, today',
      'Cold shower twice daily for 7 days',
      'Sleep on the floor for 3 consecutive nights',
      'Wake up at 4:00 AM for 7 consecutive days',
      'No home WiFi for 72 hours — work from a café',
      'Eat only 2 meals tomorrow with zero snacking',
      'Delete Netflix, social media, and games for 14 days',
      'Post publicly (Instagram or Twitter) admitting you failed your goals today',
      'Donate $50',
      'Handwrite all your goals 10 times each before sleeping',
    ],
  },
  {
    id: 'void',
    label: 'THE VOID',
    color: '#EF4444',
    glow: 'rgba(239,68,68,.4)',
    border: 'rgba(239,68,68,.65)',
    verdict: 'You did NOTHING. Zero tasks. You are a ghost. A beautiful, worthless ghost. Welcome to THE VOID.',
    items: [
      '500 push-ups spread across the day — every single one',
      'Cold shower morning AND night for 10 days',
      'Sleep on the floor for a full week — no mattress, no exceptions',
      'Wake up at 3:30 AM every single day for a week',
      'No home WiFi for 5 days — cafés and data only',
      'Eat only 1 meal per day for 3 days',
      'Delete ALL entertainment apps for 30 days',
      'Write a 2000-word manifesto on why you need to change your life — handwritten',
      'Donate $100 to a cause you actively dislike',
      '10 minutes of exercise every waking hour for the entire next day',
      'Tell 3 people in your life that you completely failed today — in person or by call',
      'No music, podcasts, or passive media during any commute for 2 weeks',
    ],
  },
]

export function getPunishmentTier(done, total) {
  if (total === 0) return null
  const missed = total - done
  const missedPct = Math.round((missed / total) * 100)

  if (missedPct === 0)   return PUNISHMENT_TIERS[0]
  if (missedPct <= 10)   return PUNISHMENT_TIERS[1]
  if (missedPct <= 25)   return PUNISHMENT_TIERS[2]
  if (missedPct <= 40)   return PUNISHMENT_TIERS[3]
  if (missedPct <= 55)   return PUNISHMENT_TIERS[4]
  if (missedPct <= 70)   return PUNISHMENT_TIERS[5]
  if (missedPct <= 85)   return PUNISHMENT_TIERS[6]
  if (missedPct <= 99)   return PUNISHMENT_TIERS[7]
  return PUNISHMENT_TIERS[8]
}
