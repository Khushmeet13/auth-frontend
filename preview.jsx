import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────
type Page = "login"|"register"|"magic-link"|"mfa"|"passkey"|"oauth-callback"|"forgot-password"|"verify-email"|"dashboard";

// ─── Shared helpers ──────────────────────────────────────────────
function Glow() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div style={{position:"absolute",top:"-15%",right:"10%",width:420,height:420,borderRadius:"50%",background:"rgba(124,58,237,0.07)",filter:"blur(110px)"}}/>
        <div style={{position:"absolute",bottom:"5%",left:"5%",width:320,height:320,borderRadius:"50%",background:"rgba(6,182,212,0.05)",filter:"blur(90px)"}}/>
      </div>
    </>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#22d3ee)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.95"/></svg>
      </div>
      <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)",letterSpacing:"0.02em"}}>AuthSystem</span>
    </div>
  );
}

function Card({children, title, subtitle}:{children:React.ReactNode,title:string,subtitle?:string}) {
  return (
    <div style={{background:"rgba(255,255,255,0.035)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"2rem",backdropFilter:"blur(8px)"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:600,color:"white",letterSpacing:"-0.02em",marginBottom:4}}>{title}</h1>
        {subtitle && <p style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function AuthWrap({children, title, subtitle}:{children:React.ReactNode,title:string,subtitle?:string}) {
  return (
    <div style={{minHeight:"100vh",background:"#09090e",display:"flex",alignItems:"center",justifyContent:"center",padding:16,position:"relative",fontFamily:"'Sora',system-ui,sans-serif"}}>
      <Glow/>
      <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}}>
        <Logo/>
        <Card title={title} subtitle={subtitle}>{children}</Card>
      </div>
    </div>
  );
}

function Inp({label,type="text",placeholder,value,onChange,error,icon,right}:{label:string,type?:string,placeholder?:string,value:string,onChange:(v:string)=>void,error?:string,icon?:React.ReactNode,right?:React.ReactNode}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</label>
      <div style={{position:"relative"}}>
        {icon && <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.25)",display:"flex"}}>{icon}</div>}
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e=>onChange(e.target.value)}
          style={{
            width:"100%",background:"rgba(255,255,255,0.055)",
            border:`1px solid ${error?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)"}`,
            borderRadius:12,padding:"11px 14px",paddingLeft:icon?"40px":"14px",paddingRight:right?"44px":"14px",
            fontSize:13,color:"white",outline:"none",fontFamily:"inherit",boxSizing:"border-box",
          }}
          onFocus={e=>{e.target.style.borderColor=error?"rgba(239,68,68,0.6)":"rgba(139,92,246,0.6)";e.target.style.background="rgba(255,255,255,0.07)";}}
          onBlur={e=>{e.target.style.borderColor=error?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)";e.target.style.background="rgba(255,255,255,0.055)";}}
        />
        {right && <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}>{right}</div>}
      </div>
      {error && <p style={{fontSize:11,color:"rgb(248,113,113)"}}>{error}</p>}
    </div>
  );
}

function Btn({children,onClick,loading,full,variant="primary",disabled}:{children:React.ReactNode,onClick?:()=>void,loading?:boolean,full?:boolean,variant?:"primary"|"outline"|"ghost",disabled?:boolean}) {
  const styles:{[k:string]:React.CSSProperties} = {
    primary:{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"white",border:"none",boxShadow:"0 4px 20px rgba(124,58,237,0.25)"},
    outline:{background:"transparent",color:"rgba(255,255,255,0.75)",border:"1px solid rgba(255,255,255,0.12)"},
    ghost:{background:"transparent",color:"rgba(255,255,255,0.5)",border:"none"},
  };
  return (
    <button
      onClick={onClick} disabled={disabled||loading}
      style={{
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        padding:"11px 18px",borderRadius:12,fontSize:13,fontWeight:500,cursor:"pointer",
        width:full?"100%":undefined,transition:"all 0.15s",opacity:(disabled||loading)?0.45:1,
        fontFamily:"inherit",...styles[variant],
      }}
    >
      {loading && <svg style={{width:14,height:14,animation:"spin 0.8s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
      {children}
    </button>
  );
}

function Divider({label="or"}:{label?:string}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0"}}>
      <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
      <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</span>
      <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
    </div>
  );
}

function OAuthBtns({onGoogle,onGithub,onSAML}:{onGoogle:()=>void,onGithub:()=>void,onSAML?:()=>void}) {
  const btn = (onClick:()=>void, icon:React.ReactNode, label:string) => (
    <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"rgba(255,255,255,0.75)",fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",marginBottom:8}}
      onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.07)";(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.14)"}}
      onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)";(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.08)"}}
    >
      {icon}
      <span style={{flex:1,textAlign:"left"}}>{label}</span>
      <svg style={{width:12,height:12,color:"rgba(255,255,255,0.2)"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
    </button>
  );
  const GoogleIcon = <svg style={{width:16,height:16,flexShrink:0}} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
  const GithubIcon = <svg style={{width:16,height:16,fill:"rgba(255,255,255,0.7)",flexShrink:0}} viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>;
  const SamlIcon = <div style={{width:16,height:16,borderRadius:4,background:"rgba(139,92,246,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg style={{width:10,height:10,fill:"rgba(167,139,250,0.9)"}} viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>;
  return (
    <div>
      {btn(onGoogle, GoogleIcon, "Continue with Google")}
      {btn(onGithub, GithubIcon, "Continue with GitHub")}
      {onSAML && btn(onSAML, SamlIcon, "Continue with SSO / SAML")}
    </div>
  );
}

// ─── Icon helpers ────────────────────────────────────────────────
const EmailIcon = <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const LockIcon = <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>;
const UserIcon = <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const EyeIcon = ({show}:{show:boolean}) => show
  ? <svg style={{width:16,height:16,color:"rgba(255,255,255,0.35)",cursor:"pointer"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
  : <svg style={{width:16,height:16,color:"rgba(255,255,255,0.35)",cursor:"pointer"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;

function BackBtn({onClick}:{onClick:()=>void}) {
  return (
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:4,fontSize:13,color:"rgba(255,255,255,0.3)",background:"none",border:"none",cursor:"pointer",marginTop:20,fontFamily:"inherit"}}>
      <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
      Back to login
    </button>
  );
}

// ─── Pages ───────────────────────────────────────────────────────

function LoginPage({nav}:{nav:(p:Page,e?:string)=>void}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [errs,setErrs]=useState<Record<string,string>>({});

  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    const err:Record<string,string>={};
    if(!email)err.email="Email required";
    else if(!/\S+@\S+\.\S+/.test(email))err.email="Invalid email";
    if(!pass)err.pass="Password required";
    if(Object.keys(err).length){setErrs(err);return;}
    setLoading(true);
    setTimeout(()=>{setLoading(false);nav("mfa",email);},1200);
  };

  return (
    <AuthWrap title="Welcome back" subtitle="Sign in to your account">
      <OAuthBtns onGoogle={()=>nav("oauth-callback")} onGithub={()=>nav("oauth-callback")} onSAML={()=>nav("oauth-callback")}/>
      <Divider/>
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Email" type="email" placeholder="you@example.com" value={email} onChange={v=>{setEmail(v);setErrs(p=>({...p,email:""}))}} error={errs.email} icon={EmailIcon}/>
        <Inp label="Password" type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={v=>{setPass(v);setErrs(p=>({...p,pass:""}))}} error={errs.pass} icon={LockIcon}
          right={<span onClick={()=>setShow(v=>!v)}><EyeIcon show={show}/></span>}/>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button type="button" onClick={()=>nav("forgot-password")} style={{fontSize:12,color:"rgba(167,139,250,1)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Forgot password?</button>
        </div>
        <Btn full loading={loading}>Sign in</Btn>
      </form>
      <Divider label="more options"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[
          {label:"Magic Link",icon:<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,page:"magic-link" as Page,color:"rgba(139,92,246,"},
          {label:"Passkey",icon:<svg style={{width:18,height:18}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.999-4.659.999-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>,page:"passkey" as Page,color:"rgba(6,182,212,"},
        ].map(item=>(
          <button key={item.label} onClick={()=>nav(item.page)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px",borderRadius:12,border:"1px solid rgba(255,255,255,0.07)",background:"transparent",cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit"}}
            onMouseOver={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${item.color}0.3)`;(e.currentTarget as HTMLElement).style.background=`${item.color}0.05)`}}
            onMouseOut={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.07)";(e.currentTarget as HTMLElement).style.background="transparent"}}
          >
            <span style={{color:"rgba(255,255,255,0.3)"}}>{item.icon}</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{item.label}</span>
          </button>
        ))}
      </div>
      <p style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:20}}>
        Don't have an account?{" "}
        <button onClick={()=>nav("register")} style={{color:"rgba(167,139,250,1)",background:"none",border:"none",cursor:"pointer",fontWeight:500,fontFamily:"inherit"}}>Create one</button>
      </p>
    </AuthWrap>
  );
}

function RegisterPage({nav}:{nav:(p:Page,e?:string)=>void}) {
  const [f,setF]=useState({name:"",email:"",password:"",confirm:""});
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [errs,setErrs]=useState<Record<string,string>>({});
  const set=(k:keyof typeof f)=>(v:string)=>setF(p=>({...p,[k]:v}));

  const strength=(()=>{let s=0;const p=f.password;if(p.length>=8)s++;if(/[A-Z]/.test(p))s++;if(/[0-9]/.test(p))s++;if(/[^A-Za-z0-9]/.test(p))s++;return s;})();
  const sColors=["","rgb(239,68,68)","rgb(234,179,8)","rgb(59,130,246)","rgb(34,197,94)"];
  const sLabels=["","Weak","Fair","Good","Strong"];

  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    const err:Record<string,string>={};
    if(!f.name)err.name="Name required";
    if(!f.email||!/\S+@\S+\.\S+/.test(f.email))err.email="Valid email required";
    if(f.password.length<8)err.password="Min 8 characters";
    if(f.password!==f.confirm)err.confirm="Passwords don't match";
    if(Object.keys(err).length){setErrs(err);return;}
    setLoading(true);
    setTimeout(()=>{setLoading(false);nav("verify-email",f.email);},1200);
  };

  return (
    <AuthWrap title="Create account" subtitle="Start building something great">
      <OAuthBtns onGoogle={()=>nav("oauth-callback")} onGithub={()=>nav("oauth-callback")}/>
      <Divider/>
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Full name" placeholder="John Doe" value={f.name} onChange={v=>{set("name")(v);setErrs(p=>({...p,name:""}))}} error={errs.name} icon={UserIcon}/>
        <Inp label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={v=>{set("email")(v);setErrs(p=>({...p,email:""}))}} error={errs.email} icon={EmailIcon}/>
        <div>
          <Inp label="Password" type={show?"text":"password"} placeholder="Min 8 characters" value={f.password} onChange={v=>{set("password")(v);setErrs(p=>({...p,password:""}))}} error={errs.password} icon={LockIcon}
            right={<span onClick={()=>setShow(v=>!v)}><EyeIcon show={show}/></span>}/>
          {f.password && (
            <div style={{marginTop:8}}>
              <div style={{display:"flex",gap:4,marginBottom:4}}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=strength?sColors[strength]:"rgba(255,255,255,0.1)",transition:"all 0.3s"}}/>
                ))}
              </div>
              <p style={{fontSize:11,color:sColors[strength]}}>{sLabels[strength]}</p>
            </div>
          )}
        </div>
        <Inp label="Confirm password" type="password" placeholder="••••••••" value={f.confirm} onChange={v=>{set("confirm")(v);setErrs(p=>({...p,confirm:""}))}} error={errs.confirm} icon={LockIcon}/>
        <Btn full loading={loading}>Create account</Btn>
      </form>
      <p style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.35)",marginTop:20}}>
        Already have an account?{" "}
        <button onClick={()=>nav("login")} style={{color:"rgba(167,139,250,1)",background:"none",border:"none",cursor:"pointer",fontWeight:500,fontFamily:"inherit"}}>Sign in</button>
      </p>
    </AuthWrap>
  );
}

function MFAPage({nav,email}:{nav:(p:Page)=>void,email:string}) {
  const [otp,setOtp]=useState(Array(6).fill(""));
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [countdown,setCountdown]=useState(0);
  const refs=useRef<(HTMLInputElement|null)[]>([]);

  useEffect(()=>{refs.current[0]?.focus();},[]);
  useEffect(()=>{if(countdown>0){const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t);}},[countdown]);

  const change=(i:number,v:string)=>{
    const d=v.replace(/\D/g,"").slice(-1);
    const next=[...otp];next[i]=d;setOtp(next);setError("");
    if(d&&i<5)refs.current[i+1]?.focus();
  };
  const keydown=(i:number,e:React.KeyboardEvent)=>{if(e.key==="Backspace"&&!otp[i]&&i>0)refs.current[i-1]?.focus();};
  const paste=(e:React.ClipboardEvent)=>{
    e.preventDefault();
    const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    const next=Array(6).fill("");p.split("").forEach((d,i)=>{next[i]=d;});
    setOtp(next);refs.current[Math.min(p.length,5)]?.focus();
  };

  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    const code=otp.join("");
    if(code.length<6){setError("Enter all 6 digits");return;}
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      if(code==="123456")nav("dashboard");
      else{setError("Invalid. Try 123456 for demo");setOtp(Array(6).fill(""));refs.current[0]?.focus();}
    },900);
  };

  return (
    <AuthWrap title="Two-factor auth" subtitle="Enter the 6-digit code from your authenticator">
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",marginBottom:20}}>
        {LockIcon}
        <div>
          <p style={{fontSize:11,color:"rgba(167,139,250,1)",fontWeight:500}}>Signing in as</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>{email||"user@example.com"}</p>
        </div>
      </div>
      <form onSubmit={submit}>
        <label style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:10}}>Authenticator code</label>
        <div style={{display:"flex",gap:8,marginBottom:error?8:0}} onPaste={paste}>
          {otp.map((d,i)=>(
            <input key={i} ref={el=>{refs.current[i]=el;}} type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e=>change(i,e.target.value)} onKeyDown={e=>keydown(i,e)}
              style={{flex:1,aspectRatio:"1",textAlign:"center",fontSize:18,fontWeight:600,borderRadius:12,
                background:"rgba(255,255,255,0.055)",border:`1px solid ${error?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)"}`,
                color:d?"white":"rgba(255,255,255,0.2)",outline:"none",fontFamily:"inherit"}}
              onFocus={e=>{e.target.style.borderColor=error?"rgba(239,68,68,0.6)":"rgba(139,92,246,0.6)";e.target.style.background="rgba(255,255,255,0.08)";}}
              onBlur={e=>{e.target.style.borderColor=error?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)";e.target.style.background="rgba(255,255,255,0.055)";}}
            />
          ))}
        </div>
        {error&&<p style={{fontSize:11,color:"rgb(248,113,113)",marginBottom:4}}>{error}</p>}
        <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginBottom:16,marginTop:6}}>Demo: enter 123456</p>
        <Btn full loading={loading} disabled={otp.join("").length<6}>Verify code</Btn>
      </form>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:14}}>
        <span style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>Didn't get a code?</span>
        {countdown>0
          ? <span style={{fontSize:13,color:"rgba(255,255,255,0.25)"}}>Resend in {countdown}s</span>
          : <button onClick={()=>setCountdown(30)} style={{fontSize:13,color:"rgba(167,139,250,1)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Resend code</button>
        }
      </div>
      <BackBtn onClick={()=>nav("login")}/>
    </AuthWrap>
  );
}

