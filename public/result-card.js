/* Local PNG export. No customer answers or images are uploaded. */
(() => {
  'use strict';
  function blocks(snapshot) {
    const r = snapshot.reading;
    const out = [
      {text:'적바림 · 취향 노트',size:26,gap:28,color:'#6e6e73'},
      {text:r.title,size:56,weight:400,gap:20},
      {text:r.opening,size:31,gap:46},
      {text:'추천한 '+snapshot.products.length+'가지 술',size:37,weight:600,gap:28}
    ];
    snapshot.products.forEach((p,i) => out.push(
      {text:String(i+1).padStart(2,'0')+'  '+p.name,size:39,weight:500,gap:12},
      {text:p.cat+' · '+p.abv+'% · '+p.vol+'ml · '+Number(p.price).toLocaleString('ko-KR')+'원',size:27,color:'#6e6e73',gap:16},
      {text:p.note,size:30,gap:14},
      {text:p.tags.join(' · '),size:26,color:'#6e6e73',gap:44}
    ));
    out.push({text:'당신을 조금 더 읽어보면',size:37,weight:600,gap:24});
    r.axes.forEach(a => out.push({text:a.label+' — '+a.value,size:28,gap:8,color:'#6e6e73'}));
    out.push({text:'',size:20,gap:20});
    [...r.readings,{heading:'익숙함과 새로움 사이',text:r.contrast},{heading:'좋은 시간을 즐기는 방식',text:r.bridge}].forEach(x => out.push(
      {text:x.heading,size:32,weight:600,gap:12},
      {text:x.text,size:30,gap:32}
    ));
    out.push(
      {text:'답변을 바탕으로 가볍게 즐기는 성향 이야기예요. 당신의 모든 모습을 정해두는 결과는 아니에요.',size:24,color:'#6e6e73',gap:16},
      {text:'가격과 재고는 매장에서 확인해 주세요.',size:24,color:'#6e6e73',gap:0}
    );
    return out;
  }
  function layout(ctx,snapshot,fontFamily) {
    const width=1080,padding=72,available=width-padding*2,lines=[];
    let y=padding;
    for(const block of blocks(snapshot)) {
      const font=(block.weight||400)+' '+block.size+'px '+fontFamily;
      ctx.font=font;
      const lineHeight=Math.ceil(block.size*1.65);
      for(const paragraph of block.text.split('\n')) {
        let line='';
        for(const char of paragraph) {
          if(line&&ctx.measureText(line+char).width>available) {
            lines.push({text:line,x:padding,y,font,color:block.color||'#1d1d1f',lineHeight});
            y+=lineHeight;line='';
          }
          line+=char;
        }
        lines.push({text:line,x:padding,y,font,color:block.color||'#1d1d1f',lineHeight});
        y+=lineHeight;
      }
      y+=block.gap;
    }
    return {width,height:Math.ceil(y+padding),lines};
  }
  async function create(snapshot) {
    await document.fonts.load('400 16px "Wanted Sans Variable"','적바림');
    await document.fonts.ready;
    const canvas=document.createElement('canvas');
    const fontFamily=getComputedStyle(document.body).fontFamily;
    const plan=layout(canvas.getContext('2d'),snapshot,fontFamily);
    canvas.width=plan.width;canvas.height=plan.height;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textBaseline='top';
    for(const line of plan.lines) {ctx.font=line.font;ctx.fillStyle=line.color;ctx.fillText(line.text,line.x,line.y);}
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('PNG encoding failed');
    return blob;
  }
  window.JukbarimCard={blocks,layout,create};
})();
