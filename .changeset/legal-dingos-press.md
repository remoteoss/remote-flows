---
'@remoteoss/remote-flows': patch
---

- Fix radio options, now they're disabled correctly [#330](https://github.com/remoteoss/remote-flows/pull/330)
- Fix multi-selects inside the fieldsets as it was rendered as a single select [#332](https://github.com/remoteoss/remote-flows/pull/332)
- Add window.RemoteFlowsSDK when you aren't in a production environment, to easily know which version consumers are using [#334](https://github.com/remoteoss/remote-flows/pull/334)
- Improvement on how fieldsets are invalidated, before if you touched a fielset the whole form was invalidated, now only after a submission is done [#337](https://github.com/remoteoss/remote-flows/pull/337)
