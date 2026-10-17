import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import UnderwaterBackground from './components/UnderwaterBackground';
import FloatingText from './components/FloatingText';
import MainPage from './components/MainPage';

const App: React.FC = () => {
  // --- 1. LOADING STATE ---
  const [isLoading, setIsLoading] = useState(true);

  // --- COVER / DRAG STATE ---
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showMainContent, setShowMainContent] = useState(false);
  
  const [hasAscended, setHasAscended] = useState(false);
  
  // --- PAGE NAVIGATION STATE ---
  const [pageIndex, setPageIndex] = useState(0);
  const isTransitioningPage = useRef(false);
  
  // --- CLICK / BOUNCE STATE ---
  const [isBouncing, setIsBouncing] = useState(false);
  const [labelText, setLabelText] = useState("ABOUT ME");
  const revertTimerRef = useRef<number | null>(null);

  // --- REFS ---
  const startY = useRef(0);
  const isPointerDown = useRef(false);

  // --- EFFECTS: FONT LOADING CHECK ---
  useEffect(() => {
    // 字体最多等 2.5s，超时就先放人进来，避免 Google Fonts 慢时黑屏干等
    const fontPromise = Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 2500)),
    ]);
    // 稍微缩短一点强制等待时间，让感觉更干脆
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 800));

    Promise.all([fontPromise, minTimePromise]).then(() => {
      setIsLoading(false);
    });

    // 兜底：无论如何 4s 后一定进入
    const safety = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(safety);
  }, []);

  // --- EFFECTS: MAIN ANIMATION SEQUENCE ---
  useEffect(() => {
    if (isDismissed) {
      const timer = setTimeout(() => {
        setShowMainContent(true);
        setHasAscended(true); 
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDismissed]);

  // --- PAGE NAVIGATION HANDLERS ---
  const handleNextPage = useCallback(() => {
    setPageIndex(prev => prev < 4 ? prev + 1 : prev);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPageIndex(prev => prev > 0 ? prev - 1 : prev);
  }, []);

  useEffect(() => {
    if (!showMainContent) return;

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioningPage.current) return;
      isTransitioningPage.current = true;
      setTimeout(() => isTransitioningPage.current = false, 800); 

      if (e.deltaY > 0 || e.deltaX > 0) {
        handleNextPage();
      } else if (e.deltaY < 0 || e.deltaX < 0) {
        handlePrevPage();
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
         if (Math.abs(deltaX) > 50) { 
            if (deltaX > 0) handleNextPage(); 
            else handlePrevPage(); 
         }
      } else {
         if (Math.abs(deltaY) > 50) {
             if (deltaY > 0) handleNextPage(); 
             else handlePrevPage(); 
         }
      }
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [showMainContent, handleNextPage, handlePrevPage]);

  // --- DRAG HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary || isLoading) return; 
    isPointerDown.current = true;
    startY.current = e.clientY;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || isDismissed || isLoading) return;

    const currentY = e.clientY;
    const deltaY = startY.current - currentY; 

    if (deltaY > 10) {
      setIsDragging(true);
      setDragOffset(Math.max(0, deltaY));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);

    const windowHeight = window.innerHeight;
    const threshold = windowHeight * 0.25; 

    if (isDragging) {
       if (dragOffset > threshold) {
          setIsDismissed(true);
          setDragOffset(windowHeight); 
       } else {
          setDragOffset(0);
          setIsDragging(false);
       }
    } else {
       handleBottomClick();
    }
  };

  const handleBottomClick = () => {
    if (revertTimerRef.current) clearTimeout(revertTimerRef.current);
    setLabelText("DRAG ME UP");
    if (!isBouncing) {
        setIsBouncing(true);
        setTimeout(() => setIsBouncing(false), 500); 
    }
    revertTimerRef.current = window.setTimeout(() => {
      setLabelText("ABOUT ME");
    }, 5000);
  };

  // --- STYLES ---
  const containerStyle = useMemo(() => {
    if (isDismissed) {
       return { 
           transform: 'translateY(-150%)', 
           transition: 'transform 2s cubic-bezier(0.25, 1, 0.5, 1)' 
       };
    }
    if (isDragging) {
       return { transform: `translateY(-${dragOffset}px)`, transition: 'none' };
    }
    if (isBouncing) {
       return { transform: 'translateY(-80px)', transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' };
    }
    return { transform: 'translateY(0)', transition: 'transform 0.3s ease-out' };
  }, [isDismissed, isDragging, dragOffset, isBouncing]);

  const getPageColor = (idx: number) => {
      switch(idx) {
          case 0: return '#DCE8F2'; 
          case 1: return '#06BBF7'; 
          case 2: return '#5865F2'; 
          case 3: return '#FB7299'; 
          case 4: return '#FF4D4D'; 
          default: return '#DCE8F2';
      }
  };

  const bgOverlayStyle = useMemo(() => {
     let backgroundColor = '#001E4A'; 
     if (isDismissed) {
        backgroundColor = getPageColor(pageIndex);
     }
     const duration = isDismissed && !hasAscended ? '2.5s' : '0.8s'; 
     const timing = 'cubic-bezier(0.45, 0, 0.55, 1)'; 

     return {
         backgroundColor,
         transition: `background-color ${duration} ${timing}`
     };
  }, [isDismissed, pageIndex, hasAscended]);

  return (
    <main className="relative w-full h-[100svh] overflow-hidden bg-anime-abyss font-sans">
      
      {/* --- 0. LOADING OVERLAY (Neon Green Style) --- */}
      <div 
        className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="relative">
           {/* 荧光绿加载圈 */}
           <div className="w-16 h-16 border-4 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(57,255,20,0.5)]"></div>
           {/* 荧光绿发光背景 */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#39FF14]/10 blur-xl rounded-full"></div>
        </div>
        <h2 className="font-michroma text-[#39FF14] tracking-[0.3em] text-sm animate-pulse drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]">
          SYSTEM INITIALIZING...
        </h2>
      </div>

      {/* --- 1. MAIN SITE CONTENT --- */}
      <div className="absolute inset-0 z-0">
         <div 
            className="absolute inset-0 pointer-events-none z-10 will-change-[background-color]"
            style={bgOverlayStyle}
         />
         <MainPage show={showMainContent} pageIndex={pageIndex} onNavigate={setPageIndex} />
      </div>

      {/* --- 2. THE UNDERWATER CURTAIN --- */}
      <div 
        className="absolute inset-0 z-50 will-change-transform"
        style={containerStyle}
      >
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#0088FF] -translate-y-full pointer-events-none" />
        <div className="relative w-full h-full bg-[#001166]">
            {/* 水下背景一直存在，不需要重置 */}
            <UnderwaterBackground />
            
            <div 
              className="absolute bottom-0 left-0 w-full h-[20%] z-[200]"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp} 
            />
            <div className="absolute bottom-0 left-0 w-full h-px shadow-[0_50px_150px_80px_#001E4A] pointer-events-none"></div>
        </div>
      </div>

      {/* --- 3. FLOATING TEXT LAYER --- */}
      <div 
         className="absolute inset-0 z-[300] pointer-events-none"
         style={containerStyle}
      >
         {/* 
            关键修改：
            只有当 isLoading 变为 false 后，才开始渲染 FloatingText。
            这样 FloatingText 内部的物理引擎（文字下落动画）就会从这一刻开始重置播放，
            刚好卡在 Loading 界面消失的点上。
         */}
         {!isLoading && (
            <FloatingText 
                labelText={labelText} 
                hideLabel={isDragging || isDismissed} 
            />
         )}
      </div>

    </main>
  );
};

export default App;