import { useEffect } from "react";
import type { KnowledgeAssetsAPI } from "@/modules/knowledge-base/orchestrator/@core-contracts/api";
import { AssetIndex } from "./AssetIndex";
import { assetsStore } from "./assetsStores";
import { useStore } from "@nanostores/react";

const execEnv = import.meta.env.PUBLIC_EXEC_ENV;

export const AssetsList = () => {
  const assets = useStore(assetsStore);
  useEffect(() => {
    if (execEnv === "browser") {
      import("@/modules/knowledge-base/orchestrator").then(
        async ({ knowledgeAssetsApiFactory }) => {
          const knowledgeAssetApi: KnowledgeAssetsAPI =
            await knowledgeAssetsApiFactory({
              filesPolicy: {
                storage: "browser-fs",
                repository: "idb",
              },
              textExtractionPolicy: {
                extractor: "browser-pdf",
                repository: "idb",
              },
              chunkingPolicy: {
                strategy: "fixed",
              },
              embeddingsPolicy: {
                provider: "browser-hf",
                repository: "idb",
              },
              knowledgeAssetPolicy: {
                repository: "idb",
                aiProvider: "web-llm",
              },
            });
          knowledgeAssetApi.getAllKnowledgeAssets().then((assets) => {
            assetsStore.set(assets);
          });
        }
      );
      return;
    }
    fetch("/api/knowledge").then((res) => {
      res.json().then((data) => {
        assetsStore.set(data);
      });
    });
  }, []);
  return (
    <div className="flex flex-col gap-2 text-sm text-white">
      {assets.map((asset) => (
        <AssetIndex key={asset.id} {...asset} />
      ))}
    </div>
  );
};
