(() => {
  const note = document.querySelector('.sky-note');
  if (!note) return;
  const el = name => note.querySelector(`[data-weather="${name}"]`);
  let zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let coords = { latitude:28.4089, longitude:77.3178 };
  let fallback = true, busy = false, lastSuccess = 0;
  const clock = () => {
    const now = new Date();
    const part = opts => new Intl.DateTimeFormat('en-US', {timeZone:zone,...opts}).format(now);
    el('date').dateTime = now.toISOString();
    el('date').textContent = `${part({weekday:'long'})} · ${part({month:'long',day:'numeric'})} · ${part({year:'numeric'})} · ${part({hour:'numeric',minute:'2-digit',hour12:true})}`;
  };
  function condition(code, day) {
    if (code===0 || code===1) return [day?'sun':'night',code===0?'clear':'mostly clear',day?'looks like a good day to create.':'still creating after sunset.'];
    if (code===2 || code===3) return ['cloud',code===2?'partly cloudy':'cloudy','ideas brewing under cloudy skies.'];
    if (code===45 || code===48) return ['cloud','foggy','a little mystery in the air today.'];
    if ([71,73,75,77,85,86].includes(code)) return ['snow','snow','a little snow, a fresh page.'];
    if ([95,96,99].includes(code)) return ['storm','thunderstorms','big skies, little indoor projects.'];
    if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return ['rain',code<60?'drizzle':'rain','rainy outside, making things inside.'];
    return [day?'cloud':'night','changing skies','a little room for the unexpected.'];
  }
  async function json(url) {
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(),12000);
    try { const r=await fetch(url,{signal:controller.signal}); if(!r.ok) throw new Error('Unavailable'); return await r.json(); }
    finally { clearTimeout(timer); }
  }
  async function locality() {
    if(fallback) { el('place').textContent='Faridabad'; return; }
    el('place').textContent=`${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°`;
    try {
      const url=new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
      url.search=new URLSearchParams({...coords,localityLanguage:'en'});
      const data=await json(url);
      const name=data.city || data.locality || data.principalSubdivision;
      if(name) el('place').textContent=name;
    } catch { /* Coordinates remain an accurate location when naming is unavailable. */ }
  }
  async function weather() {
    if(busy)return; busy=true;
    el('status').textContent=fallback?'Faridabad weather · location unavailable':'checking your sky…';
    try {
      const url=new URL('https://api.open-meteo.com/v1/forecast');
      url.search=new URLSearchParams({...coords,current:'temperature_2m,relative_humidity_2m,weather_code,is_day',timezone:'auto'});
      const data=await json(url);
      if(!Number.isFinite(data.current?.temperature_2m)||!Number.isFinite(data.current?.weather_code))throw new Error('Invalid weather');
      if(data.timezone) { try {new Intl.DateTimeFormat('en',{timeZone:data.timezone});zone=data.timezone;}catch{} }
      clock();
      const [icon,label,message]=condition(data.current.weather_code,data.current.is_day===1);
      note.dataset.sky=icon;
      el('temperature').textContent=`${Math.round(data.current.temperature_2m)}°C`;
      el('condition').textContent=label;
      el('message').textContent=message;
      el('status').textContent=fallback?'Faridabad weather · location unavailable':'';
      lastSuccess=Date.now();
    } catch {
      el('status').textContent=lastSuccess?'weather refresh unavailable · showing last update':'weather is taking a little break · try again';
      if(!lastSuccess) {el('temperature').textContent='—°C';el('condition').textContent='unavailable';el('message').textContent='still a good moment to make something.';}
    } finally {busy=false;}
  }
  function locate() {
    el('status').textContent='finding your local sky…';
    const finish=position=>{
      fallback=!position;
      if(position) coords={latitude:position.coords.latitude,longitude:position.coords.longitude};
      else {coords={latitude:28.4089,longitude:77.3178};zone='Asia/Kolkata';clock();}
      void locality();void weather();
    };
    if(navigator.geolocation)navigator.geolocation.getCurrentPosition(finish,()=>finish(null),{timeout:10000,maximumAge:300000,enableHighAccuracy:false});
    else finish(null);
  }
  let animationTimer;
  note.addEventListener('click',event=>{if(event.target.closest('a,.sky-retry'))return;note.classList.remove('is-playing');void note.offsetWidth;note.classList.add('is-playing');clearTimeout(animationTimer);animationTimer=setTimeout(()=>note.classList.remove('is-playing'),3600);});
  el('retry').addEventListener('click',()=>{if(!busy)locate();});
  clock();setInterval(clock,1000);locate();
  setInterval(()=>{if(!document.hidden)void weather();},600000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){clock();if(Date.now()-lastSuccess>600000)void weather();}});
})();
