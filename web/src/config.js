const defaultApi = "http://localhost:8080";
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "";

export const API_BASE = import.meta.env?.VITE_API_URL || (host === "localhost" ? defaultApi : "");

export const FALLBACK_VEHICLES = [
  {
    id: "AERO-417",
    name: "Freightliner Cascadia",
    plate: "8ABC417",
    status: "moving",
    odometer: 3218680,
    regDue: "2025-06-30",
    driverName: "Emma Flores",
    stats: {
      source: "sample",
      lastGpsFix: "2025-01-06T14:10:00Z",
      fuelLevel: 72,
      batteryVoltage: 12.6,
      speedMph: 58
    },
    maintenanceRules: [
      { id: "rule-1", type: "oil", dueDate: "2025-02-28", thresholdMiles: 500, thresholdDays: 7 },
      { id: "rule-2", type: "inspection", dueDate: "2025-03-15", thresholdDays: 14 }
    ]
  },
  {
    id: "AERO-221",
    name: "Ford Transit 250",
    plate: "9XYZ221",
    status: "idle",
    odometer: 1864130,
    regDue: "2025-04-12",
    driverName: "No driver",
    stats: {
      source: "sample",
      lastGpsFix: "2025-01-05T22:45:00Z",
      fuelLevel: 41,
      batteryVoltage: 12.3,
      speedMph: 0
    },
    maintenanceRules: [
      { id: "rule-3", type: "registration", dueDate: "2025-04-12", thresholdDays: 30 }
    ]
  },
  {
    id: "AERO-109",
    name: "Toyota Prius Hybrid",
    plate: "7JKL109",
    status: "off",
    odometer: 1432780,
    regDue: "2025-11-02",
    driverName: "Jerome Patel",
    stats: {
      source: "sample",
      lastGpsFix: "2025-01-04T09:12:00Z",
      fuelLevel: 88,
      batteryVoltage: 13.1,
      speedMph: 0
    },
    maintenanceRules: []
  }
];

export function getVehicleFallback(id) {
  return FALLBACK_VEHICLES.find(v => String(v.id) === String(id)) || null;
}
