export const TYPE_LOCALITY = 'LOCALITY';
export const TYPE_NODE = 'NODE';

export function stringifyPath(path) {
  return JSON.stringify(path);
}

export function unStringifyPath(stringified) {
  return JSON.parse(stringified);
}

export function pathHasPrefix(path, prefix) {
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] !== path[i]) {
      return false;
    }
  }
  return true;
}

// filterDescendentPaths returns a new set with the paths that descend
// from the given path filtered out.
export function filterDescendentPaths(allPaths, path) {
  const res = new Set([...allPaths].filter((curPathStr) => {
    const curPath = unStringifyPath(curPathStr);
    const isDescendant = curPath.length > path.length && pathHasPrefix(curPath, path);
    return !isDescendant;
  }));
  return res;
}

export const EMPTY_PATH = stringifyPath([]);

export const EMPTY_STATS = {
  QPS: 0,
  gbUsed: 0,
  gbCapacity: 0
};

export function addStats(a, b) {
  return {
    QPS: a.QPS + b.QPS,
    gbUsed: a.gbUsed + b.gbUsed,
    gbCapacity: a.gbCapacity + b.gbCapacity
  };
}
