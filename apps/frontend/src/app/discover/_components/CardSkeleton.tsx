// apps/frontend/src/app/discover/_components/CardSkeleton.tsx
export function CardSkeleton() {
  return (
    <div style={{
      background:"#F7F8FA", border:"1px solid rgba(16,64,107,0.09)",
      borderRadius:20, padding:"22px 20px", height:220,
      animation:"pulse 1.5s ease-in-out infinite",
    }}>
      {[80,120,60,40].map((w,i) => (
        <div key={i} style={{
          height:12, borderRadius:6, marginBottom:14,
          width:`${w}%`, background:"rgba(16,64,107,0.07)",
        }}/>
      ))}
    </div>
  );
}