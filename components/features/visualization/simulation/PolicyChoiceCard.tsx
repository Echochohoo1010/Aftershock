"use client"

import { Card } from "@/components/ui/card"

interface PolicyOption {
  id: string
  label: string
  description: string
}

interface PolicyChoiceCardProps {
  title?: string
  options: PolicyOption[]
  selectedOption: string
  onOptionChange: (optionId: string) => void
}

export default function PolicyChoiceCard({
  title = "Policy choice:",
  options,
  selectedOption,
  onOptionChange
}: PolicyChoiceCardProps) {
  return (
    <Card className="p-4 min-w-[500px]">
      <h3 className="text-xl font-bold mb-2">{title}</h3>

      <div className="policy-choice-form">
        {options.map((option) => (
          <div key={option.id} className="policy-option">
            <input
              type="checkbox"
              id={option.id}
              checked={selectedOption === option.id}
              onChange={() => onOptionChange(option.id)}
              className="policy-checkbox"
            />
            <label htmlFor={option.id} className="policy-label">
              {option.label}
              {option.description && `: ${option.description}`}
            </label>
          </div>
        ))}
      </div>

      <style jsx>{`
        .policy-choice-form {
          --_clr-primary: #666;
          --_clr-hover: #f33195;
          --_clr-checked: #127acf;
        }

        .policy-option {
          --_clr-current: var(--_clr-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .policy-option + .policy-option {
          margin-block-start: 0.5rem;
        }

        .policy-label {
          cursor: pointer;
          color: var(--_clr-current);
          transition: color 150ms ease-in-out;
        }

        /* Styled checkbox */
        .policy-checkbox {
          appearance: none;
          outline: none;
          width: 1.5rem;
          height: 1.5rem;
          aspect-ratio: 1;
          padding: 0.25rem;
          background: transparent;
          border: 1px solid var(--_clr-current);
          border-radius: 2px;
          display: grid;
          place-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .policy-checkbox::after {
          content: "✔";
          opacity: 0;
          transition: opacity 150ms ease-in-out;
          color: var(--_clr-checked);
          font-size: inherit;
          font-family: inherit;
        }

        .policy-checkbox:checked,
        .policy-checkbox:checked + .policy-label {
          --_clr-current: var(--_clr-checked);
        }

        .policy-checkbox:checked::after {
          opacity: 1;
        }
      `}</style>
    </Card>
  )
}
