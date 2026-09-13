# 02: GI 数据展示规则与静态表选择器（prefactor）

**What to build:** 针对 GI 数据集（约 4900 条，含 DiOGenes 类别赋值噪声）的展示层规则：低碳水条目（carbs_per_100g < 2.5）显示 "GI: N/A (too little carbohydrate to measure) · GL ≈ 0" 而非数值 GI；静态参考表选择器只输出合规条目（≥2.5 且非编码嫌疑：carbs<10 ∧ GI∈{45,70} 排除），≥20 条覆盖主食/水果/蔬菜/乳制品/豆类。规格：Spec §6，测试：Spec §8 T2。

**Blocked by:** 01（分档函数）

**Status:** ready-for-agent

## Acceptance criteria

- [ ] `npm run test:unit` 绿：静态表选择器输出全量断言 carbs ≥2.5 且非编码嫌疑、条数 ≥20
- [ ] 回归锚点：低碳水蛋清条目（实测 carbs 1.2/0.4，非零）展示层返回 "GI: N/A"，永不输出数值 GI 70
- [ ] 规则是纯函数（不耦合 UI），供 11/12 号 ticket 复用
