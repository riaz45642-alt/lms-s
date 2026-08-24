import { useEffect } from 'react'
import { COMPANION_CONFIG } from './companionConfig'
import './CharacterWorld.css'

export const CHARACTER_THEMES = Object.freeze({
  fox: { primary: '#c65a22', secondary: '#397662', accent: '#f1b64c', background: '#fff9ef', surface: '#fffdf8', surfaceAlt: '#f9f0df', surfaceMuted: '#eef5e9', deep: '#402b25', text: '#34261f', border: '#eadbc8', radiusSm: '9px 14px 9px 12px', radiusMd: '17px 10px 18px 13px', radiusLg: '30px 18px 34px 22px', radiusXl: '42px 24px 48px 30px', shadow: '0 18px 42px rgba(111,65,31,.10)' },
  panda: { primary: '#365f62', secondary: '#34333b', accent: '#e6aa4c', background: '#faf9f5', surface: '#fffefa', surfaceAlt: '#f0eee7', surfaceMuted: '#e8f1ee', deep: '#303237', text: '#2e2d34', border: '#dedbd2', radiusSm: '16px', radiusMd: '24px', radiusLg: '34px', radiusXl: '48px', shadow: '0 15px 34px rgba(49,47,43,.09)' },
  dinosaur: { primary: '#31815c', secondary: '#d86e48', accent: '#8063c7', background: '#f3fbf1', surface: '#fffdf7', surfaceAlt: '#e6f4df', surfaceMuted: '#fff0db', deep: '#274737', text: '#253b31', border: '#cfe3ce', radiusSm: '14px 9px 16px 10px', radiusMd: '26px 17px 29px 19px', radiusLg: '38px 24px 42px 27px', radiusXl: '54px 31px 58px 36px', shadow: '0 20px 42px rgba(44,102,68,.12)' },
  robot: { primary: '#267e9b', secondary: '#7461bd', accent: '#44c9c6', background: '#f4fafc', surface: '#fbfeff', surfaceAlt: '#e7f4f7', surfaceMuted: '#f0edfb', deep: '#263e50', text: '#243543', border: '#cbe1e8', radiusSm: '6px', radiusMd: '10px', radiusLg: '14px', radiusXl: '18px', shadow: '0 14px 32px rgba(39,100,123,.10)' },
  astronaut: { primary: '#6654b8', secondary: '#238ca0', accent: '#e3a92e', background: '#f7f6fd', surface: '#fdfcff', surfaceAlt: '#edeafb', surfaceMuted: '#e7f5f6', deep: '#2e2b55', text: '#292944', border: '#dad6ef', radiusSm: '18px', radiusMd: '28px', radiusLg: '38px', radiusXl: '56px', shadow: '0 18px 42px rgba(78,66,145,.12)' },
})

export default function CharacterWorld({ page, children }) {
  const character = COMPANION_CONFIG[page]?.character
  const theme = CHARACTER_THEMES[character]
  useEffect(() => {
    if (!character) return undefined
    document.documentElement.dataset.characterTheme = character
    return () => { delete document.documentElement.dataset.characterTheme }
  }, [character])
  if (!theme) return children
  const variables = {
    '--world-primary': theme.primary, '--world-secondary': theme.secondary,
    '--world-accent': theme.accent, '--world-bg': theme.background,
    '--world-surface': theme.surface, '--world-surface-alt': theme.surfaceAlt,
    '--world-surface-muted': theme.surfaceMuted, '--world-deep': theme.deep, '--world-text': theme.text,
    '--world-border': theme.border, '--world-radius-sm': theme.radiusSm,
    '--world-radius-md': theme.radiusMd, '--world-radius-lg': theme.radiusLg,
    '--world-radius-xl': theme.radiusXl, '--world-radius': theme.radiusMd,
    '--world-shadow': theme.shadow,
  }
  return <div className={`character-world world-${character}`} style={variables} data-world={character}>
    <div className="world-atmosphere" aria-hidden="true"><i/><i/><i/></div>
    <div className="world-content">{children}</div>
  </div>
}
