import type { JSX } from 'react'
import type { LanguageOption } from '../../../shared/types'

const LABELS: Record<LanguageOption, string> = {
  auto: 'Auto',
  english: 'English',
  simplified: '简体中文',
  traditional: '繁體中文'
}

interface LanguageSelectProps {
  options: LanguageOption[]
  value: LanguageOption
  onChange(option: LanguageOption): void
}

export default function LanguageSelect({
  options,
  value,
  onChange
}: LanguageSelectProps): JSX.Element {
  return (
    <select
      className="w-56 cursor-pointer rounded-md border border-black/25 bg-transparent px-2.5 py-2 text-sm dark:border-white/25"
      value={value}
      onChange={(event) => onChange(event.target.value as LanguageOption)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {LABELS[option]}
        </option>
      ))}
    </select>
  )
}
