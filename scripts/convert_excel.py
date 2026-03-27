"""
Convert client Excel files to JSON and TypeScript data files.
Outputs:
  - public/data/enterprises.json
  - public/data/skill-talents.json
  - src/mock/localPolicies.ts
  - src/mock/localAggregations.ts
"""
import json, sys, os, re
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

try:
    import pandas as pd
except ImportError:
    print("Installing pandas + openpyxl...")
    os.system(f'"{sys.executable}" -m pip install pandas openpyxl -q')
    import pandas as pd

BASE = Path(__file__).resolve().parent.parent
EXCEL_DIR = Path(r"C:\work\交接\yc\宜昌提供本地特色数据")

# ─── 1. Enterprises ───────────────────────────────────────────────────────────
print("Reading enterprises...")
df_ent = pd.read_excel(EXCEL_DIR / "Organization_yichang（企业表）-3.16.xlsx", dtype=str)
# Skip first row if it's field descriptions (not real data)
first_id = str(df_ent.iloc[0].get('entity_id', ''))
if len(first_id) < 20 or '(' in first_id or '（' in first_id:
    df_ent = df_ent.iloc[1:].reset_index(drop=True)
df_ent = df_ent.fillna('')
enterprises = []
for _, r in df_ent.iterrows():
    enterprises.append({
        'id': r.get('entity_id', ''),
        'name': r.get('entity_name', ''),
        'type': r.get('entity_type', ''),
        'uscc': r.get('uscc', ''),
        'region': r.get('region', ''),
        'address': r.get('address', ''),
        'industryTags': r.get('industry_tags', ''),
        'contactPerson': r.get('contact_person', ''),
    })
out_ent = BASE / "public" / "data" / "enterprises.json"
with open(out_ent, 'w', encoding='utf-8') as f:
    json.dump(enterprises, f, ensure_ascii=False)
print(f"  -> {out_ent} ({len(enterprises)} records, {out_ent.stat().st_size // 1024}KB)")

# ─── 2. Skill Talents ─────────────────────────────────────────────────────────
print("Reading skill talents...")
df_tal = pd.read_excel(EXCEL_DIR / "yichang_local_personnel（宜昌技能人才数据-去邮箱手机号）3.16.xlsx", dtype=str)
# First row might be field description, check
if df_tal.iloc[0]['ID'] and len(df_tal.iloc[0]['ID']) < 10:
    df_tal = df_tal.iloc[1:].reset_index(drop=True)
df_tal = df_tal.fillna('')
talents = []
for _, r in df_tal.iterrows():
    talents.append({
        'id': r.get('ID', ''),
        'name': r.get('RealName', ''),
        'gender': r.get('Gender', ''),
        'education': r.get('Education_Name', ''),
        'school': r.get('School', ''),
        'major': r.get('Major', ''),
        'skill': r.get('SkillName', ''),
        'certificate': r.get('CertificateName', ''),
        'workingYears': r.get('WorkingYears', ''),
        'organization': r.get('OrganizationName', ''),
        'position': r.get('JobPosition', ''),
        'nativePlace': r.get('NativePlace', ''),
        'level': r.get('Level', ''),
        'industry': r.get('Industry', ''),
    })
out_tal = BASE / "public" / "data" / "skill-talents.json"
with open(out_tal, 'w', encoding='utf-8') as f:
    json.dump(talents, f, ensure_ascii=False)
print(f"  -> {out_tal} ({len(talents)} records, {out_tal.stat().st_size // 1024}KB)")

# ─── 3. Policies ──────────────────────────────────────────────────────────────
print("Reading policies...")
df_pol = pd.read_excel(EXCEL_DIR / "宜昌政策收集3.5.xlsx", sheet_name=0, dtype=str)
df_pol = df_pol.fillna('')

def derive_type(cats):
    if '人才' in cats: return '人才'
    if '产业' in cats: return '产业'
    if '技术' in cats or '科技' in cats or '创新' in cats: return '技术'
    if '资金' in cats or '财政' in cats or '金融' in cats: return '资金'
    return '综合'

def map_status(s):
    s = s.strip()
    if s in ('有效', '生效'): return 'active'
    if s in ('失效', '废止'): return 'expired'
    return 'active'

policies = []
for _, r in df_pol.iterrows():
    pid = r.get('policy_id', '')
    if not pid: continue
    # Skip header description row
    try: int(pid)
    except: continue
    cats_raw = ''
    for col in df_pol.columns:
        if 'Unnamed' in col and r.get(col, ''):
            cats_raw = r[col]
            break
    tags = [t.strip() for t in re.split(r'[,，、;；]', cats_raw) if t.strip()]
    deadline = r.get('expiry_date', '')
    if not deadline or deadline.lower() == 'nan': deadline = '长期有效'
    else: deadline = deadline.split(' ')[0]  # strip time
    pub_date = r.get('publish_date', '')
    if pub_date: pub_date = pub_date.split(' ')[0]
    policies.append({
        'id': str(pid),
        'title': r.get('title', ''),
        'department': r.get('issuer', ''),
        'publishDate': pub_date,
        'deadline': deadline,
        'type': derive_type(cats_raw),
        'tags': tags if tags else ['综合'],
        'summary': r.get('doc_no', '') or '',
        'status': map_status(r.get('status', '有效')),
        'sourceUrl': r.get('source_url', ''),
    })

