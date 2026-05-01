export default function Loading() {
  return (
    <main className="min-h-screen w-full bg-black text-white flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/50 mb-5">Loading Komban</p>
        <div className="w-44 h-px bg-white/10 overflow-hidden mx-auto">
          <div className="h-full w-1/2 bg-accent animate-pulse-soft" />
        </div>
      </div>
    </main>
  );
}
