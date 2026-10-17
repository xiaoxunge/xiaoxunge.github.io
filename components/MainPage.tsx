import React, { useEffect, useRef, useState } from 'react';

interface MainPageProps {
  show: boolean;
  pageIndex: number;
  onNavigate?: (index: number) => void;
}

/* ============================================================
   页面配置
   0 = 白底排版页（About），1-4 = 联系方式卡片
   ============================================================ */
const PAGES = [
  { accent: '#12314F', deep: '#0B2136', label: 'ABOUT' },
  { accent: '#06BBF7', deep: '#0794C4', label: 'GITHUB' },
  { accent: '#5865F2', deep: '#4451D6', label: 'DISCORD' },
  { accent: '#FB7299', deep: '#E4537C', label: 'BILIBILI' },
  { accent: '#FF4D4D', deep: '#D93A3A', label: 'QQ' },
];

const INK = '#12314F';
const BODY = '#5A7288';

/* ============================================================
   小部件
   ============================================================ */

const Avatar: React.FC<{
  src?: string;
  alt: string;
  fallback: string;
  accent: string;
  className?: string;
}> = ({ src, alt, fallback, accent, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-[#EDF3F9] ${className}`}
      style={{ boxShadow: `0 0 0 1px rgba(11,27,51,0.07), 0 16px 34px -16px ${accent}` }}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-bodoni text-2xl text-[#0B1B33]/30">{fallback}</span>
        </div>
      )}
    </div>
  );
};

const Pill: React.FC<{ label: string; href?: string; onClick?: () => void; index: number; large?: boolean }> = ({
  label,
  href,
  onClick,
  index,
  large,
}) => {
  const base =
    'group inline-flex items-center justify-center gap-2.5 rounded-full font-michroma text-white transition-all duration-300 hover:-translate-y-0.5';
  const size = large ? 'px-8 py-3.5 text-[11px] tracking-[0.22em]' : 'px-6 py-2.5 text-[10px] tracking-[0.2em]';
  const style: React.CSSProperties = {
    background: `linear-gradient(180deg, ${PAGES[index].accent} 0%, ${PAGES[index].deep} 100%)`,
    boxShadow: `0 10px 26px -12px ${PAGES[index].accent}`,
  };

  const inner = (
    <>
      <span>{label}</span>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
      >
        <path
          d="M2.5 8h11M9 3.5L13.5 8 9 12.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${size}`} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} ${size}`} style={style}>
      {inner}
    </button>
  );
};

const CopyPill: React.FC<{ value: string; label: string; index: number }> = ({ value, label, index }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return <Pill label={copied ? 'COPIED' : label} onClick={copy} index={index} />;
};

/* ============================================================
   白底排版页（参考 P3R 的 Game System 版式）
   ============================================================ */

const AboutLayout: React.FC<{
  visible: boolean;
  entering: boolean;
  onNavigate?: (i: number) => void;
}> = ({ visible, entering, onNavigate }) => (
  <div
    className="absolute inset-0 z-30 overflow-hidden"
    style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(-14px)',
      transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)',
      pointerEvents: visible ? 'auto' : 'none',
    }}
  >
    {/* 底部压住的巨型空心字 */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden">
      <span
        className="stroke-dark block whitespace-nowrap font-bodoni font-bold leading-[0.78]"
        style={{ fontSize: '18.5vw', marginLeft: '-1.5vw' }}
      >
        XIAOXUNGE
      </span>
    </div>

    {/* 右侧视觉锚点 */}
    <div className="pointer-events-none absolute right-[9vw] top-1/2 hidden -translate-y-1/2 lg:block">
      <div className="relative">
        <div
          className="absolute -inset-6 rounded-full"
          style={{ border: `1px solid ${INK}12` }}
        />
        <img
          src="https://github.com/xiaoxunge.png"
          alt=""
          aria-hidden="true"
          className="h-[248px] w-[248px] rounded-full object-cover"
          style={{
            boxShadow: `0 30px 70px -30px ${INK}55`,
            filter: 'saturate(0.92)',
          }}
        />
        <span
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-michroma text-[8px] tracking-[0.3em]"
          style={{ color: `${INK}55` }}
        >
          XIAOXUNGE
        </span>
      </div>
    </div>

    <div className="relative z-10 flex h-full items-center px-7 sm:px-[7vw]">
      <div className="w-full max-w-[500px]">
        <div className="flex items-center gap-3">
          <span className="h-px w-9" style={{ backgroundColor: `${INK}55` }} />
          <span className="font-michroma text-[9px] tracking-[0.34em]" style={{ color: `${INK}88` }}>
            ABOUT
          </span>
        </div>

        <h1
          className="mt-7 font-bodoni leading-[1.02] tracking-[-0.015em]"
          style={{ fontSize: 'clamp(38px, 4.6vw, 60px)', color: INK, fontWeight: 400 }}
        >
          About Me
        </h1>

        <div className="mt-7 space-y-4 font-noto-sans text-[13px] leading-[1.95] tracking-[0.02em]" style={{ color: BODY }}>
          <p>这里是我的一点私人角落。平时折腾 AI 影像、短视频和创意工具，把做出来的东西随手丢在 GitHub，偶尔在 B 站发一点。</p>
          <p>如果你也想聊这些，下面几个地方都能找到我。</p>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Pill label="OPEN GITHUB" href="https://github.com/xiaoxunge" index={1} large />
          <button
            type="button"
            onClick={() => onNavigate?.(1)}
            className="font-michroma text-[9px] tracking-[0.26em] transition-opacity hover:opacity-60"
            style={{ color: `${INK}99` }}
          >
            向下滚动 ↓
          </button>
        </div>

        <div className="mt-10 flex items-center gap-3 font-michroma text-[8px] tracking-[0.24em]" style={{ color: `${INK}55` }}>
          <span className="h-px w-6" style={{ backgroundColor: `${INK}33` }} />
          四个地方 · 一个我
        </div>
      </div>
    </div>
  </div>
);

