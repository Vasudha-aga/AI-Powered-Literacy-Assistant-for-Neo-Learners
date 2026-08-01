import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden font-sans pb-32">
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

      <Link to="/" className="absolute top-6 left-6 p-3 bg-surface/20 backdrop-blur-md border border-white/10 rounded-full text-textSecondary hover:text-white hover:bg-surface/40 transition-colors z-20 flex items-center justify-center">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Problem & Solution Section */}
      <section className="relative z-10 pt-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-20 animate-fade-rise-delay">
            <h2 className="text-4xl md:text-5xl mb-6 font-normal tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
              The Problem
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Millions of adults lack foundational literacy skills, yet most educational tools are designed for children. Adult learners (neo-learners) often feel alienated by childish interfaces and rigid, standardized testing methods that fail to account for their life experience and unique learning curves. 
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Additionally, language barriers and lack of personalized feedback make it incredibly difficult for neo-learners to accurately assess their current level and know where to start improving.
            </p>
          </div>

          <div className="animate-fade-rise-delay-2">
            <h2 className="text-4xl md:text-5xl mb-6 font-normal tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
              The Solution
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              NeoLearner® is an AI-powered literacy platform built specifically for adult learners. We replace rigid tests with an intelligent, conversational diagnostic assessment that evaluates Reading, Writing, and Speaking in real-time.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              By leveraging advanced Large Language Models (LLMs), we provide instant, nuanced feedback and dynamically generate a personalized curriculum tailored to each user's unique strengths and weaknesses. Available seamlessly in English, Hindi, and Marathi, NeoLearner® offers a dignified, highly effective pathway to full literacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
