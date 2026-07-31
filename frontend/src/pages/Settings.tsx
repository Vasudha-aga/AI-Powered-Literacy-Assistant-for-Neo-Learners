import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Settings as SettingsIcon, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

export default function Settings() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isSaving, setIsSaving] = useState(false);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCurrentLanguage(newLang);
    i18n.changeLanguage(newLang);
    
    // Optionally update user profile on backend
    if (user) {
      setIsSaving(true);
      try {
        await api.put('/auth/profile', { preferred_language: newLang });
      } catch (err) {
        console.error("Failed to update language on backend", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe /> Language Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                Application Language
              </label>
              <select
                value={currentLanguage}
                onChange={handleLanguageChange}
                disabled={isSaving}
                className="w-full p-3 border border-borderCustom rounded-custom bg-background focus:ring-1 focus:ring-primary outline-none transition-shadow"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
              {isSaving && <p className="text-sm text-primary mt-2">Saving...</p>}
            </div>
            <p className="text-sm text-textSecondary">
              Changing this will immediately translate the entire application, including all quizzes and dashboards.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SettingsIcon /> Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-textSecondary">Additional account settings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
