// ===================== КАРМИОН: АВТОРИЗАЦИЯ =====================
// Вход по логину/паролю через Supabase Auth.
// Доступ выдаётся вручную: после оплаты вы создаёте покупателю
// пользователя в панели Supabase (Authentication → Users → Add user).

const SUPABASE_URL = 'https://fgoojpmjcvdkqocnwiih.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dSGvzdo8IljaSTz2IKrMLA_6DNx4ghS';

let supabaseClient = null;
if (window.supabase && window.supabase.createClient){
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function showApp(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-content').classList.remove('hidden');
}
function showLogin(){
  document.getElementById('app-content').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}
function loginError(msg){
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

async function checkSession(){
  if (!supabaseClient){
    loginError('Не удалось загрузить систему входа. Проверьте интернет-соединение и обновите страницу.');
    return;
  }
  const { data } = await supabaseClient.auth.getSession();
  if (data.session){
    showApp();
  } else {
    showLogin();
  }
}

async function doLogin(){
  loginError('');
  if (!supabaseClient){
    loginError('Не удалось загрузить систему входа. Проверьте интернет-соединение и обновите страницу.');
    return;
  }
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password){
    loginError('Введите e-mail и пароль.');
    return;
  }
  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Входим…';
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  btn.disabled = false;
  btn.textContent = 'Войти';
  if (error){
    loginError('Неверный e-mail или пароль. Если доступа ещё нет — обратитесь к автору методики.');
    return;
  }
  showApp();
}

async function doLogout(){
  if (supabaseClient) await supabaseClient.auth.signOut();
  showLogin();
}

document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  document.getElementById('btn-login').addEventListener('click', doLogin);
  document.getElementById('btn-logout').addEventListener('click', doLogout);
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
});
