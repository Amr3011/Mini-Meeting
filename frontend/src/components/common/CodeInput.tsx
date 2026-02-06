import { useRef } from "react";

interface CodeInputProps {
  code: string[];
  onChange: (code: string[]) => void;
  label?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({ code, onChange, label = "Verification Code" }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    onChange(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      onChange(newCode);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
        {label}
      </label>
      <div className="flex gap-3 justify-center">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`
              w-14 h-16 text-center text-3xl font-bold 
              border-2 rounded-xl transition-all duration-200
              focus:outline-none focus:ring-4
              ${
                digit
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-brand-100"
                  : "border-gray-300 hover:border-gray-400 focus:border-brand-500 focus:ring-brand-100"
              }
              ${digit && "animate-pulse"}
            `}
          />
        ))}
      </div>
    </div>
  );
};
