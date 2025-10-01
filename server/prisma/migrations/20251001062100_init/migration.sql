-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "samsaraId" TEXT,
    "name" TEXT,
    "vin" TEXT,
    "plate" TEXT,
    "year" INTEGER,
    "make" TEXT,
    "model" TEXT,
    "lastOdometer" INTEGER,
    "lastEngineHours" INTEGER,
    "lastFuelPct" INTEGER,
    "lastSeenAt" DATETIME,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "VehicleMaintenanceRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" DATETIME,
    "dueMiles" INTEGER,
    "dueHours" INTEGER,
    "thresholdDays" INTEGER,
    "thresholdMiles" INTEGER,
    "thresholdHours" INTEGER,
    CONSTRAINT "VehicleMaintenanceRule_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleMaintenanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serviceDate" DATETIME NOT NULL,
    "atMiles" INTEGER,
    "atHours" INTEGER,
    "cost" INTEGER,
    "vendor" TEXT,
    "notes" TEXT,
    "driveFileId" TEXT,
    CONSTRAINT "VehicleMaintenanceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "samsaraId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "licenseClass" TEXT,
    "licenseExpiresOn" DATETIME,
    "medCardExpiresOn" DATETIME,
    "hireDate" DATETIME,
    "status" TEXT,
    "emergencyContact" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "DriverWriteup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "category" TEXT,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT,
    "driveFileId" TEXT,
    CONSTRAINT "DriverWriteup_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriverTimeOff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "DriverTimeOff_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "mimeType" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT,
    "driverId" TEXT,
    CONSTRAINT "Document_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_samsaraId_key" ON "Vehicle"("samsaraId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_samsaraId_key" ON "Driver"("samsaraId");
