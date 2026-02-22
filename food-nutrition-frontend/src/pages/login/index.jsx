import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import WelcomeHeader from './components/WelcomeHeader';
import LoginForm from './components/LoginForm';

const GlitterCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#4ade80' : '#6ee7b7',
    }));

    let animId;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      dots.forEach((dot) => {
        const alpha =
          0.3 + 0.7 * Math.abs(Math.sin(t * dot.speed * 60 + dot.phase));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = dot.color;
        ctx.shadowColor = dot.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

const NAVBAR_HEIGHT = 60;

const Login = () => {
  const [lampOn, setLampOn] = useState(false);

  return (
    <>
      <Helmet>
        <title>Sign In - FoodNutritionAI</title>
      </Helmet>

      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d1f2d 40%, #0a1a1a 100%)',
        }}
      >
        <GlitterCanvas />

        {/* LIGHT GLOW */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            width: '320px',
            height: '320px',
            background: lampOn
              ? 'radial-gradient(circle, rgba(74,222,128,0.25), transparent 70%)'
              : 'transparent',
            filter: 'blur(40px)',
            transition: '0.6s',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />

     {/* HANGING LAMP */}
{!lampOn && (
  <motion.div
    drag="y"
    dragConstraints={{ top: 0, bottom: 160 }}
    onDragEnd={(e, info) => {
      if (info.point.y > 200) setLampOn(true);
    }}
    style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'grab',
    }}
  >
    {/* Rope */}
    <div
      style={{
        width: '4px',
        height: '140px',
        background: 'linear-gradient(to bottom,#94a3b8,#64748b)',
      }}
    />

    {/* Lamp holder */}
    <div
      style={{
        width: '26px',
        height: '18px',
        background: '#334155',
        borderRadius: '6px 6px 0 0',
      }}
    />

    {/* Lamp head */}
    <div
      style={{
        width: '90px',
        height: '55px',
        background: 'linear-gradient(#22c55e,#166534)',
        borderRadius: '50px 50px 18px 18px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
        position: 'relative',
      }}
    />

    {/* LIGHT CONE */}
    <div
      style={{
        width: '260px',
        height: '260px',
        marginTop: '-20px',
        background:
          'radial-gradient(circle at top, rgba(74,222,128,0.35), transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }}
    />
  </motion.div>
)}

        {/* NAVBAR */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            height: `${NAVBAR_HEIGHT}px`,
            background: '#0d1f2d',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: 'white', fontWeight: 700 }}>
            FoodNutritionAI
          </span>
        </div>

        {/* LOGIN CARD */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: `${NAVBAR_HEIGHT + 16}px`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={
              lampOn
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 60, scale: 0.9 }
            }
            transition={{ duration: 0.8 }}
            style={{ width: '100%', maxWidth: '520px' }}
          >
            <div
              style={{
                backdropFilter: 'blur(24px)',
                borderRadius: '3rem',
                padding: 'clamp(32px, 5vw, 56px)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <WelcomeHeader />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={lampOn ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <LoginForm />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;