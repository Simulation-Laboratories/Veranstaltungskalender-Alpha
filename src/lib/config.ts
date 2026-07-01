import fs from 'fs/promises';
import path from 'path';
import prisma from './prisma';

const configPath = path.join(process.cwd(), 'data', 'config.json');

export interface AppConfig {
  DATABASE_URL?: string;
  NEXTAUTH_SECRET?: string;
}

export async function readDbConfig(): Promise<AppConfig | null> {
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data) as AppConfig;
  } catch (error) {
    return null;
  }
}

export async function writeDbConfig(config: AppConfig): Promise<void> {
  const dataDir = path.dirname(configPath);
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {}
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}

export async function getSystemSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key }
    });
    if (setting) {
      return JSON.parse(setting.value) as T;
    }
  } catch (e) {
    // DB might not be initialized yet or table missing
  }
  return defaultValue;
}

export async function setSystemSetting<T>(key: string, value: T): Promise<void> {
  const strValue = JSON.stringify(value);
  await prisma.systemSettings.upsert({
    where: { key },
    update: { value: strValue },
    create: { key, value: strValue }
  });
}
