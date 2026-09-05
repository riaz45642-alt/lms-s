import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useRouter } from '../router/Router'
import { errorMessage } from '../services/api'
import './ConnectedLms.css'

const META = {
  courses: ['fox','Fox Trail Courses','Pick a trail, learn at your pace, and celebrate every lesson.','🦊'],
  workbooks: ['panda','Panda’s Workbooks','Big, friendly practice collections for curious minds.','🐼'],
  quizzes: ['dino','Dino Activity Park','Play, think, answer, and roar when you get it right!','🦖'],
  messages: ['robot','Robot Message Station','Safe conversations with your learning team.','🤖'],
  notifications: ['robot','Robot News Desk','Helpful updates from around your learning world.','🤖'],
  calendar: ['astronaut','Mission Calendar','Classes, deadlines, and special learning missions.','🚀'],
  certificates: ['astronaut','Achievement Galaxy','Every certificate is a star you earned.','🚀'],
  saved: ['astronaut','My Saved Stars','Bookmarks, favorites, and wishes in one safe place.','🚀'],
  admin: ['robot','People & Roles','Manage the EduSphere community safely.','🤖'],
  classes: ['fox','Class Treehouse','Teachers, learners, and subjects learning together.','🦊'],
  subjects: ['fox','Subject Forest','Explore every branch of learning.','🦊'],
  billing: ['panda','Choose Your Learning Pack','Clear plan choices—with payment connection coming next.','🐼'],
  bundles: ['panda','Panda’s Worksheet Bundles','Hand-picked practice packs for focused learning.','🐼'],
}

function State({ loading, error, empty, retry }) {
  if (loading) return <div className="lms-state" role="status"><span className="spinner"/>Gathering your learning treasures…</div>
  if (error) return <div className="lms-state error" role="alert"><strong>That path had a wobble.</strong><span>{error}</span><button onClick={retry}>Try again</button></div>
  if (empty) return <div className="lms-state"><span className="state-face">🌱</span><strong>Nothing here yet</strong><span>Your next learning adventure will appear here.</span></div>
  return null
}

