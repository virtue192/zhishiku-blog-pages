import{_ as k}from"./preload-helper.4mdWZyVN.js";import{d as u,y as f}from"./hooks.module.BMcXyVA6.js";import{i as m}from"./auth.DIYeHEE3.js";const p={ai:{label:"AI",color:"text-blue-500 bg-blue-50 dark:bg-blue-900/20"},tools:{label:"工具",color:"text-amber-600 bg-amber-50 dark:bg-amber-900/20"},thinking:{label:"思考",color:"text-purple-500 bg-purple-50 dark:bg-purple-900/20"},life:{label:"生活",color:"text-green-600 bg-green-50 dark:bg-green-900/20"},uncategorized:{label:"未分类",color:"text-gray-500 bg-gray-50 dark:bg-gray-800"}};function y(e){return p[e]||p.uncategorized}const v=Object.entries(p).map(([e,{label:i}])=>({id:e,label:i}));let r=null,l=null;const s=[{id:"k1",title:"Obsidian + Codex 双层知识库",slug:"obsidian-codex-knowledge-base",raw_content:`## 原始笔记

Obsidian 用于快速捕捉想法，Codex 用于 AI 增强处理。两层架构：raw 层保留原始思维碎片，wiki 层是经过 AI 整理的结构化知识。`,wiki_content:`## 知识库架构

### Raw 层（原始层）
- 保留原始笔记、想法碎片
- 使用 Obsidian vault 管理
- 支持 Markdown 双向链接

### Wiki 层（百科层）
- AI 处理后的结构化知识
- 标签分类 + 知识图谱连接
- 可对外展示的知识页面

### 同步机制
1. Obsidian 写入 → git push
2. 构建脚本解析 Markdown frontmatter
3. 写入 Supabase knowledge_entries 表
4. AI 按需将 raw_content 转为 wiki_content`,summary:"Obsidian + Codex 构建的双层知识库架构，raw 层保留原始笔记，wiki 层为 AI 增强的结构化知识",tags:["obsidian","knowledge-management","ai","codex"],connections:["ai-prompt-engineering","personal-knowledge-system"],category:"tools",status:"published",is_active:!0,published_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{id:"k2",title:"AI Prompt 工程设计模式",slug:"ai-prompt-engineering",raw_content:`## 原始笔记

Prompt 设计的核心原则：清晰指令、上下文丰富、分步骤推理。常见模式包括 Few-shot、Chain-of-Thought、ReAct。`,wiki_content:`## Prompt 工程设计模式

### 核心原则
1. **清晰指令**：明确任务目标与输出格式
2. **上下文丰富**：提供充分背景信息
3. **分步推理**：将复杂任务拆解为子步骤

### 常见设计模式
- **Few-shot Learning**：通过示例引导模型理解任务
- **Chain-of-Thought (CoT)**：引导模型逐步推理
- **ReAct**：结合推理与行动的迭代循环
- **Self-Consistency**：多次采样取一致答案

### 反模式
- 过长的 System Prompt 导致注意力稀释
- 忽略模型的 instruction-following 倾向
- 单次对话承载过多任务`,summary:"Prompt 工程的设计模式与反模式系统整理，涵盖 Few-shot、CoT、ReAct 等核心方法",tags:["ai","prompt-engineering","design-patterns"],connections:["obsidian-codex-knowledge-base"],category:"ai",status:"published",is_active:!0,published_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{id:"k3",title:"个人知识管理系统设计",slug:"personal-knowledge-system",raw_content:`## 原始笔记

知识管理的核心不是工具，而是流程。从收集 → 整理 → 连接 → 输出的闭环。`,wiki_content:`## 个人知识管理系统

### 核心流程
\`\`\`
收集 → 整理 → 连接 → 输出
  ↑                        ↓
  ←←← 反馈与迭代 ←←←←←←←
\`\`\`

### 工具链
- **收集**：Obsidian Quick Add、手机备忘录
- **整理**：Obsidian + AI 辅助分类
- **连接**：双向链接 + 知识图谱
- **输出**：博客文章、项目文档、社交分享

### 设计哲学
- 工具服务于流程，不是反过来
- 低摩擦输入，高价值输出
- 知识的价值在于连接，而非囤积`,summary:"个人知识管理系统的设计与实施，从工具选择到流程优化",tags:["knowledge-management","obsidian","productivity","workflow"],connections:["obsidian-codex-knowledge-base","ai-prompt-engineering"],category:"thinking",status:"published",is_active:!0,published_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{id:"k4",title:"深度工作与注意力管理",slug:"deep-work-attention",raw_content:`## 原始笔记

Cal Newport 的深度工作理论。在碎片化时代，专注力是稀缺资源。Time blocking 是最有效的方法之一。`,wiki_content:`## 深度工作实践指南

### 理论基础
Cal Newport 提出的深度工作（Deep Work）概念：
> 在无干扰状态下进行的专业活动，使你的认知能力达到极限。

### 实践方法
1. **Time Blocking**：预先规划每一天的时间块
2. **环境设计**：消除干扰源
3. **仪式感**：固定的深度工作启动流程
4. **度量追踪**：记录每日深度工作时长

### 与 Life Ledger OS 的关联
本站首页的 Time Events 24h 时间轴，正是深度工作理论的数字化实践——将时间分配可视化。`,summary:"基于 Cal Newport 理论的深度工作实践，专注力管理与时间块方法",tags:["deep-work","attention","productivity","time-management"],connections:["personal-knowledge-system"],category:"thinking",status:"published",is_active:!0,published_at:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()}];async function g(){return null}function w(){r=null,l=null}async function b(e){const i=m.value;return r||l||(l=(async()=>{const a=await g();if(!a)return r=s,r;try{let t=a.from("knowledge_entries").select("*").eq("is_active",!0).order("published_at",{ascending:!1});i||(t=t.eq("status","published"));const{data:n}=await t;return r=n?.length?n:s,r}catch{return r=s,r}})(),l)}async function S(e){return(await b()).find(a=>a.slug===e)??null}function E(){const[e,i]=u(null),[a,t]=u(!0);return f(()=>{b().then(n=>{i(n),t(!1)})},[m.value]),{entries:e,loading:a}}function A(e){const[i,a]=u(null),[t,n]=u(!0);return f(()=>{n(!0),S(e).then(o=>{a(o),n(!1)})},[e,m.value]),{entry:i,loading:t}}async function D(e){const i=await g();if(!i){const t=!e.id||e.id.startsWith("new-"),n=new Date().toISOString();if(!t&&e.id){const o=s.findIndex(_=>_.id===e.id);o>=0&&(s[o]={...s[o],...e,updated_at:n})}else{const o={id:e.id||`k-${Date.now()}`,title:e.title,slug:e.slug,raw_content:e.raw_content||"",wiki_content:e.wiki_content||"",summary:e.summary||"",tags:e.tags||[],connections:e.connections||[],category:e.category||"uncategorized",status:e.status||"draft",is_active:!0,published_at:n,created_at:n,updated_at:n};s.push(o)}return w(),!0}try{if(!e.id||e.id.startsWith("new-")){const{id:n,created_at:o,updated_at:_,...d}=e,{error:c}=await i.from("knowledge_entries").insert({...d,is_active:!0,status:d.status||"draft",tags:d.tags||[],connections:d.connections||[],created_at:new Date().toISOString(),updated_at:new Date().toISOString()});if(c)return console.error("Save error:",c),!1}else{const{id:n,created_at:o,updated_at:_,...d}=e,{error:c}=await i.from("knowledge_entries").update({...d,updated_at:new Date().toISOString()}).eq("id",e.id);if(c)return console.error("Save error:",c),!1}return w(),!0}catch(t){return console.error("Save exception:",t),!1}const a=e.wiki_content||e.raw_content||e.summary||e.title;a&&k(async()=>{const{updateEntryEmbedding:t}=await import("./embeddings.0fjbLLq8.js");return{updateEntryEmbedding:t}},[]).then(({updateEntryEmbedding:t})=>{g().then(async n=>{if(n)try{const{data:o}=await n.from("knowledge_entries").select("id").eq("slug",e.slug).single();o?.id&&t(o.id,a)}catch{}})}).catch(()=>{})}async function x(e){const i=await g();if(!i){const a=s.findIndex(t=>t.id===e);return a>=0&&s.splice(a,1),w(),!0}try{const{error:a}=await i.from("knowledge_entries").delete().eq("id",e);return a?!1:(w(),!0)}catch{return!1}}export{v as A,E as a,x as d,b as f,y as g,w as i,D as s,A as u};
