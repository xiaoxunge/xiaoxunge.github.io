import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import UnderwaterBackground from './components/UnderwaterBackground';
import FloatingText from './components/FloatingText';
import MainPage from './components/MainPage';

const App: React.FC = () => {
  // --- COVER / DRAG STATE ---
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showMainContent, setShowMainContent] = useState(false);
  
  // Track if the initial ascension animation (Dark Blue -> Cyan) has completed
  const [hasAscended, setHasAscended] = useState(false);
  
  // --- PAGE NAVIGATION STATE (0=GitHub, 1=Discord, 2=Bilibili, 3=QQ) ---
  const [pageIndex, setPageIndex] = useState(0);
  const isTransitioningPage = useRef(false);
  
  // --- CLICK / BOUNCE STATE ---
  const [isBouncing, setIsBouncing] = useState(false);
  const [labelText, setLabelText] = useState("ABOUT ME");
  const revertTimerRef = useRef<number | null>(null);

  // --- REFS ---
  const startY = useRef(0);
  const isPointerDown = useRef(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (isDismissed) {
      // Wait for the curtain animation to complete, then trigger main content
      const timer = setTimeout(() => {
        setShowMainContent(true);
        setHasAscended(true); // Mark initial animation as done
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDismissed]);

  // --- PAGE NAVIGATION HANDLERS ---
  const handleNextPage = useCallback(() => {
    // 使用函数式更新，依赖数组可以为空
    setPageIndex(prev => prev < 3 ? prev + 1 : prev);
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


  // --- DRAG HANDLERS (Cover) ---

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    isPointerDown.current = true;
    startY.current = e.clientY;
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || isDismissed) return;

    const currentY = e.clientY;
    const deltaY = startY.current - currentY; // Positive = Dragging UP

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

  // Background Color Logic
  const getPageColor = (idx: number) => {
      switch(idx) {
          case 0: return '#06BBF7'; // Cyan
          case 1: return '#5865F2'; // Discord
          case 2: return '#FB7299'; // Bilibili
          case 3: return '#FF4D4D'; // QQ
          default: return '#06BBF7';
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
    <main className="relative w-full h-screen overflow-hidden bg-anime-abyss font-sans">
      
      {/* --- 1. MAIN SITE CONTENT (HIDDEN BEHIND CURTAIN) --- */}
      <div className="absolute inset-0 z-0">
         {/* Transition Overlay */}
         <div 
            className="absolute inset-0 pointer-events-none z-10 will-change-[background-color]"
            style={bgOverlayStyle}
         />
         <MainPage show={showMainContent} pageIndex={pageIndex} />
      </div>


      {/* --- 2. THE UNDERWATER CURTAIN (SPLASH SCREEN) --- */}
      <div 
        className="absolute inset-0 z-50 will-change-transform"
        style={containerStyle}
      >
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#0088FF] -translate-y-full pointer-events-none" />
        <div className="relative w-full h-full bg-[#001166]">
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
         <FloatingText 
             labelText={labelText} 
             hideLabel={isDragging || isDismissed} 
         />
      </div>

    </main>
  );
};

export default App;