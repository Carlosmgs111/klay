import { removeAsset } from "./assetsStores";

const execEnv = import.meta.env.PUBLIC_EXEC_ENV;

export const AssetIndex = ({ id, name }: { id: string; name: string }) => {
  const onClickEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (execEnv === "browser") {
      import("@/modules/knowledge-base/orchestrator").then(
        ({ knowledgeAssetsApiFactory }) => {
          knowledgeAssetsApiFactory({
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
          }).then(async (api) => {
            const result = await api.deleteKnowledgeAsset(id);
            if (result) removeAsset(id);
          });
        }
      );
      return;
    }
    fetch(`/api/knowledge/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) removeAsset(id);
    });
  };
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-bold text-xl">{name}</h2>
      <button onClick={onClickEvent} className="font-bold">
        Eliminar
      </button>
    </div>
  );
};
