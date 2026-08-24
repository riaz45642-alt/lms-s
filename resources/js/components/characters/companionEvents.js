export const COMPANION_REACTION_EVENT = 'edusphere:companion-reaction'

export function emitCompanionReaction(state = 'interaction', message, duration = 1100) {
  window.dispatchEvent(new CustomEvent(COMPANION_REACTION_EVENT, { detail: { state, message, duration } }))
}

export const REACTION_MESSAGES = Object.freeze({
  fox: { interaction: 'Great choice—let’s learn!', success: 'Wonderful progress!', celebration: 'You did it!' },
  panda: { interaction: 'This worksheet looks fun!', success: 'Lovely work!', celebration: 'Worksheet complete—great job!' },
  dinosaur: { interaction: 'Let’s jump into this activity!', success: 'You’re doing brilliantly!', celebration: 'Activity complete—hooray!' },
  robot: { interaction: 'I’m here to help!', success: 'That makes sense now!', celebration: 'Problem solved!' },
  astronaut: { interaction: 'Let’s check your journey!', success: 'You’re reaching new heights!', celebration: 'Milestone unlocked!' },
})
