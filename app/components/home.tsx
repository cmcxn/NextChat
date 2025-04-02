"use client";

require("../polyfill");

import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getISOLang, getLang } from "../locales";

import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { AuthPage } from "./auth";
import { LoginPage } from "./login";
import { RegisterPage } from "./register";
import { getClientConfig } from "../config/client";
import { type ClientApi, getClientApi } from "../client/api";
import { useAccessStore } from "../store";
import { useSyncStore } from "../store/sync";
import clsx from "clsx";
import { initializeMcpSystem, isMcpEnabled } from "../mcp/actions";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={clsx("no-dark", styles["loading-content"])}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
import { safeLocalStorage } from "@/app/utils";

import { ProviderType } from "../utils/cloud";
import { getHeaders } from "../client/api";
import { getModelProvider } from "../utils/model";

const storage = safeLocalStorage();
const Artifacts = dynamic(async () => (await import("./artifacts")).Artifacts, {
  loading: () => <Loading noLogo />,
});

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

const PluginPage = dynamic(async () => (await import("./plugin")).PluginPage, {
  loading: () => <Loading noLogo />,
});

const SearchChat = dynamic(
  async () => (await import("./search-chat")).SearchChatPage,
  {
    loading: () => <Loading noLogo />,
  },
);

const Sd = dynamic(async () => (await import("./sd")).Sd, {
  loading: () => <Loading noLogo />,
});

const McpMarketPage = dynamic(
  async () => (await import("./mcp-market")).McpMarketPage,
  {
    loading: () => <Loading noLogo />,
  },
);

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

export function WindowContent(props: { children: React.ReactNode }) {
  return (
    <div className={styles["window-content"]} id={SlotID.AppBody}>
      {props?.children}
    </div>
  );
}

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isArtifact = location.pathname.includes(Path.Artifacts);
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Auth;
  const isLogin = location.pathname === Path.Login;
  const isRegister = location.pathname === Path.Register;
  const isSd = location.pathname === Path.Sd;
  const isSdNew = location.pathname === Path.SdNew;

  const isMobileScreen = useMobileScreen();
  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  if (isArtifact) {
    return (
      <Routes>
        <Route path="/artifacts/:id" element={<Artifacts />} />
      </Routes>
    );
  }
  const renderContent = () => {
    if (isAuth) return <AuthPage />;
    if (isLogin) return <LoginPage />;
    if (isRegister) return <RegisterPage />;
    if (isSd) return <Sd />;
    if (isSdNew) return <Sd />;
    return (
      <>
        <SideBar
          className={clsx({
            [styles["sidebar-show"]]: isHome,
          })}
        />
        <WindowContent>
          <Routes>
            <Route path={Path.Home} element={<Chat />} />
            <Route path={Path.NewChat} element={<NewChat />} />
            <Route path={Path.Masks} element={<MaskPage />} />
            <Route path={Path.Plugins} element={<PluginPage />} />
            <Route path={Path.SearchChat} element={<SearchChat />} />
            <Route path={Path.Chat} element={<Chat />} />
            <Route path={Path.Settings} element={<Settings />} />
            <Route path={Path.McpMarket} element={<McpMarketPage />} />
          </Routes>
        </WindowContent>
      </>
    );
  };

  return (
    <div
      className={clsx(styles.container, {
        [styles["tight-container"]]: shouldTightBorder,
        [styles["rtl-screen"]]: getLang() === "ar",
      })}
    >
      {renderContent()}
    </div>
  );
}

export function useLoadData() {
  const config = useAppConfig();

  const api: ClientApi = getClientApi(config.modelConfig.providerName);

  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function Home() {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();

    const initMcp = async () => {
      try {
        const enabled = await isMcpEnabled();
        if (enabled) {
          console.log("[MCP] initializing...");
          await initializeMcpSystem();
          console.log("[MCP] initialized");
        }
      } catch (err) {
        console.error("[MCP] failed to initialize:", err);
      }
    };
    initMcp();
  }, []);

  const accessStore = useAccessStore();
  const syncStore = useSyncStore();
  const configStore = useAppConfig();
  useEffect(() => {
    // 获取个人信息
    fetch("/api/user/self", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          // 获取状态信息
          fetch("/api/status", {
            method: "GET",
          })
            .then((res1_2) => res1_2.json())
            .then((res1_2) => {
              // 配额_单位
              storage.setItem("quota_per_unit", res1_2.data.quota_per_unit);
              accessStore.update((state) => {
                // 剩余额度
                storage.setItem("quota", res.data.quota);
                const quotaPerUnit = parseFloat(
                  res1_2.data.quota_per_unit || "0",
                );
                state.$quota = ((res.data.quota || 0) / quotaPerUnit).toFixed(
                  2,
                );
              });
            });
          // 配置云同步，同步类型
          syncStore.update((config) => {
            config.provider = "upstash" as ProviderType;
            config.upstash.endpoint = "https://unified-kitten-32655.upstash.io";
            config.upstash.username = storage.getItem("username") as string;
            config.upstash.apiKey =
              "AX-PAAIjcDExZDE2NDY4MGZmYjk0YzQ5OGQ3ZmY3NjAyMjZhZmRiNXAxMA";
          });
          // 获取key
          fetch(`/api/tk/`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + res.data.access_token,
            },
          })
            .then((res2) => res2.json())
            .then((res2) => {
              if (Array.isArray(res2.data)) {
                storage.setItem("key", "sk-" + res2.data?.[0]?.key);
                accessStore.update(
                  (access) =>
                    (access.openaiApiKey = "sk-" + res2.data?.[0]?.key),
                );
              }
            });
        } else {
          window.location.href = window.location.origin + "/#/login";
        }
      });
    // 设置全局默认模型、接口地址
    fetch("/api/config", {
      method: "post",
      body: null,
      headers: {
        ...getHeaders(),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const defaultModel = res.defaultModel ?? "";
        if (defaultModel !== "" && !useAppConfig.getState().modelConfig.model) {
          configStore.update((config: any) => {
            const [model, providerName] = getModelProvider(defaultModel);
            config.modelConfig.model = model;
            config.modelConfig.providerName = providerName as any;
          });
        }
        // 更新模型服务商
        const baseUrl = res.baseUrl ?? "";
        if (baseUrl !== "") {
          accessStore.update((access) => {
            access.openaiUrl = baseUrl;
          });
        }
        // 对话摘要模型
        const compressModel = res.compressModel ?? "";
        if (compressModel !== "") {
          configStore.update((config: any) => {
            const [model, providerName] = getModelProvider(compressModel);
            config.modelConfig.compressModel = model;
            config.modelConfig.compressProviderName = providerName as any;
          });
        }
        // 是否使用自定义接口
        const useCustomConfig: any = res.useCustomConfig || false;
        if (useCustomConfig == true) {
          accessStore.update((access) => {
            access.useCustomConfig = true;
          });
        }
      });
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }
  return (
    <ErrorBoundary>
      <Router>
        <Screen />
        <ToastContainer />
      </Router>
    </ErrorBoundary>
  );
}
