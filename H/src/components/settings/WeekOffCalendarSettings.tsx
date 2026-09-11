import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Info, 
  Sparkles, 
  Save, 
  RotateCcw,
  Briefcase,
  Coffee,
  PartyPopper
} from 'lucide-react';

interface CalendarDayDetail {
  dateStr: string;
  dayNum: number;
  dayName: string;
  isCustom: boolean;
  type: 'WEEK_OFF' | 'WORKING' | 'HOLIDAY';
  label: string;
  holiday: any;
}

export const WeekOffCalendarSettings: React.FC = () => {
  const { holidayPolicies, weeklySchedules, updateWeeklySchedule } = useHRMS();

  // Current view date (default to current year & month, e.g. Sept 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 1)); // September 2026

  // Policy configuration state
  const [primaryOffDays, setPrimaryOffDays] = useState<string[]>(['Sunday']);

  // Custom date overrides (e.g. { '2026-09-15': 'off' | 'working' })
  const [customOverrides, setCustomOverrides] = useState<Record<string, 'off' | 'working'>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(2026, 8, 10));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Helper to check day status
  const getDayDetails = (dayNum: number): CalendarDayDetail => {
    const dateObj = new Date(year, month, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    // Check holiday list
    const holiday = holidayPolicies.find(h => h.date === dateStr);

    // Check custom override
    if (customOverrides[dateStr]) {
      return {
        dateStr,
        dayNum,
        dayName,
        isCustom: true,
        type: customOverrides[dateStr] === 'off' ? 'WEEK_OFF' : 'WORKING',
        label: customOverrides[dateStr] === 'off' ? 'Special Week Off' : 'Working Day',
        holiday: null
      };
    }

    if (holiday) {
      return {
        dateStr,
        dayNum,
        dayName,
        isCustom: false,
        type: 'HOLIDAY',
        label: holiday.name,
        holiday
      };
    }

    // Check Primary Off Day (e.g. Sunday)
    if (primaryOffDays.includes(dayName)) {
      return {
        dateStr,
        dayNum,
        dayName,
        isCustom: false,
        type: 'WEEK_OFF',
        label: `${dayName} Off`,
        holiday: null
      };
    }

    return {
      dateStr,
      dayNum,
      dayName,
      isCustom: false,
      type: 'WORKING',
      label: 'Working Day',
      holiday: null
    };
  };

  // Build grid days
  const calendarDays: CalendarDayDetail[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(getDayDetails(i));
  }

  // Count metrics
  const totalDays = daysInMonth;
  const weekOffCount = calendarDays.filter(d => d.type === 'WEEK_OFF').length;
  const holidayCount = calendarDays.filter(d => d.type === 'HOLIDAY').length;
  const workingDaysCount = calendarDays.filter(d => d.type === 'WORKING').length;

  // Toggle date status on click
  const handleToggleDay = (day: CalendarDayDetail) => {
    setSelectedDateKey(day.dateStr);
    const newOverrides = { ...customOverrides };
    if (day.type === 'WEEK_OFF') {
      newOverrides[day.dateStr] = 'working';
      showToast(`${day.dateStr} marked as Working Day`);
    } else {
      newOverrides[day.dateStr] = 'off';
      showToast(`${day.dateStr} marked as Weekly Off`);
    }
    setCustomOverrides(newOverrides);
  };

  const handleResetOverrides = () => {
    setCustomOverrides({});
    showToast('Custom month overrides reset to default roster pattern');
  };

  const handleSaveRosterConfig = () => {
    showToast('Weekly Off calendar rules saved and active for attendance calculation!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#0E7490',
          color: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(14, 116, 144, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP CONTROL BAR: Month Selector & Schedule Presets */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: '10px',
            padding: '3px'
          }}>
            <button
              type="button"
              onClick={prevMonth}
              title="Previous Month"
              style={{
                border: 'none',
                background: 'transparent',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#0F172A',
              padding: '4px 12px',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              title="Next Month"
              style={{
                border: 'none',
                background: 'transparent',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#475569',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={goToToday}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* MONTH SUMMARY METRIC STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Days</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>{totalDays} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94A3B8' }}>Days</span></div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: '#ECFEFF',
            color: '#0E7490',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Coffee size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0E7490', textTransform: 'uppercase' }}>Weekly Offs</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0E7490' }}>{weekOffCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>Days</span></div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: '#F0FDF4',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>Working Days</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16A34A' }}>{workingDaysCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>Days</span></div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PartyPopper size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Declared Holidays</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#DC2626' }}>{holidayCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>Days</span></div>
          </div>
        </div>
      </div>

      {/* MONTHLY CALENDAR GRID */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
      }}>
        {/* Instructions & Reset Override */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B' }}>
            <Info size={15} color="#0E7490" />
            <span>Click any day to quickly toggle between <b>Weekly Off</b> and <b>Working Day</b>.</span>
          </div>

          {Object.keys(customOverrides).length > 0 && (
            <button
              type="button"
              onClick={handleResetOverrides}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: '#DC2626',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              Reset {Object.keys(customOverrides).length} Custom Override(s)
            </button>
          )}
        </div>

        {/* Days Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '10px'
        }}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                padding: '8px 4px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: idx === 0 ? '#0E7490' : idx === 6 ? '#475569' : '#64748B',
                backgroundColor: idx === 0 ? '#ECFEFF' : '#F8FAFC',
                borderRadius: '8px',
                letterSpacing: '0.04em'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px'
        }}>
          {/* Empty cells for preceding month days */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
            const prevDayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
            return (
              <div
                key={`empty-prev-${idx}`}
                style={{
                  minHeight: '76px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px dashed #E2E8F0',
                  padding: '8px',
                  opacity: 0.45
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8' }}>{prevDayNum}</div>
              </div>
            );
          })}

          {/* Current Month Days */}
          {calendarDays.map(day => {
            const isWeekOff = day.type === 'WEEK_OFF';
            const isHoliday = day.type === 'HOLIDAY';
            const isToday = day.dayNum === 10 && month === 8 && year === 2026;

            let bgColor = '#FFFFFF';
            let borderColor = '#E2E8F0';
            let pillBg = '#F1F5F9';
            let pillColor = '#475569';

            if (isWeekOff) {
              bgColor = '#F0FDFA';
              borderColor = '#A5F3FC';
              pillBg = '#ECFEFF';
              pillColor = '#0E7490';
            } else if (isHoliday) {
              bgColor = '#FFF5F5';
              borderColor = '#FECACA';
              pillBg = '#FEE2E2';
              pillColor = '#DC2626';
            }

            return (
              <div
                key={day.dateStr}
                onClick={() => handleToggleDay(day)}
                title={`Click to toggle: ${day.label}`}
                style={{
                  minHeight: '82px',
                  backgroundColor: bgColor,
                  borderRadius: '10px',
                  border: isToday ? '2px solid #0E7490' : `1px solid ${borderColor}`,
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  boxShadow: isToday ? '0 2px 6px rgba(14, 116, 144, 0.15)' : 'none'
                }}
              >
                {/* Day Number and Today Indicator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: isWeekOff ? '#0E7490' : isHoliday ? '#DC2626' : '#1E293B'
                  }}>
                    {day.dayNum}
                  </span>
                  {isToday && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      backgroundColor: '#0E7490',
                      color: '#FFFFFF',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      TODAY
                    </span>
                  )}
                  {day.isCustom && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      MODIFIED
                    </span>
                  )}
                </div>

                {/* Status Pill */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 750,
                    backgroundColor: pillBg,
                    color: pillColor,
                    padding: '3px 6px',
                    borderRadius: '5px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {day.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #F1F5F9',
          fontSize: '0.78rem',
          color: '#64748B',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ECFEFF', border: '1px solid #A5F3FC' }} />
            <span>Weekly Off (Sunday / Alt Sat)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
            <span>Regular Working Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }} />
            <span>Gazetted / Festival Holiday</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }} />
            <span>Custom Override</span>
          </div>
        </div>
      </div>

      {/* WEEKLY OFF POLICY CONFIGURATION CARD */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '22px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Standard Weekly Off & Work Week Roster Rule
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
              Define default off days and weekend policies applied across punch-in, biometric tracking, and payroll.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveRosterConfig}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0E7490',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(14, 116, 144, 0.2)'
            }}
          >
            <Save size={15} />
            Save Rules
          </button>
        </div>

        {/* Primary Weekly Off Days */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '16px'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
            Primary Weekly Off Day(s)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
              const isSelected = primaryOffDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (primaryOffDays.length > 1) {
                        setPrimaryOffDays(primaryOffDays.filter(d => d !== day));
                      }
                    } else {
                      setPrimaryOffDays([...primaryOffDays, day]);
                    }
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #0E7490' : '1px solid #CBD5E1',
                    backgroundColor: isSelected ? '#ECFEFF' : '#FFFFFF',
                    color: isSelected ? '#0E7490' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Sunday is the default mandatory weekly off across industrial and plant sites.
          </div>
        </div>
      </div>
    </div>
  );
};
