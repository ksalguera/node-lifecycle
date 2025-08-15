import { Schedule } from '../../src/types.js';

// Small, realistic merged schedule for tests
export const schedule: Schedule = {
  "20": {
    start: "2023-04-18",
    lts: "2023-10-24",
    maintenance: "2024-10-22",
    end: "2026-04-30"
  },
  "22": {
    start: "2024-04-23",
    lts: "2024-10-22",
    maintenance: "2025-10-21",
    end: "2027-04-30"
  },
  "23": {
    start: "2024-10-16",
    end: "2025-06-01"
  },
  "24": {
    start: "2025-04-23",
    end: "2026-04-30"
  }
};