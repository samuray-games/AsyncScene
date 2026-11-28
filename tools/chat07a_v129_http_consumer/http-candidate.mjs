// Loopback HTTP candidate for isolated Node tests. NOT shared Worker, D1, or deployed HTTP backend.
import http from 'node:http';
const HEADERS=Object.freeze({'Cache-Control':'private, no-store, max-age=0','Surrogate-Control':'no-store','Referrer-Policy':'no-referrer','Pragma':'no-cache','Vary':'Authorization, Cookie','X-Content-Type-Options':'nosniff'});
const generic404=JSON.stringify({error:'not_found'});
const json=(res,code,body)=>{res.writeHead(code,{...HEADERS,'Content-Type':'application/json; charset=utf-8'});res.end(typeof body==='string'?body:JSON.stringify(body));};
const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function html(res,items){
  const cards=items.map(x=>`<article data-kind="${escapeHtml(x.kind)}"><h2>${x.kind==='VERIFIED_OUTCOME'?'Результат боя':'Публичное высказывание'}</h2><p>${escapeHtml(x.kind==='VERIFIED_OUTCOME'?x.fields.finality:x.fields.approvedPublishedText)}</p></article>`).join('');
  res.writeHead(200,{...HEADERS,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
  res.end(`<!doctype html><html lang="ru"><meta charset="utf-8"><body>${cards}</body></html>`);
}
const sessionToken=req=>/^Bearer [A-Za-z0-9_-]+$/.test(req.headers.authorization||'')?(req.headers.authorization.slice(7)):null;
export function makeCandidateServer({authority,beforeEmit=async()=>{}}){
  const server=http.createServer(async(req,res)=>{
    const session=authority.session(sessionToken(req));
    if(!session){json(res,401,{error:'unauthorized'});return;}
    if(req.method!=='GET'){json(res,405,{error:'method_not_allowed'});return;}
    let url;try{url=new URL(req.url,'http://localhost');}catch{json(res,404,generic404);return;}
    const path=url.pathname;const publicMatch=/^\/v1\/history\/item\/([A-Za-z0-9_-]+)$/.exec(path);
    const privateMatch=/^\/v1\/private\/item\/([A-Za-z0-9_-]+)$/.exec(path);
    try{
      if(publicMatch||privateMatch){
        const surface=publicMatch?'PUBLIC_HISTORY':'PRIVATE_RECIPIENT',ref=(publicMatch||privateMatch)[1];
        const prepared=authority.view(session,ref,surface),revision=authority.revision;
        await beforeEmit({path,session,kind:'ITEM',authority});
        // Synchronous final authorization and response write. No await after final fence.
        if(authority.revision!==revision||!prepared){json(res,404,generic404);return;}
        const current=authority.view(authority.session(sessionToken(req)),ref,surface);
        if(!current||JSON.stringify(current)!==JSON.stringify(prepared)){json(res,404,generic404);return;}
        json(res,200,current);return;
      }
      if(path==='/v1/history'||path==='/v1/history/ssr'){
        // SSR is a full, standalone, freshly authorized view; never accept page/cursor aliases.
        if(path==='/v1/history/ssr'&&url.search!==''){json(res,404,generic404);return;}
        const cursor=url.searchParams.get('cursor');
        const p=url.searchParams.get('pageSize');
        const pageSize=(p===null?10:/^(?:[1-9]|10)$/.test(p)?Number(p):0);
        if(!pageSize||[...url.searchParams.keys()].some(k=>!['pageSize','cursor'].includes(k))){json(res,404,generic404);return;}
        const revision=authority.revision;
        const offset=cursor?authority.consumeCursor(session,cursor,pageSize):0;
        if(offset===null){json(res,404,generic404);return;}
        await beforeEmit({path,session,kind:'LIST',authority});
        const live=authority.session(sessionToken(req));
        if(authority.revision!==revision||!live){json(res,404,generic404);return;}
        const visible=authority.history(live);
        if(path==='/v1/history/ssr'){html(res,visible);return;}
        const items=visible.slice(offset,offset+pageSize);
        const next=(offset+pageSize<visible.length)?authority.issueCursor(live,offset+pageSize,pageSize):null;
        json(res,200,{projectionVersion:'07a-http-consumer/v1',items,...(next?{nextCursor:next}:{})});return;
      }
      json(res,404,generic404);
    }catch{
      // A test-only generic fail-closed candidate; no underlying issuer details in errors.
      json(res,404,generic404);
    }
  });
  return server;
}
