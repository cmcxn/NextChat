import { useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { safeLocalStorage } from "@/app/utils";
const storage = safeLocalStorage();
export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const models = useMemo(() => {
    let modelsArr: any = [];
    try {
      const modelString: any = storage.getItem("available_models");
      const modelList: any = JSON.parse(modelString);
      (modelList || []).forEach((item: any, index: any) => {
        modelsArr.push({
          name: item,
          available: true,
          sorted: 1000,
          provider: {
            id: item,
            providerName: item,
            providerType: item,
            sorted: index + 1,
          },
          displayName: item,
        });
      });
    } catch (e) {
      console.log(e);
    }
    return modelsArr;
  }, [
    accessStore.customModels,
    accessStore.defaultModel,
    configStore.customModels,
    configStore.models,
  ]);

  return models;
}
