export function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function removeItem<T>(list: T[], item: T): T[] {
  return list.filter((i) => i !== item);
}

export function insertAt<T>(list: T[], item: T, index: number): T[] {
  const result = Array.from(list);
  result.splice(index, 0, item);
  return result;
}
