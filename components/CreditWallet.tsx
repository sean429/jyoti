'use client';

// Floating wallet pinned to the corner of the screen so buyers always see
// how many credits they hold and how many themes they've unlocked.
// Hidden when the visitor owns nothing, and excluded from printed reports.

type Credits = { std: number; prem: number };

const STRINGS = {
  ko: {
    title: '내 이용권',
    std: '심층 테마 이용권',
    prem: '프리미엄 이용권',
    count: (n: number) => `${n}장`,
    unlocked: '해금된 테마',
    unlockedCount: (n: number) => `${n}개`,
    hint: '잠긴 테마를 고르면 이용권으로 바로 열 수 있어요',
    invite: '내 초대 코드 · 친구 결제 시 1장',
    share: '공유',
  },
  zh: {
    title: '我的使用券',
    std: '深度主题使用券',
    prem: '高级使用券',
    count: (n: number) => `${n}张`,
    unlocked: '已解锁主题',
    unlockedCount: (n: number) => `${n}个`,
    hint: '选择锁定的主题，即可用使用券立即解锁',
    invite: '我的邀请码 · 好友付款得1张',
    share: '分享',
  },
  en: {
    title: 'My Credits',
    std: 'Theme credits',
    prem: 'Premium credits',
    count: (n: number) => `${n}`,
    unlocked: 'Unlocked themes',
    unlockedCount: (n: number) => `${n}`,
    hint: 'Pick a locked theme to unlock it with a credit',
    invite: 'My invite code · 1 credit per friend',
    share: 'Share',
  },
};

export default function CreditWallet({ lang, credits, unlockedCount, refCode, onShare }: {
  lang: 'ko' | 'zh' | 'en';
  credits: Credits;
  unlockedCount: number;
  refCode?: string;
  onShare?: () => void;
}) {
  const s = STRINGS[lang];
  const hasCredits = credits.std > 0 || credits.prem > 0;
  if (!hasCredits && unlockedCount === 0 && !refCode) return null;

  return (
    <div className="no-print" style={{
      position: 'fixed', left: '12px', bottom: '16px', zIndex: 60,
      minWidth: '190px', maxWidth: '240px',
      background: 'rgba(12,10,30,0.92)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(201,168,76,0.45)', borderRadius: '12px',
      padding: '10px 12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <p className="font-cinzel text-xs font-bold mb-1.5" style={{ color: 'var(--gold-light)' }}>
        🎟 {s.title}
      </p>
      {refCode && (
        <div className="mb-2 pb-2" style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>{s.invite}</p>
          <div className="flex items-center gap-1.5">
            <span className="font-cinzel text-xs font-bold tracking-widest" style={{ color: 'var(--gold-light)' }}>{refCode}</span>
            {onShare && (
              <button onClick={onShare} className="text-[10px] font-cinzel px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.35)', color: 'var(--gold-light)' }}>
                📤 {s.share}
              </button>
            )}
          </div>
        </div>
      )}
      {credits.std > 0 && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span style={{ color: 'var(--text-muted)' }}>{s.std}</span>
          <span className="font-bold" style={{ color: 'var(--gold-light)' }}>{s.count(credits.std)}</span>
        </div>
      )}
      {credits.prem > 0 && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span style={{ color: 'var(--text-muted)' }}>{s.prem}</span>
          <span className="font-bold" style={{ color: '#c4b5fd' }}>{s.count(credits.prem)}</span>
        </div>
      )}
      {unlockedCount > 0 && (
        <div className="flex items-center justify-between text-xs mb-1">
          <span style={{ color: 'var(--text-muted)' }}>{s.unlocked}</span>
          <span className="font-bold" style={{ color: '#86efac' }}>{s.unlockedCount(unlockedCount)}</span>
        </div>
      )}
      {hasCredits && (
        <p className="text-[10px] mt-1.5" style={{ color: 'rgba(201,168,76,0.65)', lineHeight: 1.4 }}>
          {s.hint}
        </p>
      )}
    </div>
  );
}
