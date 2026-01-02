const jsonServer = require('json-server');
const path = require('node:path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ logger: true });

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = () => router.db;
const toISO = (d = new Date()) => new Date(d).toISOString();

const sign = (payload) =>
  Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64');

const verify = (token) => {
  try { return JSON.parse(Buffer.from(token, 'base64').toString('utf8')); } catch { return null; }
};

const getBearerToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

const requireAuth = (req, res, next) => {
  const token = getBearerToken(req);
  const payload = token ? verify(token) : null;
  if (!payload) return res.status(401).json({ message: 'No autorizado' });

  const user = db().get('users').find({ id: payload.sub }).value();
  if (!user) return res.status(401).json({ message: 'No autorizado' });

  req.user = { id: user.id, email: user.email, name: user.name };
  next();
};

server.use((req, res, next) => setTimeout(next, 250));

// LOGIN
server.post('/api/auth/login', (req, res) => {
  let { login, password } = req.body || {};
  login = String(login || '').trim().toLowerCase();
  password = String(password || '');

  const user = db()
    .get('users')
    .find((u) => {
      const email = String(u.email || '').trim().toLowerCase();
      const username = String(u.username || '').trim().toLowerCase();
      return (email === login || username === login) && String(u.password) === password;
    })
    .value();

  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = sign({ sub: user.id, email: user.email });
  return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// REGISTER
server.post('/api/auth/register', (req, res) => {
  let { name, email, password } = req.body || {};
  name = String(name || '').trim();
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');

  if (!name || !email || !password) return res.status(400).json({ message: 'Campos requeridos' });

  const exists = db().get('users').find((u) => String(u.email || '').trim().toLowerCase() === email).value();
  if (exists) return res.status(409).json({ message: 'Email ya registrado' });

  const nextId =
    (db().get('users').value().reduce((m, u) => Math.max(m, u.id || 0), 0) || 0) + 1;

  db().get('users').push({
    id: nextId,
    name,
    email,
    username: email.split('@')[0],
    password,
    createdAt: toISO(),
  }).write();

  return res.status(201).json({ ok: true });
});

// PROFILE
server.get('/api/auth/profile', requireAuth, (req, res) => res.status(200).json(req.user));

// FORGOT PASSWORD
server.post('/api/auth/forgot-password', (req, res) => {
  let { email, password } = req.body || {};
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');

  if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });

  const user = db().get('users').find((u) => String(u.email || '').trim().toLowerCase() === email).value();
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  db().get('users').find({ id: user.id }).assign({ password, updatedAt: toISO() }).write();
  return res.status(200).json({ ok: true });
});


// ======================
// TheCatAPI proxy helpers
// ======================
const CAT_API_BASE = process.env.CAT_API_BASE || 'https://api.thecatapi.com/v1';
const CAT_API_KEY = process.env.CAT_API_KEY || '';

async function catFetch(path, query = {}) {
  const url = new URL(CAT_API_BASE + path);

  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    url.searchParams.set(k, String(v));
  });

  const resp = await fetch(url.toString(), {
    headers: {
      // NO expongas la key al FE
      ...(CAT_API_KEY ? { 'x-api-key': CAT_API_KEY } : {}),
    },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`TheCatAPI ${resp.status}: ${text || resp.statusText}`);
  }

  return resp.json();
}

// Normaliza “breed”
function mapBreed(b) {
  return {
    id: b.id,
    name: b.name,
    origin: b.origin,
    temperament: b.temperament,
    description: b.description,
    life_span: b.life_span,
    wikipedia_url: b.wikipedia_url,
    alt_names: b.alt_names,
    // ratings (útiles para tabla)
    intelligence: b.intelligence,
    affection_level: b.affection_level,
    energy_level: b.energy_level,
    adaptability: b.adaptability,
    child_friendly: b.child_friendly,
    dog_friendly: b.dog_friendly,
    stranger_friendly: b.stranger_friendly,
    rare: b.rare,
    weight_metric: b.weight?.metric,
  };
}

function pickSubtitle(b) {
  // Para el subtitle de la card: algo corto
  // (Temperament viene como "Active, Energetic, ...")
  const t = String(b.temperament || '').split(',').map(s => s.trim()).filter(Boolean);
  return t.slice(0, 2).join(' • ') || b.origin || '';
}

// ======================
// Cats endpoints (Proxy)
// ======================

