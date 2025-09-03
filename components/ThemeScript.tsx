export default function ThemeScript() {
  const script = `
  try {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme ? theme === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  } catch {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

