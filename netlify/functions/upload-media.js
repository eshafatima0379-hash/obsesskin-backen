
const { response, requireAdmin } = require('./_supabase');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = 'product-images';

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]);

const MAX_BYTES = 4 * 1024 * 1024;

function safeName(value) {
  return String(value || 'media')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-100) || 'media';
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (!['POST', 'DELETE'].includes(event.httpMethod)) {
    return response(405, { error: 'Method not allowed.' });
  }

  try {
    await requireAdmin(event);

    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error('Supabase storage server settings are missing.');
    }

    const headers = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    };

    if (event.httpMethod === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const path = String(body.path || '');

      if (!path || path.includes('..') || path.startsWith('/')) {
        return response(400, { error: 'Invalid media path.' });
      }

      const r = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`,
        { method: 'DELETE', headers }
      );

      if (!r.ok) {
        throw new Error(
          (await r.text()) || 'Could not delete media from storage.'
        );
      }

      return response(200, { ok: true });
    }

    const body = JSON.parse(event.body || '{}');
    const mime = String(body.contentType || '');

    if (!ALLOWED.has(mime)) {
      return response(400, {
        error: 'This image or video format is not supported.'
      });
    }

    const raw = String(body.data || '').replace(
      /^data:[^,]*;base64,/,
      ''
    );

    if (!raw || !/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) {
      return response(400, { error: 'Invalid file data.' });
    }

    const bytes = Buffer.from(raw, 'base64');

    if (!bytes.length || bytes.length > MAX_BYTES) {
      return response(413, {
        error: 'Each upload must be 4 MB or smaller.'
      });
    }

    const ext = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov'
    }[mime];

    const path = `admin/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}-${safeName(body.fileName || `media.${ext}`)}`;

    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': mime,
          'x-upsert': 'false'
        },
        body: bytes
      }
    );

    if (!r.ok) {
      throw new Error(
        (await r.text()) || 'Could not upload media to Supabase Storage.'
      );
    }

    return response(201, {
      ok: true,
      path,
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`
    });

  } catch (e) {
    return response(e.statusCode || 500, {
      error: e.message || 'Media storage request failed.'
    });
  }
};
