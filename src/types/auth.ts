export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  registeredAt: string;
  lastActiveAt: string;
}

export interface LicenseRecord {
  licenseKey: string;
  phone: string;
  maxDevices: number;
  devices: DeviceInfo[];
  createdAt: string;
}

export interface ActivationResult {
  success: boolean;
  message: string;
  deviceCount?: number;
  maxDevices?: number;
  licenseKey?: string;
  phone?: string;
}
