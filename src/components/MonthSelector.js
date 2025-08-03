import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MonthSelector = ({ className = '', showCurrentMonthButton = true }) => {
  const {
    selectedMonth,
    currentMonth,
    changeMonth,
    goToCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    isCurrentMonth,
    getSelectedMonthName,
    getCurrentMonthName
  } = useAuth();

  const handleMonthChange = (e) => {
    const [month, year] = e.target.value.split('-');
    changeMonth(parseInt(month), parseInt(year));
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Previous Month Button */}
      <button
        onClick={goToPreviousMonth}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
        title="Previous Month"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Month/Year Selector */}
      <div className="flex items-center space-x-2">
        <Calendar size={16} className="text-gray-400" />
        <select
          value={`${selectedMonth.month}-${selectedMonth.year}`}
          onChange={handleMonthChange}
          className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
        >
          {/* Generate options for the last 12 months */}
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            });
            return (
              <option key={`${month}-${year}`} value={`${month}-${year}`}>
                {monthName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Next Month Button */}
      <button
        onClick={goToNextMonth}
        disabled={isCurrentMonth}
        className={`p-2 rounded-md transition-colors duration-200 ${
          isCurrentMonth 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
        title={isCurrentMonth ? "Already at current month" : "Next Month"}
      >
        <ChevronRight size={16} />
      </button>

      {/* Current Month Button */}
      {showCurrentMonthButton && !isCurrentMonth && (
        <button
          onClick={goToCurrentMonth}
          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
          title="Go to current month"
        >
          Current
        </button>
      )}

      {/* Current Month Indicator */}
      {isCurrentMonth && (
        <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md">
          Current
        </span>
      )}
    </div>
  );
};

export default MonthSelector; 