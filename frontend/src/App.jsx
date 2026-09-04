import React, { useState } from 'react'
import HeroBooking from './components/HeroBooking'
import Navbar from './components/Navbar'
import TrainResults from './components/TrainResults'
import SeatSelectionFlow from './components/SeatSelectionFlow'
import PassengerDetails from './components/PassengerDetails'
import CheckoutReview from './components/CheckoutReview'
import MyBookings from './components/MyBookings'
import Features from './components/Features'
import Footer from './components/Footer'

function App() {
  const [currentView, setCurrentView] = useState('HOME');
  const [bookingStep, setBookingStep] = useState('SELECTION');
  const [checkoutData, setCheckoutData] = useState(null);
  const [passengerData, setPassengerData] = useState(null);

  return (
    <div className="bg-[#faf9f6] text-stone-900 min-h-screen flex flex-col">
      <Navbar onNavigate={setCurrentView} currentView={currentView} />
      <main className="flex-1">
        {currentView === 'BOOKINGS' && <MyBookings />}

        {currentView === 'HOME' && bookingStep === 'SELECTION' && (
          <>
            <HeroBooking />
            <TrainResults />
            <SeatSelectionFlow 
              onCheckout={(data) => {
                setCheckoutData(data);
                setBookingStep('PASSENGERS');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <Features />
          </>
        )}

        {currentView === 'HOME' && bookingStep === 'PASSENGERS' && checkoutData && (
          <PassengerDetails 
            seats={checkoutData.seats}
            coachId={checkoutData.coachId}
            classCode={checkoutData.classCode}
            fare={checkoutData.fare}
            onBack={() => {
              setBookingStep('SELECTION');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onContinue={(details) => {
              setPassengerData(details);
              setBookingStep('REVIEW');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'HOME' && bookingStep === 'REVIEW' && checkoutData && passengerData && (
          <CheckoutReview 
            bookingData={checkoutData}
            passengerData={passengerData}
            onBack={() => {
              setBookingStep('PASSENGERS');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onComplete={() => {
              // Usually redirects to home or tickets page
              setTimeout(() => {
                setCurrentView('BOOKINGS');
                setBookingStep('SELECTION');
                setCheckoutData(null);
                setPassengerData(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 3000);
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App