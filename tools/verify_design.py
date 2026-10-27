"""核对交付文件与参数关系，不执行游戏功能测试。"""
from pathlib import Path
import json,csv,subprocess,hashlib,re
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
d=json.loads((ROOT/'data/design.json').read_text(encoding='utf-8'))
p={r[0]:r[2] for r in d['parameters']};a={r[0]:r for r in d['actions']}
checks=[]
def check(name,condition):
    checks.append((name,bool(condition)))
    if not condition:raise AssertionError(name)
for key in ('actions','parameters','enemies','tests'):
 check(key+' ID 唯一',len({r[0] for r in d[key]})==len(d[key]))
check('射击间隔与动作长度一致',p['fire_interval']==a['A_FIRE'][2])
check('换弹事件与总长一致',p['reload_total']==a['A_RELOAD'][2] and p['reload_event']==a['A_RELOAD'][3])
check('闪避区间与冷却一致',p['dodge_total']==a['A_DODGE'][2] and p['dodge_iframe_start']==a['A_DODGE'][3] and p['dodge_iframe_end']==a['A_DODGE'][4] and p['dodge_cooldown']==a['A_DODGE'][6])
check('无敌与出手不重叠',1<=p['dodge_iframe_start']<=p['dodge_iframe_end']<p['dodge_resume']<=p['dodge_total']<=p['dodge_cooldown'])
check('重射取消区间包含F6同帧裁决',a['A_HEAVY_FIRE'][5]=='1-6;19-30')
check('所有有限动作效果处于总长之内',all(r[2] is None or r[3] is None or 1<=r[3]<=r[4]<=r[2] for r in d['actions']))
check('敌人前摇与判定连续',all(r[4]==r[3]+1 and r[5]>=r[4] for r in d['enemies']))
check('用例保持待执行',all(r[5]=='待执行' for r in d['tests']))
check('满蓄完整动作114F',a['A_ENTER'][2]+p['charge_full']+a['A_HEAVY_FIRE'][2]==114)
check('理论持续DPS40',p['rifle_damage']*p['magazine']/(p['magazine']*p['fire_interval']/p['logic_hz']+p['reload_total']/p['logic_hz'])==40)
for filename,key in [('actions.csv','actions'),('parameters.csv','parameters'),('enemies.csv','enemies'),('test_cases.csv','tests')]:
 with (ROOT/'data'/filename).open(encoding='utf-8-sig') as f:rows=list(csv.reader(f))[1:]
 check(filename+' 与源数据记录数一致',len(rows)==len(d[key]))
 for left,right in zip(rows,d[key]):
  expected=['' if x is None else str(x) for x in right]
  check(filename+' '+right[0]+' 字段一致',left[:len(expected)]==expected)
files=sorted((ROOT/'docs').glob('0*.md'))
check('八个正文源文件存在',len(files)==8)
text='\n'.join(f.read_text(encoding='utf-8') for f in files)
check('正文说明未实机验证','没有实机手感' in text and '待执行' in text)
check('正文有F6同帧裁决','F6同一步先裁决取消' in text)
pdf=PdfReader(ROOT/'output/pdf/白雪公主_动作设计提案_V2.0.pdf')
pdftext='\n'.join(page.extract_text() or '' for page in pdf.pages)
for term in ['角色定位与改编','操作与资源','动作时序与衔接','命中与状态处理','敌人与验证场景','参数依据与配表方式','重构记录与参考']:
 check('PDF包含 '+term,term in pdftext)
check('PDF没有空白页',all(len(page.extract_text() or '')>100 for page in pdf.pages))
# Archived originals must retain byte-identical Git blobs.
baseline='635b4a5131cc1dcd406da79270ae858794c75967'
orig=subprocess.check_output(['git','ls-tree','-rz',baseline],cwd=ROOT)
archived=0
for raw in orig.split(b'\0'):
 if not raw:continue
 meta,path=raw.split(b'\t',1);name=path.decode('utf-8')
 if name in ('.gitignore',):continue
 # Always compare against the recorded pre-rebuild revision.
 if name.startswith(('archive/','docs/','assets/','data/','output/','tools/')):continue
 target=ROOT/'archive/v1'/name
 if not target.exists():continue
 blob=target.read_bytes();sha=hashlib.sha1(b'blob '+str(len(blob)).encode()+b'\0'+blob).hexdigest()
 check('旧文件保留 '+name,sha==meta.split()[2].decode());archived+=1
report={'date':'2026-10-27','scope':'文档、数据关系、导出内容与旧文件保留；不含游戏实现或实机测试','legacy_baseline':baseline,'checks':len(checks),'passed':sum(x[1] for x in checks),'pdf_pages':len(pdf.pages),'archive_blobs_verified':archived,'actions':len(d['actions']),'parameters':len(d['parameters']),'enemies':len(d['enemies']),'pending_gameplay_cases':len(d['tests'])}
(ROOT/'output/文档校验记录.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
