export const titles = {
  Maths: [["Adding 2 Worksheet", "free"], ["Adding 1 Worksheet", "free"], ["Sea Animals Counting", "prem"], ["Insects Counting", "free"], ["Ten-Frame Counting", "free"], ["Halloween Count", "prem"], ["Tens & Ones to 20", "prem"], ["Autumn Count & Match", "free"]],
  English: [["Letter Tracing A–Z", "free"], ["CVC Word Building", "free"], ["Rhyming Pairs", "prem"], ["Sight Words Practice", "free"], ["Story Sequencing", "free"], ["Punctuation Basics", "prem"], ["Spelling Patterns", "prem"], ["Reading Comprehension", "free"]],
  Science: [["Living vs Non-living", "free"], ["Parts of a Plant", "free"], ["Animal Habitats", "prem"], ["The Five Senses", "free"], ["Weather & Seasons", "free"], ["States of Matter", "prem"], ["Food Chains", "prem"], ["Materials Sorting", "free"]],
  Geography: [["Continents & Oceans", "free"], ["My Local Area", "free"], ["Map Symbols", "prem"], ["Weather Around Us", "free"], ["Mountains & Rivers", "free"], ["Capital Cities", "prem"], ["Compass Directions", "prem"], ["Habitats of the World", "free"]],
  History: [["Famous Explorers", "free"], ["Castles & Knights", "free"], ["The Great Fire", "prem"], ["Timelines & Dates", "free"], ["Ancient Egypt", "free"], ["Toys Through Time", "prem"], ["Historical Festivals", "prem"], ["Local Heritage", "free"]]
}

export const thumbs = { Maths: "🔢", English: "🔤", Science: "🔬", Geography: "🌍", History: "🏛️" }

export const years = ["Early Years", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]
export const subjects = ["Maths", "English", "Science", "Geography", "History"]

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

export function buildAllWorksheets() {
  const all = []
  subjects.forEach((subj) => {
    (titles[subj] || []).forEach(([title, badge], i) => {
      all.push({
        id: `${subj}-${i}`,
        title,
        badge,
        subject: subj,
        year: years[i % years.length],
        em: thumbs[subj],
        difficulty: DIFFICULTIES[i % DIFFICULTIES.length],
      })
    })
  })
  return all
}

export const ALL_WORKSHEETS = buildAllWorksheets()
