import { create } from 'zustand';

export const useComparisonStore = create((set, get) => ({
  selectedReports: [],

  addReport: (report) => {
    const { selectedReports } = get();
    // Check limit
    if (selectedReports.length >= 4) {
      return { success: false, message: "Maximum of 4 reports can be compared." };
    }
    // Check duplication
    if (selectedReports.some(r => r.id === report.id)) {
      return { success: false, message: "Report is already selected for comparison." };
    }
    set({ selectedReports: [...selectedReports, report] });
    return { success: true };
  },

  removeReport: (id) => {
    const { selectedReports } = get();
    set({ selectedReports: selectedReports.filter(r => r.id !== id) });
  },

  clearReports: () => {
    set({ selectedReports: [] });
  },

  hasReport: (id) => {
    const { selectedReports } = get();
    return selectedReports.some(r => r.id === id);
  }
}));
