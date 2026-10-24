import type { AuthUser, BusinessType, Role } from '@/types';
import { ApiError, isMock, mock, nextId, request, setToken } from './http';
import { db } from './db';

/**
 * Demo accounts backing the "Continue as …" buttons. Each links to a real
 * sample profile so dashboards are populated immediately.
 */
const DEMO_USERS: Record<Role, AuthUser> = {
  FARMER: {
    id: 'u_f1', name: 'Ramesh Pawar', email: 'ramesh@khet2kitchen.in',
    role: 'FARMER', profileId: 'f1', avatarKeyword: 'indian,farmer,portrait', isDemo: true,
  },
  RESTAURANT: {
    id: 'u_r1', name: 'Mahesh Kulkarni', email: 'mahesh@shreeganesh.in',
    role: 'RESTAURANT', profileId: 'r1', avatarKeyword: 'restaurant,owner,indian', isDemo: true,
  },
  ADMIN: {
    id: 'u_admin', name: 'Platform Admin', email: 'admin@khet2kitchen.in',
    role: 'ADMIN', avatarKeyword: 'professional,portrait', isDemo: true,
  },
};

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  /** Farmer-only */
  farmName?: string;
  /** Restaurant-only */
  restaurantName?: string;
  businessType?: BusinessType;
  district?: string;
}

/** Instant, no-password demo session. */
export async function demoLogin(role: Role): Promise<AuthUser> {
  return mock(() => {
    const user = DEMO_USERS[role];
    setToken(`demo.${role.toLowerCase()}.token`);
    return { ...user };
  }, 260);
}

export async function login(input: LoginInput): Promise<AuthUser> {
  if (!isMock) {
    const res = await request<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setToken(res.token);
    return res.user;
  }
  return mock(() => {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) throw new ApiError('Email and password are required.', 400);
    // Any known demo email logs into that role; otherwise default to a buyer.
    const known = Object.values(DEMO_USERS).find((u) => u.email === email);
    const user: AuthUser = known
      ? { ...known, isDemo: false }
      : {
          id: nextId('u'), name: email.split('@')[0].replace(/[^a-z]/gi, ' ') || 'Buyer',
          email, role: 'RESTAURANT', profileId: 'r1', isDemo: false,
        };
    setToken(`session.${user.id}.token`);
    return user;
  });
}

export async function signup(input: SignupInput): Promise<AuthUser> {
  if (!isMock) {
    const res = await request<{ token: string; user: AuthUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setToken(res.token);
    return res.user;
  }
  return mock(() => {
    if (!input.email || !input.password || !input.name) {
      throw new ApiError('Please fill in your name, email and password.', 400);
    }
    if (input.password.length < 6) {
      throw new ApiError('Password must be at least 6 characters.', 400);
    }
    const userId = nextId('u');
    let profileId: string | undefined;

    // Create the linked profile so the new user's dashboard has an identity.
    if (input.role === 'FARMER') {
      profileId = nextId('f');
      db.farmers.unshift({
        id: profileId, userId, farmName: input.farmName || `${input.name}'s Farm`, ownerName: input.name,
        description: 'New farm on Khet2Kitchen.', location: input.district || 'Pune',
        district: input.district || 'Pune', state: 'Maharashtra', pincode: '411001',
        verificationStatus: 'PENDING', rating: 0, totalOrders: 0, yearsSupplying: 0,
        avatarKeyword: 'indian,farmer,portrait', coverKeyword: 'farm,field', accent: '#2F7A34',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
    } else if (input.role === 'RESTAURANT') {
      profileId = nextId('r');
      db.restaurants.unshift({
        id: profileId, userId, restaurantName: input.restaurantName || input.name, ownerName: input.name,
        businessType: input.businessType || 'RESTAURANT', description: 'New business on Khet2Kitchen.',
        location: input.district || 'Pune', district: input.district || 'Pune', state: 'Maharashtra',
        pincode: '411001', verificationStatus: 'PENDING', rating: 0, totalOrders: 0,
        logoKeyword: 'restaurant,interior', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
    }

    const user: AuthUser = {
      id: userId, name: input.name, email: input.email.trim().toLowerCase(),
      role: input.role, profileId, isDemo: false,
    };
    setToken(`session.${userId}.token`);
    return user;
  }, 480);
}

export async function logout(): Promise<void> {
  setToken(null);
  if (!isMock) await request('/auth/logout', { method: 'POST' }).catch(() => undefined);
}
