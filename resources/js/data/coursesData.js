export const courseSubjects = ["Maths", "English", "Science", "Geography", "History"]
export const courseLevels = ["Beginner", "Intermediate", "Advanced"]

const COURSE_SEEDS = {
  Maths: ['Number Ninjas: Counting to 100', 'Times Tables Bootcamp', 'Fractions Made Fun', 'Shape Detectives'],
  English: ['Phonics Playground', 'Reading Adventures', 'Grammar Galaxy', 'Story Writing Studio'],
  Science: ['Mini Scientists Lab', 'Plant Life Explorers', 'Space & Planets', 'Materials & Magnets'],
  Geography: ['Map Explorers Club', 'Around the World', 'Weather Watchers', 'Rivers & Mountains'],
  History: ['Time Travellers: Ancient Egypt', 'Knights & Castles Quest', 'Explorers of the World', 'History Mystery Hunt'],
}

const EMOJI = { Maths: '➗', English: '📖', Science: '🧪', Geography: '🧭', History: '🏺' }

const INSTRUCTORS = ['Ms. Alison Reed', 'Mr. Daniel Cho', 'Mrs. Fatima Malik', 'Mr. Leo Brant', 'Ms. Priya Nair']

function buildCourses() {
  const all = []
  courseSubjects.forEach((subject) => {
    COURSE_SEEDS[subject].forEach((title, i) => {
      const level = courseLevels[i % courseLevels.length]
      const lessons = 6 + (i % 3) * 2
      const progress = [0, 25, 60, 100][i % 4]
      all.push({
        id: `crs-${subject}-${i}`.toLowerCase(),
        title,
        subject,
        level,
        em: EMOJI[subject],
        lessons,
        duration: `${lessons * 12} min`,
        badge: i % 2 === 0 ? 'free' : 'prem',
        instructor: INSTRUCTORS[(i + subject.length) % INSTRUCTORS.length],
        rating: (4 + ((i * 7) % 10) / 10).toFixed(1),
        students: 120 + i * 47 + subject.length * 30,
        progress,
        summary: `An interactive, self-paced ${subject.toLowerCase()} course with videos, quizzes and instant feedback, designed for ${level.toLowerCase()} learners.`,
        syllabus: Array.from({ length: lessons }, (_, l) => `Lesson ${l + 1}: Interactive activity & quick quiz`),
      })
    })
  })
  return all
}

export const ALL_COURSES = buildCourses()
