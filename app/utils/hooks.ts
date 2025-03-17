import { useEffect, useState, useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { safeLocalStorage } from "@/app/utils";
const storage = safeLocalStorage();
export function useAllModels() {
  const [availableModels, setAvailableModels] = useState([]);
  const accessStore = useAccessStore();
  const configStore = useAppConfig();

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/user/available_models"); // 替换为实际的 API 端点
        const data = await response.json();
        setAvailableModels(data.data || []); // 假设返回的数据结构中有一个 models 数组
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    }
    fetchModels();
  }, []); // 空依赖数组表示只在组件挂载时运行一次

  const models = useMemo(() => {
    let modelsArr: any = [];
    try {
      (availableModels || []).forEach((item, index) => {
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
    availableModels,
    accessStore.customModels,
    accessStore.defaultModel,
    configStore.customModels,
    configStore.models,
  ]);

  return models;
}
