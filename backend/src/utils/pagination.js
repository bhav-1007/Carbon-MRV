export function getPagination(req) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export async function paginated(model, filter, req, options = {}) {
  const { page, limit, skip } = getPagination(req);
  let query = model.find(filter).sort(options.sort || { createdAt: -1 }).skip(skip).limit(limit);
  if (options.populate) query = query.populate(options.populate);
  const [items, total] = await Promise.all([
    query,
    model.countDocuments(filter)
  ]);

  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}
