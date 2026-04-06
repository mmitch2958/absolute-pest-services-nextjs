module.exports=[18622,(e,t,i)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,i)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,i)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,i)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,i)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,i)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},66680,(e,t,i)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},27699,(e,t,i)=>{t.exports=e.x("events",()=>require("events"))},24836,(e,t,i)=>{t.exports=e.x("https",()=>require("https"))},21517,(e,t,i)=>{t.exports=e.x("http",()=>require("http"))},4446,(e,t,i)=>{t.exports=e.x("net",()=>require("net"))},55004,(e,t,i)=>{t.exports=e.x("tls",()=>require("tls"))},54799,(e,t,i)=>{t.exports=e.x("crypto",()=>require("crypto"))},88947,(e,t,i)=>{t.exports=e.x("stream",()=>require("stream"))},92509,(e,t,i)=>{t.exports=e.x("url",()=>require("url"))},6461,(e,t,i)=>{t.exports=e.x("zlib",()=>require("zlib"))},874,(e,t,i)=>{t.exports=e.x("buffer",()=>require("buffer"))},96206,e=>{"use strict";var t=e.i(56401),i=e.i(93454);let r={password:process.env.SESSION_SECRET,cookieName:"admin-session",cookieOptions:{secure:!0}};async function a(){return await (0,t.getIronSession)(await (0,i.cookies)(),r)}e.s(["getSession",0,a])},63067,e=>{"use strict";var t=e.i(60071),i=e.i(60074),r=e.i(74708),a=e.i(2268),n=e.i(17317),s=e.i(23829),o=e.i(75791),l=e.i(43895),d=e.i(82256),u=e.i(22576),c=e.i(37511),p=e.i(54879),x=e.i(31338),v=e.i(86036),R=e.i(52060),h=e.i(93695);e.i(70367);var m=e.i(26748),E=e.i(45864),_=e.i(96206),w=e.i(74160);async function f(){return(await (0,_.getSession)()).adminToken?null:E.NextResponse.json({error:"Unauthorized"},{status:401})}async function g(e){let t=await f();if(t)return t;try{let{searchParams:t}=new URL(e.url),i=t.get("status"),r=t.get("clientId");if(w.sql`
      SELECT
        i.id,
        i.invoice_number,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.sent_at,
        i.viewed_at,
        i.paid_at,
        c.id   AS client_id,
        c.name AS client_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE 1=1
    `,i){let e=await w.sql`
        SELECT
          i.id,
          i.invoice_number,
          i.status,
          i.issue_date,
          i.due_date,
          i.total,
          i.sent_at,
          i.viewed_at,
          i.paid_at,
          c.id   AS client_id,
          c.name AS client_name
        FROM invoices i
        JOIN clients c ON c.id = i.client_id
        WHERE i.status = ${i}
        ORDER BY i.created_at DESC
        LIMIT 100
      `;return E.NextResponse.json({invoices:e})}if(r){let e=await w.sql`
        SELECT
          i.id,
          i.invoice_number,
          i.status,
          i.issue_date,
          i.due_date,
          i.total,
          i.sent_at,
          i.viewed_at,
          i.paid_at,
          c.id   AS client_id,
          c.name AS client_name
        FROM invoices i
        JOIN clients c ON c.id = i.client_id
        WHERE i.client_id = ${Number(r)}
        ORDER BY i.created_at DESC
        LIMIT 100
      `;return E.NextResponse.json({invoices:e})}let a=await w.sql`
      SELECT
        i.id,
        i.invoice_number,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.sent_at,
        i.viewed_at,
        i.paid_at,
        c.id   AS client_id,
        c.name AS client_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      ORDER BY i.created_at DESC
      LIMIT 100
    `;return E.NextResponse.json({invoices:a})}catch(e){return console.error("[admin/invoices] GET failed:",e),E.NextResponse.json({error:"Failed to load invoices"},{status:500})}}e.s(["GET",0,g],89942);var C=e.i(89942);let S=new t.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/admin/invoices/route",pathname:"/api/admin/invoices",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/clients/absolute-pest-services/code/AbsolutePestServices.com/app/api/admin/invoices/route.ts",nextConfigOutput:"",userland:C}),{workAsyncStorage:y,workUnitAsyncStorage:N,serverHooks:b}=S;async function A(e,t,r){r.requestMeta&&(0,a.setRequestMeta)(e,r.requestMeta),S.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let E="/api/admin/invoices/route";E=E.replace(/\/index$/,"")||"/";let _=await S.prepare(e,t,{srcPage:E,multiZoneDraftMode:!1});if(!_)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:w,params:f,nextConfig:g,parsedUrl:C,isDraftMode:y,prerenderManifest:N,routerServerContext:b,isOnDemandRevalidate:A,revalidateOnlyGenerated:q,resolvedPathname:O,clientReferenceManifest:T,serverActionsManifest:I}=_,k=(0,o.normalizeAppPath)(E),P=!!(N.dynamicRoutes[k]||N.routes[O]),j=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,C,!1):t.end("This page could not be found"),null);if(P&&!y){let e=!!N.routes[O],t=N.dynamicRoutes[k];if(t&&!1===t.fallback&&!e){if(g.adapterPath)return await j();throw new h.NoFallbackError}}let M=null;!P||S.isDev||y||(M="/index"===(M=O)?"/":M);let H=!0===S.isDev||!P,D=P&&!H;I&&T&&(0,s.setManifestsSingleton)({page:E,clientReferenceManifest:T,serverActionsManifest:I});let U=e.method||"GET",F=(0,n.getTracer)(),L=F.getActiveScopeSpan(),$=!!(null==b?void 0:b.isWrappedByNextServer),B=!!(0,a.getRequestMeta)(e,"minimalMode"),K=(0,a.getRequestMeta)(e,"incrementalCache")||await S.getIncrementalCache(e,g,N,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let W={params:f,previewProps:N.preview,renderOpts:{experimental:{authInterrupts:!!g.experimental.authInterrupts},cacheComponents:!!g.cacheComponents,supportsDynamicResponse:H,incrementalCache:K,cacheLifeProfiles:g.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,i,r,a)=>S.onRequestError(e,t,r,a,b)},sharedContext:{buildId:w}},G=new l.NodeNextRequest(e),z=new l.NodeNextResponse(t),J=d.NextRequestAdapter.fromNodeNextRequest(G,(0,d.signalFromNodeResponse)(t));try{let a,s=async e=>S.handle(J,W).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let i=F.getRootSpanAttributes();if(!i)return;if(i.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${i.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=i.get("next.route");if(r){let t=`${U} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",r),a.updateName(t))}else e.updateName(`${U} ${E}`)}),o=async a=>{var n,o;let l=async({previousCacheEntry:i})=>{try{if(!B&&A&&q&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(a);e.fetchMetrics=W.renderOpts.fetchMetrics;let o=W.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let l=W.renderOpts.collectedTags;if(!P)return await (0,p.sendResponse)(G,z,n,W.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,x.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[R.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let i=void 0!==W.renderOpts.collectedRevalidate&&!(W.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&W.renderOpts.collectedRevalidate,r=void 0===W.renderOpts.collectedExpire||W.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:W.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:i,expire:r}}}}catch(t){throw(null==i?void 0:i.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:A})},!1,b),t}},d=await S.handleResponse({req:e,nextConfig:g,cacheKey:M,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:q,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:B});if(!P)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(o=d.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",A?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),y&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,x.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&P||u.delete(R.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,v.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(G,z,new Response(d.value.body,{headers:u,status:d.value.status||200})),null};$&&L?await o(L):(a=F.getActiveScopeSpan(),await F.withPropagatedContext(e.headers,()=>F.trace(u.BaseServerSpan.handleRequest,{spanName:`${U} ${E}`,kind:n.SpanKind.SERVER,attributes:{"http.method":U,"http.target":e.url}},o),void 0,!$))}catch(t){if(t instanceof h.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:k,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:A})},!1,b),P)throw t;return await (0,p.sendResponse)(G,z,new Response(null,{status:500})),null}}e.s(["handler",0,A,"patchFetch",0,function(){return(0,r.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:N})},"routeModule",0,S,"serverHooks",0,b,"workAsyncStorage",0,y,"workUnitAsyncStorage",0,N],63067)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0xpha56._.js.map