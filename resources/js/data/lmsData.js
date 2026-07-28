import { ALL_COURSES } from './coursesData'

// ---------- Assignments ----------
export const assignmentsData = [
  { id: 'as1', title: 'Fractions Worksheet Pack', subject: 'Maths', due: '14 July 2026', status: 'pending', marks: null, total: 20, instructions: 'Complete all 10 fraction problems showing your working. Submit as a single PDF or image scan.', attachments: ['fractions-worksheet.pdf'] },
  { id: 'as2', title: 'Reading Comprehension: The Lighthouse', subject: 'English', due: '10 July 2026', status: 'submitted', marks: 18, total: 20, instructions: 'Read the passage and answer the 8 comprehension questions in full sentences.', attachments: ['lighthouse-passage.pdf'] },
  { id: 'as3', title: 'Plant Life Cycle Diagram', subject: 'Science', due: '16 July 2026', status: 'pending', marks: null, total: 15, instructions: 'Label the diagram with the correct stages of a plant life cycle and add a short description for each.', attachments: ['plant-diagram.png'] },
  { id: 'as4', title: 'Continents & Oceans Map Quiz', subject: 'Geography', due: '5 July 2026', status: 'late', marks: 12, total: 20, instructions: 'Label all 7 continents and 5 oceans on the provided outline map.', attachments: ['world-outline-map.pdf'] },
  { id: 'as5', title: 'Ancient Egypt Timeline', subject: 'History', due: '20 July 2026', status: 'pending', marks: null, total: 25, instructions: 'Create a timeline of 6 key events in Ancient Egyptian history with dates and short notes.', attachments: ['timeline-template.pdf'] },
  { id: 'as6', title: 'Times Tables Speed Test', subject: 'Maths', due: '2 July 2026', status: 'checked', marks: 20, total: 20, instructions: 'Complete the 2, 5 and 10 times tables within the 5 minute timer.', attachments: [] },
]

// ---------- Certificates ----------
export const certificatesData = [
  { id: 'ct1', course: 'Number Ninjas: Counting to 100', date: '2 June 2026', em: '➗', grade: 'A' },
  { id: 'ct2', course: 'Phonics Playground', date: '18 May 2026', em: '📖', grade: 'A+' },
  { id: 'ct3', course: 'Mini Scientists Lab', date: '30 April 2026', em: '🧪', grade: 'B+' },
]

// ---------- Calendar ----------
export const calendarEvents = [
  { id: 'cal1', date: '2026-07-14', title: 'Live Class: Fractions Recap', type: 'class', time: '10:00 AM' },
  { id: 'cal2', date: '2026-07-14', title: 'Fractions Worksheet Pack due', type: 'deadline', time: '11:59 PM' },
  { id: 'cal3', date: '2026-07-16', title: 'Plant Life Cycle Diagram due', type: 'deadline', time: '11:59 PM' },
  { id: 'cal4', date: '2026-07-17', title: 'World Ocean Day Classroom Challenge', type: 'event', time: '9:00 AM' },
  { id: 'cal5', date: '2026-07-20', title: 'History Mid-Term Exam', type: 'exam', time: '9:30 AM' },
  { id: 'cal6', date: '2026-07-22', title: 'Live Class: Grammar Galaxy', type: 'class', time: '2:00 PM' },
  { id: 'cal7', date: '2026-07-25', title: 'Science Quiz: States of Matter', type: 'exam', time: '11:00 AM' },
]
export const CALENDAR_TYPE_META = {
  class: { label: 'Live class', color: 'var(--blue)', em: '🎥' },
  deadline: { label: 'Assignment deadline', color: '#e0632a', em: '📌' },
  event: { label: 'Event', color: '#1f9d57', em: '🎉' },
  exam: { label: 'Exam', color: 'var(--gold)', em: '📝' },
}

// ---------- Quiz ----------
export const quizzesData = {
  'quiz-fractions': {
    id: 'quiz-fractions',
    title: 'Fractions Quick Check',
    subject: 'Maths',
    durationSec: 300,
    questions: [
      { id: 'q1', text: 'What is 1/2 + 1/4?', options: ['1/6', '3/4', '2/6', '1/4'], answer: 1 },
      { id: 'q2', text: 'Which fraction is equivalent to 2/4?', options: ['1/3', '3/8', '1/2', '2/8'], answer: 2 },
      { id: 'q3', text: 'What is 3/5 of 20?', options: ['10', '12', '15', '9'], answer: 1 },
      { id: 'q4', text: 'Which is the smallest fraction?', options: ['1/2', '1/8', '1/4', '1/3'], answer: 1 },
      { id: 'q5', text: 'What is 1 - 3/4?', options: ['1/4', '1/2', '3/4', '1/3'], answer: 0 },
    ],
  },
}

