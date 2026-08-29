export interface OfflineLessonRecord {
  lessonId: string;
  gradeId: string;
  subjectId: string;
  title: string;
  encryptedPayload: Blob;
  downloadedAt: string;
  checksum: string;
  deviceSignature: string;
}

export interface AuthStateRecord {
  id: string;
  licenseKey: string;
  phone: string;
  deviceFingerprint: string;
  devices: string[];
  activeSessionToken: string;
  activatedAt: string;
}
