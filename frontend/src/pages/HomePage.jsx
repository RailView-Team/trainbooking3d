import React from 'react'
import HeroBooking from '../components/HeroBooking'
import Features from '../components/Features'

export default function HomePage() {
  return (
    <>
      <HeroBooking />
      <div id="features-section">
        <Features />
      </div>
    </>
  )
}
