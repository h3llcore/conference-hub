import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "ua" | "eng";

type LanguageContextValue = {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return saved === "eng" ? "eng" : "ua";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
  }, [language]);

  function toggleLanguage() {
    setLanguageState((prev) => (prev === "ua" ? "eng" : "ua"));
  }

  function setLanguage(language: Language) {
    setLanguageState(language);
  }

  const value = useMemo(
    () => ({
      language,
      toggleLanguage,
      setLanguage,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}