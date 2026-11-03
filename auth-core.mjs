export const SUPABASE_URL = 'https://qxifnkullezdpihflfpj.supabase.co';
const PUBLIC_KEY = 'sb_publishable_nzSERMLpR-Iy2Gza608F-w_z_gCqgQo';

export class AccessSession {
  constructor(fetcher = globalThis.fetch.bind(globalThis), clock = () => performance.now()) {
    this.fetcher = fetcher; this.clock = clock;
    this.session = null; this.lease = 0; this.epoch = 0;
  }
  allowed() { return !!this.session && this.lease > this.clock(); }
  revoke() { this.lease = 0; }
  async request(path, body = {}, token = null) {
    const headers = {apikey: PUBLIC_KEY, 'Content-Type': 'application/json'};
    if (token) headers.Authorization = 'Bearer ' + token;
    let response;
    try {
      response = await this.fetcher(SUPABASE_URL + path, {
        method: 'POST', headers, body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000), credentials: 'omit', cache: 'no-store', redirect: 'error'
      });
    } catch { throw new Error('No se pudo conectar. Revisá Internet y volvé a intentar.'); }
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { throw new Error('Respuesta inválida de Supabase.'); }
    if (!response.ok) {
      const message = response.status === 429 ? 'Demasiados intentos. Esperá unos minutos.'
        : path.startsWith('/rest/') ? 'No se pudo comprobar el permiso. Contactá al administrador.'
        : data.error_code === 'email_not_confirmed' ? 'Confirmá tu correo antes de ingresar.'
        : data.error_code === 'invalid_credentials' ? 'El correo o la contraseña no son correctos.'
        : data.error_code === 'over_email_send_rate_limit' ? 'Se alcanzó el límite de correos. Esperá o contactá al administrador.'
        : data.msg || data.message || data.error_description || 'No se pudo completar la solicitud.';
      const error = new Error(String(message)); error.status = response.status; throw error;
    }
    return data;
  }
  accept(data) {
    if (typeof data.access_token !== 'string' || !data.access_token || typeof data.refresh_token !== 'string') {
      throw new Error('La sesión recibida está incompleta. Volvé a ingresar.');
    }
    this.session = {token: data.access_token, refresh: data.refresh_token,
      until: this.clock() + Math.max(0, Number(data.expires_in) || 0) * 1000,
      email: data.user?.email || ''};
  }
  async signin(email, password) {
    const epoch = ++this.epoch; this.session = null; this.revoke();
    const data = await this.request('/auth/v1/token?grant_type=password', {email, password});
    if (epoch !== this.epoch) return false;
    this.accept(data); return true;
  }
  async signup(email, password, redirect) {
    const epoch = ++this.epoch; this.session = null; this.revoke();
    const query = redirect ? '?redirect_to=' + encodeURIComponent(redirect) : '';
    const data = await this.request('/auth/v1/signup' + query, {email, password});
    if (epoch !== this.epoch) return false;
    if (data.access_token) { this.accept(data); return true; }
    return false;
  }
  async verify() {
    // Keep the current, unexpired lease during a background renewal.
    // A denial or request failure still revokes access immediately.
    if (!this.session) return false;
    const epoch = this.epoch;
    try {
      if (this.clock() + 60000 >= this.session.until) {
        const data = await this.request('/auth/v1/token?grant_type=refresh_token', {refresh_token: this.session.refresh});
        if (epoch !== this.epoch) return false;
        this.accept(data);
      }
      const started = this.clock();
      const data = await this.request('/rest/v1/rpc/llaveros_check_access', {}, this.session.token);
      if (epoch !== this.epoch) return false;
      const seconds = typeof data.valid_for_seconds === 'number' && Number.isFinite(data.valid_for_seconds)
        ? Math.max(0, Math.min(60, data.valid_for_seconds)) : 0;
      const remaining = seconds * 1000 - (this.clock() - started);
      if (data.active === true && remaining > 0) this.lease = this.clock() + remaining;
      else this.revoke();
      return this.allowed();
    } catch (error) {
      if (epoch === this.epoch) {
        this.revoke();
        if (error.status === 401 || error.status === 400) { this.session = null; this.epoch++; }
      }
      throw error;
    }
  }
  async signout() {
    const token = this.session?.token;
    this.epoch++; this.session = null; this.revoke();
    if (token) try { await this.request('/auth/v1/logout?scope=local', {}, token); } catch { /* local logout still succeeds */ }
  }
}
