
type RememberMeCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function RememberMeCheckbox({ checked, onChange }: RememberMeCheckboxProps) {
  return (
    <label className="mt-1 mb-[22px] flex cursor-pointer items-center gap-[9px] select-none">
      <input className="peer absolute size-0 opacity-0" type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="flex size-[18px] items-center justify-center rounded-[5px] border-[1.5px] border-line-strong text-white transition-colors peer-checked:border-ink peer-checked:bg-ink [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100">
        <Check size={11} strokeWidth={3.2} />
      </span>
      <span className="text-[13.5px] text-ink-secondary">Keep me signed in</span>
    </label>
  );
}import { Check } from "lucide-react";

