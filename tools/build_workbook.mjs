import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const d=JSON.parse(await fs.readFile(root+'/data/design.json','utf8'));
const wb=Workbook.create();
const p=wb.worksheets.add('参数');
const a=wb.worksheets.add('动作');
const c=wb.worksheets.add('试算');
const e=wb.worksheets.add('敌人');
const t=wb.worksheets.add('用例');
const matrices={
 '参数':[['参数ID','名称','初值','单位','约束','章节','选择原因'],...d.parameters],
 '动作':[['动作ID','名称','总长 F','效果起 F','效果止 F','可闪避区间 F','冷却 F','资源','回到状态'],...d.actions.map(r=>r.map(x=>x===null?'不适用':x))],
 '敌人':[['敌人ID','名称','生命','前摇 F','判定起 F','判定止 F','后摇 F','伤害','应对','特殊规则'],...d.enemies],
 '用例':[['用例ID','检查项','前置条件','操作','预期结果','执行状态','构建版本','实际结果','证据'],...d.tests.map(r=>[...r,'','',''])]
};
const widths={'参数':[25,27,12,12,25,10,28],'动作':[25,24,12,12,12,22,12,28,32],'敌人':[23,20,10,10,12,12,10,10,32,42],'用例':[12,25,40,44,65,16,18,44,38]};
for(const [name,m] of Object.entries(matrices)){
 const s=wb.worksheets.getItem(name);s.showGridLines=false;
 const cols=m[0].length;const all=s.getRangeByIndexes(0,0,m.length,cols);all.values=m;
 all.format.font={name:'Microsoft YaHei',size:11,color:'#242931'};all.format.rowHeight=32;all.format.verticalAlignment='center';
 for(let j=0;j<cols;j++) s.getRangeByIndexes(0,j,m.length,1).format.columnWidth=widths[name][j];
 const header=s.getRangeByIndexes(0,0,1,cols);header.format.fill='#242931';header.format.font={name:'Microsoft YaHei',size:11,bold:true,color:'#FFFFFF'};header.format.horizontalAlignment='center';
 if(name==='用例'){all.format.wrapText=true;all.format.rowHeight=54;header.format.rowHeight=34;s.getRange('F2:F35').dataValidation={rule:{type:'list',values:['待执行','通过','失败','阻塞']}};s.getRange('F2:F35').conditionalFormats.add('containsText',{text:'失败',format:{fill:'#FCE8E4',font:{color:'#A63225'}}});}
 const table=s.tables.add(`A1:${String.fromCharCode(64+cols)}${m.length}`,true,'Table'+({参数:'Params',动作:'Actions',敌人:'Enemies',用例:'Cases'}[name]));table.style='TableStyleLight1';
 if(name==='动作'){s.getRange('C2:G11').format.horizontalAlignment='center';s.getRange('C2:E11').setNumberFormat('0');s.getRange('G2:G11').setNumberFormat('0');}
 s.freezePanes.freezeRows(1);
}
p.getRange('C2:C38').format.fill='#FFF4DA';for(let i=0;i<d.parameters.length;i++)p.getRange(`C${i+2}`).setNumberFormat(Number.isInteger(d.parameters[i][2])?'0':'0.0');
p.getRange('I1').values=[['使用说明']];p.getRange('I2').values=[['全部为改编试调初值，未实机验证。']];p.getRange('I3').values=[['改值后回写 data/design.json 并重新导出。']];p.getRange('I4').values=[['配表格式参考 Epic Data Driven Gameplay Elements。']];p.getRange('I5').values=[['https://dev.epicgames.com/documentation/en-us/unreal-engine/data-driven-gameplay-elements-in-unreal-engine']];p.getRange('I1:I5').format.columnWidth=125;
const rows=[
 ['试算项','结果','单位','口径'],
 ['每秒发射','', '发/s','连续射击，不计中断'],
 ['单匣射击时间','', 's','按周期估算，忽略首发偏移'],
 ['单匣基础伤害','', '点','全中本体，不含弱点/装甲'],
 ['完整射击+换弹周期','', 's','完整换弹到F90，不取消后摇'],
 ['理论持续DPS','', '点/s','忽略走位、失误、受击与取消'],
 ['满能有效命中数','', '次','从0能量开始，向上取整'],
 ['满蓄完整动作时长','', 's','准备+蓄力+重射总长'],
 ['未蓄力重射','', '点','一次击发，仍消耗100能量'],
 ['满蓄重射','', '点','一次击发，不计弱点'],
 ['闪避无敌时长','', 'F','包含首尾两端'],
 ['蓄力示例时间',30,'F','可编辑；限制0至满蓄，超出值被封顶'],
 ['示例重射伤害','', '点','按线性蓄力公式计算'],
 ['数据状态','设计初值','', '试算不代表平衡性或实机测试结果']
];c.getRange('A1:D14').values=rows;c.showGridLines=false;
const ref=id=>`'参数'!C${d.parameters.findIndex(r=>r[0]===id)+2}`;
const act=id=>`'动作'!C${d.actions.findIndex(r=>r[0]===id)+2}`;
const formulas={B2:`=${ref('logic_hz')}/${ref('fire_interval')}`,B3:`=${ref('magazine')}*${ref('fire_interval')}/${ref('logic_hz')}`,B4:`=${ref('magazine')}*${ref('rifle_damage')}`,B5:`=B3+${ref('reload_total')}/${ref('logic_hz')}`,B6:'=B4/B5',B7:`=ROUNDUP(${ref('energy_cap')}/${ref('energy_gain')},0)`,B8:`=(${act('A_ENTER')}+${ref('charge_full')}+${act('A_HEAVY_FIRE')})/${ref('logic_hz')}`,B9:`=${ref('heavy_min')}`,B10:`=${ref('heavy_max')}`,B11:`=${ref('dodge_iframe_end')}-${ref('dodge_iframe_start')}+1`,B13:`=${ref('heavy_min')}+(${ref('heavy_max')}-${ref('heavy_min')})*MIN(MAX(B12,0),${ref('charge_full')})/${ref('charge_full')}`};
for(const [cell,f] of Object.entries(formulas))c.getRange(cell).formulas=[[f]];
c.getRange('A1:D14').format.font={name:'Microsoft YaHei',size:11,color:'#242931'};c.getRange('A1:D14').format.rowHeight=36;c.getRange('A1:D14').format.verticalAlignment='center';
for(const [col,w]of [['A',34],['B',20],['C',14],['D',60]])c.getRange(`${col}1:${col}14`).format.columnWidth=w;
c.getRange('A1:D1').format.fill='#242931';c.getRange('A1:D1').format.font={name:'Microsoft YaHei',size:11,bold:true,color:'#FFFFFF'};c.getRange('B2:B13').setNumberFormat('0');for(const cell of ['B3','B5','B6','B8'])c.getRange(cell).setNumberFormat('0.0');c.getRange('B12').format.fill='#FFF4DA';
c.getRange('B12').dataValidation={rule:{type:'whole',operator:'between',formula1:0,formula2:60}};
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:'试算!A1:D14',include:'values,formulas',tableMaxRows:14,tableMaxCols:4,maxChars:3500})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#NUM!|#NULL!',options:{useRegex:true,maxResults:20},maxChars:1000})).ndjson);
await fs.mkdir(root+'/output/previews',{recursive:true});
for(const [sheetName,range]of [['参数','A1:G13'],['动作','A1:I11'],['试算','A1:D14'],['敌人','A1:J4'],['用例','A1:F7']]){
 const img=await wb.render({sheetName,range,scale:1.5,format:'png'});await fs.writeFile(root+`/output/previews/sheet-${sheetName}.png`,new Uint8Array(await img.arrayBuffer()));
}
// Boundary checks in memory; restore the deliverable input afterwards.
for(const [input,expected]of [[0,80],[30,160],[60,240],[90,240]]){c.getRange('B12').values=[[input]];wb.recalculate();const actual=c.getRange('B13').values[0][0];if(actual!==expected)throw Error(`Charge ${input}: ${actual} != ${expected}`)}
c.getRange('B12').values=[[30]];wb.recalculate();
const out=await SpreadsheetFile.exportXlsx(wb);await out.save(root+'/output/白雪公主_动作参数与验证_V2.0.xlsx');
console.log('Saved workbook; charge boundaries verified');
