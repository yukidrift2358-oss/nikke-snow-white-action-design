from pathlib import Path
from html import escape

ROOT=Path(__file__).resolve().parents[1]
A=ROOT/'assets'
INK='#242931'; MUTED='#65707b'; GOLD='#b98a2d'; LIGHT='#f1f2f3'; RED='#b75040'
def text(x,y,s,size=20,fill=INK,weight='normal'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}">{escape(s)}</text>'
def rect(x,y,w,h,fill=LIGHT,stroke='none',r=4):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>'
def line(x,y,xx,yy,color=MUTED,arrow=False,dash=False):
    return f'<path d="M{x},{y} L{xx},{yy}" fill="none" stroke="{color}" stroke-width="2" '+('marker-end="url(#arrow)" ' if arrow else '')+('stroke-dasharray="7 5" ' if dash else '')+'/>'
def base(title,subtitle,h=620):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{h}" viewBox="0 0 1200 {h}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" fill="{MUTED}"/></marker></defs><rect width="1200" height="100%" fill="white"/><g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">',text(44,55,title,30,weight='bold'),text(44,91,subtitle,17,MUTED)]
def save(name,parts,h=620):
    parts += [line(44,h-48,1156,h-48,'#dedfe1'),text(44,h-20,'白雪公主 · 第三人称动作设计提案  /  2.0  /  参数待原型试调',15,MUTED),'</g></svg>']
    (A/f'{name}.svg').write_text(''.join(parts),encoding='utf-8')

p=base('战斗状态与资源流向','步枪命中回能；重射在实际发射时消耗。撤离保留能量，清空本次蓄力。')
for x,title,sub in [(44,'步枪射击','每发命中 +2 能量'),(328,'重武器准备','满 100 能量 · 24F'),(612,'蓄力与瞄准','左键按住 · 最长 60F'),(896,'重射击发','松开 · F6 扣 100 能量')]:
    p += [rect(x,180,260,130),text(x+20,225,title,24,weight='bold'),text(x+20,267,sub,17,MUTED)]
for x in [304,588,872]:p += [line(x+2,244,x+20,244,arrow=True)]
p += [line(1026,310,1026,386),line(1026,386,174,386),line(174,386,174,311,arrow=True),text(455,374,'重射结束 → 回到步枪',20),rect(438,440,324,72,'#faf3e4'),text(466,483,'Shift 撤离 / Q 收枪',23),line(742,311,742,428,arrow=True),text(44,521,'弹匣 30 发 → R 换弹 → F66 补满 → F90 恢复；可用闪避中断。',19)]
save('combat-flow',p)

p=base('关键动作时序','逻辑步以 F1 起算，区间包含两端。取消先于本步动作事件处理。',650)
scale=9
def bar(y,label,total,segments,notes):
    p.extend([text(44,y+29,label,22,weight='bold')])
    x=254
    for start,end,fill,label2 in segments:
        p.extend([rect(x+(start-1)*scale,y,(end-start+1)*scale,44,fill,r=1),text(x+(start-1)*scale+7,y+28,label2,15,'white' if fill in [INK,RED,GOLD] else INK)])
    p.extend([text(254,y+72,notes,17,MUTED)])
bar(160,'换弹 / 90F',90,[(1,65,LIGHT,'准备与装填'),(66,66,GOLD,''),(67,90,LIGHT,'收尾')],'F66 补弹；同一步闪避优先，本次不补弹。')
bar(282,'闪避 / 30F',30,[(1,3,LIGHT,''),(4,12,GOLD,'无敌'),(13,18,LIGHT,''),(19,30,INK,'可接动作')],'F4–F12 无敌；F19 恢复出手；冷却从启动起共 48F。')
bar(404,'重射 / 30F',30,[(1,5,LIGHT,''),(6,6,RED,''),(7,18,INK,'锁定'),(19,30,GOLD,'可闪避')],'F6 发射；该步若先接受闪避则不击发。F7–F18 不可取消。')
p += [text(254,550,'完整满蓄：准备 24F + 蓄力 60F + 重射 30F = 114F（1.9s）',20)]
save('action-timeline',p,650)

p=base('枪口遮挡与命中结算','准星可见不等于枪口可射；同一攻击对同一目标只结算一次。')
p += [rect(80,180,190,190,'#eceef0'),text(110,223,'玩家 / 枪口',24,weight='bold'),text(110,264,'相机位于侧后',17,MUTED),rect(474,151,58,230,INK),text(462,410,'实体墙',20),rect(922,180,210,180),text(950,224,'目标',24,weight='bold'),text(950,266,'本体 + 弱点',19),line(262,160,1025,160,GOLD,True,True),text(550,145,'相机中心射线：获得期望瞄准点',18,GOLD),line(270,287,474,237,RED,True),text(300,335,'枪口射线被墙挡住',20,RED),text(730,337,'不扣目标生命 / 不回能',19),rect(80,455,1052,74),text(108,500,'attack_id + target_id 去重  →  取首个有效表面  →  伤害与回能各提交一次',21)]
save('hit-resolution',p)

p=base('灰盒验证场地','24m × 18m 的训练场概念布局；敌人代号用于功能验证，不是原作敌人设定。',700)
p += [rect(65,145,760,480,'#fafafa',INK),text(365,172,'24m',17,MUTED),text(79,400,'18m',17,MUTED),rect(270,310,145,60,INK),rect(550,390,145,60,INK),text(284,347,'实心掩体',20,'white'),text(564,427,'实心掩体',20,'white')]
for x,y,name,color in [(436,560,'玩家入口',GOLD),(410,235,'远程兵',INK),(640,224,'装甲兵',INK),(165,320,'近战兵',RED)]:
    p += [f'<circle cx="{x}" cy="{y}" r="15" fill="{color}"/>',text(x+23,y+7,name,19,color)]
p += [line(437,541,442,285,GOLD,True,True),text(850,203,'摆放检查',24,weight='bold'),text(850,255,'1  单敌先测',21),text(850,310,'2  三类再混合',21),text(850,365,'3  同线测贯穿',21),text(850,420,'4  墙边测遮挡',21),text(850,485,'5  边界测闪避',21),text(850,551,'同一时刻 1 个攻击权限',17,MUTED)]
save('test-arena',p,700)

p=base('战斗信息布局','重武器状态示意。仅保留玩家能据此操作的信息；画面与数值不是实机截图。',740)
p += [rect(44,135,1112,510,'#eeeff0'),rect(70,170,230,30,'#dedfe0'),text(82,192,'当前威胁：前方装甲兵',17),rect(810,204,278,110,'#fafafa'),text(835,243,'弱点暴露',24,weight='bold'),text(835,279,'等待攻击结束后蓄力',18,MUTED),line(570,371,630,371,INK),line(600,341,600,401,INK),rect(685,320,16,120,'white',MUTED),rect(686,380,14,59,GOLD),text(723,357,'蓄力 50%',23),text(723,395,'松开击发',22),text(723,433,'Shift 撤离 / Q 收枪',18,MUTED),rect(77,557,250,50,'white'),text(94,590,'生命 100 / 100',22),rect(814,543,313,76,'white'),text(835,575,'弹药 18 / 30',21),text(835,605,'能量 100 / 100',21,GOLD),text(80,675,'信息位置示意：蓄力 50% 为示例状态，不是测试数据。',17,MUTED)]
save('combat-ui',p,740)
print('Generated 5 editable diagrams')
