import { 
  users, subjects, studySessions, dailyStats, achievements, userAchievements, notifications, studyGroups, groupMembers,
  User, InsertUser, Subject, InsertSubject, StudySession, InsertStudySession, 
  DailyStats, InsertDailyStats, Achievement, UserAchievement, InsertUserAchievement, 
  Notification, InsertNotification, StudyGroup, InsertStudyGroup, GroupMember, InsertGroupMember,
  ACHIEVEMENT_LEVELS
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStudyTime(userId: number, additionalTime: number): Promise<User>;
  updateUserLevel(userId: number, level: string): Promise<User>;
  updateUserDailyGoal(userId: number, dailyGoal: number): Promise<User>;
  
  // Subject operations
  createSubject(subject: InsertSubject): Promise<Subject>;
  getSubjectsByUserId(userId: number): Promise<Subject[]>;
  updateSubjectTime(subjectId: number, additionalTime: number): Promise<Subject>;
  updateSubjectDailyTarget(subjectId: number, dailyTargetTime: number): Promise<Subject>;
  
  // Study session operations
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getActiveSessionsByUserId(userId: number): Promise<StudySession[]>;
  endStudySession(sessionId: number, duration: number): Promise<StudySession>;
  updateBreakTag(sessionId: number, breakTag: string): Promise<StudySession>;
  
  // Daily stats operations
  createOrUpdateDailyStats(userId: number, date: string, type: string, duration: number, subjectId?: number): Promise<DailyStats>;
  getDailyStatsByDateRange(userId: number, startDate: string, endDate: string): Promise<DailyStats[]>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  addUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: number, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<Notification>;
  
  // Study group operations
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  addMemberToGroup(member: InsertGroupMember): Promise<GroupMember>;
  getStudyGroupsByUserId(userId: number): Promise<StudyGroup[]>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  getLeaderboard(timeframe: string): Promise<User[]>;
  
  // Session store for authentication
  sessionStore: any; // Using 'any' type to avoid the SessionStore type error
}

export class MemStorage implements IStorage {
  // DB Collections
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private studySessions: Map<number, StudySession>;
  private dailyStats: Map<number, DailyStats>;
  private achievementsList: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private notificationsList: Map<number, Notification>;
  private studyGroups: Map<number, StudyGroup>;
  private groupMembers: Map<number, GroupMember>;
  
  // Auto-incrementing IDs
  private currentUserId: number;
  private currentSubjectId: number;
  private currentSessionId: number;
  private currentDailyStatsId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;
  private currentNotificationId: number;
  private currentGroupId: number;
  private currentGroupMemberId: number;
  
