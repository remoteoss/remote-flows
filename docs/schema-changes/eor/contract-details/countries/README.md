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

### Countries that have migration guide

These countries have upgraded to different versions, check each guide to know how to migrate or what has changed

- [Argentina (ARG)](./ARG.md)
- [Armenia (ARM)](./ARM.md)
- [Australia (AUS)](./AUS.md)
- [Austria (AUT)](./AUT.md)
- [Bangladesh (BGD)](./BGD.md)
- [Belgium (BEL)](./BEL.md)
- [Brazil (BRA)](./BRA.md)
- [Bulgaria (BGR)](./BGR.md)
- [Canada (CAN)](./CAN.md)
- [China (CHN)](./CHN.md)
- [Chile (CHL)](./CHL.md)
- [Colombia (COL)](./COL.md)
- [Costa Rica (CRI)](./CRI.md)
- [Switzerland (CHE)](./CHE.md)
- [Czech Republic (CZE)](./CZE.md)
- [Denmark (DNK)](./DNK.md)
- [Dominican Republic (DOM)](./DOM.md)
- [Egypt (EGY)](./EGY.md)
- [El Salvador (SLV)](./SLV.md)
- [Estonia (EST)](./EST.md)
- [Finland (FIN)](./FIN.md)
- [Germany (DEU)](./DEU.md)
- [Guatemala (GTM)](./GTM.md)
- [Hong Kong (HKG)](./HKG.md)
- [Iceland (ISL)](./ISL.md)
- [India (IND)](./IND.md)
- [Ireland (IRL)](./IRL.md)
- [Israel (ISR)](./ISR.md)
- [Jamaica (JAM)](./JAM.md)
- [Kenya (KEN)](./KEN.md)
- [South Korea (KOR)](./KOR.md)
- [Lebanon (LBN)](./LBN.md)
- [Lithuania (LTU)](./LTU.md)
- [Mauritius (MUS)](./MUS.md)
- [Malaysia (MYS)](./MYS.md)
- [Mexico (MEX)](./MEX.md)
- [Netherlands (NLD)](./NLD.md)
- [Nigeria (NGA)](./NGA.md)
- [Norway (NOR)](./NOR.md)
- [New Zealand (NZL)](./NZL.md)
- [Pakistan (PAK)](./PAK.md)
- [Peru (PER)](./PER.md)
- [Philippines (PHL)](./PHL.md)
- [Poland (POL)](./POL.md)
- [Portugal (PRT)](./PRT.md)
- [Saudi Arabia (SAU)](./SAU.md)
- [Singapore (SGP)](./SGP.md)
- [South Africa (ZAF)](./ZAF.md)
- [Spain (ESP)](./ESP.md)
- [Serbia (SRB)](./SRB.md)
- [Sweden (SWE)](./SWE.md)
- [Thailand (THA)](./THA.md)
- [Uganda (UGA)](./UGA.md)
- [United Arab Emirates (ARE)](./ARE.md)
- [United Kingdom (GBR)](./GBR.md)
- [United States (USA)](./USA.md)
- [Uruguay (URY)](./URY.md)

### Countries on Contract Details v1

- All other countries - Default v1

## Version Matrix

**Remote platform** is the Contract Details version Remote's own platform uses for that country, usually the newest one available.

**Up to date** is Yes when the Contract Details version is the same as, or newer than, the Remote platform version. Last Updated is `-` for countries that haven't been upgraded or documented yet.

