let cachedEmbeddings = null;

/** Carrega faq-embeddings.json sob demanda (code-split) para não inflar o bundle inicial. */
export async function loadFaqEmbeddings() {
  if (!cachedEmbeddings) {
    const module = await import("./faq-embeddings.json");
    cachedEmbeddings = module.default;
  }
  return cachedEmbeddings;
}
