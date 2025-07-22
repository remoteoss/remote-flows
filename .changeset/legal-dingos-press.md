---
'@remoteoss/remote-flows': patch
---

- Fixed radio options to ensure they are properly disabled when needed [#330](https://github.com/remoteoss/remote-flows/pull/330)
- Fixed multi-select components inside fieldsets that were incorrectly rendering as single-select elements [#332](https://github.com/remoteoss/remote-flows/pull/332)
- Added window.RemoteFlowsSDK exposure in non-production environments to help identifing which version is being used [#334](https://github.com/remoteoss/remote-flows/pull/334)
- Improvement on how fieldsets are invalidated, before if you touched a fielset the whole form was invalidated, now only after a submission is done [#337](https://github.com/remoteoss/remote-flows/pull/337)
