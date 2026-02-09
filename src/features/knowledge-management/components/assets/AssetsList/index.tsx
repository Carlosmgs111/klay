import { useEffect, useState } from "react";
import { AssetIndex } from "../AssetCard";
import { assetsStore } from "../../../stores/assetsStores";
import { useStore } from "@nanostores/react";
import { Overlay } from "@/shared/components/Overlay";
import { KnowledgeGenerator } from "../../KnowledgeGenerator";
import Spinner from "@/shared/components/Spinner";
const execEnv = import.meta.env.PUBLIC_EXEC_ENV;

export const AssetsIndexesList = () => {
  const assets = useStore(assetsStore);
  const [openGenerator, setOpenGenerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (execEnv === "browser") {
      import("@/features/knowledge-management/lib/clientKnowledgeBaseApi")
        .then(async ({ clientKnowledgeBaseApiFactory }) => {
          const knowledgeAssetApi = await clientKnowledgeBaseApiFactory();
          return knowledgeAssetApi.getAllKnowledgeAssets();
        })
        .then((assets) => {
          assetsStore.set(assets.value);
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Error al cargar los assets");
          setIsLoading(false);
          console.error(err);
        });
      return;
    }

    fetch("/api/knowledge")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los assets");
        return res.json();
      })
      .then((data) => {
        assetsStore.set(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar los assets");
        setIsLoading(false);
        console.error(err);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Spinner size="lg" />
        <p className="text-slate-400 text-lg animate-pulse">
          Cargando assets...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/50">
          <i className="bx bx-error text-4xl text-red-500" />
        </div>
        <p className="text-red-400 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600
                     text-white transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,280px))] gap-4 text-sm text-white">
        {/* Add new asset button */}
        <button
          className="group relative flex flex-col items-center justify-center gap-3
                     p-6 rounded-xl w-full min-h-[280px]
                     cursor-pointer bg-slate-800/30 border-2 border-dashed border-slate-600/50
                     hover:border-blue-500/50 hover:bg-slate-800/50
                     transition-all duration-300 ease-out hover:-translate-y-1
                     hover:shadow-lg hover:shadow-blue-500/10
                     animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setOpenGenerator(true)}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full
                          bg-blue-500/10 group-hover:bg-blue-500/20
                          border border-blue-500/30 group-hover:border-blue-500/50
                          transition-all duration-300"
          >
            <i
              className="bx bxs-plus text-4xl text-blue-400 group-hover:text-blue-300
                          group-hover:rotate-90 transition-all duration-300"
            />
          </div>
          <span
            className="text-base font-semibold text-slate-300 group-hover:text-blue-300
                          transition-colors duration-300"
          >
            Agregar nuevo asset
          </span>
        </button>

        {/* Assets list with staggered animation */}
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className="animate-[fadeInUp_0.4s_ease-out]"
            style={{
              animationDelay: `${index * 0.05}s`,
              animationFillMode: "backwards",
            }}
          >
            <AssetIndex {...asset} />
          </div>
        ))}
      </div>

      <Overlay open={openGenerator} setOpen={setOpenGenerator}>
        <div className="flex flex-col gap-2 p-8 border border-gray-600/50 rounded-tl-lg rounded-bl-lg bg-slate-900 h-full w-[600px]">
          <KnowledgeGenerator />
        </div>
      </Overlay>

      {/* Add keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
