import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { CLASSES } from '../coachData';
import { getAvailability } from '../service/api';

const getClassFeatures = (classCode) => {
  switch (classCode) {
    case 'EC':
      return ['AC', 'Extra legroom', 'Reclining seats', 'Charging'];
    case 'CC':
      return ['AC', 'Reserved seating', 'Charging', 'Comfortable seating'];
    case '1A':
      return ['AC', 'Private coupe/cabin', 'Bedding included', 'Attendant service'];
    case '2A':
      return ['AC', '2-Tier berth', 'Bedding included', 'Privacy curtains'];
    case '3A':
      return ['AC', '3-Tier sleeper', 'Bedding included', 'Charging points'];
    case 'SL':
      return ['Non-AC sleeper', 'Reserved berth', 'Open windows', 'Budget travel'];
    case '2S':
      return ['Reserved seat', 'Day travel', 'Window ventilation', 'Budget travel'];
    default:
      return ['Reserved seating', 'Comfortable travel', 'Clean coach', 'Window view'];
  }
};

export default function ClassSelectionPage() {
  const { trainId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const fromCode = searchParams.get('from');
  const toCode = searchParams.get('to');
  const date = searchParams.get('date');

  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || null);

  // Fetch availability data to get real classes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!trainId || !fromCode || !toCode || !date) {
        setLoading(false);
        setError('Missing journey details');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await getAvailability({
          trainId: parseInt(trainId),
          from: fromCode,
          to: toCode,
          date: date
        });
        setAvailabilityData(data);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setError('Unable to load class availability');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [trainId, fromCode, toCode, date]);

  // Extract available classes from availability data
  const getAvailableClasses = () => {
    if (!availabilityData || !availabilityData.coaches) return [];

    // Group coaches by classType and count available seats
    const classMap = {};
    availabilityData.coaches.forEach(coach => {
      if (!classMap[coach.classType]) {
        classMap[coach.classType] = {
          classType: coach.classType,
          totalSeats: 0,
          availableSeats: 0,
          coaches: []
        };
      }
      const availableInCoach = coach.seats.filter(s => s.available).length;
      classMap[coach.classType].totalSeats += coach.seats.length;
      classMap[coach.classType].availableSeats += availableInCoach;
      classMap[coach.classType].coaches.push(coach);
    });

    // Match with CLASSES and return
    return Object.values(classMap)
      .map(item => {
        const classInfo = CLASSES.find(c => c.code === item.classType);
        let name = classInfo ? classInfo.name : item.classType;
        let desc = classInfo ? classInfo.desc : `Travel in ${item.classType} class`;

        if (item.classType === 'EC') {
          name = 'Executive Class';
          desc = 'Premium AC chair seating with extra legroom';
        } else if (item.classType === 'CC') {
          name = 'AC Chair Car';
          desc = 'Air-conditioned chair seating for day travel';
        }

        return {
          code: item.classType,
          name,
          fare: item.coaches[0]?.fare ?? (classInfo ? classInfo.fare : 0),
          desc,
          capacity: item.totalSeats,
          available: item.availableSeats,
          features: getClassFeatures(item.classType)
        };
      })
      .sort((a, b) => {
        // Sort by class priority (1A, 2A, 3A, SL, EC, CC, 2S)
        const order = ['1A', '2A', '3A', 'SL', 'EC', 'CC', '2S'];
        return order.indexOf(a.code) - order.indexOf(b.code);
      });
  };

  const availableClasses = getAvailableClasses();

  const handleSelectClass = (classCode) => {
    searchParams.set('class', classCode);
    navigate(`/trains/${trainId}/coach?${searchParams.toString()}`);
  };

  const handleCardClick = (classCode) => {
    if (selectedClass === classCode) {
      handleSelectClass(classCode);
      return;
    }
    setSelectedClass(classCode);
    setTimeout(() => {
      handleSelectClass(classCode);
    }, 200);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-[#f8fafc]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Loading available classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-[#f8fafc]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <Link to="/" className="text-blue-600 font-semibold hover:underline">Return to Search</Link>
        </div>
      </div>
    );
  }

  if (availableClasses.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-[#f8fafc]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <Link
            to={-1}
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm mb-6 inline-flex group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Train Details
          </Link>
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-2">No seats available</h2>
            <p className="text-slate-500 mb-6">Unfortunately, there are no available seats for this journey.</p>
            <Link to="/" className="text-blue-600 font-bold hover:underline">Search another train</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-[75vh] bg-[#f8fafc]">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-5xl">
        <Link
          to={`/trains/${trainId}${location.search}`}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm mb-6 inline-flex group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Train Details
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-1.5">Select Class</h1>
          <p className="text-slate-500 font-medium text-sm">Train {trainId} • Choose your comfort level</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableClasses.map((cls) => {
            const isSoldOut = cls.available === 0;
            const isSelected = selectedClass === cls.code;

            return (
              <div
                key={cls.code}
                role="button"
                tabIndex={isSoldOut ? -1 : 0}
                aria-pressed={isSelected}
                aria-disabled={isSoldOut}
                onClick={() => !isSoldOut && handleCardClick(cls.code)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isSoldOut) {
                    e.preventDefault();
                    handleCardClick(cls.code);
                  }
                }}
                className={`p-6 sm:p-7 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between select-none ${
                  isSoldOut
                    ? 'opacity-55 border-slate-200 bg-white cursor-not-allowed'
                    : isSelected
                    ? 'border-blue-600 bg-[#f0f7ff] shadow-[0_8px_28px_rgba(37,99,235,0.12)] -translate-y-0.5'
                    : 'border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-300 hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
                }`}
              >
                <div>
                  {/* Top Row: Class Badge & Name (Left) + Price & per passenger (Right) */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : isSoldOut
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200/80'
                        }`}
                      >
                        {cls.code}
                      </span>
                      <h2 className="text-xl font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
                        {cls.name}
                        {isSelected && (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-xs"
                            title="Selected"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-[#0f172a] tracking-tight">
                        ₹{cls.fare.toLocaleString('en-IN')}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">per passenger</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    {cls.desc}
                  </p>

                  {/* Features List */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 px-3.5 mb-6 rounded-xl bg-slate-50/90 border border-slate-100 text-xs font-medium text-slate-700">
                    {cls.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 shrink-0">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Availability Status (Left) + CTA (Right) */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100/90">
                  <div
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                      isSoldOut
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    }`}
                  >
                    {!isSoldOut && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                    <span>{isSoldOut ? 'Sold out' : `${cls.available} seats available`}</span>
                  </div>

                  {!isSoldOut && (
                    <div
                      className={`text-sm font-bold flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'text-white bg-blue-600 px-3.5 py-1.5 rounded-xl shadow-xs'
                          : 'text-blue-600 group-hover:text-blue-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span>Selected</span>
                          <Check className="w-4 h-4 stroke-[3]" />
                        </>
                      ) : (
                        <>
                          <span>Select Class</span>
                          <span className="text-base leading-none transition-transform group-hover:translate-x-1">→</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
