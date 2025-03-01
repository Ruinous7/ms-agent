'use client';

export default function HeroImage() {
  return (
    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-border shadow-lg bg-muted flex items-center justify-center">
      <div className="text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-primary">
          <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          <path d="M12 8v-2"/>
          <path d="M12 16v2"/>
          <path d="M16 12h2"/>
          <path d="M8 12H6"/>
          <path d="M15 9l1-1"/>
          <path d="M9 15l-1 1"/>
          <path d="M15 15l1 1"/>
          <path d="M9 9l-1-1"/>
        </svg>
        <h3 className="text-xl font-medium mb-2">MS-Agent.ai Dashboard</h3>
        <p className="text-muted-foreground">נהל את המשימות שלך בצורה חכמה ויעילה</p>
      </div>
    </div>
  );
} 