import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import TrainDetailsPage from './pages/TrainDetailsPage'
import ClassSelectionPage from './pages/ClassSelectionPage'
import CoachSelectionPage from './pages/CoachSelectionPage'
import SeatSelectionPage from './pages/SeatSelectionPage'
import PassengerDetailsPage from './pages/PassengerDetailsPage'
import ReviewBookingPage from './pages/ReviewBookingPage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import BookingsPage from './pages/BookingsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/trains" element={<SearchResultsPage />} />
        <Route path="/trains/:trainId" element={<TrainDetailsPage />} />
        <Route path="/trains/:trainId/class" element={<ClassSelectionPage />} />
        <Route path="/trains/:trainId/coach" element={<CoachSelectionPage />} />
        <Route path="/trains/:trainId/seats" element={<SeatSelectionPage />} />
        <Route path="/booking/passengers" element={<PassengerDetailsPage />} />
        <Route path="/booking/review" element={<ReviewBookingPage />} />
        <Route path="/booking/payment" element={<PaymentPage />} />
        <Route path="/booking/confirmation" element={<ConfirmationPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
      </Route>
    </Routes>
  )
}

export default App