# Project decisions: Perangane Awak

The agent reads this file. Change a value here if the designer decides otherwise. If left unchanged, the agent uses the current value. Details are in `GAME_SPEC.md` section 16.

| Code | Decision | Current value |
|---|---|---|
| K-01 | Build AR mode? | **no** (3D on screen only). Change to "yes" to build Phase 7 |
| K-02 | Points allowed on the clothing surface | yes |
| K-03 | Wrong dots are disabled after a wrong tap | yes |
| K-04 | At most 1 hint per word | yes |
| K-05 | May switch word before answering correctly | yes |
| K-06 | Result categories | Sae Sanget 85-100, Sae 70-84.99, Cekap 55-69.99, Kedah Sinau Malih 0-54.99 |
| K-07 | Score storage/export | on screen only, no export |
| K-08 | Settings contents | sound on/off, text size, restart session |
| K-09 | Reference dictionary | not set |
| K-10 | Racikan and Ampeyan | unconfirmed; do not show their krama inggil value to students |
| K-11 | Rounding | two decimals |
| K-12 | Ampeyan point (sole faces down) | on top/side of the foot; camera may look up to 25 degrees below the floor line |
| K-13 | Model permission and credit | Credit line hidden by designer decision. Controlled by SHOW_MODEL_CREDIT and MODEL_CREDIT_NAME in src/config.ts. Written permission from the model creator is still the human's responsibility. |
| K-14 | Prompt shows Javanese word only | yes (during active question, show only the Javanese word, e.g. "Rikma", never its Indonesian meaning; Indonesian meaning allowed only in learning panel and materials) |

Model credit name (fill in before publishing): _______________________
