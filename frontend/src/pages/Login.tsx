import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, LogIn, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Create form data as expected by OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 expects 'username' instead of email
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;
      
      // Fetch the user details after login
      const userResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      login(token, userResponse.data);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(t('login.invalid'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 p-3 bg-surface/20 backdrop-blur-md border border-white/10 rounded-full text-textSecondary hover:text-white hover:bg-surface/40 transition-colors z-20 flex items-center justify-center">
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>
      <div className="card w-full max-w-md relative z-10 liquid-glass border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-textPrimary">{t('login.title')}</h1>
          <p className="text-textSecondary text-sm mt-2 text-center">
            {t('login.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-custom mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-end mb-4">
             <select 
               value={i18n.language}
               onChange={handleLanguageChange}
               className="text-sm bg-surface border-none text-primary cursor-pointer outline-none"
             >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">{t('login.email')}</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">{t('login.password')}</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-6"
          >
            {isLoading ? t('login.loggingIn') : (
              <>
                <LogIn className="w-4 h-4" />
                {t('login.submit')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          {t('login.noAccount')}{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            {t('login.signup')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
