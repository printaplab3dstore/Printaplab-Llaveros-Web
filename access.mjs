import {AccessSession} from './auth-core.mjs';
const account = new AccessSession();
const byId = id => document.getElementById(id);
const gate = byId('accessGate'), studio = byId('studio'), form = byId('accessForm');
const message = byId('accessMessage');
let busy = false, nextCheck = Infinity;
const controlIds = ['accessLogin','accessRegister','accessRetry'];

function locked(text) {
  studio.inert = true; gate.hidden = false;
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  message.textContent = text;
  byId('credentials').hidden = !!account.session;
  byId('accessRetry').hidden = !account.session;
  byId('accessSignout').hidden = !account.session;
  byId('accessIdentity').textContent = account.session?.email || '';
}
function pending(value) {
  busy = value;
  controlIds.forEach(id => byId(id).disabled = value);
  form.setAttribute('aria-busy', String(value));
}
async function verify() {
  if (busy || !account.session) return;
  pending(true); locked('Comprobando tu acceso…');
  try {
    if (await account.verify()) {
      nextCheck = performance.now() + 60000;
      gate.hidden = true; studio.inert = false;
      byId('sessionEmail').textContent = account.session.email;
      byId('view').dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
    } else {
      nextCheck = performance.now() + 60000;
      locked('Acceso pendiente, bloqueado o vencido. Contactá al administrador para habilitarlo.');
    }
  } catch (error) { nextCheck = performance.now()+60000; locked(error.message); }
  finally { pending(false); }
}
async function authenticate(register) {
  if (busy || !form.reportValidity()) return;
  const email = byId('accessEmail').value.trim(), password = byId('accessPassword').value;
  if (register && password.length < 8) { locked('Usá una contraseña de al menos 8 caracteres.'); return; }
  pending(true); message.textContent = register ? 'Creando cuenta…' : 'Ingresando…';
  byId('accessPassword').value = '';
  try {
    const hasSession = register
      ? await account.signup(email,password,location.origin+location.pathname)
      : await account.signin(email,password);
    if (!hasSession) locked('Si el registro fue aceptado, confirmá el correo y después ingresá. Si ya tenés cuenta, usá Ingresar.');
  } catch (error) { locked(error.message); }
  finally { pending(false); }
  if (account.session) await verify();
}
form.addEventListener('submit',event => {event.preventDefault(); authenticate(false);});
byId('accessRegister').onclick = () => authenticate(true);
byId('accessRetry').onclick = verify;
function signout() {
  if (!confirm('¿Cerrar sesión? Exportá primero tu diseño: el trabajo actual se borrará.')) return;
  pending(true); account.signout().finally(() => location.reload());
  locked('Cerrando sesión…');
}
byId('sessionSignout').onclick = signout;
byId('accessSignout').onclick = signout;
window.PrintaplabWebAccess = Object.freeze({allowed: () => account.allowed() && !document.hidden});
setInterval(() => {
  if (!account.session || document.hidden || busy) return;
  if (!account.allowed() || performance.now() >= nextCheck) {
    if (gate.hidden) locked('Revalidando el acceso…');
    if (performance.now() >= nextCheck) verify();
  }
}, 500);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { account.revoke(); if (account.session) locked('Comprobando acceso al volver…'); }
  else if (account.session) { nextCheck = 0; verify(); }
});
// Confirmation links may return tokens in the fragment; login is explicit in this version.
if (/access_token=|refresh_token=|error_description=/.test(location.hash)) history.replaceState(null,'',location.pathname+location.search);
locked('Usá la misma cuenta que en Android. El administrador debe habilitar tu acceso.');
