-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'client',
    "phone" TEXT,
    "avatarUrl" TEXT
);

-- CreateTable
CREATE TABLE "Barbershop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "latitude" REAL,
    "longitude" REAL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barbershopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "basePrice" REAL NOT NULL,
    "description" TEXT,
    CONSTRAINT "Service_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BarberMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberUserId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "allowedShift" TEXT,
    CONSTRAINT "BarberMembership_barberUserId_fkey" FOREIGN KEY ("barberUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BarberMembership_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BarberAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberUserId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    CONSTRAINT "BarberAvailability_barberUserId_fkey" FOREIGN KEY ("barberUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BarberAvailability_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barbershopId" TEXT NOT NULL,
    "barberUserId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "priceSnapshot" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Appointment_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_barberUserId_fkey" FOREIGN KEY ("barberUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Barbershop_slug_key" ON "Barbershop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BarberMembership_barberUserId_barbershopId_key" ON "BarberMembership"("barberUserId", "barbershopId");
