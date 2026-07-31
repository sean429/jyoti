import JyotiCatHelper from '@/components/JyotiCatHelper';

// Wraps every /ko/* page so the floating 조티냥 helper is present site-wide
// (Korean only for now — its tips are in Korean).
export default function KoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <JyotiCatHelper />
    </>
  );
}
