export function getItem(id) {
  if (id === "item-1") return { status: 200, body: { id, name: "Synthetic item" } };
  return {
    status: 404,
    body: { error: { code: "ITEM_NOT_FOUND", message: "Item was not found" } },
  };
}
