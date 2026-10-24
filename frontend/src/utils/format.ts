import type { Unit } from '@/types';

/** ₹ with Indian digit grouping (e.g. ₹1,24,500). */
export function formatINR(value: number, opts: { decimals?: boolean } = {}): string {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: opts.decimals ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(n);
}

/** Compact money for dashboard tiles: ₹1.2L, ₹24.5K, ₹8.4Cr. */
export function formatINRCompact(value: number): string {
  const n = Math.abs(value);
  if (n >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

const UNIT_LABEL: Record<Unit, string> = {
  KG: 'kg',
  QUINTAL: 'quintal',
  TON: 'ton',
  DOZEN: 'dozen',
  BOX: 'box',
  CRATE: 'crate',
  PIECE: 'piece',
  LITRE: 'litre',
};

export function unitLabel(unit: Unit): string {
  return UNIT_LABEL[unit] ?? unit.toLowerCase();
}

/** "₹25/kg" */
export function pricePerUnit(price: number, unit: Unit): string {
  return `${formatINR(price)}/${unitLabel(unit)}`;
}

/** Human date like "12 Sep 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Short date+time like "12 Sep, 4:30 PM". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** "just now", "3h ago", "2d ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '';
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/** Greeting by local time of day. */
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** ISO string N days from now (negative for the past). */
export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