| Country                | Code | Contract Details | Remote platform | Up to date | Last Updated |
| ---------------------- | ---- | ---------------- | --------------- | ---------- | ------------ |
| Albania                | ALB  | v1               | v4              | No         | -            |
| Argentina              | ARG  | v5               | v5              | Yes        | October 2026 |
| Armenia                | ARM  | v3               | v3              | Yes        | October 2026 |
| Australia              | AUS  | v6               | v6              | Yes        | October 2026 |
| Austria                | AUT  | v8               | v8              | Yes        | October 2026 |
| Bangladesh             | BGD  | v8               | v8              | Yes        | October 2026 |
| Belgium                | BEL  | v8               | v8              | Yes        | October 2026 |
| Bolivia                | BOL  | v1               | v5              | No         | -            |
| Bosnia and Herzegovina | BIH  | v1               | v6              | No         | -            |
| Brazil                 | BRA  | v5               | v5              | Yes        | October 2026 |
| Bulgaria               | BGR  | v8               | v8              | Yes        | October 2026 |
| Canada                 | CAN  | v8               | v8              | Yes        | October 2026 |
| Chile                  | CHL  | v7               | v7              | Yes        | October 2026 |
| China                  | CHN  | v8               | v8              | Yes        | October 2026 |
| Colombia               | COL  | v6               | v6              | Yes        | October 2026 |
| Costa Rica             | CRI  | v5               | v5              | Yes        | October 2026 |
| Croatia                | HRV  | v1               | v6              | No         | -            |
| Cyprus                 | CYP  | v1               | v7              | No         | -            |
| Czech Republic         | CZE  | v7               | v7              | Yes        | October 2026 |
| Denmark                | DNK  | v6               | v6              | Yes        | October 2026 |
| Dominican Republic     | DOM  | v6               | v6              | Yes        | October 2026 |
| Ecuador                | ECU  | v1               | v7              | No         | -            |
| Egypt                  | EGY  | v6               | v6              | Yes        | October 2026 |
| El Salvador            | SLV  | v4               | v4              | Yes        | October 2026 |
| Estonia                | EST  | v5               | v5              | Yes        | October 2026 |
| Finland                | FIN  | v5               | v5              | Yes        | October 2026 |
| France                 | FRA  | v1               | v6              | No         | -            |
| Georgia                | GEO  | v1               | v6              | No         | -            |
| Germany                | DEU  | v9               | v9              | Yes        | October 2026 |
| Greece                 | GRC  | v1               | v6              | No         | -            |
| Guatemala              | GTM  | v6               | v6              | Yes        | October 2026 |
| Honduras               | HND  | v1               | v6              | No         | -            |
| Hong Kong              | HKG  | v2               | v6              | No         | March 2026   |
| Hungary                | HUN  | v1               | v4              | No         | -            |
| Iceland                | ISL  | v2               | v5              | No         | March 2026   |
| India                  | IND  | v7               | v7              | Yes        | October 2026 |
| Indonesia              | IDN  | v1               | v5              | No         | -            |
| Ireland                | IRL  | v5               | v5              | Yes        | October 2026 |
| Israel                 | ISR  | v8               | v8              | Yes        | October 2026 |
| Italy                  | ITA  | v2               | v5              | No         | -            |
| Jamaica                | JAM  | v5               | v5              | Yes        | October 2026 |
| Japan                  | JPN  | v1               | v5              | No         | -            |
| Kenya                  | KEN  | v8               | v8              | Yes        | October 2026 |
| Kosovo                 | XKX  | v1               | v3              | No         | -            |
| Latvia                 | LVA  | v1               | v6              | No         | -            |
| Lebanon                | LBN  | v4               | v4              | Yes        | October 2026 |
| Lithuania              | LTU  | v6               | v6              | Yes        | October 2026 |
| Luxembourg             | LUX  | v1               | v5              | No         | -            |
| Malaysia               | MYS  | v5               | v5              | Yes        | October 2026 |
| Malta                  | MLT  | v1               | v5              | No         | -            |
| Mauritius              | MUS  | v2               | v5              | No         | March 2026   |
| Mexico                 | MEX  | v9               | v9              | Yes        | October 2026 |
| Moldova                | MDA  | v1               | v6              | No         | -            |
| Morocco                | MAR  | v1               | v8              | No         | -            |
| Netherlands            | NLD  | v7               | v7              | Yes        | October 2026 |
| New Zealand            | NZL  | v8               | v8              | Yes        | October 2026 |
| Nicaragua              | NIC  | v1               | v4              | No         | -            |
| Nigeria                | NGA  | v5               | v5              | Yes        | October 2026 |
| North Macedonia        | MKD  | v1               | v6              | No         | -            |
| Norway                 | NOR  | v7               | v7              | Yes        | October 2026 |
| Pakistan               | PAK  | v4               | v4              | Yes        | October 2026 |
| Panama                 | PAN  | v1               | v7              | No         | -            |
| Paraguay               | PRY  | v1               | v8              | No         | -            |
| Peru                   | PER  | v4               | v4              | Yes        | October 2026 |
| Philippines            | PHL  | v9               | v9              | Yes        | October 2026 |
| Poland                 | POL  | v5               | v5              | Yes        | October 2026 |
| Portugal               | PRT  | v9               | v9              | Yes        | October 2026 |
| Puerto Rico            | PRI  | v1               | v6              | No         | -            |
| Romania                | ROU  | v1               | v6              | No         | -            |
| Saudi Arabia           | SAU  | v5               | v5              | Yes        | October 2026 |
| Serbia                 | SRB  | v9               | v9              | Yes        | October 2026 |
| Singapore              | SGP  | v5               | v5              | Yes        | October 2026 |
| Slovakia               | SVK  | v1               | v6              | No         | -            |
| Slovenia               | SVN  | v1               | v6              | No         | -            |
| South Africa           | ZAF  | v5               | v5              | Yes        | October 2026 |
| South Korea            | KOR  | v7               | v6              | Yes        | October 2026 |
| Spain                  | ESP  | v8               | v8              | Yes        | October 2026 |
| Sri Lanka              | LKA  | v1               | v8              | No         | -            |
| Sweden                 | SWE  | v5               | v5              | Yes        | October 2026 |
| Switzerland            | CHE  | v2               | v8              | No         | March 2026   |
| Taiwan                 | TWN  | v1               | v5              | No         | -            |
| Thailand               | THA  | v5               | v5              | Yes        | October 2026 |
| Tunisia                | TUN  | v1               | v8              | No         | -            |
| Turkey                 | TUR  | v1               | v7              | No         | -            |
| Uganda                 | UGA  | v5               | v5              | Yes        | October 2026 |
| Ukraine                | UKR  | v1               | v7              | No         | -            |
| United Arab Emirates   | ARE  | v6               | v6              | Yes        | October 2026 |
| United Kingdom         | GBR  | v7               | v7              | Yes        | October 2026 |
| United States          | USA  | v9               | v9              | Yes        | October 2026 |
| Uruguay                | URY  | v6               | v6              | Yes        | October 2026 |
| Vietnam                | VNM  | v1               | v7              | No         | -            |
| Zimbabwe               | ZWE  | v1               | v6              | No         | -            |

## How to Use

1. Find your country in the list above
2. Click the country link to view its complete changelog
3. Follow the migration instructions in the country file
4. Each country file shows what changed in each version for that specific country
