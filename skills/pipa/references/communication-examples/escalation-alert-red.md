# Escalation alert (red)

```md
Hi all,

Orion Migration is at risk because the current backfill path can corrupt historical records.
**Need:** CTO + Data lead go/no-go decision by today 4:00 PM.

- **Status:** **🔴 Red** - We should not proceed on the current path.
- **What matters:** Root cause is confirmed; rollback script passed staging; rollback-first adds 3 days but protects data integrity.
- **Risk:** Devin - Any run before patch approval - Freeze + rollback-first execution.
- **Sources:** Incident doc ORION-214; DB audit diff report; Rollback runbook v3
```
