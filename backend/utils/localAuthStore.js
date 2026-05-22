const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const seedUsersPath = path.join(__dirname, '..', 'data', 'users.json');
const localUsersPath = path.join(__dirname, '..', 'data', 'local-users.json');

const readJsonFile = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
};

const ensureLocalStore = async () => {
  try {
    await fs.access(localUsersPath);
  } catch {
    const seedUsers = await readJsonFile(seedUsersPath);
    await fs.writeFile(localUsersPath, JSON.stringify(seedUsers, null, 2));
  }
};

const loadLocalUsers = async () => {
  await ensureLocalStore();
  const users = await readJsonFile(localUsersPath);
  return Array.isArray(users) ? users : [];
};

const saveLocalUsers = async (users) => {
  await fs.writeFile(localUsersPath, JSON.stringify(users, null, 2));
};

const normalizeUser = (user) => ({
  ...user,
  id: user.id || user._id || randomUUID(),
  username: user.username?.toLowerCase(),
  email: user.email?.toLowerCase(),
  isActive: user.isActive !== false,
  createdAt: user.createdAt || new Date().toISOString()
});

const getUserIdentifierCandidates = (identifier) => {
  const normalized = String(identifier || '').trim();
  return [normalized.toLowerCase(), normalized];
};

const findUserByIdentifier = async (identifier) => {
  const users = await loadLocalUsers();
  const candidates = getUserIdentifierCandidates(identifier);

  return users.find((user) => {
    const normalizedUser = normalizeUser(user);
    return normalizedUser.isActive && (
      candidates.includes(normalizedUser.username) ||
      candidates.includes(normalizedUser.email) ||
      candidates.includes(String(normalizedUser.phone || ''))
    );
  }) || null;
};

const findUserById = async (id) => {
  const users = await loadLocalUsers();
  const normalizedId = String(id || '');

  return users.find((user) => {
    const normalizedUser = normalizeUser(user);
    return String(normalizedUser.id) === normalizedId;
  }) || null;
};

const findConflictingUser = async ({ username, email, phone }) => {
  const users = await loadLocalUsers();
  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  return users.find((user) => {
    const normalizedUser = normalizeUser(user);
    return normalizedUser.username === normalizedUsername ||
      normalizedUser.email === normalizedEmail ||
      String(normalizedUser.phone || '') === String(phone);
  }) || null;
};

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (plainPassword, storedPassword) => {
  if (!storedPassword) return false;

  if (storedPassword.startsWith('$2')) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  return plainPassword === storedPassword;
};

const createLocalUser = async (userData) => {
  const users = await loadLocalUsers();
  const now = new Date().toISOString();
  const record = {
    ...userData,
    id: randomUUID(),
    username: userData.username.toLowerCase(),
    email: userData.email.toLowerCase(),
    password: await hashPassword(userData.password),
    isActive: true,
    createdAt: now
  };

  users.push(record);
  await saveLocalUsers(users);
  return normalizeUser(record);
};

module.exports = {
  comparePassword,
  createLocalUser,
  findConflictingUser,
  findUserById,
  findUserByIdentifier,
  loadLocalUsers,
  normalizeUser
};