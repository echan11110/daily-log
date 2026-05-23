export const quotes = [
  "Discipline is the bridge between goals and accomplishment. — Jim Rohn",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Aristotle",
  "The secret of your future is hidden in your daily routine. — Mike Murdock",
  "Small daily improvements over time lead to stunning results. — Robin Sharma",
  "It's not what we do once in a while that shapes our lives, but what we do consistently. — Tony Robbins",
  "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
  "You will never always be motivated. You have to learn to be disciplined.",
  "The pain of discipline is far less than the pain of regret. — Sarah Bombell",
  "One day or day one. You decide.",
  "Your future self is watching you right now through your memories. — Aubrey De Grey",
]

export function getDailyQuote(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  )
  return quotes[dayOfYear % quotes.length]
}
