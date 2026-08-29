import Dexie, { Table } from 'dexie';
import { OfflineLessonRecord, AuthStateRecord } from '@/types/offline';

export class EduOfflineDB extends Dexie {
  downloaded_lessons!: Table<OfflineLessonRecord, string>;
  auth_state!: Table<AuthStateRecord, string>;

  constructor() {
    super('EduOfflineDB_v1');
    this.version(1).stores({
      downloaded_lessons: 'lessonId, gradeId, subjectId, downloadedAt',
      auth_state: 'id, licenseKey'
    });
  }
}

export const db = new EduOfflineDB();
