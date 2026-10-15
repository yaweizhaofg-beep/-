const KEY='xinghe-demo-session';
/** Demo sessions are for the prototype only; HTTP mode relies on a server-owned cookie. */
export class DemoAuth {
  constructor(storage=globalThis.sessionStorage,now=()=>Date.now()) {this.storage=storage;this.now=now;}
  async restore() {
    try {const session=JSON.parse(this.storage.getItem(KEY));if(session?.expiresAt>this.now()&&session.user?.id)return session.user;}catch{}
    this.storage.removeItem(KEY);return null;
  }
  async login(account,password) {
    if(account!=='admin'||password!=='Xinghe2026!')throw new Error('账号或密码不正确');
    const user={id:'demo-admin',name:'林知夏',account:'admin'};
    this.storage.setItem(KEY,JSON.stringify({user,expiresAt:this.now()+8*3600000}));
    return user;
  }
  async logout() {this.storage.removeItem(KEY);}
}

export class HttpAuth {
  constructor(repository) {this.repository=repository;}
  accept(session) {
    if(!session?.user?.id)throw new Error('登录响应缺少用户信息');
    this.repository.csrfToken=session.csrfToken||null;
    return session.user;
  }
  async restore() {
    try {return this.accept(await this.repository.request('/auth/session'));}
    catch(error){if(error.status===401)return null;throw error;}
  }
  async login(account,password) {return this.accept(await this.repository.request('/auth/login','POST',{account,password}));}
  async logout() {await this.repository.request('/auth/logout','POST',{});this.repository.csrfToken=null;}
}
