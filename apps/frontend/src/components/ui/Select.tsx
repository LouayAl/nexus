// components/ui/Select.tsx
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="your-styles-here" />;
}

// components/ui/Textarea.tsx
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="your-styles-here" />;
}