  // Session store
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.studySessions = new Map();
    this.dailyStats = new Map();
    this.achievementsList = new Map();
    this.userAchievements = new Map();
    this.notificationsList = new Map();
    this.studyGroups = new Map();
    this.groupMembers = new Map();
    
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentSessionId = 1;
    this.currentDailyStatsId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    this.currentNotificationId = 1;
    this.currentGroupId = 1;
    this.currentGroupMemberId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize predefined achievements
    this.initializeAchievements();
  }

  private initializeAchievements() {
    const achievementList = [
      { id: this.currentAchievementId++, name: ACHIEVEMENT_LEVELS.STUDENT.name, description: "Studied for 1 hour", icon: ACHIEVEMENT_LEVELS.STUDENT.icon, requiredTime: ACHIEVEMENT_LEVELS.STUDENT.requiredTime, level: 1 },
      { id: this.currentAchievementId++, name: ACHIEVEMENT_LEVELS.SPECS_NERD.name, description: "Studied for 3 hours", icon: ACHIEVEMENT_LEVELS.SPECS_NERD.icon, requiredTime: ACHIEVEMENT_LEVELS.SPECS_NERD.requiredTime, level: 2 },
      { id: this.currentAchievementId++, name: ACHIEVEMENT_LEVELS.HARDCORE_STUDENT.name, description: "Studied for 6 hours", icon: ACHIEVEMENT_LEVELS.HARDCORE_STUDENT.icon, requiredTime: ACHIEVEMENT_LEVELS.HARDCORE_STUDENT.requiredTime, level: 3 },
      { id: this.currentAchievementId++, name: ACHIEVEMENT_LEVELS.WORKAHOLIC.name, description: "Studied for 8 hours", icon: ACHIEVEMENT_LEVELS.WORKAHOLIC.icon, requiredTime: ACHIEVEMENT_LEVELS.WORKAHOLIC.requiredTime, level: 4 },
      { id: this.currentAchievementId++, name: ACHIEVEMENT_LEVELS.KING.name, description: "Studied for 10 hours", icon: ACHIEVEMENT_LEVELS.KING.icon, requiredTime: ACHIEVEMENT_LEVELS.KING.requiredTime, level: 5 },
      { id: this.currentAchievementId++, name: ACHIEVEMENT_LEVELS.GOD_LEVEL.name, description: "Studied for 12 hours", icon: ACHIEVEMENT_LEVELS.GOD_LEVEL.icon, requiredTime: ACHIEVEMENT_LEVELS.GOD_LEVEL.requiredTime, level: 6 },
    ];
    
    for (const achievement of achievementList) {
      this.achievementsList.set(achievement.id, achievement);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      totalStudyTime: 0,
      level: ACHIEVEMENT_LEVELS.STUDENT.name,
      dailyGoal: insertUser.dailyGoal || 8 * 3600, // Default 8 hours if not provided
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStudyTime(userId: number, additionalTime: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      totalStudyTime: user.totalStudyTime + additionalTime
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserLevel(userId: number, level: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      level
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserDailyGoal(userId: number, dailyGoal: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      dailyGoal
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Subject operations
  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const newSubject: Subject = {
      ...subject,
      id,
      targetTime: subject.targetTime || 0,
      dailyTargetTime: subject.dailyTargetTime || 0,
      totalTime: 0,
      createdAt: new Date()
    };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  async getSubjectsByUserId(userId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.userId === userId
    );
  }

  async updateSubjectTime(subjectId: number, additionalTime: number): Promise<Subject> {
    const subject = this.subjects.get(subjectId);
    if (!subject) throw new Error("Subject not found");
    
    const updatedSubject = {
      ...subject,
      totalTime: subject.totalTime + additionalTime
    };
    
    this.subjects.set(subjectId, updatedSubject);
    return updatedSubject;
  }
  
  async updateSubjectDailyTarget(subjectId: number, dailyTargetTime: number): Promise<Subject> {
    const subject = this.subjects.get(subjectId);
    if (!subject) throw new Error("Subject not found");
    
    const updatedSubject = {
      ...subject,
      dailyTargetTime
    };
    
    this.subjects.set(subjectId, updatedSubject);
    return updatedSubject;
  }

  // Study session operations
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.currentSessionId++;
    const newSession: StudySession = {
      ...session,
      id,
      startTime: new Date(),
      endTime: null,
      duration: null,
      breakTag: session.type === 'break' ? 'rest' : null, // Default break tag
      isActive: true,
      lastSyncTime: new Date()
    };
    this.studySessions.set(id, newSession);
    return newSession;
  }

  async getActiveSessionsByUserId(userId: number): Promise<StudySession[]> {
    return Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId && session.isActive
    );
  }

  async endStudySession(sessionId: number, duration: number): Promise<StudySession> {
    const session = this.studySessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    
    const endTime = new Date();
    const updatedSession = {
      ...session,
      endTime,
      duration,
      isActive: false,
      lastSyncTime: new Date()
    };
    
    this.studySessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  
  async updateBreakTag(sessionId: number, breakTag: string): Promise<StudySession> {
    const session = this.studySessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.type !== 'break') throw new Error("Can only tag break sessions");
    
    const updatedSession = {
      ...session,
      breakTag,
      lastSyncTime: new Date()
    };
    
    this.studySessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Daily stats operations
  async createOrUpdateDailyStats(userId: number, date: string, type: string, duration: number, subjectId?: number): Promise<DailyStats> {
    const existingStat = Array.from(this.dailyStats.values()).find(
      (stat) => stat.userId === userId && stat.date === date
    );
    
    if (existingStat) {
      // Update existing stat
      const updatedStat = { ...existingStat };
      
      if (type === 'study') {
        updatedStat.studyTime += duration;
        if (subjectId) {
          const subjectBreakdown = { 
            ...updatedStat.subjectBreakdown as Record<string, number>
          };
          subjectBreakdown[subjectId] = (subjectBreakdown[subjectId] || 0) + duration;
          updatedStat.subjectBreakdown = subjectBreakdown;
        }
      } else if (type === 'break') {
        updatedStat.breakTime += duration;
      } else if (type === 'sleep') {
        updatedStat.sleepTime += duration;
      }
      
      this.dailyStats.set(existingStat.id, updatedStat);
      return updatedStat;
    } else {
      // Create new stat
      const id = this.currentDailyStatsId++;
      const subjectBreakdown: Record<string, number> = {};
      
      if (type === 'study' && subjectId) {
        subjectBreakdown[subjectId] = duration;
      }
      
      const newStat: DailyStats = {
        id,
        userId,
        date,
        studyTime: type === 'study' ? duration : 0,
        breakTime: type === 'break' ? duration : 0,
        sleepTime: type === 'sleep' ? duration : 0,
        subjectBreakdown
      };
      
      this.dailyStats.set(id, newStat);
      return newStat;
    }
  }

  async getDailyStatsByDateRange(userId: number, startDate: string, endDate: string): Promise<DailyStats[]> {
    return Array.from(this.dailyStats.values()).filter(
      (stat) => stat.userId === userId && stat.date >= startDate && stat.date <= endDate
    );
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievementsList.values());
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (achievement) => achievement.userId === userId
    );
  }

  async addUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentUserAchievementId++;
    const newUserAchievement: UserAchievement = {
      ...userAchievement,
      id,
      unlockedAt: new Date()
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date()
    };
    this.notificationsList.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUserId(userId: number, limit = 10): Promise<Notification[]> {
    const userNotifications = Array.from(this.notificationsList.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return userNotifications.slice(0, limit);
  }

  async markNotificationAsRead(notificationId: number): Promise<Notification> {
    const notification = this.notificationsList.get(notificationId);
    if (!notification) throw new Error("Notification not found");
    
    const updatedNotification = {
      ...notification,
      read: true
    };
    
    this.notificationsList.set(notificationId, updatedNotification);
    return updatedNotification;
  }

  // Study group operations
  async createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup> {
    const id = this.currentGroupId++;
    const newGroup: StudyGroup = {
      ...group,
      id,
      createdAt: new Date()
    };
    this.studyGroups.set(id, newGroup);
    return newGroup;
  }

  async addMemberToGroup(member: InsertGroupMember): Promise<GroupMember> {
    const id = this.currentGroupMemberId++;
    const newMember: GroupMember = {
      ...member,
      id,
      joinedAt: new Date()
    };
    this.groupMembers.set(id, newMember);
    return newMember;
  }

  async getStudyGroupsByUserId(userId: number): Promise<StudyGroup[]> {
    const memberGroups = Array.from(this.groupMembers.values())
      .filter((member) => member.userId === userId)
      .map((member) => member.groupId);
    
    return Array.from(this.studyGroups.values())
      .filter((group) => memberGroups.includes(group.id));
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter((member) => member.groupId === groupId);
  }

  async getLeaderboard(timeframe: string): Promise<User[]> {
    // Placeholder implementation - in a real app, would calculate based on study time in the time frame
    return Array.from(this.users.values())
      .sort((a, b) => b.totalStudyTime - a.totalStudyTime);
  }
}

export const storage = new MemStorage();
