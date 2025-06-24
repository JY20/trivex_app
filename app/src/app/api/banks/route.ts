import { NextResponse } from 'next/server';

export const dynamic = "force-static";
export const revalidate = false;

// List of major Canadian banks
const canadianBanks = [
  { id: 'rbc', name: 'Royal Bank of Canada (RBC)', code: 'RBC', logo: '🏦' },
  { id: 'td', name: 'Toronto-Dominion Bank (TD)', code: 'TD', logo: '🏦' },
  { id: 'scotiabank', name: 'Bank of Nova Scotia (Scotiabank)', code: 'BNS', logo: '🏦' },
  { id: 'bmo', name: 'Bank of Montreal (BMO)', code: 'BMO', logo: '🏦' },
  { id: 'cibc', name: 'Canadian Imperial Bank of Commerce (CIBC)', code: 'CIBC', logo: '🏦' },
  { id: 'national', name: 'National Bank of Canada', code: 'NBC', logo: '🏦' },
  { id: 'hsbc', name: 'HSBC Bank Canada', code: 'HSBC', logo: '🏦' },
  { id: 'desjardins', name: 'Desjardins Group', code: 'DESJ', logo: '🏦' },
  { id: 'laurentian', name: 'Laurentian Bank of Canada', code: 'LB', logo: '🏦' },
  { id: 'canadian-western', name: 'Canadian Western Bank', code: 'CWB', logo: '🏦' },
  { id: 'atb', name: 'ATB Financial', code: 'ATB', logo: '🏦' },
  { id: 'coast-capital', name: 'Coast Capital Savings', code: 'CCS', logo: '🏦' },
  { id: 'vancity', name: 'Vancity Credit Union', code: 'VANCITY', logo: '🏦' },
  { id: 'servus', name: 'Servus Credit Union', code: 'SERVUS', logo: '🏦' },
  { id: 'affinity', name: 'Affinity Credit Union', code: 'AFFINITY', logo: '🏦' },
  { id: 'alterna', name: 'Alterna Savings and Credit Union', code: 'ALTERNA', logo: '🏦' },
  { id: 'assiniboine', name: 'Assiniboine Credit Union', code: 'ASSINIBOINE', logo: '🏦' },
  { id: 'cambrian', name: 'Cambrian Credit Union', code: 'CAMBRIAN', logo: '🏦' },
  { id: 'coast-capital', name: 'Coast Capital Savings', code: 'COAST', logo: '🏦' },
  { id: 'connect-first', name: 'Connect First Credit Union', code: 'CONNECT', logo: '🏦' },
  { id: 'first-west', name: 'First West Credit Union', code: 'FIRSTWEST', logo: '🏦' },
  { id: 'innovation', name: 'Innovation Credit Union', code: 'INNOVATION', logo: '🏦' },
  { id: 'libro', name: 'Libro Credit Union', code: 'LIBRO', logo: '🏦' },
  { id: 'northern', name: 'Northern Credit Union', code: 'NORTHERN', logo: '🏦' },
  { id: 'peoples', name: 'Peoples Group', code: 'PEOPLES', logo: '🏦' },
  { id: 'prospera', name: 'Prospera Credit Union', code: 'PROSPERA', logo: '🏦' },
  { id: 'saskcentral', name: 'SaskCentral Credit Union', code: 'SASKCENTRAL', logo: '🏦' },
  { id: 'steinbach', name: 'Steinbach Credit Union', code: 'STEINBACH', logo: '🏦' },
  { id: 'sunshine', name: 'Sunshine Coast Credit Union', code: 'SUNSHINE', logo: '🏦' },
  { id: 'synergy', name: 'Synergy Credit Union', code: 'SYNERGY', logo: '🏦' },
  { id: 'tandia', name: 'Tandia Financial Credit Union', code: 'TANDIA', logo: '🏦' },
  { id: 'vancity', name: 'Vancity Credit Union', code: 'VANCITY', logo: '🏦' },
  { id: 'westoba', name: 'Westoba Credit Union', code: 'WESTOBA', logo: '🏦' },
  { id: 'windsor', name: 'Windsor Family Credit Union', code: 'WINDSOR', logo: '🏦' },
  { id: 'yukon', name: 'Yukon Credit Union', code: 'YUKON', logo: '🏦' }
];

export async function GET() {
  // For static export, we'll just return all banks
  // Client-side filtering will need to be implemented
  return NextResponse.json({
    banks: canadianBanks.slice(0, 10),
    total: canadianBanks.length,
    query: ''
  });
} 