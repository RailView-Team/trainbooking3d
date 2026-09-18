import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, Coffee, Wind, Moon, Sun, Armchair } from 'lucide-react';
import { CLASSES } from '../coachData';
import { getAvailability } from '../service/api';

const getAmenityIcon = (amenity) => {
  if (amenity.includes('AC') || amenity.includes('Fan')) return <Wind className="w-3.5 h-3.5" />;
  if (amenity.includes('Meals')) return <Coffee className="w-3.5 h-3.5" />;
  if (amenity.includes('Bedding') || amenity.includes('Curtains')) return <Moon className="w-3.5 h-3.5" />;
  if (amenity.includes('Legroom') || amenity.includes('Tray')) return <Armchair className="w-3.5 h-3.5" />;
  return <Info className="w-3.5 h-3.5" />;
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
        return {
          code: item.classType,
          name: classInfo ? classInfo.name : item.classType,
          fare: item.coaches[0]?.fare ?? (classInfo ? classInfo.fare : 0),
          desc: classInfo ? classInfo.desc : `Travel in ${item.classType} class`,
          capacity: item.totalSeats,
          available: item.availableSeats,
          amenities: classInfo ? classInfo.amenities || [] : []
        };
      })
      .sort((a, b) => {
        // Sort by class priority (1A, 2A, 3A, SL, EC, CC, 2S)
        const order = ['1A', '2A', '3A', 'SL', 'EC', 'CC', '2S'];
        return order.indexOf(a.code) - order.indexOf(b.code);
      });
  };

  const availableClasses = getAvailableClasses();

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-stone-50">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl text-center">
          <p className="text-stone-600 font-medium">Loading available classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-stone-50">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl text-center">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <Link to="/" className="text-rose-700 hover:underline">Return to Search</Link>
        </div>
      </div>
    );
  }

  const handleSelectClass = (classCode) => {
    searchParams.set('class', classCode);
    navigate(`/trains/${trainId}/coach?${searchParams.toString()}`);
  };

  if (availableClasses.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] bg-stone-50">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <Link
            to={-1}
            onClick={(e) => { e.preventDefault(); window.history.back(); }}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Train Details
          </Link>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-stone-900 mb-3">No seats available</h2>
            <p className="text-stone-500 mb-8">Unfortunately, there are no available seats for this journey.</p>
            <Link to="/" className="text-rose-700 font-bold hover:underline">Search another train</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-[70vh] bg-stone-50">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <Link
          to={`/trains/${trainId}${location.search}`}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-bold text-sm mb-6 inline-flex"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Train Details
        </Link>

        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-stone-900 mb-2">Select Class</h2>
          <p className="text-stone-500 font-medium">Train: {trainId} • Choose your comfort level</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableClasses.map((cls) => {
            const isSoldOut = cls.available === 0;

            return (
              <div
                key={cls.code}
                onClick={() => !isSoldOut && handleSelectClass(cls.code)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]
                  ${isSoldOut ? 'opacity-60 border-stone-200' : 'border-stone-200/60 hover:border-rose-700/50 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1'}`}
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black px-3 py-1.5 rounded-lg ${isSoldOut ? 'bg-stone-100 text-stone-400' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {cls.code}
                    </span>
                    <h4 className="font-bold text-xl text-stone-900">{cls.name}</h4>
                  </div>
                  <div className="font-black text-2xl text-stone-900">
                    ${cls.fare}
                  </div>
                </div>

                <p className="text-sm text-stone-500 mb-6 max-w-sm relative z-10">{cls.desc}</p>

                <div className="flex flex-wrap gap-2 mb-6 border-t border-stone-100 pt-4">
                  {(cls.amenities || ['Seats']).map(am => (
                    <div key={am} className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100">
                      <div className="text-rose-700">{getAmenityIcon(am)}</div>
                      <span className="text-xs font-semibold text-stone-600">{am}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${isSoldOut ? 'bg-stone-100 text-stone-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {isSoldOut ? 'Sold Out' : `${cls.available}/${cls.capacity} Seats`}
                  </div>

                  {!isSoldOut && (
                    <div className="text-sm font-bold flex items-center gap-1 transition-colors text-rose-700 group-hover:text-rose-800">
                      Select Class <ChevronRight className="w-4 h-4" />
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
