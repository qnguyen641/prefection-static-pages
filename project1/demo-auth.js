/* Demo only: credentials and permissions are public, client-side fixtures. */
(() => {
  const accounts = [
    { email: 'admin@prefection.example', role: 'Admin', name: 'Alex Morgan', initials: 'AM' },
    { email: 'sales@prefection.example', role: 'Sales', name: 'Jamie Lee', initials: 'JL' },
    { email: 'viewer@prefection.example', role: 'Viewer', name: 'Taylor Chen', initials: 'TC' }
  ];
  const password = 'Demo123!';
  const key = 'pmi-demo-session-v1';
  let current = null;
  let expiresAt = 0;
  const tabs = { Admin: ['dashboard','inbox','intelligence','review','database','jobintake','demand','scheduling'], Sales: ['dashboard','database','jobintake','demand','scheduling'], Viewer: ['dashboard','database'] };
  const descriptions = { Admin: 'All workspaces and demo reset', Sales: 'Candidates, job intake, matching and scheduling', Viewer: 'Read-only dashboard and candidate records' };
  window.PMIDemo = {
    get user() { return current; },
    canTab(tab) { return !!current && tabs[current.role].includes(tab); },
    isAdmin() { return current?.role === 'Admin'; },
    logout() { try { sessionStorage.removeItem(key); } catch {} current = null; location.reload(); },
    createGate(React, App) {
      const h = React.createElement;
      return function DemoGate() {
        const [user, setUser] = React.useState(() => {
          try {
            const saved = JSON.parse(sessionStorage.getItem(key));
            if (saved && saved.expires > Date.now() && saved.expires <= Date.now() + 28800000) { current = accounts.find(a => a.email === saved.email) || null; expiresAt = saved.expires; }
          } catch {}
          return current;
        });
        const [email, setEmail] = React.useState('');
        const [pass, setPass] = React.useState('');
        const [error, setError] = React.useState('');
        const [showAccounts, setShowAccounts] = React.useState(false);
        React.useEffect(() => {
          if (!user) return;
          const timer = setTimeout(() => window.PMIDemo.logout(), Math.max(0, expiresAt - Date.now()));
          return () => clearTimeout(timer);
        }, [user]);
        function login(event) {
          event.preventDefault();
          const account = accounts.find(a => a.email === email.trim().toLowerCase());
          if (!account) { setError('Access denied — your account is not authorized.'); return; }
          if (pass !== password) { setError('Incorrect password. Select a demo account to fill in its credentials.'); return; }
          current = account;
          expiresAt = Date.now() + 28800000;
          try { sessionStorage.setItem(key, JSON.stringify({email: account.email, expires: expiresAt})); } catch {}
          setError(''); setUser(account);
        }
        if (user) return h(React.Fragment, null,
          h('div', {className:'demo-session'}, h('span', null, h('strong',null,user.role), ' · ', descriptions[user.role]), h('span',null,user.email), h('button',{onClick:window.PMIDemo.logout},'Sign out')),
          h('div',{className:'demo-workspace'},h(App)));
        return h('main', {className:'demo-login'},
          h('section',{className:'demo-story'},h('div',{className:'demo-brand'},'PMI / PREFECTION'), h('div',null,h('p',{className:'demo-eyebrow'},'MANPOWER INTELLIGENCE'),h('h1',null,'The right people.\nThe next opportunity.'),h('p',null,'One workspace for candidate intelligence, job requests and interview coordination.')),h('p',{className:'demo-footnote'},'Interactive prototype · Sample data')),
          h('section',{className:'demo-form-panel'},h('div',{className:'demo-form-wrap'},h('p',{className:'demo-eyebrow'},'YOUR WORKSPACE'),h('h2',null,'Welcome back'),h('p',{className:'demo-muted'},'Sign in with a demo account to explore your role.'),
            h('form',{onSubmit:login},h('label',{htmlFor:'login-email'},'Email address'),h('input',{id:'login-email',type:'email',required:true,autoComplete:'username',value:email,onChange:e=>{setEmail(e.target.value);setError('');},placeholder:'you@prefection.example'}),h('label',{htmlFor:'login-password'},'Password'),h('input',{id:'login-password',type:'password',required:true,autoComplete:'current-password',value:pass,onChange:e=>setPass(e.target.value)}),error&&h('p',{role:'alert',className:'demo-error'},error),h('button',{className:'demo-submit',type:'submit'},'Sign in →')),
            h('div',{className:'demo-accounts'},h('button',{type:'button',className:'demo-account-toggle','aria-expanded':showAccounts,'aria-controls':'demo-account-options',onClick:()=>setShowAccounts(v=>!v)},h('span',null,'Try a demo account'),h('span',{'aria-hidden':true},showAccounts?'−':'+')),h('div',{id:'demo-account-options',hidden:!showAccounts},h('p',null,'Choose a role. Your sign-in details will be filled automatically.'),...accounts.map(a=>h('button',{key:a.role,type:'button',onClick:()=>{setEmail(a.email);setPass(password);setError('');setShowAccounts(false);document.getElementById('login-email')?.focus();}},h('span',null,h('strong',null,a.role),h('small',null,descriptions[a.role])),h('span',{'aria-hidden':true},'↗'))))),h('p',{className:'demo-disclaimer'},'Demo environment · Sample data'))));
      };
    }
  };
})();
