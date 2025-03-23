import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  totalStudyTime: integer("total_study_time").default(0).notNull(), // stored in seconds
  level: text("level").default("Student").notNull(),
  dailyGoal: integer("daily_goal").default(8 * 3600).notNull(), // Default 8 hours in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  dailyGoal: true,
});

// Subject model
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  targetTime: integer("target_time").default(0).notNull(), // weekly target in seconds
  dailyTargetTime: integer("daily_target_time").default(0).notNull(), // daily target in seconds
  totalTime: integer("total_time").default(0).notNull(), // total time studied in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  userId: true,
  name: true,
  color: true,
  targetTime: true,
  dailyTargetTime: true,
});

// Study session model
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  type: text("type").notNull(), // "study", "break", "sleep"
  breakTag: text("break_tag"), // "rest", "playing", "washroom", "custom", etc.
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncTime: timestamp("last_sync_time"), // For offline tracking sync
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  subjectId: true,
  type: true,
});

// Daily stats model
export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  studyTime: integer("study_time").default(0).notNull(), // in seconds
  breakTime: integer("break_time").default(0).notNull(), // in seconds
  sleepTime: integer("sleep_time").default(0).notNull(), // in seconds
  subjectBreakdown: jsonb("subject_breakdown").default({}).notNull(), // { subjectId: seconds }
});

export const insertDailyStatsSchema = createInsertSchema(dailyStats).pick({
  userId: true,
  date: true,
});

// Achievement model - predefined achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requiredTime: integer("required_time").notNull(), // in seconds
  level: integer("level").notNull(), // 1, 2, 3, etc.
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
});

// Notification model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "achievement", "break", "reminder", etc.
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  message: true,
});

// Study groups
export const studyGroups = pgTable("study_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudyGroupSchema = createInsertSchema(studyGroups).pick({
  name: true,
});

// Group members
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type StudySession = typeof studySessions.$inferSelect;

export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type DailyStats = typeof dailyStats.$inferSelect;

export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertStudyGroup = z.infer<typeof insertStudyGroupSchema>;
export type StudyGroup = typeof studyGroups.$inferSelect;

export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;

// Achievement level constants
export const ACHIEVEMENT_LEVELS = {
  STUDENT: { name: "Student", requiredTime: 3600, icon: "school" }, // 1 hour
  SPECS_NERD: { name: "Specs Nerd", requiredTime: 10800, icon: "smart_toy" }, // 3 hours
  HARDCORE_STUDENT: { name: "Hardcore Student", requiredTime: 21600, icon: "psychology" }, // 6 hours
  WORKAHOLIC: { name: "Workaholic", requiredTime: 28800, icon: "work" }, // 8 hours
  KING: { name: "King", requiredTime: 36000, icon: "military_tech" }, // 10 hours
  GOD_LEVEL: { name: "God-level Studier", requiredTime: 43200, icon: "self_improvement" }, // 12 hours
};
