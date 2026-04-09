import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import logger from '../config/logger.js';

// ── Token Helpers ────────────────────────────────────────
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const BCRYPT_SALT_ROUNDS = 12;

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, tokenVersion: user.token_version || 0 },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
};

// ── Login ────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check for account lockout
    const [users] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
    );

    if (users.length === 0) {
      logger.warn(`Failed login attempt for non-existent user: ${username}`, { ip: req.ip });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      logger.warn(`Login attempt on locked account: ${username}`, { ip: req.ip });
      return res.status(423).json({
        error: `Account is temporarily locked. Try again in ${minutesLeft} minutes.`,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Increment failed attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      const MAX_ATTEMPTS = 5;

      let lockQuery = 'UPDATE users SET failed_login_attempts = ? WHERE id = ?';
      let lockParams = [failedAttempts, user.id];

      if (failedAttempts >= MAX_ATTEMPTS) {
        // Lock for 30 minutes
        lockQuery = 'UPDATE users SET failed_login_attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE id = ?';
        logger.warn(`Account locked after ${MAX_ATTEMPTS} failed attempts: ${username}`, { ip: req.ip });
      }

      await pool.query(lockQuery, lockParams);
      logger.warn(`Failed login attempt #${failedAttempts} for: ${username}`, { ip: req.ip });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?',
      [user.id]
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token hash in DB for revocation capability
    const refreshTokenHash = await bcrypt.hash(refreshToken, 4);
    await pool.query(
      'UPDATE users SET refresh_token_hash = ? WHERE id = ?',
      [refreshTokenHash, user.id]
    );

    // Set refresh token as HTTP-only cookie
    setRefreshCookie(res, refreshToken);

    logger.info(`User logged in: ${username}`, { ip: req.ip, userId: user.id });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`, { ip: req.ip });
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// ── Refresh Token ────────────────────────────────────────
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
      );
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Fetch user from DB
    const [users] = await pool.query(
      'SELECT id, username, email, role, avatar, is_active, refresh_token_hash, token_version FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    const user = users[0];

    // Verify the refresh token hash matches (prevents reuse of stolen tokens)
    if (user.refresh_token_hash) {
      const isValidRefresh = await bcrypt.compare(refreshToken, user.refresh_token_hash);
      if (!isValidRefresh) {
        logger.warn(`Refresh token mismatch for user: ${user.username} — possible token theft`, { ip: req.ip });
        // Invalidate all sessions for this user
        await pool.query('UPDATE users SET refresh_token_hash = NULL, token_version = token_version + 1 WHERE id = ?', [user.id]);
        res.clearCookie('refreshToken', { path: '/api/auth' });
        return res.status(401).json({ error: 'Session invalidated. Please log in again.' });
      }
    }

    // Issue new tokens (rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newHash = await bcrypt.hash(newRefreshToken, 4);

    await pool.query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [newHash, user.id]);
    setRefreshCookie(res, newRefreshToken);

    res.json({
      token: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`, { ip: req.ip });
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

// ── Logout ───────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    // Clear refresh token from DB
    if (req.user?.id) {
      await pool.query('UPDATE users SET refresh_token_hash = NULL WHERE id = ?', [req.user.id]);
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Get Profile ──────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Update Profile ───────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    await pool.query(
      'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email) WHERE id = ?',
      [username, email, req.user.id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Change Password ──────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isValid = await bcrypt.compare(currentPassword, users[0].password);

    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    // Also increment token_version to invalidate all existing sessions
    await pool.query(
      'UPDATE users SET password = ?, token_version = COALESCE(token_version, 0) + 1, refresh_token_hash = NULL WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Reset Credentials ────────────────────────────────────
export const resetCredentials = async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({ error: 'At least one of New Username or New Password is required' });
    }

    if (newPassword && newPassword.length < 8) {
      return res.status(400).json({ error: 'Password does not meet security requirements.' });
    }

    const [users] = await pool.query('SELECT username, password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    if (newUsername && newUsername !== users[0].username) {
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [newUsername]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username is already in use.' });
      }
    }

    let queryUpdates = [];
    let queryParams = [];

    if (newUsername) {
      queryUpdates.push('username = ?');
      queryParams.push(newUsername);
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
      queryUpdates.push('password = ?');
      queryParams.push(hashedPassword);
      queryUpdates.push('token_version = COALESCE(token_version, 0) + 1');
      queryUpdates.push('refresh_token_hash = NULL');
    }

    queryParams.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${queryUpdates.join(', ')} WHERE id = ?`,
      queryParams
    );

    if (newPassword) {
       res.clearCookie('refreshToken', { path: '/api/auth' });
    }
    
    logger.info(`Admin credentials reset explicitly by User ${req.user.id}`, { ip: req.ip });

    res.json({ message: 'Credentials updated. Please log in again.' });
  } catch (error) {
    logger.error(`Reset Credentials error: ${error.message}`, { ip: req.ip });
    res.status(500).json({ error: error.message });
  }
};

// ── Dashboard Stats ──────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [promptCount] = await pool.query('SELECT COUNT(*) as count FROM prompts');
    const [categoryCount] = await pool.query('SELECT COUNT(*) as count FROM categories');
    const [blogCount] = await pool.query('SELECT COUNT(*) as count FROM blog_posts');
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [totalViews] = await pool.query('SELECT COALESCE(SUM(views), 0) as total FROM prompts');
    const [recentPrompts] = await pool.query(
      'SELECT id, title, slug, views, created_at FROM prompts ORDER BY created_at DESC LIMIT 5'
    );
    const [recentPosts] = await pool.query(
      'SELECT id, title, slug, views, status, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      stats: {
        prompts: promptCount[0].count,
        categories: categoryCount[0].count,
        blogPosts: blogCount[0].count,
        users: userCount[0].count,
        totalViews: totalViews[0].total,
      },
      recentPrompts,
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
