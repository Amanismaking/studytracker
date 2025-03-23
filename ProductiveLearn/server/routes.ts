import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertSubjectSchema, insertStudySessionSchema, insertNotificationSchema, insertStudyGroupSchema, insertGroupMemberSchema, ACHIEVEMENT_LEVELS } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes - sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Subjects routes
  app.post("/api/subjects", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const data = insertSubjectSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const subject = await storage.createSubject(data);
      res.status(201).json(subject);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/subjects", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const subjects = await storage.getSubjectsByUserId(req.user.id);
      res.json(subjects);
    } catch (error) {
      next(error);
    }
  });
  
  // Update subject daily target
  app.patch("/api/subjects/:id/daily-target", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { dailyTargetTime } = req.body;
      
      if (typeof dailyTargetTime !== 'number' || dailyTargetTime < 0) {
        return res.status(400).send("Daily target time must be a non-negative number");
      }
      
      const subject = await storage.updateSubjectDailyTarget(parseInt(id), dailyTargetTime);
      res.json(subject);
    } catch (error) {
      next(error);
    }
  });

  // Study sessions routes
  app.post("/api/sessions/start", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const data = insertStudySessionSchema.parse({
        ...req.body,
        userId: req.user.id,
        type: req.body.type || "study"
      });
      
      const session = await storage.createStudySession(data);
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sessions/:id/end", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { duration } = req.body;
      
      if (!duration || typeof duration !== 'number') {
        return res.status(400).send("Duration is required and must be a number");
      }
      
      const session = await storage.endStudySession(parseInt(id), duration);
      
      // If it's a study session, update user's total study time and subject time
      if (session.type === "study") {
        await storage.updateUserStudyTime(req.user.id, duration);
        await storage.updateSubjectTime(session.subjectId, duration);
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        await storage.createOrUpdateDailyStats(
          req.user.id, 
          today, 
          "study", 
          duration, 
          session.subjectId
        );
        
        // Check for achievements
        await checkForAchievements(req.user.id);
      } else if (session.type === "break") {
        // Update break stats
        const today = new Date().toISOString().split('T')[0];
        await storage.createOrUpdateDailyStats(req.user.id, today, "break", duration);
      } else if (session.type === "sleep") {
        // Update sleep stats
        const today = new Date().toISOString().split('T')[0];
        await storage.createOrUpdateDailyStats(req.user.id, today, "sleep", duration);
      }
      
      res.json(session);
    } catch (error) {
      next(error);
    }
  });

  // Update break tag
  app.post("/api/sessions/:id/tag", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { breakTag } = req.body;
      
      if (!breakTag || typeof breakTag !== 'string') {
        return res.status(400).send("Break tag is required and must be a string");
      }
      
      const updatedSession = await storage.updateBreakTag(parseInt(id), breakTag);
      res.json(updatedSession);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sessions/active", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const sessions = await storage.getActiveSessionsByUserId(req.user.id);
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  });

  // Daily stats routes
  app.get("/api/stats/daily", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { start, end } = req.query;
      
      if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        return res.status(400).send("Start and end dates are required");
      }
      
      const stats = await storage.getDailyStatsByDateRange(req.user.id, start, end);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(req.user.id);
      
      const unlockedIds = userAchievements.map(ua => ua.achievementId);
      
      const achievementsWithStatus = achievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.includes(achievement.id)
      }));
      
      res.json(achievementsWithStatus);
    } catch (error) {
      next(error);
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const limitStr = req.query.limit as string | undefined;
      const limit = limitStr ? parseInt(limitStr) : undefined;
      
      const notifications = await storage.getNotificationsByUserId(req.user.id, limit);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/notifications/:id/read", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(parseInt(id));
      res.json(notification);
    } catch (error) {
      next(error);
    }
  });

  // Study groups routes
  app.post("/api/groups", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const data = insertStudyGroupSchema.parse(req.body);
      const group = await storage.createStudyGroup(data);
      
      // Add the creator as a member
      await storage.addMemberToGroup({
        groupId: group.id,
        userId: req.user.id
      });
      
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/groups/:id/members", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { id } = req.params;
      const { userId } = req.body;
      
      const data = insertGroupMemberSchema.parse({
        groupId: parseInt(id),
        userId
      });
      
      const member = await storage.addMemberToGroup(data);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/groups", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const groups = await storage.getStudyGroupsByUserId(req.user.id);
      res.json(groups);
    } catch (error) {
      next(error);
    }
  });

  // User daily goal update
  app.patch("/api/user/daily-goal", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { dailyGoal } = req.body;
      
      if (typeof dailyGoal !== 'number' || dailyGoal < 0) {
        return res.status(400).send("Daily goal must be a non-negative number");
      }
      
      const user = await storage.updateUserDailyGoal(req.user.id, dailyGoal);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const timeframe = req.query.timeframe as string || "week";
      const users = await storage.getLeaderboard(timeframe);
      
      // Return only necessary user info for leaderboard
      const leaderboard = users.map(user => ({
        id: user.id,
        displayName: user.displayName,
        totalStudyTime: user.totalStudyTime,
        level: user.level,
        isCurrentUser: user.id === req.user.id
      }));
      
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  });

  // Helper function to check for achievements
  async function checkForAchievements(userId: number) {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;
      
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(userId);
      const unlockedIds = userAchievements.map(ua => ua.achievementId);
      
      // Find achievements the user qualifies for but hasn't unlocked yet
      const eligibleAchievements = achievements.filter(
        achievement => user.totalStudyTime >= achievement.requiredTime && !unlockedIds.includes(achievement.id)
      );
      
      // Unlock new achievements
      for (const achievement of eligibleAchievements) {
        await storage.addUserAchievement({
          userId,
          achievementId: achievement.id
        });
        
        // Create notification for the new achievement
        await storage.createNotification({
          userId,
          type: "achievement",
          message: `You've unlocked a new achievement: ${achievement.name}!`
        });
        
        // Update user level to the highest achievement unlocked
        await storage.updateUserLevel(userId, achievement.name);
      }
    } catch (error) {
      console.error("Error checking for achievements:", error);
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
