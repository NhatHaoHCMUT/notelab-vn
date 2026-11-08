/* Independent palettes for light/dark modes; no note data is touched. */
const noteAppearance = (() => {
  const key='notelab_appearance_v1', root=document.documentElement;
  const valid=s=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
  const rgb=s=>s.slice(1).match(/../g).map(x=>parseInt(x,16));
  const hex=a=>'#'+a.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');
  const mix=(a,b,t)=>hex(rgb(a).map((x,i)=>x*(1-t)+rgb(b)[i]*t));
  const luminance=s=>rgb(s).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
  const ink=s=>luminance(s)>.179?'#000000':'#ffffff';
  let saved={};
  try { const d=JSON.parse(localStorage.getItem(key)||'{}'); if(d&&typeof d==='object') saved=d; } catch {}
  const props=new Set();
  function apply() {
    props.forEach(k=>root.style.removeProperty(k));props.clear();
    const c=saved[root.dataset.theme];if(!c||!valid(c.background)||!valid(c.accent))return;
    const set=(k,v)=>{root.style.setProperty(k,v);props.add(k);};
    const fg=ink(c.background), surface=mix(c.background,fg,.035);
    for(const [k,v] of Object.entries({
      '--bg-app':c.background,'--bg-editor':c.background,'--bg-sidebar':surface,'--bg-list':mix(c.background,fg,.02),
      '--bg-elevated':surface,'--bg-hover':mix(c.background,fg,.08),'--bg-active':mix(c.background,c.accent,.20),
      '--bg-inline-code':mix(c.background,fg,.08),'--bg-tag':mix(c.background,c.accent,.14),'--bg-tag-active':c.accent,
      '--text-primary':fg,'--text-secondary':mix(c.background,fg,.78),'--text-muted':mix(c.background,fg,.65),
      '--border-color':mix(c.background,fg,.18),'--border-strong':mix(c.background,fg,.30),
      '--accent':c.accent,'--accent-hover':mix(c.accent,ink(c.accent),.12),'--accent-soft':mix(c.background,c.accent,.16),
      '--text-on-accent':ink(c.accent),'--mark-bg':c.accent,'--mark-text':ink(c.accent)
    }))set(k,v);
  }
  function init() {
    apply();new MutationObserver(apply).observe(root,{attributes:true,attributeFilter:['data-theme']});
    const dialog=document.createElement('dialog');dialog.className='appearance-dialog';dialog.setAttribute('aria-labelledby','appearanceTitle');
    dialog.innerHTML=`<form method="dialog"><div class="appearance-heading"><h2 id="appearanceTitle">Màu giao diện</h2><button class="btn" aria-label="Đóng">×</button></div></form><p>Chỉnh riêng nền và highlight. Tự lưu cho chế độ Sáng / Tối đang dùng.</p><div class="appearance-fields"></div><div class="appearance-presets"></div><p class="appearance-error" role="status"></p><button type="button" class="btn" data-reset>Khôi phục màu mặc định</button><hr/><p>Ẩn/hiện Tab: <kbd>Ctrl+Alt+B</kbd><br/>Ẩn/hiện danh sách: <kbd>Ctrl+Alt+L</kbd><br/>Trên macOS dùng ⌘ thay Ctrl.</p>`;
    document.body.append(dialog);
    const error=dialog.querySelector('[role="status"]');
    const mode=()=>root.dataset.theme;
    const current=()=>{
      const c=saved[mode()];if(c&&valid(c.background)&&valid(c.accent))return c;
      const styles=getComputedStyle(root);
      const read=name=>{const v=styles.getPropertyValue(name).trim();return /^#[0-9a-f]{3}$/i.test(v)?'#'+v.slice(1).split('').map(x=>x+x).join(''):v;};
      return {background:read('--bg-editor'),accent:read('--accent')};
    };
    function save(c) {saved[mode()]=c;apply();try{localStorage.setItem(key,JSON.stringify(saved));error.textContent='Đã lưu màu giao diện.';}catch{error.textContent='Đã áp dụng, nhưng trình duyệt không cho lưu màu.';}}
    function refresh() {const c=current();for(const name of ['background','accent']){dialog.querySelector(`[data-picker="${name}"]`).value=c[name];dialog.querySelector(`[data-hex="${name}"]`).value=c[name];rgb(c[name]).forEach((v,i)=>dialog.querySelector(`[data-rgb="${name}-${i}"]`).value=v);}}
    for(const [name,label] of [['background','Màu nền'],['accent','Màu highlight']]){
      const field=document.createElement('fieldset');field.innerHTML=`<legend>${label}</legend><div class="color-row"><input type="color" data-picker="${name}" aria-label="${label}"/><label>HEX <input data-hex="${name}" maxlength="7" spellcheck="false" aria-label="${label} HEX"/></label></div><div class="rgb-row">${['R','G','B'].map((c,i)=>`<label>${c}<input type="number" min="0" max="255" step="1" data-rgb="${name}-${i}" aria-label="${label} ${c}"/></label>`).join('')}</div>`;
      dialog.querySelector('.appearance-fields').append(field);
      field.querySelector('[type="color"]').oninput=e=>{save({...current(),[name]:e.target.value});refresh();};
      field.querySelector('[data-hex]').oninput=e=>{let v=e.target.value;if(/^[0-9a-f]{6}$/i.test(v))v='#'+v;if(!valid(v)){error.textContent='HEX cần đủ 6 ký tự, ví dụ #99C9B3.';return;}save({...current(),[name]:v});refresh();};
      field.querySelectorAll('[data-rgb]').forEach(el=>el.oninput=()=>{const a=[...field.querySelectorAll('[data-rgb]')].map(x=>x.value===''?NaN:Number(x.value));if(a.some(x=>!Number.isInteger(x)||x<0||x>255)){error.textContent='Mỗi giá trị RGB phải là số nguyên từ 0 đến 255.';return;}save({...current(),[name]:hex(a)});refresh();});
    }
    for(const [label,background,accent] of [['Lá','#1b2925','#99c9b3'],['Biển','#172435','#93c5fd'],['Tím','#261e35','#c4b5fd'],['Hổ phách','#29231b','#fbbf24'],['Giấy','#f7faf8','#376e58']]){
      const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label;b.onclick=()=>{save({background,accent});refresh();};dialog.querySelector('.appearance-presets').append(b);
    }
    dialog.querySelector('[data-reset]').onclick=()=>{delete saved[mode()];apply();try{localStorage.setItem(key,JSON.stringify(saved));error.textContent='Đã khôi phục mặc định.';}catch{error.textContent='Không thể lưu thiết lập.';}refresh();};
    document.querySelectorAll('[data-open-appearance]').forEach(b=>b.onclick=()=>{refresh();error.textContent='';dialog.showModal();});
  }
  window.addEventListener('DOMContentLoaded',init);
  return {apply};
})();
