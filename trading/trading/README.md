# 交易记录系统

## 目录结构

```
trading/
├── YYYY/                           # 年份目录
│   ├── YYYY-MM/                   # 月份目录
│   │   ├── daily/                 # 日记录
│   │   │   ├── YYYY-MM-DD自评.md
│   │   │   └── YYYY-MM-DDAI评.md
│   │   ├── weekly/                # 周总结
│   │   │   ├── YYYY-W01.md
│   │   │   └── YYYY-W02.md
│   │   └── YYYY-MM_Summary.md     # 月度总结
│   └── YYYY_Annual_Summary.md     # 年度总结
└── README.md
```

---

## 🛠️ 工具脚本使用指南

> 所有脚本位于 `scripts/` 目录，需在项目根目录执行

### 1. 创建目录结构

```bash
# 创建2026年全部12个月
python scripts/create_trading_structure.py --year 2026

# 创建2026年1-3月
python scripts/create_trading_structure.py --year 2026 --months 1 2 3
```

### 2. 创建每日记录

```bash
# 创建今天的记录
python scripts/create_daily_record.py

# 创建指定日期
python scripts/create_daily_record.py --date 2025-01-02

# 只创建自评模板
python scripts/create_daily_record.py --type self

# 批量创建最近7天
python scripts/create_daily_record.py --range 7
```

### 3. 迁移现有记录

```bash
# 查看需要迁移的文件（不执行）
python scripts/migrate_trading_records.py --dry-run

# 执行迁移
python scripts/migrate_trading_records.py

# 只迁移2025年
python scripts/migrate_trading_records.py --year 2025
```

### 4. 生成总结

```bash
# 生成本周总结
python scripts/generate_summary.py --type weekly

# 生成月总结
python scripts/generate_summary.py --type monthly --month 12

# 生成年总结
python scripts/generate_summary.py --type yearly
```

---

## 📅 年份索引



## 2026年

### [一月](./2026/2026-01/)
- [日记录](./2026/2026-01/daily/)
- [周总结](./2026/2026-01/weekly/)
- [月度总结](./2026/2026-01/2026-01_Summary.md)

### [年度总结](./2026/2026_Annual_Summary.md)

---

## 🔄 日常工作流程

### 收盘后
```bash
# 1. 创建当日记录模板
python scripts/create_daily_record.py

# 2. 填写自评文件
# 编辑 trading/YYYY/YYYY-MM/daily/YYYY-MM-DD自评.md
```

### 周末
```bash
# 生成本周总结
python scripts/generate_summary.py --type weekly
```

### 月末
```bash
# 生成本月总结
python scripts/generate_summary.py --type monthly --month X
```

---

*详细使用说明请参考: [wiki/TRADING_RECORDS_GUIDE.md](../wiki/TRADING_RECORDS_GUIDE.md)*
