// B-03 ECharts 配置文件 · 2 张图（含容错包装，A-02 §4 52 条命名）

// =====================================================
// 容错入口：DOM就绪 + echarts可用 双检查
// =====================================================
(function safeInit() {
  function run() {
    if (typeof echarts === 'undefined') {
      ['chart_ulti_bs','chart_bs_heatmap'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) {
          el.innerHTML = '<div style="padding:60px 20px;text-align:center;color:#991B1B;font-size:14px;">图表库未加载（echarts.min.js 未找到）。请确认 _shared/js/echarts.min.js 存在于同目录。</div>';
          el.style.background = '#FEF2F2';
          el.style.border = '1px solid #FECACA';
          el.style.borderRadius = '10px';
        }
      });
      return;
    }
    try {

const fontBase = 'Noto Sans CJK SC, sans-serif';
const fontMono = 'JetBrains Mono, monospace';
const palette = {
  ink: '#0F172A', ink2: '#334155', ink3: '#64748B',
  accent: '#1E40AF', accent2: '#0369A1',
  ok: '#0F766E', okBg: '#DCFCE7',
  warn: '#B45309', warnBg: '#FEF3C7',
  danger: '#991B1B', dangerBg: '#FEE2E2',
  violet: '#6D28D9', violetBg: '#EDE9FE',
  line: '#E2E8F0', bg: '#F8FAFC',
  m01: '#DC2626',   // Mouth_Close 红
  e05: '#0891B2',   // Eye_Wide 青
  e13: '#7C3AED',   // Pupil_Constrict 紫
  e14: '#EA580C',   // Pupil_Dilate 橙
  b09: '#0369A1',   // Brow_Glare 蓝
  j02: '#991B1B',   // Jaw_Tighten 深红（唯一 100%）
  j04: '#0F766E',   // Jaw_Retract 绿
  disabled: '#94A3B8', // 锁 0
};

// ==============================================
// Chart 1: U 大招表情强度曲线（7 主通道 × 7 段 252F）
// ==============================================
(function chart1() {
  const el = document.getElementById('chart_ulti_bs');
  if (!el) return;
  const chart = echarts.init(el, null, { renderer: 'canvas' });

  const frames = [
    1,10,20,        // 段1 20F
    30,40,50,60,70,  // 段2 50F
    72,75,          // 段3 5F F075 峰值
    78,82,86,90,    // 段4 15F
    100,110,120,130,140,150,  // 段5 60F
    160,170,180,190,200,210,  // 段6 60F
    220,230,240,252,          // 段7 42F
  ];
  // 按 §04 分段参数表插值
  const m01 = [ // M01 Mouth_Close
    0.85,0.85,0.85, // 段1 保持
    0.85,0.85,0.85,0.85,0.85, // 段2 保持
    0.83,0.75, // 段3 F075→0.75（M02 Open_Small 同步开启）
    0.77,0.80,0.81,0.82, // 段4 回 0.82
    0.82,0.83,0.83,0.84,0.84,0.84, // 段5 回 0.84
    0.84,0.84,0.85,0.85,0.85,0.85, // 段6 回 0.85
    0.85,0.85,0.85,0.85, // 段7 保持
  ];
  const e05 = [ // E05/06 Eye_Wide 峰值 0.40
    0.05,0.08,0.10,
    0.14,0.18,0.22,0.26,0.30,
    0.38,0.40, // F075 峰值 0.40
    0.35,0.30,0.28,0.25,
    0.22,0.20,0.18,0.15,0.12,0.10,
    0.09,0.08,0.07,0.06,0.055,0.05,
    0.04,0.03,0.02,0.00,
  ];
  const e13 = [ // E13 Pupil_Constrict 击发 0.30
    0,0,0, 0,0,0,0,0,
    0.20,0.30, // F075 峰值 0.30
    0.22,0.12,0.05,0.00,
    0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,
  ];
  const e14 = [ // E14 Pupil_Dilate 峰值 0.50
    0.10,0.12,0.15,
    0.20,0.25,0.30,0.35,0.40,
    0.48,0.50, // F075 峰值 0.50
    0.43,0.35,0.30,0.25,
    0.23,0.22,0.21,0.19,0.17,0.15,
    0.14,0.13,0.12,0.11,0.105,0.10,
    0.09,0.08,0.07,0.05,
  ];
  const b09 = [ // B09/10 Brow_Glare 峰值 0.20
    0.05,0.08,0.10,
    0.11,0.12,0.13,0.14,0.15,
    0.18,0.20, // F075 峰值
    0.17,0.14,0.12,0.10,
    0.09,0.08,0.07,0.06,0.055,0.05,
    0.045,0.04,0.03,0.02,0.01,0.00,
    0.00,0.00,0.00,0.00,
  ];
  const j02 = [ // J02 Jaw_Tighten 全角色唯一 100% F070-F090
    0,0,0, 0,0,0,0,0,
    1.00,1.00, // F070 瞬间开
    1.00,1.00,1.00,1.00, // F090 前保持
    0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0, // F090 瞬间关
  ];
  const j04 = [ // J04 Jaw_Retract 0.15 基线
    0.15,0.15,0.15, // 段1 保持
    0.14,0.13,0.12,0.11,0.10, // 段2 降
    0.08,0.05, // 段3 下颌放开
    0.06,0.07,0.075,0.08,
    0.08,0.09,0.09,0.095,0.10,0.10,
    0.10,0.11,0.11,0.115,0.12,0.12,
    0.13,0.14,0.145,0.15,
  ];

  // 段分隔线（F20/F70/F75/F90/F150/F210）
  const splitLines = [
    { xAxis: 20, lineStyle: { color: '#94A3B8', type: 'dashed', width: 1 } },
    { xAxis: 70, lineStyle: { color: '#94A3B8', type: 'dashed', width: 1 } },
    { xAxis: 75, lineStyle: { color: palette.danger, type: 'solid', width: 2 } }, // F075 峰值
    { xAxis: 90, lineStyle: { color: '#94A3B8', type: 'dashed', width: 1 } },
    { xAxis: 150, lineStyle: { color: '#94A3B8', type: 'dashed', width: 1 } },
    { xAxis: 210, lineStyle: { color: '#94A3B8', type: 'dashed', width: 1 } },
  ];
  // 段色块
  const markAreas = [
    [{ xAxis: 1, itemStyle: { color: 'rgba(30,64,175,0.06)' } }, { xAxis: 20 }],
    [{ xAxis: 20, itemStyle: { color: 'rgba(109,40,217,0.08)' } }, { xAxis: 70 }],
    [{ xAxis: 70, itemStyle: { color: 'rgba(234,88,12,0.15)' } }, { xAxis: 75 }],
    [{ xAxis: 75, itemStyle: { color: 'rgba(15,118,110,0.08)' } }, { xAxis: 90 }],
    [{ xAxis: 90, itemStyle: { color: 'rgba(30,64,175,0.06)' } }, { xAxis: 150 }],
    [{ xAxis: 150, itemStyle: { color: 'rgba(30,64,175,0.06)' } }, { xAxis: 210 }],
    [{ xAxis: 210, itemStyle: { color: 'rgba(15,118,110,0.06)' } }, { xAxis: 252 }],
  ];

  const line = (name, data, color, w=2.5, dash='solid', sym='circle', ss=6, area=null) => ({
    name, type: 'line', smooth: true, symbol: sym, symbolSize: ss,
    data, itemStyle: { color }, lineStyle: { color, width: w, type: dash },
    ...(area ? { areaStyle: area } : {}),
  });

  const option = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: fontBase, color: palette.ink },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,.92)', borderWidth: 0,
      textStyle: { color: '#fff', fontFamily: fontBase, fontSize: 12 },
      axisPointer: { type: 'cross', lineStyle: { color: '#94A3B8', type: 'dashed' } },
      formatter: (params) => {
        const f = params[0].axisValue;
        let html = `<b style="font-family:${fontMono}">F${String(f).padStart(3,'0')}</b><br>`;
        params.forEach(p => {
          html += `<span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:50%;margin-right:6px;"></span>${p.seriesName}：<b style="font-family:${fontMono}">${typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</b><br>`;
        });
        return html;
      }
    },
    legend: {
      top: 0, right: 0,
      icon: 'roundRect', itemWidth: 16, itemHeight: 8,
      textStyle: { fontFamily: fontBase, color: palette.ink2, fontSize: 12 },
      data: ['M01 Mouth_Close', 'E05/06 Eye_Wide', 'E13 Pupil_Constrict', 'E14 Pupil_Dilate', 'B09/10 Brow_Glare', 'J02 Jaw_Tighten（值 1.00）', 'J04 Jaw_Retract'],
    },
    grid: { left: 48, right: 24, top: 60, bottom: 80 },
    xAxis: {
      type: 'category', data: frames,
      axisLabel: { fontFamily: fontMono, color: palette.ink3, fontSize: 11,
        formatter: v => `F${String(v).padStart(3,'0')}`,
        interval: 3, // 避免密集
      },
      axisLine: { lineStyle: { color: palette.line } },
      splitLine: { show: false },
      markLine: { silent: true, symbol: 'none', data: splitLines },
    },
    yAxis: {
      type: 'value', min: 0, max: 1,
      axisLabel: { fontFamily: fontMono, color: palette.ink3, fontSize: 11,
        formatter: v => v.toFixed(2),
      },
      axisLine: { lineStyle: { color: palette.line } },
      splitLine: { lineStyle: { color: palette.line, type: 'dashed' } },
      name: 'BS 通道值 [0,1]',
      nameTextStyle: { color: palette.ink3, fontSize: 11, fontFamily: fontBase },
    },
    series: [
      line('M01 Mouth_Close', m01, palette.m01, 3, 'solid', 'circle', 5,
        { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(220,38,38,.22)'},{offset:1,color:'rgba(220,38,38,.02)'}]) }
      ),
      line('E05/06 Eye_Wide', e05, palette.e05, 2.5, 'solid', 'triangle', 7),
      line('E13 Pupil_Constrict', e13, palette.e13, 2.5, 'solid', 'diamond', 6),
      line('E14 Pupil_Dilate', e14, palette.e14, 2.5, 'solid', 'rect', 6),
      line('B09/10 Brow_Glare', b09, palette.b09, 2.5, 'solid', 'pin', 6),
      line('J02 Jaw_Tighten（值 1.00）', j02, palette.j02, 3.5, 'solid', 'circle', 5,
        { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(153,27,27,.28)'},{offset:1,color:'rgba(153,27,27,.02)'}]) }
      ),
      line('J04 Jaw_Retract', j04, palette.j04, 2, 'dashed', 'roundRect', 5),
    ].map((s, i) => {
      // 第一个 series 带 markAreas
      if (i === 0) s.markArea = { silent: true, data: markAreas, label: { show: false } };
      return s;
    }),
    graphic: [
      { type: 'text', xAxis: 10, yAxis: 0.03, style: { text: '段1 切入', fill: palette.ink3, font: `400 10px ${fontBase}`, textAlign: 'center' } },
      { type: 'text', xAxis: 45, yAxis: 0.03, style: { text: '段2 蓄压50F', fill: palette.violet, font: `400 10px ${fontBase}`, textAlign: 'center' } },
      { type: 'text', xAxis: 72.5, yAxis: 0.01, style: { text: '段3 F075峰值', fill: palette.danger, font: `700 11px ${fontBase}`, textAlign: 'center' } },
      { type: 'text', xAxis: 82.5, yAxis: 0.03, style: { text: '段4 回落', fill: palette.ok, font: `400 10px ${fontBase}`, textAlign: 'center' } },
      { type: 'text', xAxis: 120, yAxis: 0.03, style: { text: '段5 余波', fill: palette.ink3, font: `400 10px ${fontBase}`, textAlign: 'center' } },
      { type: 'text', xAxis: 180, yAxis: 0.03, style: { text: '段6 收势', fill: palette.ink3, font: `400 10px ${fontBase}`, textAlign: 'center' } },
      { type: 'text', xAxis: 231, yAxis: 0.03, style: { text: '段7 对齐I-01', fill: palette.ok, font: `400 10px ${fontBase}`, textAlign: 'center' } },
    ],
  };
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
})();

