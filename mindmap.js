/* Mindmaps live in fenced Markdown blocks, using the existing note/backup pipeline. */
const mindmapEngine = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const color = s => /^#[0-9a-f]{6}$/i.test(s);
  const template = JSON.stringify({v:1,nodes:[{id:'root',text:'Chủ đề chính',x:0,y:0,color:'#99c9b3'},{id:'idea',text:'Ý tưởng',x:260,y:100,color:'#93c5fd'}],links:[{from:'root',to:'idea'}]}, null, 2);
  function parse(raw) {
    const d = JSON.parse(raw);
    if (!d || d.v !== 1 || !Array.isArray(d.nodes) || !Array.isArray(d.links) || d.nodes.length > 500 || d.links.length > 2000) throw Error('Mindmap không hợp lệ (tối đa 500 node / 2000 liên kết).');
    const ids = new Set();
    const nodes = d.nodes.map(n => {
      if (!n || typeof n.id !== 'string' || !n.id || n.id.length > 100 || ids.has(n.id) || typeof n.text !== 'string' || n.text.length > 120 || !Number.isFinite(n.x) || !Number.isFinite(n.y) || Math.abs(n.x)>100000 || Math.abs(n.y)>100000 || !color(n.color)) throw Error('Node không hợp lệ: kiểm tra ID, tên, tọa độ và màu HEX.');
      ids.add(n.id); return {id:n.id,text:n.text,x:n.x,y:n.y,color:n.color};
    });
    const seen = new Set();
    const links = d.links.map(l => {
      if (!l || !ids.has(l.from) || !ids.has(l.to) || l.from===l.to) throw Error('Liên kết phải nối hai node khác nhau có tồn tại.');
      const key=JSON.stringify([l.from,l.to].sort());
      if(seen.has(key)) throw Error('Liên kết bị trùng.');
      seen.add(key); return {from:l.from,to:l.to};
    });
    return {v:1,nodes,links};
  }
  function bounds(d) {
    if (!d.nodes.length) return [-100,-100,800,400];
    const x=Math.min(...d.nodes.map(n=>n.x))-60, y=Math.min(...d.nodes.map(n=>n.y))-60;
    return [x,y,Math.max(320,Math.max(...d.nodes.map(n=>n.x))+240-x),Math.max(240,Math.max(...d.nodes.map(n=>n.y))+120-y)];
  }
  function drawing(d, selected='', edge=-1) {
    const nodes = new Map(d.nodes.map(n=>[n.id,n]));
    return d.links.map((l,i)=>{
      const a=nodes.get(l.from), b=nodes.get(l.to);
      return `<path data-edge="${i}" d="M${a.x+90} ${a.y+30} L${b.x+90} ${b.y+30}" fill="none" stroke="${i===edge?'#f59e0b':'#78958e'}" stroke-width="${i===edge?6:4}" style="cursor:pointer"/>`;
    }).join('') + d.nodes.map(n=>{
      const rgb=n.color.slice(1).match(/../g).map(v=>parseInt(v,16));
      const ink=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>150?'#111827':'#ffffff';
      const lines=n.text.match(/.{1,18}/gu)||[''];
      return `<g data-node="${esc(n.id)}" style="cursor:grab"><rect x="${n.x}" y="${n.y}" width="180" height="60" rx="14" fill="${n.color}" stroke="${n.id===selected?'#f59e0b':'#52756a'}" stroke-width="${n.id===selected?4:1}"/><text x="${n.x+90}" y="${n.y+26}" text-anchor="middle" fill="${ink}" font-family="system-ui,sans-serif" font-size="13"><title>${esc(n.text)}</title>${lines.slice(0,2).map((s,i)=>`<tspan x="${n.x+90}" dy="${i?18:0}">${esc(s)}</tspan>`).join('')}</text></g>`;
    }).join('');
  }
  function renderStaticSvg(raw) {
    const d=parse(raw);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds(d).join(' ')}" width="800" role="img" aria-label="Sơ đồ tư duy" style="max-width:100%;height:auto">${drawing(d)}</svg>`;
  }
  function mountEditor(container, raw, onChange, toolbar) {
    let d;
    try { d=parse(raw); } catch(e) { container.textContent=e.message+' Hãy sửa JSON trong ghi chú rồi mở lại.'; return; }
    let selected=d.nodes[0]?.id||'', edge=-1, linking=false, drag=null;
    let view=bounds(d);
    toolbar.innerHTML=`<div class="mindmap-tools"><button class="btn btn-sm" data-mm="add">+ Node</button><button class="btn btn-sm" data-mm="link" aria-pressed="false">Nối node</button><button class="btn btn-sm" data-mm="delete">Xóa mục chọn</button><label>Node <select aria-label="Chọn node" data-mm="select"></select></label><input data-mm="text" aria-label="Tên node" maxlength="120" placeholder="Tên node"/><input data-mm="color" aria-label="Màu node" type="color"/><button class="btn btn-sm" data-mm="out" aria-label="Thu nhỏ">−</button><button class="btn btn-sm" data-mm="in" aria-label="Phóng to">+</button><button class="btn btn-sm" data-mm="fit">Vừa khung</button></div>`;
    container.innerHTML='<div class="mindmap-help" role="status">Kéo node để di chuyển; kéo nền để pan; cuộn để zoom. Nối node: chọn node nguồn, bấm Nối node, chọn node đích.</div><svg class="mindmap-canvas" xmlns="http://www.w3.org/2000/svg" aria-label="Vùng vẽ mindmap" tabindex="0"></svg>';
    const svg=container.querySelector('svg'), q=n=>toolbar.querySelector(`[data-mm="${n}"]`), status=container.querySelector('[role="status"]');
    const emit=()=>onChange(JSON.stringify(d,null,2));
    function draw() {
      svg.setAttribute('viewBox',view.join(' ')); svg.innerHTML=drawing(d,selected,edge);
      const n=d.nodes.find(n=>n.id===selected);
      q('select').innerHTML='<option value="">Chọn node</option>'+d.nodes.map(n=>`<option value="${esc(n.id)}">${esc(n.text)}</option>`).join('');
      q('select').value=selected;
      q('text').value=n?.text||''; q('text').disabled=!n; q('color').value=n?.color||'#99c9b3'; q('color').disabled=!n;
      q('link').setAttribute('aria-pressed',String(linking));
    }
    function choose(id) {
      if(linking && selected && id!==selected) {
        if(d.links.length<2000 && !d.links.some(l=>(l.from===selected&&l.to===id)||(l.to===selected&&l.from===id))) {d.links.push({from:selected,to:id}); emit();}
        linking=false; status.textContent='Đã nối node. Chọn đường nối để xóa.';
      }
      selected=id; edge=-1; draw();
    }
    function zoom(f, point) {
      const w=Math.max(160,Math.min(20000,view[2]*f)), ratio=w/view[2];
      const p=point||{x:view[0]+view[2]/2,y:view[1]+view[3]/2};
      view=[p.x-(p.x-view[0])*ratio,p.y-(p.y-view[1])*ratio,w,view[3]*ratio]; draw();
    }
    function point(e) {return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());}
    q('add').onclick=()=>{
      if(d.nodes.length>=500) {status.textContent='Đã đạt giới hạn 500 node.';return;}
      const parent=d.nodes.find(n=>n.id===selected);
      const n={id:crypto.randomUUID(),text:'Ý tưởng mới',x:parent?parent.x+260:view[0]+view[2]/2-90,y:parent?parent.y:view[1]+view[3]/2-30,color:'#99c9b3'};
      while(d.nodes.some(a=>Math.abs(a.x-n.x)<220&&Math.abs(a.y-n.y)<100))n.y+=110;
      if(Math.abs(n.x)>100000||Math.abs(n.y)>100000){status.textContent='Vị trí vượt giới hạn. Chọn node gần tâm để tạo thêm.';return;}
      d.nodes.push(n);selected=n.id;edge=-1;view=bounds(d);emit();draw();q('text').focus();q('text').select();
    };
    q('link').onclick=()=>{if(!selected) {status.textContent='Chọn node nguồn trước.';return;} linking=!linking;status.textContent=linking?'Chọn node đích để nối.':'Đã hủy chế độ nối.';draw();};
    q('select').onchange=e=>choose(e.target.value);
    q('delete').onclick=()=>{if(edge>=0) d.links.splice(edge,1);else {d.nodes=d.nodes.filter(n=>n.id!==selected);d.links=d.links.filter(l=>l.from!==selected&&l.to!==selected);} selected='';edge=-1;linking=false;emit();draw();};
    q('text').oninput=e=>{const n=d.nodes.find(n=>n.id===selected);if(n){n.text=e.target.value;emit();svg.innerHTML=drawing(d,selected,edge);const o=q('select').selectedOptions[0];if(o)o.textContent=n.text;}};
    q('color').oninput=e=>{const n=d.nodes.find(n=>n.id===selected);if(n){n.color=e.target.value;emit();draw();}};
    q('in').onclick=()=>zoom(.8);q('out').onclick=()=>zoom(1.25);q('fit').onclick=()=>{view=bounds(d);draw();};
    svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.1:1/1.1,point(e));},{passive:false});
    svg.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      const id=e.target.closest('[data-node]')?.dataset.node;
      const target=e.target.closest('[data-edge]');
      if(target){edge=Number(target.dataset.edge);selected='';draw();return;}
      if(id){const wasLinking=linking;choose(id);if(wasLinking)return;}
      const p=point(e), n=d.nodes.find(n=>n.id===id);
      drag={pointer:e.pointerId,start:p,node:n,x:n?.x,y:n?.y,view:[...view]};svg.setPointerCapture(e.pointerId);e.preventDefault();
    });
    svg.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const p=point(e);if(drag.node){drag.node.x=Math.max(-100000,Math.min(100000,drag.x+p.x-drag.start.x));drag.node.y=Math.max(-100000,Math.min(100000,drag.y+p.y-drag.start.y));}else {view[0]+=drag.start.x-p.x;view[1]+=drag.start.y-p.y;}draw();});
    const end=()=>{if(drag?.node)emit();drag=null;};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('lostpointercapture',end);
    svg.addEventListener('keydown',e=>{const n=d.nodes.find(n=>n.id===selected);if(n&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();n.x+=e.key==='ArrowLeft'?-10:e.key==='ArrowRight'?10:0;n.y+=e.key==='ArrowUp'?-10:e.key==='ArrowDown'?10:0;emit();draw();}});
    draw();
  }
  return {template,parse,renderStaticSvg,mountEditor};
})();
