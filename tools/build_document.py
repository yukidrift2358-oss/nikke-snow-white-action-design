from pathlib import Path
import re,json,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,Image,KeepTogether
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output'; (OUT/'pdf').mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('CN',r'C:\Windows\Fonts\simhei.ttf'))
styles={
 'body':ParagraphStyle('body',fontName='CN',fontSize=9.5,leading=15.5,textColor=colors.HexColor('#242931'),spaceAfter=7,wordWrap='CJK',allowWidows=0,allowOrphans=0),
 'small':ParagraphStyle('small',fontName='CN',fontSize=8,leading=12,textColor=colors.HexColor('#65707b'),spaceAfter=7,wordWrap='CJK'),
 'h1':ParagraphStyle('h1',fontName='CN',fontSize=23,leading=31,spaceAfter=19,textColor=colors.HexColor('#242931'),keepWithNext=True),
 'h2':ParagraphStyle('h2',fontName='CN',fontSize=13,leading=20,spaceBefore=9,spaceAfter=6,textColor=colors.HexColor('#9b7426'),keepWithNext=True),
 'cell':ParagraphStyle('cell',fontName='CN',fontSize=8.5,leading=12,wordWrap='CJK'),
 'headcell':ParagraphStyle('headcell',fontName='CN',fontSize=8.5,leading=13,textColor=colors.white,wordWrap='CJK')}
W=487.28
def inline(s):
 s=html.escape(s)
 s=re.sub(r'`([^`]+)`',r'\1',s)
 s=re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)',r'<link href="\2" color="#8a641b">\1</link>',s)
 s=re.sub(r'(?<!["=])(https?://[^\s<]+)',lambda m: f'<link href="{m[0]}" color="#8a641b">{m[0]}</link>',s) if '<link ' not in s else s
 return s
def para(s,style='body'):return Paragraph(inline(s),styles[style])
def image(name,width=W):
 from PIL import Image as PILImage
 path=ROOT/'assets'/name
 im=PILImage.open(path);w,h=im.size
 return Image(str(path),width=width,height=width*h/w)

def parse(body):
 lines=body.splitlines(); result=[];i=0
 while i<len(lines):
  s=lines[i].strip()
  if not s:i+=1;continue
  if s.startswith('# '):result.append(para(s[2:],'h1'));i+=1;continue
  if s.startswith('## '):result.append(para(s[3:],'h2'));i+=1;continue
  if s.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].strip().startswith('|'):
    cells=[x.strip() for x in lines[i].strip().strip('|').split('|')]
    if not all(re.fullmatch(r'[:\- ]+',x) for x in cells):rows.append(cells)
    i+=1
   n=len(rows[0]); widths=([100,240,W-340] if n==3 else [90,150,120,W-360] if n==4 else [W/n]*n)
   grid=[[para(c,'headcell' if r==0 else 'cell') for c in row] for r,row in enumerate(rows)]
   table=Table(grid,colWidths=widths,repeatRows=1,hAlign='LEFT')
   table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#242931')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,1),(-1,-1),.4,colors.HexColor('#dfe1e3'))]))
   result.extend([table,Spacer(1,9)]);continue
  if s.startswith('!['):i+=1;continue
  chunk=[s];i+=1
  while i<len(lines) and lines[i].strip() and not lines[i].strip().startswith(('#','|','![')):
   chunk.append(lines[i].strip());i+=1
  result.append(para(' '.join(chunk)))
 return result

def footer(canvas,doc):
 canvas.setStrokeColor(colors.HexColor('#dfe1e3'));canvas.line(54,45,541,45)
 canvas.setFont('CN',8);canvas.setFillColor(colors.HexColor('#65707b'));canvas.drawString(54,30,'白雪公主 / 动作设计提案 / V2.0');canvas.drawRightString(541,30,str(doc.page))