// ==============================================
// Chart 2: 52 条 BS × 8 阶段 启用热力图（A-02 §4 真实命名）
// ==============================================
(function chart2() {
  const el = document.getElementById('chart_bs_heatmap');
  if (!el) return;
  const chart = echarts.init(el, null, { renderer: 'canvas' });

  const stages = ['I 待机', 'M 戒备', 'F 瞄准射击', 'F 换弹专注', 'E 过热态', 'D 受击', 'U 大招蓄→爆', 'D 死亡'];
  const channels = [
    // E01-E18
    ['E01','BS_Eye_Blink_L'],['E02','BS_Eye_Blink_R'],
    ['E03','BS_Eye_Squint_L'],['E04','BS_Eye_Squint_R'],
    ['E05','BS_Eye_Wide_L'],['E06','BS_Eye_Wide_R'],
    ['E07','BS_Eye_LookUp_L'],['E08','BS_Eye_LookDown_L'],
    ['E09','BS_Eye_LookUp_R'],['E10','BS_Eye_LookDown_R'],
    ['E11','BS_Eye_LookIn_L'],['E12','BS_Eye_LookOut_R'],
    ['E13','BS_Eye_Pupil_Constrict'],['E14','BS_Eye_Pupil_Dilate'],
    ['E15','BS_Eye_Tear_L'],['E16','BS_Eye_Tear_R'],
    ['E17','BS_Eye_LowerLid_Push_L'],['E18','BS_Eye_LowerLid_Push_R'],
    // M01-M18
    ['M01','BS_Mouth_Close'],['M02','BS_Mouth_Open_Small'],
    ['M03','BS_Mouth_Open_Medium'],['M04','BS_Mouth_Open_Wide'],
    ['M05','BS_Mouth_Lip_Pucker'],
    ['M06','BS_Mouth_Corner_Up_L'],['M07','BS_Mouth_Corner_Up_R'],
    ['M08','BS_Mouth_Corner_Down_L'],['M09','BS_Mouth_Corner_Down_R'],
    ['M10','BS_Mouth_Corner_Pull_L'],['M11','BS_Mouth_Corner_Pull_R'],
    ['M12','BS_Mouth_Lip_Upper_Roll'],['M13','BS_Mouth_Lip_Lower_Roll'],
    ['M14','BS_Mouth_Lip_Bite_Lower'],['M15','BS_Mouth_Lip_Bite_Upper'],
    ['M16','BS_Mouth_Puff_Cheek_L'],['M17','BS_Mouth_Puff_Cheek_R'],
    ['M18','BS_Mouth_Tongue_Out'],
    // B01-B10
    ['B01','BS_Brow_Raise_L'],['B02','BS_Brow_Raise_R'],
    ['B03','BS_Brow_Furrow_L'],['B04','BS_Brow_Furrow_R'],
    ['B05','BS_Brow_Tail_Up_L'],['B06','BS_Brow_Tail_Up_R'],
    ['B07','BS_Brow_Tail_Down_L'],['B08','BS_Brow_Tail_Down_R'],
    ['B09','BS_Brow_Glare_L'],['B10','BS_Brow_Glare_R'],
    // J01-J06
    ['J01','BS_Jaw_Open'],['J02','BS_Jaw_Tighten'],
    ['J03','BS_Jaw_Thrust_Forward'],['J04','BS_Jaw_Retract'],
    ['J05','BS_Jaw_Shift_L'],['J06','BS_Jaw_Shift_R'],
  ];
  const channelNames = channels.map(c => `${c[0]} ${c[1]}`);

  // 8 阶段最大值（与 §03 表完全一致，精度 0.01，heat 值 = 阶段 max×100 取整）
  // 格式：[colIdx, rowIdx, 阶段最大强度值×100]
  const raw = {
    // E01/E02 Blink：阶段 1-6/U 蓄力 0 → 死亡 0.70~1.00 取 100
    'E01': [100, 100, 0, 100, 100, 0, 0, 100],
    'E02': [100, 100, 0, 100, 100, 0, 0, 100],
    'E03': [0,0,0,0,0,0,0,0], // 锁0
    'E04': [0,0,0,0,0,0,0,0],
    'E05': [5, 10, 40, 10, 20, 35, 40, 0],
    'E06': [5, 10, 40, 10, 20, 35, 40, 0],
    'E07': [0, 0, 0, 0, 0, 0, 0, 0], // LookUp 补正 ≤0.20，但 §03 写 0~0.05 取 5
    'E08': [5, 0, 0, 10, 0, 0, 0, 0],
    'E09': [0, 0, 0, 0, 0, 0, 0, 0],
    'E10': [5, 0, 0, 10, 0, 0, 0, 0],
    'E11': [0, 0, 30, 0, 0, 0, 0, 0], // 护目镜 <30cm 对焦
    'E12': [0, 0, 30, 0, 0, 0, 0, 0],
    'E13': [0, 0, 30, 0, 0, 0, 30, 0], // F06 击发 0.30 / U F075 0.30
    'E14': [10, 10, 20, 10, 35, 50, 50, 50], // 死亡 0.50
    'E15': [0,0,0,0,0,0,0,0],
    'E16': [0,0,0,0,0,0,0,0],
    'E17': [0,0,0,0,0,0,0,0],
    'E18': [0,0,0,0,0,0,0,0],
    // M
    'M01': [85, 85, 85, 85, 80, 85, 85, 85],
    'M02': [0, 0, 60, 0, 10, 10, 20, 0], // 击发 0.60
    'M03': [0, 0, 0, 0, 0, 0, 0, 0], // 仅 H03 眩晕
    'M04': [0,0,0,0,0,0,0,0], // 锁0
    'M05': [0,0,0,0,0,0,0,0],
    'M06': [0,0,0,0,0,0,0,0],
    'M07': [0,0,0,0,0,0,0,0],
    'M08': [0,0,0,0,0,0,0,0],
    'M09': [0,0,0,0,0,0,0,0],
    'M10': [0,0,0,0,0,0,0,0],
    'M11': [0,0,0,0,0,0,0,0],
    'M12': [0,0,0,0,0,0,0,0],
    'M13': [0,0,0,0,0,0,0,0],
    'M14': [0,0,0,0,0,0,0,0],
    'M15': [0,0,0,0,0,0,0,0],
    'M16': [0, 0, 30, 0, 0, 0, 20, 0], // F-05 满蓄 0.30 / U 蓄 0.20
    'M17': [0, 0, 30, 0, 0, 0, 20, 0],
    'M18': [0,0,0,0,0,0,0,0],
    // B
    'B01': [0,0,0,0,0,0,0,0], 'B02': [0,0,0,0,0,0,0,0],
    'B03': [0,0,0,0,0,0,0,0], 'B04': [0,0,0,0,0,0,0,0],
    'B05': [0,0,0,0,0,0,0,0], 'B06': [0,0,0,0,0,0,0,0],
    'B07': [0,0,0,0,0,0,0,0], 'B08': [0,0,0,0,0,0,0,0],
    'B09': [0, 10, 20, 10, 15, 10, 20, 0],
    'B10': [0, 10, 20, 10, 15, 10, 20, 0],
    // J
    'J01': [0,0,0,0,0,0,0,30], // 死亡颌开 0.30
    'J02': [0,0,0,0,0,0,100,0], // U 大招值 1.00
    'J03': [0,0,0,0,0,0,0,0],
    'J04': [15, 15, 10, 10, 10, 10, 15, 15], // 标准基线 0.15
    'J05': [0,0,0,0,0,0,0,0],
    'J06': [0,0,0,0,0,0,0,0],
  };

  const data = [];
  channels.forEach((ch, row) => {
    const id = ch[0];
    const rowArr = raw[id] || [0,0,0,0,0,0,0,0];
    stages.forEach((s, col) => {
      data.push([col, row, rowArr[col]]);
    });
  });

  const option = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: fontBase, color: palette.ink },
    tooltip: {
      backgroundColor: 'rgba(15,23,42,.92)', borderWidth: 0,
      textStyle: { color: '#fff', fontFamily: fontBase, fontSize: 12 },
      formatter: (p) => {
        const col = p.value[0], row = p.value[1], v = p.value[2] / 100;
        const [id, name] = channels[row];
        const st = stages[col];
        let status = '';
        if (v === 0) status = '<span style="color:#94A3B8;">锁 0</span>';
        else if (['E03','E04','E15','E16','E17','E18','M04','M05','M06','M07','M08','M09','M10','M11','M12','M13','M14','M15','M18','B01','B02','B03','B04','B05','B06','B07','B08','J03','J05','J06'].includes(id))
          status = '<span style="color:#EF4444;">锁 0 通道，值应为 0</span>';
        else if (id === 'J02') status = `<span style="color:#DC2626;font-weight:700;">全角色唯一允许值 1.00（仅 U 大招 F070-F090）</span>`;
        else status = `<span style="color:#3B82F6;">部分启用</span>`;
        return `<b style="font-family:${fontMono}">${id}</b> <span style="font-family:${fontMono};color:#93C5FD;">${name}</span><br>阶段：${st}<br>最大强度：<b style="font-family:${fontMono}">${v.toFixed(2)}</b><br>状态：${status}`;
      }
    },
    grid: { left: 220, right: 60, top: 40, bottom: 100 },
    xAxis: {
      type: 'category', data: stages,
      axisLabel: { fontFamily: fontBase, color: palette.ink2, fontSize: 11.5, interval: 0 },
      axisLine: { lineStyle: { color: palette.line } },
    },
    yAxis: {
      type: 'category', data: channelNames,
      axisLabel: {
        fontFamily: fontMono, color: palette.ink2, fontSize: 10.5,
        formatter: (v) => {
          const id = v.split(' ')[0];
          // 锁0灰色斜体 / 常规启用深蓝 / J02 标红
          const lock0 = ['E03','E04','E15','E16','E17','E18','M04','M05','M06','M07','M08','M09','M10','M11','M12','M13','M14','M15','M18','B01','B02','B03','B04','B05','B06','B07','B08','J03','J05','J06'].includes(id);
          if (id === 'J02') return `{j02|${v}}`;
          if (lock0) return `{lock|${v}}`;
          const full8 = ['E01','E02','E14','M01']; // 常规启用 4 + 4 补充
          if (full8.includes(id)) return `{full|${v}}`;
          return v;
        },
        rich: {
          lock: { color: '#94A3B8', fontStyle: 'italic', fontFamily: fontMono, fontSize: 10.5 },
          full: { color: palette.accent, fontFamily: fontMono, fontSize: 10.5, fontWeight: 700 },
          j02:  { color: palette.danger, fontFamily: fontMono, fontSize: 10.5, fontWeight: 700 },
        }
      },
      axisLine: { lineStyle: { color: palette.line } },
    },
    visualMap: {
      min: 0, max: 100,
      calculable: true,
      orient: 'horizontal', left: 'center', bottom: 16,
      itemWidth: 16, itemHeight: 260,
      text: ['高 1.00', '低 0.00'],
      textStyle: { color: palette.ink3, fontFamily: fontBase, fontSize: 11 },
      inRange: {
        color: [
          '#E2E8F0',  // 0 = 锁 0（灰）
          '#F1F5F9',
          '#FEF3C7',  // 0.10 部分启用（黄）
          '#FDE68A',  // 0.20
          '#DBEAFE',  // 0.30 浅蓝
          '#93C5FD',  // 0.50 中蓝
          '#3B82F6',  // 0.70 亮蓝
          '#1D4ED8',  // 0.85 深兰
          '#1E3A8A',  // 1.00 主色深蓝（J02 100%）
        ]
      },
    },
    series: [{
      name: 'BS 最大强度值 × 100', type: 'heatmap',
      data,
      label: {
        show: true, fontFamily: fontMono,
        fontSize: 9.5,
        color: (p) => p.value[2] >= 60 ? '#fff' : (p.value[2] === 0 ? 'transparent' : palette.ink),
        formatter: (p) => {
          const v = p.value[2];
          if (v === 0) return '';
          return (v/100).toFixed(2);
        }
      },
      itemStyle: { borderColor: '#fff', borderWidth: 1, borderRadius: 2 },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(30,64,175,.3)' } },
    }],
  };
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
})();


    } catch (e) {
      console.error('[B-03 charts error]', e);
      ['chart_ulti_bs','chart_bs_heatmap'].forEach(function(id){
        var el = document.getElementById(id);
        if (el && !el.querySelector('canvas')) {
          el.innerHTML = '<div style="padding:60px 20px;text-align:center;color:#991B1B;font-size:13px;line-height:1.8;"><b>图表渲染异常：</b><br>' + String(e.message || e) + '<br><br>请按 F12 打开 Console 查看堆栈。</div>';
          el.style.background = '#FEF2F2';
          el.style.border = '1px solid #FECACA';
          el.style.borderRadius = '10px';
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
