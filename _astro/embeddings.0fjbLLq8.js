var g={};const c="https://open.bigmodel.cn/api/paas/v4";function s(){return typeof window>"u"}function u(){return g.ZHIPU_API_KEY||""}async function d(){return null}async function l(r,n){const e=await fetch(r,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});return e.ok?await e.json():null}async function f(r){if(!s())return null;const n=u();if(!n)return null;try{const e=await fetch(`${c}/embeddings`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:"embedding-3",input:[r]})});return e.ok?(await e.json()).data?.[0]?.embedding??null:(console.error("Embedding API error:",e.status),null)}catch(e){return console.error("Embedding generation failed:",e),null}}async function m(r,n=5){if(!s())return(await l("/api/knowledge/search",{query:r,matchCount:n}))?.results||[];const e=await f(r);if(!e)return[];const o=await d();if(!o)return[];try{const{data:a,error:t}=await o.rpc("match_knowledge_entries",{query_embedding:e,match_count:n,filter_category:null});return t?(console.error("Vector search error:",t),[]):a||[]}catch(a){return console.error("Vector search failed:",a),[]}}async function w(r){if(!s())return l("/api/knowledge/ask",{question:r});const n=await m(r,3);if(n.length===0)return{answer:"未找到相关知识条目。",sources:[]};const e=u();if(!e)return{answer:"AI 问答功能未配置。",sources:n};const a=`你是 Life Ledger OS 知识库的 AI 助手。根据以下知识条目回答用户问题。

规则：
1. 只能基于提供的知识条目回答，不要编造内容
2. 引用来源时使用 [1]、[2]、[3] 格式，必须对应下方条目编号
3. 如果知识条目中没有相关信息，请诚实说明
4. 用中文回答，简洁明了，可以使用 markdown

知识条目：
${n.map((t,i)=>`[${i+1}] ${t.title} - category: ${t.category}, slug: ${t.slug}
${t.wiki_content||t.summary||""}`).join(`

---

`)}`;try{const t=await fetch(`${c}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"glm-4-flash",messages:[{role:"system",content:a},{role:"user",content:r}],temperature:.7,max_tokens:1024})});return t.ok?{answer:(await t.json()).choices?.[0]?.message?.content||"无法生成回答。",sources:n}:(console.error("Chat API error:",t.status),{answer:"AI 问答暂时不可用。",sources:n})}catch(t){return console.error("Q&A failed:",t),{answer:"AI 问答请求失败。",sources:n}}}async function y(r,n){if(!s())return!1;const e=await f(n);if(!e)return!1;const o=await d();if(!o)return!1;try{const{error:a}=await o.from("knowledge_entries").update({embedding:e}).eq("id",r);return!a}catch{return!1}}export{w as askKnowledgeQuestion,f as generateEmbedding,m as searchKnowledge,y as updateEntryEmbedding};
