import styles from "./register.module.scss";
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

export function RegisterPage() {
  const [userInput, setUserInput] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPassword2, setUserPassword2] = useState("");
  const navigate = useNavigate();
  const accessStore = useAccessStore();
  const goLogin = () => navigate(Path.Login);
  const goChat = () => {
    fetch("/api/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 添加内容类型
      },
      body: JSON.stringify({
        username: userInput,
        password: userPassword,
        password2: userPassword2,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          toast.success("注册成功");
          goLogin();
        } else {
          toast.error(res.message);
        }
      });
  };

  const goSaas = () => {
    goLogin();
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
    <div className={styles["register-page"]}>
      <div className={clsx("no-dark", styles["register-logo"])}>
        <BotIcon />
      </div>

      <div className={styles["register-title"]}>{Locale.Register.Title}</div>
      <div className={styles["register-tips"]}>{Locale.Register.Tips}</div>

      <UserInput
        label={Locale.Register.UserInputLabel}
        type="text"
        value={userInput}
        placeholder={Locale.Register.UserInputValue}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserInput(event.target.value);
        }}
      />
      <UserPassword
        label={Locale.Register.PasswordInputLabel}
        placeholder={Locale.Register.PasswordInputPassword}
        value={userPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserPassword(event.target.value);
        }}
      />
      <UserPassword
        label={Locale.Register.PasswordInputLabel2}
        placeholder={Locale.Register.PasswordInputPassword2}
        value={userPassword2}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setUserPassword2(event.target.value);
        }}
      />

      <div className={styles["register-actions"]}>
        <IconButton
          text={Locale.Register.Confirm}
          type="primary"
          onClick={goChat}
        />

        <span
          className={styles["register-text"]}
          onClick={() => {
            goSaas();
          }}
        >
          {Locale.Register.SaasTips}
        </span>
      </div>
    </div>
  );
}
