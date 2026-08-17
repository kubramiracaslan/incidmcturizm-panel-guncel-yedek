import type { Agency } from "@/lib/types";

export const mockAgencies: Agency[] = [
  {
    id: "agency-daisy-travel",
    name: "Daisy Travel",
    contactName: "Kübra Miraç Aslan",
    email: "acente@mail.com",
    phone: "+90 532 000 00 00",
    status: "active",
  },
  {
    id: "agency-global-explorer",
    name: "Global Explorer",
    contactName: "Ahmet Yılmaz",
    email: "ahmet@globalexplorer.com",
    phone: "+90 532 111 11 11",
    status: "active",
  },
  {
    id: "agency-skyline-travel",
    name: "Skyline Travel",
    contactName: "Elif Demir",
    email: "elif@skylinetravel.com",
    phone: "+90 532 222 22 22",
    status: "active",
  },
  {
    id: "agency-ocean-breeze",
    name: "Ocean Breeze",
    contactName: "Mert Kaya",
    email: "mert@oceanbreeze.com",
    phone: "+90 532 333 33 33",
    status: "active",
  },
  {
    id: "agency-peak-tours",
    name: "Peak Tours",
    contactName: "Selin Aydın",
    email: "selin@peaktours.com",
    phone: "+90 532 444 44 44",
    status: "passive",
  },
  {
    id: "agency-heritage-journeys",
    name: "Heritage Journeys",
    contactName: "Burak Şahin",
    email: "burak@heritagejourneys.com",
    phone: "+90 532 555 55 55",
    status: "active",
  },
];

export function findMockAgencyById(id: string): Agency | undefined {
  return mockAgencies.find((agency) => agency.id === id);
}
