# Role and capability matrix

The MVP has no authentication. Roles describe product actors and repository responsibilities, not runtime permission claims.

| Capability | Anonymous learner | Maintainer | Contributor | Search crawler |
| --- | --- | --- | --- | --- |
| Browse catalog and published lessons | Yes | Yes | Yes | Yes |
| Search public content | Yes, locally | Yes | Yes | Indexable pages only |
| Mark completion | Local browser only | Local browser only | Local browser only | No |
| Create/edit/export study notes | Local browser only | Local browser only | Local browser only | No |
| Change theme | Local browser only | Local browser only | Local browser only | No |
| Access drafts in production | No | No runtime role | No | No |
| Author or revise content | No | Repository write access | Pull request | No |
| Publish a release | No | Protected repository workflow | No | No |
| Change schemas/architecture | No | ADR plus review | Proposal via PR | No |
| Access learner progress or notes | No | No | No | No |

## Repository authorization expectations

- `main` is protected; changes arrive through reviewed pull requests.
- Deployments require passing CI and Vercel checks.
- Production environment and DNS changes remain owner-only.
- Contributors never need access to learner data because MVP stores none server-side.
- If authentication or remote sync is introduced, this matrix must be replaced with an enforceable authorization design and tests before implementation.
