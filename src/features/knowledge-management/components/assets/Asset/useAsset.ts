import { useEffect, useState } from "react";
import type { FullKnowledgeAssetDTO } from "@/modules/knowledge-base/knowledge-asset/@core-contracts/dtos";
import { removeAsset } from "../../../stores/assetsStores";

const execEnv = import.meta.env.PUBLIC_EXEC_ENV;
export const useAsset = (id: string) => {
  const [asset, setAsset] = useState<FullKnowledgeAssetDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSettingsOverlay, setOpenSettingsOverlay] = useState(false);
  const [openFilesOverlay, setOpenFilesOverlay] = useState(false);
  useEffect(() => {
    if (execEnv === "browser") {
      import("@/features/knowledge-management/lib/clientKnowledgeBaseApi").then(
        async ({ clientKnowledgeBaseApiFactory }) => {
          const knowledgeAssetsApi = await clientKnowledgeBaseApiFactory();
          knowledgeAssetsApi.getFullKnowledgeAssetById(id).then((asset) => {
            setAsset(asset.getValue());
          });
        }
      );
      return;
    }
  }, []);

  const onClickEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const confirm = window.confirm(
      "⚠️ ¿Estás seguro de eliminar este asset? ⚠️"
    );
    if (!confirm) return;
    if (execEnv === "browser") {
      import("@/features/knowledge-management/lib/clientKnowledgeBaseApi").then(
        ({ clientKnowledgeBaseApiFactory }) => {
          clientKnowledgeBaseApiFactory().then(async (api) => {
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
  return {
    asset,
    loading,
    error,
    openSettingsOverlay,
    setOpenSettingsOverlay,
    openFilesOverlay,
    setOpenFilesOverlay,
    onClickEvent,
  };
};
