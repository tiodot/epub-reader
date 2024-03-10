"use client"

import { atomWithStorage } from 'jotai/utils'
import { useAtom, atom } from 'jotai'

export const navbarState = atom(false) 

export interface Settings extends TypographyConfiguration {
  theme?: ThemeConfiguration
}

export interface TypographyConfiguration {
  fontSize?: string
  fontWeight?: number
  fontFamily?: string
  lineHeight?: number
  spread?: string
  zoom?: number
}

interface ThemeConfiguration {
  source?: string
  background?: number
}

export const defaultSettings: Settings = {}

export const settingsState = atomWithStorage('settings', defaultSettings) 

export function useSettings() {
  return useAtom(settingsState)
}