export default function ConnectedLms({ type, id, savedKind='bookmark' }) {
  const { api, user } = useApp(); const { navigate } = useRouter(); const meta=META[type]||META.courses
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[refresh,setRefresh]=useState(0)
  const endpoint=useMemo(()=>{
    if(type==='bundles') return id?`/worksheet-bundles/${id}`:'/worksheet-bundles'
    if(type==='saved') return `/content-items?kind=${savedKind}`
    if(type==='admin') return '/admin/users'
    if(type==='calendar') return '/calendar-events'
    if(type==='notifications') return '/notifications'
    if(type==='certificates') return '/certificates'
    if(type==='billing') return '/billing/plans'
    if(type==='classes'||type==='subjects'||type==='messages') return `/${type}`
    return `/${type}${id?`/${id}`:''}`
  },[type,id,savedKind])
  useEffect(()=>{let live=true;setLoading(true);setError('');api.get(endpoint).then(r=>live&&setData(r.data)).catch(e=>live&&setError(errorMessage(e))).finally(()=>live&&setLoading(false));return()=>{live=false}},[endpoint,refresh])
  const items=Array.isArray(data)?data:(data?.data||[])
  const visible=items.filter(x=>!query||JSON.stringify(x).toLowerCase().includes(query.toLowerCase()))
  const again=()=>setRefresh(x=>x+1)
  const toggle=async(kind,content_type,content_id)=>{try{await api.post('/content-items/toggle',{kind,content_type,content_id});}catch(e){setError(errorMessage(e))}}

  if(id&&['courses','workbooks','quizzes','bundles'].includes(type)) return <Detail type={type} data={data} loading={loading} error={error} retry={again}/>
  return <main className={`connected-lms world-${meta[0]}`}>
    <section className="lms-hero"><div><span className="lms-eyebrow">EduSphere adventure</span><h1>{meta[1]}</h1><p>{meta[2]}</p></div><div className="lms-mascot" aria-hidden="true">{meta[3]}</div></section>
    <div className="lms-toolbar"><label><span className="sr-only">Search this page</span><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${meta[1].toLowerCase()}…`}/></label></div>
    <State loading={loading} error={error} empty={!loading&&!error&&!visible.length} retry={again}/>
    {!loading&&!error&&((user?.role==='admin'&&['courses','workbooks','quizzes','classes','subjects'].includes(type))||(['admin','teacher'].includes(user?.role)&&type==='calendar'))&&<Creator type={type} api={api} onDone={again}/>} 
    {!loading&&!error&&<section className="adventure-grid">
      {type==='admin'&&visible.map(x=><UserCard key={x.id} item={x} api={api} onDone={again}/>) }
      {type==='messages'&&<Messages items={visible} api={api} onDone={again}/>} 
      {type==='billing'&&visible.map(x=><Plan key={x.id} item={x} api={api} user={user}/>) }
      {!['admin','messages','billing'].includes(type)&&visible.map((x,i)=><article className="adventure-card" key={x.id||i}>
        <div className="card-sticker" aria-hidden="true">{meta[3]}</div><div className="card-copy"><span className="card-kicker">{x.subject||x.event_type||x.content_type||x.role||'EduSphere'}</span><h2>{x.title||x.name||x.course_title||x.subject||`${x.action||x.kind} ${x.content_type||''}`}</h2>
        <p>{x.description||x.summary||x.grade_level||x.code||x.data||'A new part of your learning journey.'}</p>
        {x.progress!=null&&<div className="kid-progress" aria-label={`${x.progress}% complete`}><span style={{width:`${x.progress}%`}}/></div>}
        <div className="card-actions">
          {['courses','workbooks','quizzes','bundles'].includes(type)&&<button onClick={()=>navigate(`/${type==='quizzes'?'activities':type}/${x.id}`)}>Explore</button>}
          {['courses','workbooks','quizzes','bundles'].includes(type)&&<button className="round" aria-label="Add bookmark" onClick={()=>toggle('bookmark',type==='quizzes'?'quiz':type.slice(0,-1),x.id)}>☆</button>}
          {type==='notifications'&&!x.read_at&&<button onClick={async()=>{await api.patch(`/notifications/${x.id}/read`);again()}}>Mark read</button>}
        </div></div></article>)}
    </section>}
  </main>
}

function Detail({type,data,loading,error,retry}){
  const {api}=useApp();const [result,setResult]=useState(null),[answers,setAnswers]=useState({}),[busy,setBusy]=useState(false),[local,setLocal]=useState(data),[notice,setNotice]=useState('')
  useEffect(()=>setLocal(data),[data]);if(loading||error||!local)return <main className="connected-lms"><State loading={loading} error={error} retry={retry}/></main>
  const complete=async lesson=>{setBusy(true);try{await api.post(`/lessons/${lesson.id}/complete`);retry()}finally{setBusy(false)}}
  const enroll=async()=>{setBusy(true);setNotice('');try{const {data:response}=await api.post(`/courses/${local.id}/enroll`);setNotice(response.message);retry()}catch(e){setNotice(errorMessage(e))}finally{setBusy(false)}}
  const submit=async()=>{setBusy(true);try{const r=await api.post(`/quizzes/${local.id}/attempts`,{answers});setResult(r.data)}catch(e){setResult({error:errorMessage(e)})}finally{setBusy(false)}}
  const courseProgress=local.enrollment?.progress
  return <main className={`connected-lms world-${type==='quizzes'?'dino':type==='courses'?'fox':'panda'}`}><section className="detail-banner"><button onClick={()=>history.back()}>← Back</button><h1>{local.title}</h1><p>{local.description||local.summary}</p>{courseProgress!=null&&<div className="kid-progress" aria-label={`${courseProgress}% complete`}><span style={{width:`${courseProgress}%`}}/></div>}{type==='courses'&&!local.enrollment&&<button className="big-action" disabled={busy} onClick={enroll}>Enroll in this course</button>}{notice&&<p role="status">{notice}</p>}</section>
    {type==='courses'&&<section className="lesson-path">{local.lessons?.map((l,i)=><article key={l.id} className={l.completed_at?'done':''}><span>{l.completed_at?'✓':i+1}</span><div><h2>{l.title}</h2><p>{l.summary}</p><div className="lesson-content">{l.content}</div></div><button disabled={busy||l.completed_at} onClick={()=>complete(l)}>{l.completed_at?'Completed':'Mark complete'}</button></article>)}</section>}
    {(type==='workbooks'||type==='bundles')&&<section className="lesson-path">{local.worksheets?.map((w,i)=><article key={w.id}><span>{i+1}</span><div><h2>{w.title}</h2><p>{w.subject} · {w.grade_level}</p></div><a className="action-link" href={`/api/worksheets/${w.id}/download`}>Print / download</a></article>)}</section>}
    {type==='quizzes'&&<section className="quiz-play">{local.questions?.map((q,i)=><fieldset key={q.id}><legend><span>{i+1}</span>{q.prompt}</legend>{q.options.map(o=><label key={o}><input type="radio" name={`q-${q.id}`} value={o} checked={answers[q.id]===o} onChange={()=>setAnswers({...answers,[q.id]:o})}/><span>{o}</span></label>)}</fieldset>)}<button className="big-action" disabled={busy||result} onClick={submit}>Check my answers</button>{result&&<div className={`quiz-result ${result.passed?'passed':''}`} role="status">{result.error||`${result.percentage}% — ${result.passed?'Dino-tastic! You passed!':'Good try! Review and roar again.'}`}</div>}</section>}
  </main>
}

function UserCard({item,api,onDone}){const [busy,setBusy]=useState(false);const save=async field=>{setBusy(true);try{await api.patch(`/admin/users/${item.id}`,field);onDone()}finally{setBusy(false)}};return <article className="adventure-card"><div className="avatar-dot">{item.name?.[0]}</div><div className="card-copy"><h2>{item.name}</h2><p>{item.email}</p><label>Role<select disabled={busy} value={item.role} onChange={e=>save({role:e.target.value})}>{['student','teacher','parent','admin'].map(r=><option key={r}>{r}</option>)}</select></label><button disabled={busy} onClick={()=>save({status:item.status==='active'?'suspended':'active'})}>{item.status==='active'?'Suspend':'Reactivate'}</button></div></article>}
function Messages({items,api,onDone}){const [form,setForm]=useState({recipient_id:'',subject:'',body:''}),[error,setError]=useState('');const send=async e=>{e.preventDefault();try{await api.post('/messages',form);setForm({recipient_id:'',subject:'',body:''});onDone()}catch(x){setError(errorMessage(x))}};return <><form className="message-compose" onSubmit={send}><h2>New safe message</h2>{error&&<p role="alert">{error}</p>}<label>Recipient user ID<input type="number" required value={form.recipient_id} onChange={e=>setForm({...form,recipient_id:e.target.value})}/></label><label>Subject<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label>Message<textarea required value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><button>Send message</button></form>{items.map(x=><article className="message-bubble" key={x.id}><strong>{x.sender?.name} → {x.recipient?.name}</strong><span>{x.subject}</span><p>{x.body}</p><time>{new Date(x.created_at).toLocaleString()}</time></article>)}</>}
function Plan({item,api,user}){const [state,setState]=useState('');const choose=async()=>{if(!user){setState('Please sign in first.');return}try{const r=await api.post('/billing/interests',{billing_plan_id:item.id});setState(r.data.message)}catch(e){setState(errorMessage(e))}};return <article className="plan-card"><span>Learning pack</span><h2>{item.name}</h2><div className="price">{new Intl.NumberFormat(undefined,{style:'currency',currency:item.currency}).format(item.price_cents/100)}<small>/{item.interval}</small></div><p>{item.description}</p><ul>{(typeof item.features==='string'?JSON.parse(item.features):item.features||[]).map(f=><li key={f}>✓ {f}</li>)}</ul><button onClick={choose}>Choose this pack</button>{state&&<p role="status">{state}</p>}<small>Payment processing is not connected yet.</small></article>}
function Creator({type,api,onDone}){const [open,setOpen]=useState(false),[form,setForm]=useState({title:'',name:'',code:'',subject:'',grade_level:'',academic_year:new Date().getFullYear().toString(),description:'',difficulty:'beginner',prompt:'',options:'',correct_answer:'',starts_at:'',event_type:'event'}),[error,setError]=useState(''),[busy,setBusy]=useState(false)
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{let endpoint=`/${type}`,payload={...form,is_published:true};if(type==='classes')payload={name:form.name,code:form.code,grade_level:form.grade_level,academic_year:form.academic_year};if(type==='subjects')payload={name:form.name,code:form.code,description:form.description};if(type==='quizzes')payload={title:form.title,description:form.description,subject:form.subject,grade_level:form.grade_level,difficulty:form.difficulty,is_published:true,questions:[{prompt:form.prompt,options:form.options.split(',').map(x=>x.trim()).filter(Boolean),correct_answer:form.correct_answer,points:1}]};if(type==='calendar')endpoint='/calendar-events',payload={title:form.title,description:form.description,event_type:form.event_type,starts_at:form.starts_at};await api.post(endpoint,payload);setOpen(false);onDone()}catch(x){setError(errorMessage(x))}finally{setBusy(false)}}
  return <section className="creator"><button onClick={()=>setOpen(!open)}>{open?'Close creator':`＋ Create ${type.slice(0,-1)}`}</button>{open&&<form className="message-compose" onSubmit={submit}>{error&&<p role="alert">{error}</p>}{['classes','subjects'].includes(type)?<><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Code<input required value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/></label></>:<label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>}{!['classes'].includes(type)&&<label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>}{['courses','workbooks','quizzes','classes'].includes(type)&&<label>Grade level<input required={type==='classes'} value={form.grade_level} onChange={e=>setForm({...form,grade_level:e.target.value})}/></label>}{['workbooks','quizzes'].includes(type)&&<label>Subject<input required={type==='workbooks'} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label>}{type==='classes'&&<label>Academic year<input required value={form.academic_year} onChange={e=>setForm({...form,academic_year:e.target.value})}/></label>}{type==='quizzes'&&<><label>Question<input required value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})}/></label><label>Options (comma separated)<input required value={form.options} onChange={e=>setForm({...form,options:e.target.value})}/></label><label>Correct answer<input required value={form.correct_answer} onChange={e=>setForm({...form,correct_answer:e.target.value})}/></label></>}{type==='calendar'&&<><label>Type<select value={form.event_type} onChange={e=>setForm({...form,event_type:e.target.value})}>{['event','class','assignment','deadline'].map(x=><option key={x}>{x}</option>)}</select></label><label>Starts at<input type="datetime-local" required value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/></label></>}<button disabled={busy}>{busy?'Saving…':'Save'}</button></form>}</section>}
