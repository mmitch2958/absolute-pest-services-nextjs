module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},66680,(e,t,r)=>{t.exports=e.x("node:crypto",()=>require("node:crypto"))},27699,(e,t,r)=>{t.exports=e.x("events",()=>require("events"))},24836,(e,t,r)=>{t.exports=e.x("https",()=>require("https"))},21517,(e,t,r)=>{t.exports=e.x("http",()=>require("http"))},4446,(e,t,r)=>{t.exports=e.x("net",()=>require("net"))},55004,(e,t,r)=>{t.exports=e.x("tls",()=>require("tls"))},54799,(e,t,r)=>{t.exports=e.x("crypto",()=>require("crypto"))},88947,(e,t,r)=>{t.exports=e.x("stream",()=>require("stream"))},92509,(e,t,r)=>{t.exports=e.x("url",()=>require("url"))},6461,(e,t,r)=>{t.exports=e.x("zlib",()=>require("zlib"))},874,(e,t,r)=>{t.exports=e.x("buffer",()=>require("buffer"))},83562,e=>{"use strict";var t=e.i(56401),r=e.i(93454);async function a(){return await (0,t.getIronSession)(await (0,r.cookies)(),{password:process.env.SESSION_SECRET,cookieName:"aps_admin_session",cookieOptions:{httpOnly:!0,secure:!0,sameSite:"lax"}})}e.s(["getAdminSession",0,a])},51179,e=>{"use strict";var t=e.i(60071),r=e.i(60074),a=e.i(74708),n=e.i(2268),s=e.i(17317),o=e.i(23829),i=e.i(75791),l=e.i(43895),d=e.i(82256),p=e.i(22576),u=e.i(37511),c=e.i(54879),m=e.i(31338),E=e.i(86036),x=e.i(52060),R=e.i(93695);e.i(70367);var h=e.i(26748),f=e.i(45864),j=e.i(83562),_=e.i(74160);async function g(){let e=await (0,j.getAdminSession)();return e.userId&&"admin"===e.role?null:f.NextResponse.json({error:"Unauthorized"},{status:401})}async function v(e){let t=await g();if(t)return t;try{let t,{searchParams:r}=new URL(e.url),a=r.get("search")||"",n=r.get("status")||"",s=r.get("dateFrom")||"",o=r.get("dateTo")||"";if(a.trim()){let e=`%${a.trim()}%`;t=await _.sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE (
          jl.customer_name ILIKE ${e}
          OR jl.site_location ILIKE ${e}
          OR jl.serviced_area ILIKE ${e}
          OR jl.work_performed ILIKE ${e}
        )
        ORDER BY jl.job_date DESC
        LIMIT 200
      `}else t=n&&s&&o?await _.sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE jl.status = ${n}
          AND DATE(jl.job_date) >= ${s}
          AND DATE(jl.job_date) <= ${o}
        ORDER BY jl.job_date DESC
        LIMIT 200
      `:n?await _.sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE jl.status = ${n}
        ORDER BY jl.job_date DESC
        LIMIT 200
      `:s&&o?await _.sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE DATE(jl.job_date) >= ${s}
          AND DATE(jl.job_date) <= ${o}
        ORDER BY jl.job_date DESC
        LIMIT 200
      `:await _.sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        ORDER BY jl.job_date DESC
        LIMIT 200
      `;let i=await _.sql`SELECT id, name FROM field_employees WHERE is_active = true ORDER BY name`;return f.NextResponse.json({logs:t,employees:i})}catch(e){return console.error("[admin/job-logs] GET error:",e),f.NextResponse.json({error:"Failed to load job logs"},{status:500})}}e.s(["GET",0,v],18256);var y=e.i(18256);let O=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/admin/job-logs/route",pathname:"/api/admin/job-logs",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/clients/absolute-pest-services/code/AbsolutePestServices.com/app/api/admin/job-logs/route.ts",nextConfigOutput:"",userland:y}),{workAsyncStorage:w,workUnitAsyncStorage:b,serverHooks:T}=O;async function N(e,t,a){a.requestMeta&&(0,n.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let f="/api/admin/job-logs/route";f=f.replace(/\/index$/,"")||"/";let j=await O.prepare(e,t,{srcPage:f,multiZoneDraftMode:!1});if(!j)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:_,params:g,nextConfig:v,parsedUrl:y,isDraftMode:w,prerenderManifest:b,routerServerContext:T,isOnDemandRevalidate:N,revalidateOnlyGenerated:S,resolvedPathname:A,clientReferenceManifest:C,serverActionsManifest:I}=j,q=(0,i.normalizeAppPath)(f),D=!!(b.dynamicRoutes[q]||b.routes[A]),L=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,y,!1):t.end("This page could not be found"),null);if(D&&!w){let e=!!b.routes[A],t=b.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(v.adapterPath)return await L();throw new R.NoFallbackError}}let F=null;!D||O.isDev||w||(F="/index"===(F=A)?"/":F);let M=!0===O.isDev||!D,k=D&&!M;I&&C&&(0,o.setManifestsSingleton)({page:f,clientReferenceManifest:C,serverActionsManifest:I});let P=e.method||"GET",H=(0,s.getTracer)(),$=H.getActiveScopeSpan(),U=!!(null==T?void 0:T.isWrappedByNextServer),B=!!(0,n.getRequestMeta)(e,"minimalMode"),K=(0,n.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,v,b,B);null==K||K.resetRequestCache(),globalThis.__incrementalCache=K;let J={params:g,previewProps:b.preview,renderOpts:{experimental:{authInterrupts:!!v.experimental.authInterrupts},cacheComponents:!!v.cacheComponents,supportsDynamicResponse:M,incrementalCache:K,cacheLifeProfiles:v.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>O.onRequestError(e,t,a,n,T)},sharedContext:{buildId:_}},W=new l.NodeNextRequest(e),Y=new l.NodeNextResponse(t),G=d.NextRequestAdapter.fromNodeNextRequest(W,(0,d.signalFromNodeResponse)(t));try{let n,o=async e=>O.handle(G,J).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=H.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=r.get("next.route");if(a){let t=`${P} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t),n&&n!==e&&(n.setAttribute("http.route",a),n.updateName(t))}else e.updateName(`${P} ${f}`)}),i=async n=>{var s,i;let l=async({previousCacheEntry:r})=>{try{if(!B&&N&&S&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(n);e.fetchMetrics=J.renderOpts.fetchMetrics;let i=J.renderOpts.pendingWaitUntil;i&&a.waitUntil&&(a.waitUntil(i),i=void 0);let l=J.renderOpts.collectedTags;if(!D)return await (0,c.sendResponse)(W,Y,s,J.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[x.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==J.renderOpts.collectedRevalidate&&!(J.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&J.renderOpts.collectedRevalidate,a=void 0===J.renderOpts.collectedExpire||J.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:J.renderOpts.collectedExpire;return{value:{kind:h.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:a}}}}catch(t){throw(null==r?void 0:r.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:f,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:N})},!1,T),t}},d=await O.handleResponse({req:e,nextConfig:v,cacheKey:F,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:S,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:B});if(!D)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==h.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});B||t.setHeader("x-nextjs-cache",N?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,m.fromNodeOutgoingHttpHeaders)(d.value.headers);return B&&D||p.delete(x.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,E.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(W,Y,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};U&&$?await i($):(n=H.getActiveScopeSpan(),await H.withPropagatedContext(e.headers,()=>H.trace(p.BaseServerSpan.handleRequest,{spanName:`${P} ${f}`,kind:s.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},i),void 0,!U))}catch(t){if(t instanceof R.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:N})},!1,T),D)throw t;return await (0,c.sendResponse)(W,Y,new Response(null,{status:500})),null}}e.s(["handler",0,N,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:b})},"routeModule",0,O,"serverHooks",0,T,"workAsyncStorage",0,w,"workUnitAsyncStorage",0,b],51179)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0qkivzb._.js.map