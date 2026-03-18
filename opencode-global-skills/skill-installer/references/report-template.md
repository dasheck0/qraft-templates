# Security Report Template

Use this structure when generating the full `security-report.md` file.

---

```markdown
# Security Assessment Report: {skill_name}

**Source URL**: {github_url}  
**Assessment Date**: {ISO datetime}  
**Assessed by**: Claude ({model_id})  

---

## Overall Score: {score}% {emoji}

{1-2 sentence plain-language verdict}

---

## Files Inspected

| File | Size | Type |
|------|------|------|
| SKILL.md | 4.2KB | Markdown |
| scripts/install.py | 1.1KB | Python |
| ... | ... | ... |

---

## Deterministic Checks

| # | Check | Result | Details |
|---|-------|--------|---------|
| 1 | Dangerous shell patterns | ✅ Pass | No dangerous shell patterns found |
| 2 | Exfiltration patterns | ✅ Pass | No outbound data patterns detected |
| 3 | Secret harvesting | ✅ Pass | No secret/token references found |
| 4 | Unexpected file types | ✅ Pass | All files are expected types (.md, .py, .json) |
| 5 | External URL references | ⚠️ Warn | Found external URL: https://example.com/api in SKILL.md line 42 |
| 6 | Filesystem writes outside expected dirs | ✅ Pass | No writes to sensitive paths |
| 7 | Obfuscated content | ✅ Pass | No obfuscation detected |
| 8 | File size anomaly | ✅ Pass | Total size: 18KB (well within limits) |

---

## Semantic / LLM Assessment

### Prompt Injection
**Result**: ✅ No issues found  
No instructions attempting to override or manipulate Claude's core behavior were detected.

### Scope Manipulation  
**Result**: ⚠️ Minor concern  
The skill description says it "helps with React" but the body also contains instructions about modifying system files. This mismatch is worth noting, though it may be benign.

### Social Engineering
**Result**: ✅ No issues found

### Data Exfiltration Instructions
**Result**: ✅ No issues found

### Privilege Escalation
**Result**: ✅ No issues found

### Misleading Identity
**Result**: ✅ No issues found

---

## Score Breakdown

| Source | Deduction | Running Total |
|--------|-----------|---------------|
| Starting score | — | 100% |
| External URL reference (medium) | -10 | 90% |
| Scope mismatch (medium) | -10 | 80% |
| **Final Score** | | **80%** 🟡 |

---

## Recommendation

{Plain language summary: what the user should pay attention to, what looks fine, 
what would make this cleaner. Be honest and direct. If something looks suspicious, 
say so clearly. If it looks fine, say so too — false alarms erode trust.}
```
