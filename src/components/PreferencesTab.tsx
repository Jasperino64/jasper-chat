/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client"
import React from "react"
import { Button } from "./ui/button"
import { MoonIcon, SunIcon, Volume2, VolumeX } from "lucide-react"
import { useTheme } from "next-themes"
import { usePreferences } from "@/store/usePreferences"
import useSound from "use-sound"

function PreferencesTab() {
    const { theme, setTheme } = useTheme()
    const { soundEnabled, setSoundEnabled } = usePreferences()
    const [playMouseClick] = useSound("/sounds/mouse-click.mp3", { volume: 0.3 })
    const [playSoundOn] = useSound("/sounds/sound-on.mp3", { volume: 0.3 })
    const [playSoundOff] = useSound("/sounds/sound-off.mp3", { volume: 0.3 })
    return (
        <div className="flex flex-wrap gap-2 px-1 md:px-2">
            {theme == "light" ? (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setTheme("dark")
                        soundEnabled && playMouseClick()
                    }}
                >
                    <SunIcon className="size-[1.2rem] text-muted-forground" />
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        setTheme("light")
                        soundEnabled && playMouseClick()
                    }}
                >
                    <MoonIcon className="size-[1.2rem] text-muted-forground" />
                </Button>
            )}
            <Button
                variant="outline"
                size="icon"
                onClick={() => {
                    setSoundEnabled(!soundEnabled)
                    soundEnabled ? playSoundOff() : playSoundOn();
                }}
            >
                {soundEnabled ? (
                    <Volume2 className="size-[1.2rem] text-muted-forground" />
                ) : (
                    <VolumeX className="size-[1.2rem] text-muted-forground" />
                )}
            </Button>
        </div>
    )
}

export default PreferencesTab
