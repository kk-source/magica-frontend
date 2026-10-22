/** Galaxy's ghost mascot: a violet blob with two big eyes. */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M6 18C6 9.7 12.3 4 20 4s14 5.7 14 14v15.5c0 1.6-1.9 2.4-3 1.3l-2.3-2.3a2 2 0 0 0-2.8 0l-2.5 2.5a2 2 0 0 1-2.8 0L18 32.4a2 2 0 0 0-2.8 0l-2.6 2.6a2 2 0 0 1-2.8 0l-.9-.9A2 2 0 0 0 6 35.5z"
        fill="#5b4df6"
      />
      <circle cx="14.5" cy="17" r="4.5" fill="#fff" />
      <circle cx="25.5" cy="17" r="4.5" fill="#fff" />
      <circle cx="15.5" cy="17.5" r="2" fill="#141416" />
      <circle cx="26.5" cy="17.5" r="2" fill="#141416" />
    </svg>
  );
}
