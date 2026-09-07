-- Railway Reservation Backend: Initial schema
-- This mirrors prisma/schema.prisma exactly. Applied manually via prisma/migrate.js
-- because this sandbox cannot reach binaries.prisma.sh to download the Prisma engine.

CREATE TYPE "TrainStatus" AS ENUM ('NOT_STARTED', 'RUNNING', 'ARRIVED', 'COMPLETED');
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Station" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Train" (
    "id" SERIAL PRIMARY KEY,
    "trainNumber" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "status" "TrainStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStationId" INTEGER REFERENCES "Station"("id"),
    "currentStationSequence" INTEGER,
    "nextStationId" INTEGER REFERENCES "Station"("id"),
    "lastLocationUpdate" TIMESTAMP(3)
);

CREATE TABLE "TrainStation" (
    "id" SERIAL PRIMARY KEY,
    "trainId" INTEGER NOT NULL REFERENCES "Train"("id"),
    "stationId" INTEGER NOT NULL REFERENCES "Station"("id"),
    "sequence" INTEGER NOT NULL,
    "arrivalTime" TEXT,
    "departureTime" TEXT,
    UNIQUE ("trainId", "sequence"),
    UNIQUE ("trainId", "stationId")
);

CREATE TABLE "Coach" (
    "id" SERIAL PRIMARY KEY,
    "trainId" INTEGER NOT NULL REFERENCES "Train"("id"),
    "coachNumber" TEXT NOT NULL,
    "classType" TEXT NOT NULL,
    UNIQUE ("trainId", "coachNumber")
);

CREATE TABLE "Seat" (
    "id" SERIAL PRIMARY KEY,
    "coachId" INTEGER NOT NULL REFERENCES "Coach"("id"),
    "seatNumber" TEXT NOT NULL,
    "seatType" TEXT NOT NULL DEFAULT 'SLEEPER',
    UNIQUE ("coachId", "seatNumber")
);

CREATE TABLE "Booking" (
    "id" SERIAL PRIMARY KEY,
    "pnr" TEXT NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL REFERENCES "User"("id"),
    "trainId" INTEGER NOT NULL REFERENCES "Train"("id"),
    "journeyDate" TIMESTAMP(3) NOT NULL,
    "boardingStationId" INTEGER NOT NULL REFERENCES "Station"("id"),
    "destinationStationId" INTEGER NOT NULL REFERENCES "Station"("id"),
    "boardingSequence" INTEGER NOT NULL,
    "destinationSequence" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BookingSeat" (
    "id" SERIAL PRIMARY KEY,
    "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id"),
    "seatId" INTEGER NOT NULL REFERENCES "Seat"("id"),
    UNIQUE ("bookingId", "seatId")
);

CREATE TABLE "Passenger" (
    "id" SERIAL PRIMARY KEY,
    "bookingId" INTEGER NOT NULL REFERENCES "Booking"("id"),
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL
);

-- Helpful indexes for the availability-overlap query and lookups
CREATE INDEX "idx_booking_train_date_status" ON "Booking" ("trainId", "journeyDate", "status");
CREATE INDEX "idx_bookingseat_seat" ON "BookingSeat" ("seatId");
CREATE INDEX "idx_trainstation_train_seq" ON "TrainStation" ("trainId", "sequence");
