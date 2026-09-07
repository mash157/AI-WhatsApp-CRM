import create from 'zustand';

const useThemeStore = create((set) => ({
  isDarkMode: typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark',
  
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      
      // Apply theme to document
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { isDarkMode: newDarkMode };
    });
  },
  
  setDarkMode: (isDark) => {
    set(() => {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      // Apply theme to document
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { isDarkMode: isDark };
    });
  }
}));

export default useThemeStore;
