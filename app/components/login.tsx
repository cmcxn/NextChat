import styles from "./login.module.scss";
import { IconButton } from "./button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";
import BotIcon from "../icons/bot.svg";
import { getClientConfig } from "../config/client";
import { UserInput, UserPassword } from "./ui-lib";
import { safeLocalStorage } from "@/app/utils";

import clsx from "clsx";

import { toast } from "react-toastify";

const storage = safeLocalStorage();

export function LoginPage() {
  const [userInput, setUserInput] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const navigate = useNavigate();
  const accessStore = useAccessStore();
  const goHome = () => navigate(Path.Home);
  const goRegister = () => navigate(Path.Register);
  // const goChat = () => navigate(Path.Chat);
  const goChat = () => {
    if (!userInput || !userPassword) {
      toast.error("请输入用户名或密码");
      return;
    }
    fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 添加内容类型
      },
      body: JSON.stringify({ username: userInput, password: userPassword }),
    })
      .then((res1) => res1.json())
      .then((res1) => {
        if (res1.success) {
          storage.setItem("username", res1.data.username);
          fetch("/api/user/self", {
            method: "GET",
          })
            .then((res2) => res2.json())
            .then((res2) => {
              storage.setItem("access_token", res2.data.access_token);

              accessStore.update(
                (access) =>
                  (access.openaiUrl = process.env
                    .NEXT_PUBLIC_SERVE_URL as string),
              );
              fetch(`/api/tk/`, {
                method: "GET",
                headers: {
                  Authorization: "Bearer " + storage.getItem("access_token"),
                },
              })
                .then((res3) => res3.json())
                .then((res3) => {
                  if (Array.isArray(res3.data)) {
                    storage.setItem("key", "sk-" + res3.data?.[0]?.key);
                    accessStore.update(
                      (access) =>
                        (access.openaiApiKey = "sk-" + res3.data?.[0]?.key),
                    );
                  }
                });

              fetch(`/api/user/available_models`)
                .then((res3) => res3.json())
                .then((res3) => {
                  storage.setItem(
                    "available_models",
                    JSON.stringify(res3.data),
                  );
                  goHome();
                });
            });
        } else {
          toast.error(res1.message);
        }
      });
  };

  const goSaas = () => {
    goRegister();
  };

  const resetAccessCode = () => {
    accessStore.update((access) => {
      access.openaiApiKey = "";
      access.accessCode = "";
    });
  }; // Reset access code to empty string

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles["login-page"]}>
      <div className={clsx("no-dark", styles["login-logo"])}>
        <BotIcon />
      </div>

      <div className={styles["login-title"]}>{Locale.Login.Title}</div>
      <div className={styles["login-tips"]}>{Locale.Login.Tips}</div>

      <UserInput
        label={Locale.Login.UserInputLabel}
        type="text"
        value={userInput}
        placeholder={Locale.Login.UserInputValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserInput(event.target.value);
        }}
      />
      <UserPassword
        label={Locale.Login.PasswordInputLabel}
        placeholder={Locale.Login.PasswordInputPassword}
        value={userPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserPassword(event.target.value);
        }}
      />

      <div className={styles["login-actions"]}>
        <IconButton
          text={Locale.Login.Confirm}
          type="primary"
          onClick={goChat}
        />

        <span
          className={styles["register-text"]}
          onClick={() => {
            goSaas();
          }}
        >
          {Locale.Login.SaasTips}
        </span>
      </div>
    </div>
  );
}
