# Kiburan Vendor App — Milestone 1: Project and Backend Audit

Status: **complete, awaiting review.** No app code, no migrations, and no client-app changes were made.

| Doc | Covers |
| --- | --- |
| [01-vendor-database-schema.md](01-vendor-database-schema.md) | Vendor tables, columns, constraints, triggers, indexes, seed data |
| [02-backend-functionality-and-auth.md](02-backend-functionality-and-auth.md) | Environment, existing vendor code paths, auth architecture, vendor account states, role capabilities |
| [03-rls-security-and-storage.md](03-rls-security-and-storage.md) | RLS policy table, verified security findings, storage buckets |
| [04-backend-gaps-and-proposed-migrations.md](04-backend-gaps-and-proposed-migrations.md) | Capability gaps, proposed migrations P1–P9, design-vs-backend conflicts, open questions |
| [05-architecture-and-roadmap.md](05-architecture-and-roadmap.md) | Repository layout, stack, folder structure, account-state routing, performance rules, roadmap |

## Summary

- The shared schema already models the vendor domain well (vendors, team roles, services, packages, media, availability, inquiries, quotes, bookings, reviews), and RLS is enabled everywhere.
- The client app only exercises the couple side: browse, shortlist, send inquiry. **Nothing creates quotes or bookings today**, so the vendor booking pipeline has no real data source until a quote-acceptance flow exists.
- Vendors cannot read the wedding, event, or customer profile behind their own inquiries/bookings. A scoped read RPC is required.
- Four security holes were confirmed on the local database (rolled back): self-verified vendor creation, and vendor-side rewriting/moving of couple-owned `wedding_vendors` and `vendor_inquiries` rows. Booking and quote rows have the same unrestricted pattern.
- There is no vendor storage bucket, no messaging, no notifications, no vendor-visible payment records, no vendor team invitation flow, and no admin approval tooling.
