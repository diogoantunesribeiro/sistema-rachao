import { createToolkitI18nCatalog } from "@agent-native/toolkit/app/i18n";

import enUS from "./en-US";
import ptBR from "./pt-BR";

export { ptBR };

export const i18nCatalog = createToolkitI18nCatalog({
  messages: enUS,
  sourceLocale: "en-US",
  supportedLocales: ["pt-BR"],
  restrictToCatalogLocales: true,
  localeLoaders: {
    "pt-BR": () => import("./pt-BR"),
  },
});
