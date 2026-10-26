# Schema Changes by Country

Country-specific schema version history and changelogs for employee onboarding flows.

## Why Country-Specific Changelogs?

Schema versions can have different implementations per country. Instead of generic version documentation, each country has its own changelog documenting exactly what changed for that country's onboarding flow.

## Type of change

Each version in a country guide has a **Type of change** line saying why the version exists, so you can tell which upgrades are urgent. A version can have more than one type, with the main one first.

| Type         | What it means for you                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `compliance` | A legal requirement changed. Upgrade to stay compliant.                                                          |
| `product`    | A new capability or improvement. Adopt it when you want it.                                                      |
| `technical`  | An internal or engine change. Usually no action is needed, but read the entry: it says if you must do something. |
| `bugfix`     | A correction to something that was wrong before.                                                                 |

The type tells you how urgent a change is. **What changed** and **Migration** tell you what to do.

## Quick Reference

Looking for versions that are being retired? See [deprecated versions](./DEPRECATIONS.md).

Click a country name to open its migration guide. Countries without a link are on the default v1 schema or have no guide yet.

## Version Matrix

**Remote platform** is the Contract Details version Remote's own platform uses for that country, usually the newest one available.

**Up to date** is Yes when the Contract Details version is the same as, or newer than, the Remote platform version, except France, which is marked up to date even though the platform lists v2. Last Updated is `-` for countries that haven't been upgraded or documented yet.

