export const activitySubjects = ["Maths", "English", "Science", "Geography", "History"]

const ACTIVITY_SEEDS = {
  Maths: ['Number Match Puzzle', 'Shape Sorting Game', 'Speedy Sums Challenge', 'Coin Counting Quiz'],
  English: ['Word Search: Sight Words', 'Rhyme Time Matching', 'Alphabet Bingo', 'Story Puzzle Pieces'],
  Science: ['Animal Habitat Sorting', 'Seasons Wheel Spinner', 'Five Senses Match-Up', 'Simple Machines Drag & Drop'],
  Geography: ['Continents Jigsaw', 'Where in the World? Quiz', 'Map Symbols Memory Game', 'Weather Match'],
  History: ['Timeline Ordering Game', 'Ancient Egypt Trivia', 'Castle Builder Puzzle', 'Explorers Match-Up'],
}

const EMOJI = { Maths: '🧩', English: '🔤', Science: '🧫', Geography: '🗺️', History: '⏳' }

function buildActivities() {
  const all = []
  activitySubjects.forEach((subject) => {
    ACTIVITY_SEEDS[subject].forEach((title, i) => {
      all.push({
        id: `act-${subject}-${i}`.toLowerCase(),
        title,
        subject,
        em: EMOJI[subject],
        minutes: 5 + (i % 3) * 5,
        badge: i % 2 === 0 ? 'free' : 'prem',
        summary: `A short, playful ${subject.toLowerCase()} activity that reinforces key concepts through drag-and-drop, matching or quick-fire questions — perfect for a quick brain break.`,
        steps: ['Read the on-screen instructions', 'Complete the interactive challenge', 'Get instant feedback and a score', 'Earn credits toward your avatar collection'],
      })
    })
  })
  return all
}

export const ALL_ACTIVITIES = buildActivities()
