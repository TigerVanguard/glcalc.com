# 01: 公式纯函数库（prefactor）

**What to build:** 集中式医学公式库：GL/GI 计算、mg/dL⇄mmol/L、A1C→eAG（双单位）、eAG→A1C 区间、GMI、GL/GI 连续分档。所有后续工具页只从这里取数。函数一律返回未舍入原始值，舍入只发生在展示层。规格：Spec §5A.1-1，黄金值与容差：Spec §8 T1（注意 eag(6.5)=139.85，139.9 是旧版错值）。

**Blocked by:** None（可立即开始）

**Status:** ready-for-agent

## Acceptance criteria

- [ ] `npm run test:unit` 绿；T1 表全部断言为容差式（禁止浮点严格相等）
- [ ] glBand/giBand 连续区间无空洞：10→Low、10.5→Medium、19.99→Medium、20→High；55→低、69.5→中、70→高
- [ ] a1cRange(126) 端点 = [5.5, 6.6]±0.01 且非单点；超 ADAG 范围返回 out-of-range 标记
- [ ] 任何函数不做内部舍入（断言 eag(6.5) 与 139.85 误差 <0.01）