| Country                          | Code | Contract Details | Remote platform | Up to date | Last Updated |
| -------------------------------- | ---- | ---------------- | --------------- | ---------- | ------------ |
| [Albania](./ALB.md)              | ALB  | v4               | v4              | Yes        | October 2026 |
| [Argentina](./ARG.md)            | ARG  | v5               | v5              | Yes        | October 2026 |
| [Armenia](./ARM.md)              | ARM  | v3               | v3              | Yes        | October 2026 |
| [Australia](./AUS.md)            | AUS  | v6               | v6              | Yes        | October 2026 |
| [Austria](./AUT.md)              | AUT  | v8               | v8              | Yes        | October 2026 |
| [Bangladesh](./BGD.md)           | BGD  | v8               | v8              | Yes        | October 2026 |
| [Belgium](./BEL.md)              | BEL  | v8               | v8              | Yes        | October 2026 |
| Bolivia                          | BOL  | v1               | v5              | No         | -            |
| Bosnia and Herzegovina           | BIH  | v1               | v6              | No         | -            |
| [Brazil](./BRA.md)               | BRA  | v5               | v5              | Yes        | October 2026 |
| [Bulgaria](./BGR.md)             | BGR  | v8               | v8              | Yes        | October 2026 |
| [Canada](./CAN.md)               | CAN  | v8               | v8              | Yes        | October 2026 |
| [Chile](./CHL.md)                | CHL  | v7               | v7              | Yes        | October 2026 |
| [China](./CHN.md)                | CHN  | v8               | v8              | Yes        | October 2026 |
| [Colombia](./COL.md)             | COL  | v6               | v6              | Yes        | October 2026 |
| [Costa Rica](./CRI.md)           | CRI  | v5               | v5              | Yes        | October 2026 |
| Croatia                          | HRV  | v1               | v6              | No         | -            |
| [Cyprus](./CYP.md)               | CYP  | v7               | v7              | Yes        | October 2026 |
| [Czech Republic](./CZE.md)       | CZE  | v7               | v7              | Yes        | October 2026 |
| [Denmark](./DNK.md)              | DNK  | v6               | v6              | Yes        | October 2026 |
| [Dominican Republic](./DOM.md)   | DOM  | v6               | v6              | Yes        | October 2026 |
| Ecuador                          | ECU  | v1               | v7              | No         | -            |
| [Egypt](./EGY.md)                | EGY  | v6               | v6              | Yes        | October 2026 |
| [El Salvador](./SLV.md)          | SLV  | v4               | v4              | Yes        | October 2026 |
| [Estonia](./EST.md)              | EST  | v5               | v5              | Yes        | October 2026 |
| [Finland](./FIN.md)              | FIN  | v5               | v5              | Yes        | October 2026 |
| France                           | FRA  | v1               | v2              | Yes        | -            |
| [Georgia](./GEO.md)              | GEO  | v6               | v6              | Yes        | October 2026 |
| [Germany](./DEU.md)              | DEU  | v9               | v9              | Yes        | October 2026 |
| Greece                           | GRC  | v1               | v6              | No         | -            |
| [Guatemala](./GTM.md)            | GTM  | v6               | v6              | Yes        | October 2026 |
| Honduras                         | HND  | v1               | v6              | No         | -            |
| [Hong Kong](./HKG.md)            | HKG  | v2               | v6              | No         | March 2026   |
| Hungary                          | HUN  | v1               | v4              | No         | -            |
| [Iceland](./ISL.md)              | ISL  | v2               | v5              | No         | March 2026   |
| [India](./IND.md)                | IND  | v7               | v7              | Yes        | October 2026 |
| Indonesia                        | IDN  | v1               | v5              | No         | -            |
| [Ireland](./IRL.md)              | IRL  | v5               | v5              | Yes        | October 2026 |
| [Israel](./ISR.md)               | ISR  | v8               | v8              | Yes        | October 2026 |
| Italy                            | ITA  | v2               | v2              | Yes        | -            |
| [Jamaica](./JAM.md)              | JAM  | v5               | v5              | Yes        | October 2026 |
| Japan                            | JPN  | v1               | v5              | No         | -            |
| [Kenya](./KEN.md)                | KEN  | v8               | v8              | Yes        | October 2026 |
| Kosovo                           | XKX  | v1               | v3              | No         | -            |
| Latvia                           | LVA  | v1               | v6              | No         | -            |
| [Lebanon](./LBN.md)              | LBN  | v4               | v4              | Yes        | October 2026 |
| [Lithuania](./LTU.md)            | LTU  | v6               | v6              | Yes        | October 2026 |
| Luxembourg                       | LUX  | v1               | v5              | No         | -            |
| [Malaysia](./MYS.md)             | MYS  | v5               | v5              | Yes        | October 2026 |
| Malta                            | MLT  | v1               | v5              | No         | -            |
| [Mauritius](./MUS.md)            | MUS  | v6               | v5              | Yes        | October 2026 |
| [Mexico](./MEX.md)               | MEX  | v9               | v9              | Yes        | October 2026 |
| Moldova                          | MDA  | v1               | v6              | No         | -            |
| Morocco                          | MAR  | v1               | v8              | No         | -            |
| [Netherlands](./NLD.md)          | NLD  | v7               | v7              | Yes        | October 2026 |
| [New Zealand](./NZL.md)          | NZL  | v8               | v8              | Yes        | October 2026 |
| [Nicaragua](./NIC.md)            | NIC  | v4               | v4              | Yes        | October 2026 |
| [Nigeria](./NGA.md)              | NGA  | v5               | v5              | Yes        | October 2026 |
| North Macedonia                  | MKD  | v1               | v6              | No         | -            |
| [Norway](./NOR.md)               | NOR  | v7               | v7              | Yes        | October 2026 |
| [Pakistan](./PAK.md)             | PAK  | v4               | v4              | Yes        | October 2026 |
| Panama                           | PAN  | v1               | v7              | No         | -            |
| Paraguay                         | PRY  | v1               | v8              | No         | -            |
| [Peru](./PER.md)                 | PER  | v4               | v4              | Yes        | October 2026 |
| [Philippines](./PHL.md)          | PHL  | v9               | v9              | Yes        | October 2026 |
| [Poland](./POL.md)               | POL  | v5               | v5              | Yes        | October 2026 |
| [Portugal](./PRT.md)             | PRT  | v9               | v9              | Yes        | October 2026 |
| Puerto Rico                      | PRI  | v1               | v6              | No         | -            |
| Romania                          | ROU  | v1               | v6              | No         | -            |
| [Saudi Arabia](./SAU.md)         | SAU  | v5               | v5              | Yes        | October 2026 |
| [Serbia](./SRB.md)               | SRB  | v9               | v9              | Yes        | October 2026 |
| [Singapore](./SGP.md)            | SGP  | v5               | v5              | Yes        | October 2026 |
| Slovakia                         | SVK  | v1               | v6              | No         | -            |
| [Slovenia](./SVN.md)             | SVN  | v6               | v6              | Yes        | October 2026 |
| [South Africa](./ZAF.md)         | ZAF  | v5               | v5              | Yes        | October 2026 |
| [South Korea](./KOR.md)          | KOR  | v7               | v6              | Yes        | October 2026 |
| [Spain](./ESP.md)                | ESP  | v8               | v8              | Yes        | October 2026 |
| Sri Lanka                        | LKA  | v1               | v8              | No         | -            |
| [Sweden](./SWE.md)               | SWE  | v5               | v5              | Yes        | October 2026 |
| [Switzerland](./CHE.md)          | CHE  | v2               | v8              | No         | March 2026   |
| Taiwan                           | TWN  | v1               | v5              | No         | -            |
| [Thailand](./THA.md)             | THA  | v5               | v5              | Yes        | October 2026 |
| Tunisia                          | TUN  | v1               | v8              | No         | -            |
| Turkey                           | TUR  | v1               | v7              | No         | -            |
| [Uganda](./UGA.md)               | UGA  | v5               | v5              | Yes        | October 2026 |
| Ukraine                          | UKR  | v1               | v7              | No         | -            |
| [United Arab Emirates](./ARE.md) | ARE  | v6               | v6              | Yes        | October 2026 |
| [United Kingdom](./GBR.md)       | GBR  | v7               | v7              | Yes        | October 2026 |
| [United States](./USA.md)        | USA  | v9               | v9              | Yes        | October 2026 |
| [Uruguay](./URY.md)              | URY  | v6               | v6              | Yes        | October 2026 |
| [Vietnam](./VNM.md)              | VNM  | v7               | v7              | Yes        | October 2026 |
| Zimbabwe                         | ZWE  | v1               | v6              | No         | -            |

## How to Use

1. Find your country in the version matrix above
2. Click the country name to view its complete changelog (countries without a link have no guide yet)
3. Follow the migration instructions in the country file
4. Each country file shows what changed in each version for that specific country