// GET /api/cats/breeds
// GET /api/cats/breeds?page=1&limit=9&q=abys&sort=az&breedIds=abys,beng
server.get('/api/cats/breeds', requireAuth, async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);     // 1-based
    const limit = Math.min(Math.max(Number(req.query.limit || 9), 1), 27);

    const q = String(req.query.q || '').trim().toLowerCase();
    const sort = String(req.query.sort || 'az'); // az | za | pop

    const breedIdsRaw = String(req.query.breedIds || '').trim();
    const breedIds = breedIdsRaw
      ? breedIdsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const breeds = await catFetch('/breeds');

    // 1) filter by q
    let filtered = q
      ? breeds.filter(b =>
          `${b.name} ${b.origin || ''} ${b.temperament || ''}`
            .toLowerCase()
            .includes(q)
        )
      : breeds;

    // 2) filter by selected breeds (ids)
    if (breedIds.length) {
      const set = new Set(breedIds);
      filtered = filtered.filter(b => set.has(b.id));
    }

    // 3) sort
    filtered = [...filtered].sort((a, b) => {
      if (sort === 'za') return String(b.name).localeCompare(String(a.name));
      if (sort === 'pop') {
        const pa = (a.intelligence || 0) + (a.affection_level || 0);
        const pb = (b.intelligence || 0) + (b.affection_level || 0);
        return pb - pa;
      }
      return String(a.name).localeCompare(String(b.name)); // az
    });

    const total = filtered.length;

    // 4) pagination
    const start = (page - 1) * limit;
    const pageItems = filtered.slice(start, start + limit);

    // 5) images (solo para los de la página)
    const withImages = await Promise.all(
      pageItems.map(async (b) => {
        try {
          const imgs = await catFetch('/images/search', {
            limit: 1,
            breed_ids: b.id,
            order: 'RANDOM',
          });
          const img = Array.isArray(imgs) && imgs[0] ? imgs[0].url : '';
          return { ...mapBreed(b), subtitle: pickSubtitle(b), image: img };
        } catch {
          return { ...mapBreed(b), subtitle: pickSubtitle(b), image: '' };
        }
      })
    );

    res.status(200).json({
      data: withImages,
      total,
      page,
      limit,
    });
  } catch (e) {
    res.status(502).json({ message: 'Error consultando TheCatAPI', detail: String(e.message || e) });
  }
});


// GET /api/cats/breeds/options  (para filtros)
server.get('/api/cats/breeds/options', requireAuth, async (req, res) => {
  try {
    const breeds = await catFetch('/breeds');

    const options = breeds
      .map(b => ({ label: b.name, value: b.id }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return res.status(200).json(options);
  } catch (e) {
    return res.status(502).json({ message: 'Error consultando TheCatAPI', detail: String(e.message || e) });
  }
});



// GET /api/cats/breeds/search?q=...
server.get('/api/cats/breeds/search', requireAuth, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.status(200).json([]);

    // TheCatAPI tiene /breeds/search?q=
    const breeds = await catFetch('/breeds/search', { q });

    const result = breeds.map(b => ({
      ...mapBreed(b),
      subtitle: pickSubtitle(b),
    }));

    res.status(200).json(result);
  } catch (e) {
    res.status(502).json({ message: 'Error consultando TheCatAPI', detail: String(e.message || e) });
  }
});

// GET /api/cats/breeds/:id  (detalle)
server.get('/api/cats/breeds/:id', requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ message: 'id requerido' });

    // TheCatAPI no siempre tiene /breeds/:id (depende), lo más estable:
    // trae /breeds y busca por id
    const breeds = await catFetch('/breeds');
    const breed = breeds.find(b => b.id === id);

    if (!breed) return res.status(404).json({ message: 'Raza no encontrada' });

    res.status(200).json({
      ...mapBreed(breed),
      subtitle: pickSubtitle(breed),
    });
  } catch (e) {
    res.status(502).json({ message: 'Error consultando TheCatAPI', detail: String(e.message || e) });
  }
});

// GET /api/cats/breeds/:id/images?limit=10
server.get('/api/cats/breeds/:id/images', requireAuth, async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 20);

    const images = await catFetch('/images/search', {
      limit,
      breed_ids: id,
      order: 'RANDOM',
    });

    // Para carrusel solo necesitas urls (y quizá width/height)
    const result = images.map(img => ({
      id: img.id,
      url: img.url,
      width: img.width,
      height: img.height,
    }));

    res.status(200).json(result);
  } catch (e) {
    res.status(502).json({ message: 'Error consultando TheCatAPI', detail: String(e.message || e) });
  }
});

// (Opcional) tabla con campos “relevantes” y pocos
server.get('/api/cats/breeds-table', requireAuth, async (req, res) => {
  try {
    const breeds = await catFetch('/breeds');
    const table = breeds.map(b => ({
      id: b.id,
      name: b.name,
      origin: b.origin,
      intelligence: b.intelligence,
      affection_level: b.affection_level,
      energy_level: b.energy_level,
      child_friendly: b.child_friendly,
      dog_friendly: b.dog_friendly,
      rare: b.rare,
      life_span: b.life_span,
      weight_metric: b.weight?.metric,
    }));
    res.status(200).json(table);
  } catch (e) {
    res.status(502).json({ message: 'Error consultando TheCatAPI', detail: String(e.message || e) });
  }
});



server.use(router);

const PORT = process.env.PORT || 4300;
server.listen(PORT, () => console.log(`Mock API running at http://localhost:${PORT}`));