/* ============================================================
   联系方式卡片轮播
   ============================================================ */

const CARD_W = (narrow: boolean) => (narrow ? 246 : 322);
const CARD_H = (narrow: boolean) => (narrow ? 396 : 452);
const GAP = (narrow: boolean) => (narrow ? 14 : 24);

type CardData = {
  avatar: React.ReactNode;
  title: string;
  titleClass: string;
  subtitle: string;
  action: React.ReactNode;
};

const Card: React.FC<{
  index: number;
  current: number;
  narrow: boolean;
  entering: boolean;
  stage: string;
  onPick: (i: number) => void;
  data: CardData;
}> = ({ index, current, narrow, entering, stage, onPick, data }) => {
  const d = index - current;
  const abs = Math.abs(d);
  const active = d === 0;

  const step = CARD_W(narrow) + GAP(narrow);
  // 侧卡缩小后把中心往下补，让三张卡的底边对齐（像官网那样名字在同一行）
  const yShift = active ? 0 : (CARD_H(narrow) * (1 - 0.84)) / 2;

  const clipPath = entering
    ? stage === 'HIDDEN' || stage === 'DRAWING'
      ? 'polygon(49.4% 0, 50.6% 0, 50.6% 100%, 49.4% 100%)'
      : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
    : undefined;

  return (
    <div
      className="absolute left-1/2 top-1/2"
      onClick={() => {
        if (!active) onPick(index);
      }}
      style={{
        transform: `translate(-50%, -50%) translate(${d * step}px, ${yShift}px) scale(${active ? 1 : 0.84})`,
        opacity: abs > 1 ? 0 : active ? 1 : 0.55,
        zIndex: 20 - abs,
        transition: 'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, filter 0.75s ease',
        filter: active
          ? 'saturate(1) drop-shadow(0 26px 58px rgba(0,16,45,0.36))'
          : 'saturate(0.1) brightness(1.05) drop-shadow(0 16px 36px rgba(0,16,45,0.24))',
        pointerEvents: abs > 1 ? 'none' : 'auto',
        cursor: active ? 'default' : 'pointer',
        width: CARD_W(narrow),
      }}
    >
      <div
        className="relative overflow-hidden bg-white"
        style={{
          height: CARD_H(narrow),
          clipPath,
          transition: entering ? 'clip-path 0.7s cubic-bezier(0.22, 1, 0.36, 1)' : undefined,
        }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
          {data.avatar}

          <h2 className={`mt-5 whitespace-nowrap text-[#0B1B33] ${data.titleClass}`}>{data.title}</h2>

          <p className="mt-2 font-michroma text-[9px] tracking-[0.22em] text-[#0B1B33]/40">{data.subtitle}</p>

          <div
            className="mt-7"
            style={{ opacity: active ? 1 : 0, transition: 'opacity 0.4s ease', pointerEvents: active ? 'auto' : 'none' }}
          >
            {data.action}
          </div>
        </div>

        <span className="absolute right-4 top-3.5 font-michroma text-[8px] tracking-[0.2em] text-[#0B1B33]/20">
          {String(index).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-3.5 flex items-center gap-2 pl-1">
        <span className="font-michroma text-[10px] tracking-[0.26em] text-white/75">{PAGES[index].label}</span>
        <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5 text-white/45">
          <path d="M2.5 8h11M9 3.5L13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

/* ============================================================
   主体
   ============================================================ */

const MainPage: React.FC<MainPageProps> = ({ show, pageIndex, onNavigate }) => {
  const [introStage, setIntroStage] = useState<'HIDDEN' | 'DRAWING' | 'EXPAND' | 'CONTENT'>('HIDDEN');
  const [narrow, setNarrow] = useState(false);
  const [entering, setEntering] = useState(true);
  const introDoneRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!show) {
      setIntroStage('HIDDEN');
      setEntering(true);
      introDoneRef.current = false;
      return;
    }

    if (!introDoneRef.current) {
      introDoneRef.current = true;
      setEntering(true);
      setIntroStage('HIDDEN');
      const t1 = setTimeout(() => setIntroStage('DRAWING'), 100);
      const t2 = setTimeout(() => setIntroStage('EXPAND'), 760);
      const t3 = setTimeout(() => {
        setIntroStage('CONTENT');
        setEntering(false);
      }, 1320);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    setIntroStage('DRAWING');
    const t1 = setTimeout(() => setIntroStage('EXPAND'), 80);
    const t2 = setTimeout(() => setIntroStage('CONTENT'), 320);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [show, pageIndex]);

  const ready = introStage === 'CONTENT';
  const showAbout = pageIndex === 0;
  const showCards = !showAbout;

  const cardData: Record<number, CardData> = {
    1: {
      avatar: (
        <Avatar
          src="https://github.com/xiaoxunge.png"
          alt="小讯ge 的头像"
          fallback="X"
          accent={PAGES[1].accent}
          className="h-[86px] w-[86px]"
        />
      ),
      title: 'XIAOXUNGE',
      titleClass: 'font-bodoni text-[25px] tracking-tight',
      subtitle: 'github.com/xiaoxunge',
      action: <Pill label="OPEN GITHUB" href="https://github.com/xiaoxunge" index={1} />,
    },
    2: {
      avatar: (
        <div
          className="flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#EDEFFF]"
          style={{ boxShadow: `0 0 0 1px rgba(88,101,242,0.12), 0 16px 34px -16px ${PAGES[2].accent}` }}
        >
          <span className="font-bodoni text-3xl italic text-[#5865F2]">@</span>
        </div>
      ),
      title: 'hinin',
      titleClass: 'font-bodoni text-[27px] tracking-tight',
      subtitle: 'DISCORD USERNAME',
      action: <CopyPill value="hinin" label="COPY USERNAME" index={2} />,
    },
    3: {
      avatar: (
        <Avatar
          src="https://image.zeta-ai.io/profile-image/8efca046-e45f-4129-b10d-ccd12ac218cd/c4630277-38c2-4734-8a8f-58d1794d2fd2/6fb5d525-e780-44e4-8802-d0cbc3b1dc2c.jpeg?w=3840&q=90&f=webp"
          alt="小讯ge 的 Bilibili 头像"
          fallback="B"
          accent={PAGES[3].accent}
          className="h-[86px] w-[86px]"
        />
      ),
      title: '仰望大触的小讯',
      titleClass: 'font-noto-serif text-[19px] tracking-[0.06em]',
      subtitle: 'UID 275310636',
      action: <Pill label="去我空间" href="https://space.bilibili.com/275310636" index={3} />,
    },
    4: {
      avatar: (
        <Avatar
          src="https://cdn.mmoe.nl/media_attachments/files/112/669/621/336/638/733/original/34fb7e0f4cd14b30.jpg"
          alt="小讯ge 的 QQ 头像"
          fallback="Q"
          accent={PAGES[4].accent}
          className="h-[86px] w-[86px]"
        />
      ),
      title: '小讯ge',
      titleClass: 'font-noto-serif text-[21px] tracking-[0.1em]',
      subtitle: '2097278193',
      action: <CopyPill value="2097278193" label="COPY NUMBER" index={4} />,
    },
  };

  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      {/* 白底排版页 */}
      <AboutLayout visible={showAbout && ready} entering={entering} onNavigate={onNavigate} />

      {/* 联系方式卡片 */}
      <div
        className="absolute inset-0"
        style={{
          opacity: showCards && ready ? 1 : 0,
          transition: 'opacity 0.55s ease',
          pointerEvents: showCards ? 'auto' : 'none',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            index={i}
            current={pageIndex}
            narrow={narrow}
            entering={entering}
            stage={introStage}
            onPick={(n) => onNavigate?.(n)}
            data={cardData[i]}
          />
        ))}
      </div>

      {/* 页码（只在卡片页显示） */}
      <div
        className="pointer-events-none absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 transition-opacity duration-500"
        style={{ opacity: showCards && ready ? 1 : 0 }}
      >
        {PAGES.map((_, i) => (
          <span
            key={i}
            className="h-[2px] rounded-full transition-all duration-500"
            style={{
              width: i === pageIndex ? 24 : 9,
              backgroundColor: i === pageIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.32)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MainPage;
