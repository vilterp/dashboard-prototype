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
  gbCapacity: 0,
  ranges: 0
};

export function addStats(a, b) {
  return {
    QPS: a.QPS + b.QPS,
    gbUsed: a.gbUsed + b.gbUsed,
    gbCapacity: a.gbCapacity + b.gbCapacity,
    ranges: a.ranges + b.ranges
  };
}

function findNode(root, path) {
  function recur(curNode, pathInd) {
    if (pathInd === path.length) {
      return curNode;
    }
    const curPathElem = path[pathInd];
    for (const child of curNode.children) {
      if (child.name === curPathElem) {
        return recur(child, pathInd + 1)
      }
    }
  }
  return recur(root, 1);
}

function getLeafPathsFromNode(node, pathToNode) {
  const output = [];
  function recur(curNode, pathToCurNode) {
    if (curNode.type === TYPE_NODE) {
      output.push(pathToCurNode);
      return;
    }
    curNode.children.forEach((child) => {
      const pathToChild = [...pathToCurNode, child.name];
      recur(child, pathToChild);
    });
  }
  recur(node, pathToNode);
  return output;
}

export function getLeafPaths(data, paths) {
  const output = new Set();
  paths.forEach((path) => {
    const node = findNode(data, path);
    const leafPaths = getLeafPathsFromNode(node, path);
    leafPaths.forEach((path) => {
      output.add(path);
    });
  })
  return output;
}