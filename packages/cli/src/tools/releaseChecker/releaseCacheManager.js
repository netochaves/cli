/**
 * @flow
 */
import path from 'path';
import fs from 'fs';
import os from 'os';
import mkdirp from 'mkdirp';
import {logger} from '@react-native-community/cli-tools';

type ReleaseCacheKey = 'eTag' | 'lastChecked' | 'latestVersion';
type Cache = {[key: ReleaseCacheKey]: string};

function loadCache(name: string): ?Cache {
  try {
    const cacheRaw = fs.readFileSync(
      path.resolve(getCacheRootPath(), name),
      'utf8',
    );
    const cache = JSON.parse(cacheRaw);
    return cache;
  } catch (e) {
    if (e.code === 'ENOENT') {
      // Create cache file since it doesn't exist.
      saveCache(name, {});
    }
    logger.debug('No release cache found');
  }
}

function saveCache(name: string, cache: Cache) {
  fs.writeFileSync(
    path.resolve(getCacheRootPath(), name),
    JSON.stringify(cache, null, 2),
  );
}

/**
 * Returns the path string of `$HOME/.react-native-cli`.
 *
 * In case it doesn't exist, it will be created.
 */
function getCacheRootPath() {
  const cachePath = path.resolve(os.homedir(), '.react-native-cli', 'cache');
  if (!fs.existsSync(cachePath)) {
    mkdirp(cachePath);
  }

  return cachePath;
}

function get(name: string, key: ReleaseCacheKey): ?string {
  const cache = loadCache(name);
  if (cache) {
    return cache[key];
  }
}

function set(name: string, key: ReleaseCacheKey, value: string) {
  const cache = loadCache(name);
  if (cache) {
    cache[key] = value;
    saveCache(name, cache);
  }
}

export default {
  get,
  set,
};
