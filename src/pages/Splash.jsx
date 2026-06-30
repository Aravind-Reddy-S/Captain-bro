import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import splashImg from "../assets/images/splash.png";
import { useAuth } from "../hooks/useAuth";

function Splash() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleNavigation = () => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
      navigate("/admin");
    } else if (currentUser && currentUser.role === 'rider') {
      navigate("/rider");
    } else {
      navigate("/home");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNavigation();
    }, 2500); // 2.5 seconds duration to align with loading animation
    return () => clearTimeout(timer);
  }, [navigate, currentUser]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#0d0103] select-none overflow-hidden relative cursor-pointer"
      onClick={handleNavigation}
    >
      {/* 
        Single image container. By setting the image height to 108% and shifting it up by top-[-4%],
        the status bar (9:41) and the home indicator line are cropped out of the viewport.
        Using object-cover ensures it covers 100% of the screen with no borders on mobile and tablet.
      */}
      <img
        src={splashImg}
        alt="Captain Bro Splash Screen"
        className="absolute w-full h-[108%] top-[-4%] left-0 object-cover z-10"
      />

      {/* Loading progress bar overlay at the bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-2/3 max-w-xs h-[3px] bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <div className="h-full bg-gradient-to-r from-red-600 to-rose-500 animate-[loading_3.7s_linear_forwards]"></div>
      </div>

      {/* Skip button overlay at top right */}
      <div className="absolute top-8 right-6 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigation();
          }}
          className="bg-black/35 hover:bg-black/55 text-white/95 text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
        >
          Skip
        </button>
      </div>

      {/* Styles for loading animation */}
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default Splash;