out_pol = BASE / "src" / "mock" / "localPolicies.ts"
ts_content = "// Auto-generated from 宜昌政策收集3.5.xlsx\n"
ts_content += "export const policies = " + json.dumps(policies, ensure_ascii=False, indent=2) + ";\n"
with open(out_pol, 'w', encoding='utf-8') as f:
    f.write(ts_content)
print(f"  -> {out_pol} ({len(policies)} policies)")

# ─── 4. Job Positions ─────────────────────────────────────────────────────────
print("Reading job positions...")
df_job = pd.read_excel(EXCEL_DIR / "JobPosition_最近12个月（岗位表）-3.16.xlsx", dtype=str)
# First row might be field description
if df_job.iloc[0].get('demand_id', '') and len(str(df_job.iloc[0].get('demand_id', ''))) < 10:
    df_job = df_job.iloc[1:].reset_index(drop=True)
df_job = df_job.fillna('')

# ─── 5. Aggregations ──────────────────────────────────────────────────────────
print("Computing aggregations...")

# Enterprise aggregations
ent_type_counter = Counter(e['type'] for e in enterprises if e['type'])
ent_region_counter = Counter(e['region'] for e in enterprises if e['region'])
ent_industry_counter = Counter()
for e in enterprises:
    if e['industryTags']:
        for tag in re.split(r'[,，、;；]', e['industryTags']):
            tag = tag.strip()
            if tag: ent_industry_counter[tag] += 1

# Talent aggregations
tal_level_counter = Counter(t['level'] for t in talents if t['level'])
tal_industry_counter = Counter(t['industry'] for t in talents if t['industry'])
tal_education_counter = Counter(t['education'] for t in talents if t['education'])
tal_native_counter = Counter(t['nativePlace'] for t in talents if t['nativePlace'])

# Job position aggregations
pos_industry_counter = defaultdict(int)
for _, r in df_job.iterrows():
    occ = r.get('occupation_name', '') or r.get('position_name', '')
    headcount = 0
    try: headcount = int(r.get('headcount', '0'))
    except: pass
    if occ: pos_industry_counter[occ] += headcount

# Policy aggregations
pol_cat_counter = Counter()
for p in policies:
    for t in p['tags']:
        pol_cat_counter[t] += 1

# Top items for dashboard
top_enterprises = [{'name': e['name'], 'industry': e['industryTags'].split(',')[0].split('，')[0] if e['industryTags'] else ''} for e in enterprises if e['name']][:9]
top_talents = [{'name': t['name'], 'position': t['position'], 'organization': t['organization']} for t in talents if t['name']][:12]

# Count talent sub-stats for dashboard
yichang_native = sum(1 for t in talents if '宜昌' in t['nativePlace'])
leading_count = tal_level_counter.get('领军人才', 0)
innovation_count = tal_level_counter.get('创新人才', 0)
skill_count = tal_level_counter.get('技能人才', 0)

agg = {
    'totalEnterprises': len(enterprises),
    'totalSkillTalents': len(talents),
    'totalPolicies': len(policies),
    'enterpriseCountByType': dict(ent_type_counter.most_common(20)),
    'enterpriseCountByRegion': dict(ent_region_counter.most_common(20)),
    'enterpriseCountByIndustry': dict(ent_industry_counter.most_common(20)),
    'talentCountByLevel': dict(tal_level_counter),
    'talentCountByIndustry': dict(tal_industry_counter.most_common(20)),
    'talentCountByEducation': dict(tal_education_counter.most_common(10)),
    'talentCountByNativePlace': dict(tal_native_counter.most_common(20)),
    'positionCountByOccupation': dict(sorted(pos_industry_counter.items(), key=lambda x: -x[1])[:20]),
    'policyCountByCategory': dict(pol_cat_counter.most_common(20)),
    'topEnterprises': top_enterprises,
    'topSkillTalents': top_talents,
    'talentSubStats': {
        'yichangNative': yichang_native,
        'leading': leading_count,
        'innovation': innovation_count,
        'skill': skill_count,
    },
}

out_agg = BASE / "src" / "mock" / "localAggregations.ts"
ts_agg = "// Auto-generated aggregations from client Excel data\n"
ts_agg += "export const aggregations = " + json.dumps(agg, ensure_ascii=False, indent=2) + ";\n"
with open(out_agg, 'w', encoding='utf-8') as f:
    f.write(ts_agg)
print(f"  -> {out_agg}")

# Print summary
print("\n=== Summary ===")
print(f"Enterprises: {len(enterprises)} records")
print(f"  Types: {dict(ent_type_counter.most_common(5))}")
print(f"  Regions: {dict(ent_region_counter.most_common(5))}")
print(f"Skill Talents: {len(talents)} records")
print(f"  Levels: {dict(tal_level_counter)}")
print(f"  Industries: {dict(tal_industry_counter.most_common(6))}")
print(f"  Yichang native: {yichang_native}")
print(f"Policies: {len(policies)} records")
print(f"  Categories: {dict(pol_cat_counter.most_common(5))}")
print(f"Job Positions: {len(df_job)} records")
print(f"  Occupations: {dict(sorted(pos_industry_counter.items(), key=lambda x: -x[1])[:5])}")
print("\nDone!")
