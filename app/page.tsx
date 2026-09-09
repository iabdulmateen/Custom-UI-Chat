import { ChatInterface } from '@/components/ChatInterface';

export const metadata = {
  title: 'Custom Chat UI | Software Architect Console',
  description: 'A production-grade custom chat frontend with rich markdown rendering, local storage persistence, and code execution blocks.',
};

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-zinc-950">
      <ChatInterface />
    </main>
  );
}
