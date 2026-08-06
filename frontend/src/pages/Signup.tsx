import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, UserPlus, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Signup = () => {
  const { t, i18n } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New fields
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setPreferredLanguage(newLang);
    localStorage.setItem('preferred_language', newLang);
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Register the user
      await api.post('/auth/register', {
        name,
        email,
        password,
        age: age === '' ? null : Number(age),
        gender: gender || null,
        education: education || null,
        occupation: occupation || null,
        preferred_language: preferredLanguage,
        district: district || null,
        state: state || null,
      });

      // 2. Automatically login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const token = loginRes.data.access_token;
      
      // Fetch user details
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      login(token, userResponse.data);

      // Redirect to assessment after signup
      navigate('/assessment');
    } catch (err: any) {
      console.error("Signup error:", err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else if (err.message) {
        setError(`Error: ${err.message}. Is the backend running?`);
      } else {
        setError('Failed to create account. Please try again.');
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
      <div className="card w-full max-w-md my-8 relative z-10 liquid-glass border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-textPrimary">{t('signup.title')}</h1>
          <p className="text-textSecondary text-sm mt-2 text-center">
            {t('signup.subtitle')}
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
               value={preferredLanguage}
               onChange={handleLanguageChange}
               className="text-sm bg-surface border-none text-primary cursor-pointer outline-none"
             >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.fullName')}</label>
            <input
              type="text"
              required
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.email')}</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.password')}</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.age')}</label>
              <input
                type="number"
                className="input-field"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.gender')}</label>
              <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value=""></option>
                <option value="Male">{t('signup.genderOptions.male')}</option>
                <option value="Female">{t('signup.genderOptions.female')}</option>
                <option value="Other">{t('signup.genderOptions.other')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.education')}</label>
              <select className="input-field" value={education} onChange={(e) => setEducation(e.target.value)}>
                <option value=""></option>
                <option value="None">{t('signup.educationOptions.none')}</option>
                <option value="Primary">{t('signup.educationOptions.primary')}</option>
                <option value="Secondary">{t('signup.educationOptions.secondary')}</option>
                <option value="Higher">{t('signup.educationOptions.higher')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.occupation')}</label>
              <input
                type="text"
                className="input-field"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.district')}</label>
              <input
                type="text"
                className="input-field"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">{t('signup.state')}</label>
              <input
                type="text"
                className="input-field"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-6"
          >
            {isLoading ? t('signup.creating') : (
              <>
                <UserPlus className="w-4 h-4" />
                {t('signup.submit')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          {t('signup.alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t('signup.login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
