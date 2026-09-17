import type { Agency } from "@/lib/types";

export const mockAgencies: Agency[] = [
  {
    id: "agency-daisy-travel",
    name: "Daisy Travel",
    contactName: "Kübra Miraç Aslan",
    firstName: "Kübra Miraç",
    lastName: "Aslan",
    email: "acente@mail.com",
    phone: "+90 532 000 00 00",
    status: "approved",
  },
  {
    id: "agency-global-explorer",
    name: "Global Explorer",
    contactName: "Ahmet Yılmaz",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet@globalexplorer.com",
    phone: "+90 532 111 11 11",
    status: "approved",
  },
  {
    id: "agency-skyline-travel",
    name: "Skyline Travel",
    contactName: "Elif Demir",
    firstName: "Elif",
    lastName: "Demir",
    email: "elif@skylinetravel.com",
    phone: "+90 532 222 22 22",
    status: "approved",
  },
  {
    id: "agency-ocean-breeze",
    name: "Ocean Breeze",
    contactName: "Mert Kaya",
    firstName: "Mert",
    lastName: "Kaya",
    email: "mert@oceanbreeze.com",
    phone: "+90 532 333 33 33",
    status: "pending",
  },
  {
    id: "agency-peak-tours",
    name: "Peak Tours",
    contactName: "Selin Aydın",
    firstName: "Selin",
    lastName: "Aydın",
    email: "selin@peaktours.com",
    phone: "+90 532 444 44 44",
    status: "rejected",
  },
  {
    id: "agency-heritage-journeys",
    name: "Heritage Journeys",
    contactName: "Burak Şahin",
    firstName: "Burak",
    lastName: "Şahin",
    email: "burak@heritagejourneys.com",
    phone: "+90 532 555 55 55",
    status: "approved",
  },
];

export function findMockAgencyById(id: string): Agency | undefined {
  return mockAgencies.find((agency) => agency.id === id);
}
