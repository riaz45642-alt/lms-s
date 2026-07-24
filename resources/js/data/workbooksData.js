export const workbookSubjects = ["Maths", "English", "Science", "Geography", "History"]
export const workbookYears = ["Early Years", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]

const THEMES = {
  Maths: ['Number & Place Value', 'Addition & Subtraction', 'Multiplication & Division', 'Fractions & Decimals', 'Shape & Space', 'Measurement Mastery'],
  English: ['Phonics Foundations', 'Reading Comprehension', 'Grammar & Punctuation', 'Creative Writing', 'Spelling Patterns', 'Story Sequencing'],
  Science: ['Living Things', 'States of Matter', 'Forces & Magnets', 'Plants & Growth', 'The Human Body', 'Weather & Seasons'],
  Geography: ['Map Skills', 'Continents & Oceans', 'Local Area Studies', 'Climate & Weather', 'Physical Landscapes', 'World Cultures'],
  History: ['Ancient Civilisations', 'Timelines & Change', 'Castles & Monarchs', 'Explorers & Inventors', 'Local Heritage', 'World Wars Overview'],
}

const EMOJI = { Maths: '🔢', English: '🔤', Science: '🔬', Geography: '🌍', History: '🏛️' }

function buildWorkbooks() {
  const all = []
  workbookSubjects.forEach((subject) => {
    THEMES[subject].forEach((theme, i) => {
      const year = workbookYears[i % workbookYears.length]
      const weeks = 4 + (i % 3) * 2
      all.push({
        id: `wb-${subject}-${i}`.toLowerCase(),
        title: `${theme} Workbook`,
        subject,
        year,
        em: EMOJI[subject],
        weeks,
        pageCount: weeks * 6,
        badge: i % 3 === 0 ? 'free' : 'prem',
        summary: `A structured ${weeks}-week ${subject.toLowerCase()} workbook building confidence in ${theme.toLowerCase()} through daily practice pages.`,
        chapters: Array.from({ length: weeks }, (_, w) => `Week ${w + 1}: ${theme} — Session ${w + 1}`),
      })
    })
  })
  return all
}

export const ALL_WORKBOOKS = buildWorkbooks()
