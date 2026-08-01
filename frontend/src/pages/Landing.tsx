import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>
      <div className="stars-overlay-1"></div>
      <div className="stars-overlay-2"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-3xl tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
          NeoLearner<sup className="text-xs">®</sup>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-muted-foreground font-medium">
          <Link to="/" className="text-foreground transition-colors">Home</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
        </div>
        <Link to="/signup" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform font-medium">
          Begin Journey
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 min-h-screen">
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal animate-fade-rise"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Where <em className="not-italic text-muted-foreground">knowledge</em> rises <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We're designing tools for adult learners, bold thinkers, and quiet rebels. Amid the noise, we build digital spaces for sharp focus and inspired learning.
        </p>
        <Link to="/signup" className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer font-medium animate-fade-rise-delay-2">
          Begin Journey
        </Link>
      </main>
    </div>
  );
};

export default Landing;
