"use client"

import { Settings, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Voice } from "@/lib/hooks/use-text-to-speech"

interface VoiceSettingsProps {
  voices: Voice[]
  selectedVoice: Voice
  onVoiceChange: (voice: Voice) => void
  isEnabled: boolean
  onToggleEnabled: () => void
}

export function VoiceSettings({
  voices,
  selectedVoice,
  onVoiceChange,
  isEnabled,
  onToggleEnabled,
}: VoiceSettingsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="Voice Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Voice Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2">
          <Button
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={onToggleEnabled}
            className="w-full justify-start gap-2"
          >
            <Volume2 className="h-4 w-4" />
            {isEnabled ? "Voice Enabled" : "Voice Disabled"}
          </Button>
        </div>

        {isEnabled && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Select Voice
            </DropdownMenuLabel>
            {voices.map((voice) => (
              <DropdownMenuItem
                key={voice.id}
                onClick={() => onVoiceChange(voice)}
                className={
                  selectedVoice.id === voice.id
                    ? "bg-accent"
                    : ""
                }
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{voice.name}</span>
                  {voice.description && (
                    <span className="text-xs text-muted-foreground">
                      {voice.description}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
