// Plain-language scheduling options. The sidebar builds schedules from these
// presets so users never have to write a cron expression; the /scheduled page
// uses the same mapping to describe saved crons.

export type SchedulePreset = {
  cron: string
  label: string
}

export const schedulePresets: SchedulePreset[] = [
  { cron: "0 * * * *", label: "Every hour" },
  { cron: "0 */6 * * *", label: "Every 6 hours" },
  { cron: "0 9 * * *", label: "Every day at 9:00 AM" },
  { cron: "0 18 * * *", label: "Every day at 6:00 PM" },
  { cron: "0 9 * * 1", label: "Every Monday at 9:00 AM" },
  { cron: "0 9 1 * *", label: "First day of every month at 9:00 AM" },
]

export const defaultScheduleCron = "0 9 * * *"

// A short list of common IANA timezones; anything else saved on a workflow is
// still honored — it just gets appended as an extra option where needed.
export const scheduleTimezones = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
]

// Describes a saved cron in plain language, falling back to the raw
// expression for crons created before presets existed.
export function describeCron(cron: string | null) {
  if (!cron) return null
  return schedulePresets.find((preset) => preset.cron === cron)?.label ?? cron
}

export function timezoneLabel(timezone: string) {
  if (timezone === "UTC") return "UTC"
  return timezone.split("/").pop()?.replace(/_/g, " ") ?? timezone
}