function MagicLinkPage({nav}:{nav:(p:Page)=>void}) {
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const submit=(e:React.FormEvent)=>{
    e.preventDefault();
    if(!email||!/\S+@\S+\.\S+/.test(email)){setError("Enter a valid email");return;}
    setLoading(true);setTimeout(()=>{setLoading(false);setSent(true);},1100);
  };

  if(sent) return (
    <AuthWrap title="Check your inbox" subtitle="We sent you a magic link">
      <div style={{textAlign:"center"}}>
        <div style={{position:"relative",display:"inline-block",marginBottom:20}}>
          <div style={{width:72,height:72,borderRadius:18,background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {EmailIcon}
          </div>
          <div style={{position:"absolute",top:-4,right:-4,width:20,height:20,borderRadius:"50%",background:"rgb(34,197,94)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg style={{width:11,height:11}} fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:4}}>Magic link sent to</p>
        <p style={{fontSize:14,color:"white",fontWeight:500,marginBottom:20}}>{email}</p>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:16,textAlign:"left",marginBottom:16}}>
          {["Check your email inbox","Click the magic link","You'll be signed in automatically"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?10:0}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(139,92,246,0.2)",border:"1px solid rgba(139,92,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:10,color:"rgba(167,139,250,1)",fontWeight:700}}>{i+1}</span>
              </div>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.55)"}}>{s}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginBottom:14}}>Link expires in 15 minutes</p>
        <button onClick={()=>{setSent(false);setEmail("");}} style={{fontSize:13,color:"rgba(167,139,250,1)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Use a different email</button>
      </div>
      <BackBtn onClick={()=>nav("login")}/>
    </AuthWrap>
  );

  return (
    <AuthWrap title="Magic link" subtitle="Sign in without a password">
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px",marginBottom:18}}>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)"}}>Enter your email and we'll send a one-click sign-in link. No password needed.</p>
      </div>
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Email address" type="email" placeholder="you@example.com" value={email} onChange={v=>{setEmail(v);setError("");}} error={error} icon={EmailIcon}/>
        <Btn full loading={loading}>Send magic link</Btn>
      </form>
      <BackBtn onClick={()=>nav("login")}/>
    </AuthWrap>
  );
}

function PasskeyPage({nav}:{nav:(p:Page)=>void}) {
  const [step,setStep]=useState<"intro"|"auth"|"done">("intro");
  const start=()=>{setStep("auth");setTimeout(()=>setStep("done"),1800);setTimeout(()=>nav("dashboard"),3000);};
  const FingerprintIcon=<svg style={{width:36,height:36}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.999-4.659.999-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>;

  return (
    <AuthWrap title="Sign in with passkey" subtitle="Use your device biometrics">
      {step==="intro" && (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{width:88,height:88,borderRadius:24,background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:"rgba(34,211,238,0.85)"}}>{FingerprintIcon}</div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Use fingerprint, face, or device PIN to sign in securely. No password required.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {["Fingerprint","Face ID","Device PIN"].map(m=>(
              <div key={m} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"12px 8px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{width:28,height:28,color:"rgba(34,211,238,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {m==="Face ID"?<svg style={{width:22,height:22}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  :m==="Device PIN"?<svg style={{width:22,height:22}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  :<svg style={{width:22,height:22}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.999-4.659.999-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>}
                </div>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{m}</span>
              </div>
            ))}
          </div>
          <Btn full onClick={start}>Continue with passkey</Btn>
          <button onClick={()=>nav("login")} style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.3)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Use password instead</button>
        </div>
      )}
      {step==="auth" && (
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
            <div style={{width:88,height:88,borderRadius:24,background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(34,211,238,0.85)",animation:"pulse 1.5s ease-in-out infinite"}}>{FingerprintIcon}</div>
            <div style={{position:"absolute",width:120,height:120,borderRadius:"50%",border:"2px solid rgba(6,182,212,0.15)",animation:"ping 1.2s cubic-bezier(0,0,0.2,1) infinite"}}/>
          </div>
          <p style={{color:"white",fontWeight:500,marginBottom:6}}>Waiting for biometric</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>Touch the sensor or look at the camera</p>
        </div>
      )}
      {step==="done" && (
        <div style={{textAlign:"center",padding:"32px 0"}}>
          <div style={{width:88,height:88,borderRadius:24,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <svg style={{width:40,height:40,color:"rgb(74,222,128)"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p style={{color:"white",fontWeight:500,marginBottom:4}}>Verified!</p>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>Signing you in...</p>
        </div>
      )}
    </AuthWrap>
  );
}

function OAuthPage({nav}:{nav:(p:Page)=>void}) {
  const [done,setDone]=useState(false);
  useEffect(()=>{const t1=setTimeout(()=>setDone(true),1400);const t2=setTimeout(()=>nav("dashboard"),2500);return()=>{clearTimeout(t1);clearTimeout(t2);};},[]);
  return (
    <AuthWrap title="Signing you in" subtitle="Completing OAuth flow">
      <div style={{textAlign:"center",padding:"32px 0"}}>
        {!done ? (
          <>
            <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:20}}>
              {["rgba(139,92,246,1)","rgba(6,182,212,1)","rgba(217,70,239,1)"].map((c,i)=>(
                <div key={i} style={{width:10,height:10,borderRadius:"50%",background:c,animation:`bounce 0.9s ease-in-out ${i*0.15}s infinite`}}/>
              ))}
            </div>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>Verifying with provider...</p>
          </>
        ):(
          <>
            <div style={{width:60,height:60,borderRadius:16,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
              <svg style={{width:28,height:28,color:"rgb(74,222,128)"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            </div>
            <p style={{color:"white",fontWeight:500}}>Authenticated!</p>
          </>
        )}
      </div>
    </AuthWrap>
  );
}

function ForgotPage({nav}:{nav:(p:Page)=>void}) {
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const submit=(e:React.FormEvent)=>{e.preventDefault();if(!email||!/\S+@\S+\.\S+/.test(email)){setError("Enter a valid email");return;}setLoading(true);setTimeout(()=>{setLoading(false);setSent(true);},1000);};
  if(sent) return (
    <AuthWrap title="Email sent" subtitle="Check your inbox for reset instructions">
      <div style={{textAlign:"center",paddingTop:8}}>
        <div style={{width:60,height:60,borderRadius:16,background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>{EmailIcon}</div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:20}}>Reset link sent to <span style={{color:"white"}}>{email}</span></p>
        <Btn full variant="outline" onClick={()=>nav("login")}>Back to login</Btn>
      </div>
    </AuthWrap>
  );
  return (
    <AuthWrap title="Forgot password?" subtitle="We'll send a reset link">
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Email address" type="email" placeholder="you@example.com" value={email} onChange={v=>{setEmail(v);setError("");}} error={error} icon={EmailIcon}/>
        <Btn full loading={loading}>Send reset link</Btn>
      </form>
      <BackBtn onClick={()=>nav("login")}/>
    </AuthWrap>
  );
}

function VerifyPage({nav,email}:{nav:(p:Page)=>void,email:string}) {
  const [countdown,setCountdown]=useState(0);
  useEffect(()=>{if(countdown>0){const t=setTimeout(()=>setCountdown(c=>c-1),1000);return()=>clearTimeout(t);}},[countdown]);
  return (
    <AuthWrap title="Verify your email" subtitle="One more step before you can sign in">
      <div style={{textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:18,background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>{EmailIcon}</div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:4}}>Verification email sent to</p>
        <p style={{fontWeight:500,color:"white",marginBottom:20}}>{email||"your email"}</p>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 16px",textAlign:"left",marginBottom:16}}>
          {["Open the email in your inbox","Click the verification link","Come back and sign in"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?10:0}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(139,92,246,0.2)",border:"1px solid rgba(139,92,246,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:10,color:"rgba(167,139,250,1)",fontWeight:700}}>{i+1}</span>
              </div>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>{s}</span>
            </div>
          ))}
        </div>
        {countdown>0
          ? <p style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginBottom:8}}>Resend in {countdown}s</p>
          : <button onClick={()=>setCountdown(30)} style={{fontSize:13,color:"rgba(167,139,250,1)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>Resend verification email</button>
        }
        <div><button onClick={()=>nav("login")} style={{fontSize:13,color:"rgba(255,255,255,0.3)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Back to login</button></div>
      </div>
    </AuthWrap>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────
type Tab="overview"|"security"|"sessions"|"rbac";

const ALL_METHODS=[
  {key:"password",label:"Password",desc:"Email + password login",enabled:true,color:"violet"},
  {key:"google",label:"Google OAuth",desc:"Sign in with Google",enabled:true,color:"blue"},
  {key:"github",label:"GitHub OAuth",desc:"Sign in with GitHub",enabled:false,color:"gray"},
  {key:"mfa",label:"Two-Factor Auth",desc:"TOTP authenticator app",enabled:true,color:"violet"},
  {key:"passkey",label:"Passkeys",desc:"Biometric / device auth",enabled:false,color:"cyan"},
  {key:"magic",label:"Magic Links",desc:"Passwordless email login",enabled:true,color:"purple"},
  {key:"saml",label:"SSO / SAML",desc:"Enterprise single sign-on",enabled:false,color:"amber"},
];
const INIT_SESSIONS=[
  {id:1,device:"Chrome on macOS",loc:"New Delhi, IN",time:"Active now",current:true},
  {id:2,device:"Firefox on Windows",loc:"Mumbai, IN",time:"2 hours ago",current:false},
  {id:3,device:"Safari on iPhone",loc:"Gurugram, IN",time:"1 day ago",current:false},
];

function Toggle({on,set}:{on:boolean,set:()=>void}) {
  return (
    <div onClick={set} style={{width:40,height:22,borderRadius:11,background:on?"#7c3aed":"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",transition:"background 0.25s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left 0.25s"}}/>
    </div>
  );
}

function DashboardPage({nav}:{nav:(p:Page)=>void}) {
  const [tab,setTab]=useState<Tab>("overview");
  const [methods,setMethods]=useState(ALL_METHODS);
  const [sessions,setSessions]=useState(INIT_SESSIONS);
  const [role,setRole]=useState<"user"|"moderator"|"admin">("admin");

  const enabled=methods.filter(m=>m.enabled).length;
  const score=Math.round((enabled/methods.length)*100);
  const tabs:Tab[]=["overview","security","sessions","rbac"];
  const tabLabels={"overview":"Overview","security":"Auth Methods","sessions":"Sessions","rbac":"RBAC"};

  const PERMS=[
    {label:"View own profile",user:true,moderator:true,admin:true},
    {label:"Edit own profile",user:true,moderator:true,admin:true},
    {label:"View other users",user:false,moderator:true,admin:true},
    {label:"Moderate content",user:false,moderator:true,admin:true},
    {label:"Delete users",user:false,moderator:false,admin:true},
    {label:"Manage roles",user:false,moderator:false,admin:true},
    {label:"View audit logs",user:false,moderator:false,admin:true},
    {label:"Access API keys",user:false,moderator:false,admin:true},
  ];

  const ACTIVITY=[
    {e:"Successful login",d:"Chrome on macOS · New Delhi",t:"Just now",type:"ok"},
    {e:"MFA code verified",d:"Authenticator app",t:"Just now",type:"ok"},
    {e:"Password changed",d:"Via web app",t:"3 days ago",type:"info"},
    {e:"Google account linked",d:"OAuth connection",t:"1 week ago",type:"info"},
    {e:"Failed login attempt",d:"Unknown device",t:"2 weeks ago",type:"warn"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#09090e",fontFamily:"'Sora',system-ui,sans-serif",color:"white"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} @keyframes ping{75%,100%{transform:scale(1.5);opacity:0}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
      <Glow/>
      {/* Nav */}
      <nav style={{position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(9,9,14,0.85)",backdropFilter:"blur(12px)"}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#7c3aed,#22d3ee)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.95"/></svg>
            </div>
            <span style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>AuthSystem</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(139,92,246,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:10,color:"rgba(167,139,250,1)",fontWeight:700}}>JD</span>
              </div>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.55)"}}>John Doe</span>
            </div>
            <button onClick={()=>nav("login")} style={{fontSize:12,color:"rgba(255,255,255,0.3)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"6px 10px",borderRadius:8}}>Sign out</button>
          </div>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px",position:"relative",zIndex:1}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:22,fontWeight:600,color:"white",letterSpacing:"-0.02em",marginBottom:4}}>Security Dashboard</h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>Manage authentication methods and account security</p>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
          {[
            {label:"Auth methods",val:`${enabled}/${methods.length}`,c:"rgba(167,139,250,1)"},
            {label:"Security score",val:`${score}%`,c:score>70?"rgb(74,222,128)":score>40?"rgb(250,204,21)":"rgb(248,113,113)"},
            {label:"Active sessions",val:String(sessions.length),c:"rgba(34,211,238,1)"},
            {label:"Role",val:role[0].toUpperCase()+role.slice(1),c:"rgba(167,139,250,1)"},
          ].map(s=>(
            <div key={s.label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px"}}>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</p>
              <p style={{fontSize:20,fontWeight:600,color:s.c}}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",gap:2,padding:"4px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,width:"fit-content",marginBottom:20}}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:9,fontSize:13,fontWeight:tab===t?500:400,cursor:"pointer",border:"none",fontFamily:"inherit",
              background:tab===t?"rgba(255,255,255,0.08)":"transparent",
              color:tab===t?"white":"rgba(255,255,255,0.4)",transition:"all 0.15s"}}>
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab==="overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20}}>
              <p style={{fontSize:14,fontWeight:500,marginBottom:14}}>Security overview</p>
              {[
                {label:"Email verified",ok:true},
                {label:"Two-factor auth",ok:true},
                {label:"Passkey registered",ok:false},
                {label:"Suspicious activity",ok:true,inv:true},
                {label:"Password strength",ok:true},
              ].map(item=>{
                const good=item.inv?!item.ok:item.ok;
                return (
                  <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.65)"}}>{item.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:500,color:good?"rgb(74,222,128)":"rgb(250,204,21)"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:good?"rgb(74,222,128)":"rgb(250,204,21)"}}/>
                      {good?"Secure":"Action needed"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20}}>
              <p style={{fontSize:14,fontWeight:500,marginBottom:14}}>Recent activity</p>
              {ACTIVITY.map((a,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",marginTop:5,flexShrink:0,
                    background:a.type==="ok"?"rgb(74,222,128)":a.type==="warn"?"rgb(250,204,21)":"rgba(34,211,238,1)"}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{a.e}</p>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{a.d}</p>
                  </div>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.2)",flexShrink:0}}>{a.t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auth Methods */}
        {tab==="security" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20}}>
            <p style={{fontSize:14,fontWeight:500,marginBottom:4}}>Authentication methods</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:18}}>Enable or disable sign-in methods</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {methods.map(m=>(
                <div key={m.key} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,border:`1px solid ${m.enabled?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)"}`,background:m.enabled?"rgba(255,255,255,0.02)":"transparent",opacity:m.enabled?1:0.55,transition:"all 0.2s"}}>
                  <div style={{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                    background:m.enabled?"rgba(139,92,246,0.14)":"rgba(255,255,255,0.04)",
                    border:`1px solid ${m.enabled?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.06)"}`,
                    color:m.enabled?"rgba(167,139,250,1)":"rgba(255,255,255,0.3)"}}>
                    <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.9)"}}>{m.label}</p>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{m.desc}</p>
                  </div>
                  {m.enabled && <span style={{fontSize:10,color:"rgb(74,222,128)",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",padding:"2px 8px",borderRadius:20}}>Active</span>}
                  <Toggle on={m.enabled} set={()=>setMethods(ms=>ms.map(x=>x.key===m.key?{...x,enabled:!x.enabled}:x))}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions */}
        {tab==="sessions" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
              <div>
                <p style={{fontSize:14,fontWeight:500,marginBottom:2}}>Active sessions</p>
                <p style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Devices signed in to your account</p>
              </div>
              <button onClick={()=>setSessions(s=>s.filter(x=>x.current))}
                style={{fontSize:12,color:"rgba(248,113,113,1)",background:"transparent",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"inherit"}}>
                Revoke all others
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {sessions.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,
                  border:`1px solid ${s.current?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.07)"}`,
                  background:s.current?"rgba(139,92,246,0.06)":"rgba(255,255,255,0.02)"}}>
                  <div style={{width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                    background:s.current?"rgba(139,92,246,0.2)":"rgba(255,255,255,0.05)",
                    color:s.current?"rgba(167,139,250,1)":"rgba(255,255,255,0.4)"}}>
                    <svg style={{width:16,height:16}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <p style={{fontSize:13,color:"rgba(255,255,255,0.85)"}}>{s.device}</p>
                      {s.current&&<span style={{fontSize:10,color:"rgba(167,139,250,1)",background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.25)",padding:"1px 7px",borderRadius:20}}>Current</span>}
                    </div>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{s.loc} · {s.time}</p>
                  </div>
                  {!s.current && (
                    <button onClick={()=>setSessions(ss=>ss.filter(x=>x.id!==s.id))}
                      style={{fontSize:12,color:"rgba(255,255,255,0.3)",background:"none",border:"1px solid transparent",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontFamily:"inherit"}}
                      onMouseOver={e=>{(e.currentTarget as HTMLElement).style.color="rgb(248,113,113)";(e.currentTarget as HTMLElement).style.borderColor="rgba(239,68,68,0.2)";(e.currentTarget as HTMLElement).style.background="rgba(239,68,68,0.06)";}}
                      onMouseOut={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.3)";(e.currentTarget as HTMLElement).style.borderColor="transparent";(e.currentTarget as HTMLElement).style.background="none";}}>
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {sessions.length===1&&<p style={{fontSize:12,color:"rgba(255,255,255,0.25)",textAlign:"center",padding:"8px 0"}}>Only this session is active</p>}
            </div>
          </div>
        )}

        {/* RBAC */}
        {tab==="rbac" && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20}}>
            <p style={{fontSize:14,fontWeight:500,marginBottom:4}}>Role-based access control</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:18}}>Select a role to preview its permissions</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22}}>
              {(["user","moderator","admin"] as const).map(r=>(
                <button key={r} onClick={()=>setRole(r)} style={{
                  padding:"14px 12px",borderRadius:12,border:`1px solid ${role===r?"rgba(139,92,246,0.4)":"rgba(255,255,255,0.07)"}`,
                  background:role===r?"rgba(139,92,246,0.1)":"rgba(255,255,255,0.02)",
                  cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s",
                }}>
                  <p style={{fontSize:12,fontWeight:600,color:role===r?"rgba(167,139,250,1)":"rgba(255,255,255,0.55)",textTransform:"capitalize",marginBottom:3}}>{r}</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{r==="user"?"Basic access":r==="moderator"?"Content control":"Full access"}</p>
                </button>
              ))}
            </div>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:12}}>Permissions for <span style={{color:"rgba(167,139,250,1)",textTransform:"capitalize"}}>{role}</span></p>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {PERMS.map(p=>{
                const has=p[role];
                return (
                  <div key={p.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 10px",borderRadius:8,background:has?"rgba(255,255,255,0.025)":"transparent",opacity:has?1:0.45}}>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.65)"}}>{p.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:500,color:has?"rgb(74,222,128)":"rgba(255,255,255,0.2)"}}>
                      {has
                        ? <><svg style={{width:13,height:13}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Allowed</>
                        : <><svg style={{width:13,height:13}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>Denied</>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState<Page>("login");
  const [email,setEmail]=useState("");
  const nav=(p:Page,e?:string)=>{if(e)setEmail(e);setPage(p);};

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-font-smoothing:antialiased;}
        input::placeholder{color:rgba(255,255,255,0.2);}
        input:-webkit-autofill,input:-webkit-autofill:focus{
          -webkit-box-shadow:0 0 0 1000px #141418 inset;
          -webkit-text-fill-color:white;
        }
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes ping{75%,100%{transform:scale(1.6);opacity:0}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>
      {page==="login"        && <LoginPage nav={nav}/>}
      {page==="register"     && <RegisterPage nav={nav}/>}
      {page==="magic-link"   && <MagicLinkPage nav={nav}/>}
      {page==="mfa"          && <MFAPage nav={nav} email={email}/>}
      {page==="passkey"      && <PasskeyPage nav={nav}/>}
      {page==="oauth-callback"&&<OAuthPage nav={nav}/>}
      {page==="forgot-password"&&<ForgotPage nav={nav}/>}
      {page==="verify-email" && <VerifyPage nav={nav} email={email}/>}
      {page==="dashboard"    && <DashboardPage nav={nav}/>}
    </>
  );
}
