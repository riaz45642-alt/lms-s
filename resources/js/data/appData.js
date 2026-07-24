export const notificationsSeed = [
  { id: 'n1', type: 'worksheet', title: 'New worksheet added', body: '"Ten-Frame Counting" was just added to Maths · Early Years.', time: '2h ago', read: false },
  { id: 'n2', type: 'event', title: 'Event updated', body: 'Father\'s Day worksheet bundle now includes 3 new sheets.', time: '5h ago', read: false },
  { id: 'n3', type: 'registration', title: 'Registration confirmed', body: 'You\'re registered for "World Ocean Day Classroom Challenge".', time: '1d ago', read: false },
  { id: 'n4', type: 'system', title: 'Password changed', body: 'Your account password was updated successfully.', time: '2d ago', read: true },
  { id: 'n5', type: 'worksheet', title: 'Weekly digest', body: '8 new worksheets were published across Science and History.', time: '3d ago', read: true },
  { id: 'n6', type: 'system', title: 'Welcome to EduSphere', body: 'Your account is ready — start exploring worksheets and subjects.', time: '6d ago', read: true },
]

export const subjectsData = [
  { key: 'Maths', em: '🔢', color: '#eef6fe', desc: 'Number sense, arithmetic, shapes and measurement built step by step.', chapters: ['Counting & Numbers', 'Addition & Subtraction', 'Shapes & Patterns', 'Measurement', 'Time & Money'] },
  { key: 'English', em: '🔤', color: '#f4f9fe', desc: 'Phonics, reading comprehension, spelling and creative writing.', chapters: ['Phonics & Letters', 'Sight Words', 'Reading Comprehension', 'Grammar Basics', 'Creative Writing'] },
  { key: 'Science', em: '🔬', color: '#eef6fe', desc: 'Hands-on exploration of living things, matter and the world around us.', chapters: ['Living vs Non-living', 'Plants & Animals', 'The Five Senses', 'Weather & Seasons', 'States of Matter'] },
  { key: 'Geography', em: '🌍', color: '#f4f9fe', desc: 'Maps, places and the physical world, from local area to continents.', chapters: ['My Local Area', 'Map Symbols', 'Continents & Oceans', 'Mountains & Rivers', 'Compass Directions'] },
  { key: 'History', em: '🏛️', color: '#eef6fe', desc: 'Timelines, famous figures and stories that shaped the past.', chapters: ['Timelines & Dates', 'Famous Explorers', 'Ancient Egypt', 'Castles & Knights', 'Local Heritage'] },
]

export const eventsData = [
  { id: 'ev1', em: '🎈', date: '5 June 2026', title: 'Hot Air Balloon Day', desc: 'Celebrate flight and invention with themed counting and reading worksheets for the whole class.', location: 'Online', schedule: [['9:00 AM', 'Opening activity & story time'], ['10:30 AM', 'Balloon maths challenge'], ['1:00 PM', 'Craft & colouring session']] },
  { id: 'ev2', em: '🌱', date: '5 June 2026', title: 'World Environment Day', desc: 'Explore sustainability and nature with hands-on classroom activities and printable trackers.', location: 'Online', schedule: [['9:30 AM', 'Nature walk worksheet kickoff'], ['11:00 AM', 'Recycling sorting activity'], ['2:00 PM', 'Class discussion & pledge cards']] },
  { id: 'ev3', em: '🌊', date: '8 June 2026', title: 'World Ocean Day', desc: 'Dive into marine habitats, sea creatures and ocean conservation with our themed bundle.', location: 'Online', schedule: [['9:00 AM', 'Ocean habitats reading'], ['10:00 AM', 'Sea animal counting sheets'], ['12:30 PM', 'Conservation quiz']] },
  { id: 'ev4', em: '📔', date: '12 June 2026', title: 'Anne Frank Day', desc: 'Age-appropriate history and reflection worksheets for upper primary classes.', location: 'Online', schedule: [['10:00 AM', 'Introductory timeline'], ['11:30 AM', 'Guided reading']] },
  { id: 'ev5', em: '👨‍👧', date: '15 June 2026', title: 'Father\'s Day Bundle Launch', desc: 'Honour and appreciate fathers and father figures with a themed bundle of printable activities.', location: 'Online', schedule: [['9:00 AM', 'Bundle release'], ['10:00 AM', 'Craft card templates'], ['11:00 AM', 'Word search & quiz sheet']] },
]

export const teamData = [
  { name: 'Sarah Whitfield', role: 'Founder & CEO', em: '👩‍💼' },
  { name: 'James Okafor', role: 'Head of Curriculum', em: '👨‍🏫' },
  { name: 'Priya Nair', role: 'Product Design Lead', em: '👩‍🎨' },
  { name: 'Tom Reyes', role: 'Engineering Lead', em: '👨‍💻' },
]

export const dashboardStats = {
  student: [
    { label: 'Worksheets completed', value: '48', em: '📄' },
    { label: 'Current streak', value: '6 days', em: '🔥' },
    { label: 'Favorites saved', value: '12', em: '⭐' },
    { label: 'Upcoming events', value: '3', em: '🗓️' },
  ],
  teacher: [
    { label: 'Worksheets assigned', value: '132', em: '📄' },
    { label: 'Active students', value: '28', em: '🧑‍🎓' },
    { label: 'Classes managed', value: '4', em: '🏫' },
    { label: 'Events hosted', value: '5', em: '🗓️' },
  ],
  admin: [
    { label: 'Total users', value: '1,204', em: '👥' },
    { label: 'Worksheets published', value: '386', em: '📄' },
    { label: 'Active subjects', value: '5', em: '📚' },
    { label: 'Events this month', value: '9', em: '🗓️' },
  ],
}

export const recentActivity = [
  { em: '✅', text: 'Completed "Adding 2 Worksheet"', time: '2h ago' },
  { em: '⭐', text: 'Added "Parts of a Plant" to favorites', time: '1d ago' },
  { em: '⬇️', text: 'Downloaded "Sight Words Practice"', time: '2d ago' },
  { em: '🗓️', text: 'Registered for "World Ocean Day"', time: '3d ago' },
]

export const continueLearning = [
  { title: 'Tens & Ones to 20', subject: 'Maths', progress: 70 },
  { title: 'Story Sequencing', subject: 'English', progress: 45 },
  { title: 'States of Matter', subject: 'Science', progress: 20 },
]