// ---------- Discussions ----------
export const discussionsData = [
  {
    id: 'd1', title: 'How do you remember the 7 times table?', author: 'Amelia Carter', role: 'student', time: '2h ago', likes: 6, subject: 'Maths',
    replies: [
      { id: 'd1r1', author: 'Mr. Daniel Cho', role: 'teacher', time: '1h ago', text: 'Try skip counting out loud and pairing it with the rhythm game from Lesson 4!', likes: 4 },
      { id: 'd1r2', author: 'Noah Bennett', role: 'student', time: '40m ago', text: 'I made flashcards, they really helped me.', likes: 2 },
    ],
  },
  {
    id: 'd2', title: 'Best way to structure a story for the Creative Writing Studio task?', author: 'Liam Turner', role: 'student', time: '5h ago', likes: 3, subject: 'English',
    replies: [
      { id: 'd2r1', author: 'Mrs. Fatima Malik', role: 'teacher', time: '3h ago', text: 'Start with a clear beginning, middle and end, and introduce your character early.', likes: 5 },
    ],
  },
  {
    id: 'd3', title: 'Question about the plant life cycle diagram', author: 'Sofia Reyes', role: 'student', time: '1d ago', likes: 1, subject: 'Science',
    replies: [],
  },
]

// ---------- Wishlist / Bookmarks ----------
export const wishlistIds = [ALL_COURSES[2]?.id, ALL_COURSES[9]?.id, ALL_COURSES[15]?.id].filter(Boolean)

export const bookmarkedLessons = [
  { id: 'bm1', lesson: 'Lesson 3: Adding fractions with like denominators', course: 'Fractions Made Fun', progress: 40 },
  { id: 'bm2', lesson: 'Lesson 5: Story sequencing practice', course: 'Reading Adventures', progress: 70 },
  { id: 'bm3', lesson: 'Lesson 2: Parts of a plant', course: 'Plant Life Explorers', progress: 25 },
]

// ---------- Learning / Course Player ----------
export function buildLessons(course) {
  if (!course) return []
  return Array.from({ length: course.lessons }, (_, i) => ({
    id: `${course.id}-l${i + 1}`,
    index: i + 1,
    title: course.syllabus[i] || `Lesson ${i + 1}`,
    duration: `${8 + (i % 4) * 3} min`,
    completed: i < Math.round((course.progress / 100) * course.lessons),
  }))
}

// ---------- Analytics ----------
export const weeklyActivity = [
  { day: 'Mon', hours: 1.2 }, { day: 'Tue', hours: 0.8 }, { day: 'Wed', hours: 1.6 },
  { day: 'Thu', hours: 0.5 }, { day: 'Fri', hours: 2.1 }, { day: 'Sat', hours: 1.4 }, { day: 'Sun', hours: 0.9 },
]
export const monthlyActivity = [
  { label: 'Wk 1', value: 6 }, { label: 'Wk 2', value: 8.5 }, { label: 'Wk 3', value: 5.5 }, { label: 'Wk 4', value: 9.2 },
]
export const quizPerformance = [
  { label: 'Maths', score: 88 }, { label: 'English', score: 92 }, { label: 'Science', score: 76 },
  { label: 'Geography', score: 81 }, { label: 'History', score: 69 },
]
export const subjectProgress = [
  { subject: 'Maths', em: '➗', progress: 72 }, { subject: 'English', em: '📖', progress: 85 },
  { subject: 'Science', em: '🧪', progress: 54 }, { subject: 'Geography', em: '🧭', progress: 63 }, { subject: 'History', em: '🏺', progress: 40 },
]
export const achievementsData = [
  { em: '🔥', title: '6-day streak', desc: 'Learned something new for 6 days in a row' },
  { em: '🥇', title: 'Top of the class', desc: 'Highest quiz score in English this month' },
  { em: '📚', title: 'Bookworm', desc: 'Completed 10 reading comprehension lessons' },
  { em: '🎯', title: 'Perfect score', desc: 'Scored 100% on Times Tables Speed Test' },
]
