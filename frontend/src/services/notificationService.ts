import type { Notification, Role } from '@/types';
import { ApiError, isMock, mock, request } from './http';
import { db } from './db';

export async function listNotifications(role: Role): Promise<Notification[]> {
  if (!isMock) return request<Notification[]>(`/notifications?role=${role}`);
  return mock(
    () =>
      db.notifications
        .filter((n) => n.audienceRole === role)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    180,
  );
}

export async function unreadCount(role: Role): Promise<number> {
  if (!isMock) return request<number>(`/notifications/unread-count?role=${role}`);
  return mock(() => db.notifications.filter((n) => n.audienceRole === role && !n.read).length, 120);
}

export async function markRead(id: string): Promise<void> {
  if (!isMock) {
    await request(`/notifications/${id}/read`, { method: 'PATCH' });
    return;
  }
  await mock(() => {
    const n = db.notifications.find((x) => x.id === id);
    if (!n) throw new ApiError('Notification not found.', 404);
    n.read = true;
  }, 120);
}

export async function markAllRead(role: Role): Promise<void> {
  if (!isMock) {
    await request(`/notifications/read-all`, { method: 'PATCH', body: JSON.stringify({ role }) });
    return;
  }
  await mock(() => {
    db.notifications.forEach((n) => {
      if (n.audienceRole === role) n.read = true;
    });
  }, 160);
}
