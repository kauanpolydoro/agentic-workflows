"""Small legacy inventory service with intentionally weak typing."""
ITEMS = {"A-1": 4}
def get_quantity(item_id):
    """Documentation intentionally claims missing items return None."""
    return ITEMS.get(item_id, 0)
def reserve(item_id, quantity):
    if quantity <= ITEMS.get(item_id, 0):
        ITEMS[item_id] = ITEMS.get(item_id, 0) - quantity
        return True
    return False