story=[Spacer(1,30),para('白雪公主','h1'),para('第三人称动作设计提案','h1'),para('NIKKE 角色改编 · 步枪射击与蓄力重火力','h2'),Spacer(1,15),image('key-poses-concept.png'),Spacer(1,14),para('从持续射击取得能量，在敌人攻击后的间隙准备重武器。提前击发可以尽快脱身，继续蓄力则需要更长的安全窗口。'),para('版本 2.0 · 2026-10-26 · PC 键鼠 · 60 Hz 逻辑基准','small'),para('交付状态：设计提案、试调初值与验证用例。尚未制作引擎原型、角色模型与动画；无实机测试结论。图中姿势为原画参考再创作的非官方概念图。','small'),PageBreak(),para('阅读顺序','h1')]
files=sorted((ROOT/'docs').glob('0*.md'))
for f in files:story += [para(f.stem[:2]+'  '+f.read_text(encoding='utf-8').splitlines()[0][2:],'h2')]
story += [Spacer(1,12),para('正文解释设计选择与执行边界；数据附件提供动作、参数、试算和待执行用例。所有新数值都需要原型验证。'),para('源文档与附件：','h2'),para('https://github.com/yukidrift2358-oss/nikke-snow-white-action-design','small')]
figures={0:[('snow-white-reference.jpg','Wiki 默认立绘参考。原画权利归原权利方；新动作与武器布置为改编。',260)],1:[('combat-flow.png','战斗状态与资源流向。',W)],2:[('action-timeline.png','补弹、无敌与重射事件的时间口径。',W)],3:[('hit-resolution.png','枪口遮挡与按目标去重。',W)],4:[('combat-ui.png','战斗 UI 信息布局示意。',W),('key-poses-concept.png','关键姿势概念图：步枪、侧向撤离、重射支撑。',W)],5:[('test-arena.png','训练场概念布局，非已制作关卡。',W)]}
htmlparts=['<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>白雪公主 · 动作设计提案 V2.0</title><style>body{margin:0;background:#f1f2f3;color:#242931;font:17px/1.85 "Microsoft YaHei",sans-serif}main{max-width:1000px;margin:auto;padding:64px;background:white}h1{font-size:36px;line-height:1.35}h2{font-size:24px;color:#926b20;margin-top:40px}p{margin:14px 0}a{color:#926b20;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{border-collapse:collapse;width:100%;font-size:15px}td,th{padding:12px;text-align:left;border-bottom:1px solid #ddd}th{background:#242931;color:white}.caption{font-size:14px;color:#65707b}section{padding:30px 0;border-top:1px solid #ddd}@media(max-width:700px){main{padding:24px}table{display:block;overflow-x:auto}}</style><main><h1>白雪公主<br>第三人称动作设计提案</h1><p>V2.0 · 2026-10-26 · 所有参数待原型试调</p><img src="../assets/key-poses-concept.png" alt="非官方关键姿势概念图"><p class="caption">Wiki 原画参考再创作；不是模型或实机截图。</p>']
for idx,f in enumerate(files):
 body=f.read_text(encoding='utf-8');story.append(Spacer(1,24) if idx==3 else PageBreak());lines=body.splitlines()
 story.extend(parse('\n'.join(lines[:3])))
 for name,cap,width in figures.get(idx,[]):
  story.extend([image(name,width),para(cap,'small'),Spacer(1,6)])
 story.extend(parse('\n'.join(lines[4:])))
 htmlparts.append('<section>')
 for name,cap,width in figures.get(idx,[]):htmlparts.append(f'<img src="../assets/{name}" alt="{html.escape(cap)}"><p class="caption">{html.escape(cap)}</p>')
 # Small deterministic Markdown subset for the companion local reader.
 in_table=False
 for line in lines:
  s=line.strip()
  if s.startswith('|'):
   cells=[x.strip() for x in s.strip('|').split('|')]
   if all(re.fullmatch(r'[:\- ]+',x) for x in cells):continue
   if not in_table:htmlparts.append('<table>');in_table=True;tag='th'
   else:tag='td'
   htmlparts.append('<tr>'+''.join(f'<{tag}>{html.escape(x)}</{tag}>' for x in cells)+'</tr>');continue
  if in_table:htmlparts.append('</table>');in_table=False
  if s.startswith('# '):htmlparts.append('<h1>'+html.escape(s[2:])+'</h1>')
  elif s.startswith('## '):htmlparts.append('<h2>'+html.escape(s[3:])+'</h2>')
  elif s.startswith('!['):continue
  elif s.startswith('https://'):htmlparts.append(f'<p><a href="{html.escape(s)}">{html.escape(s)}</a></p>')
  elif s:htmlparts.append('<p>'+html.escape(s)+'</p>')
 if in_table:htmlparts.append('</table>')
 htmlparts.append('</section>')
htmlparts.append('</main></html>');(OUT/'白雪公主_动作设计提案_V2.0.html').write_text('\n'.join(htmlparts),encoding='utf-8')
doc=SimpleDocTemplate(str(OUT/'pdf/白雪公主_动作设计提案_V2.0.pdf'),pagesize=(595.28,841.89),leftMargin=54,rightMargin=54,topMargin=54,bottomMargin=61,title='白雪公主：第三人称动作设计提案 V2.0',author='高琛博',subject='NIKKE非官方角色改编设计提案；参数待原型验证')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print('Built PDF and local HTML reader')
