import { create } from "zustand"

type Preferences = {
    soundEnabled: boolean
    setSoundEnabled: (soundEnabled: boolean) => void
}

const getInitialSoundEnabled = () => {
    const savedPreference = window.localStorage.getItem("soundEnabled")
    return savedPreference !== null ? JSON.parse(savedPreference) : true
}

export const usePreferences = create<Preferences>((set) => ({
    soundEnabled: getInitialSoundEnabled(),
    setSoundEnabled: (soundEnabled: boolean) => {
        window.localStorage.setItem("soundEnabled", JSON.stringify(soundEnabled))
        set(() => ({ soundEnabled }))
    },
}))
