"use client";

import React, { Suspense } from "react";
import { Button, Card, CardBody, CardHeader, Form, Input, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";

const inputClassNames = {
  label: "text-sm font-semibold text-slate-800",
  input: "text-base font-medium text-slate-950 placeholder:text-slate-500",
  inputWrapper:
    "h-14 border-2 border-slate-300 bg-white shadow-sm data-[hover=true]:border-slate-500 group-data-[focus=true]:border-primary group-data-[focus=true]:ring-4 group-data-[focus=true]:ring-primary/15",
};
const AUTH_PENDING_KEY = "ai-content-auth-pending";

function LoginPageFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <Spinner size="sm" />
        <span className="text-sm text-slate-600">正在检查登录状态...</span>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [hasUsers, setHasUsers] = React.useState(true);

  const navigateToNext = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.assign(nextPath);
      return;
    }

    router.replace(nextPath);
  }, [nextPath, router]);

  React.useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [setup, currentUser] = await Promise.allSettled([
          authApi.setupStatus(),
          authApi.me(),
        ]);

        if (!active) {
          return;
        }

        if (setup.status === "fulfilled") {
          setHasUsers(setup.value.hasUsers);
        }

        if (currentUser.status === "fulfilled") {
          navigateToNext();
          return;
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [navigateToNext]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      toast.error("请输入账号和密码");
      return;
    }

    try {
      setSubmitting(true);
      await authApi.login(username.trim(), password);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(AUTH_PENDING_KEY, String(Date.now()));
      }
      toast.success("登录成功");
      navigateToNext();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoginPageFallback />;
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(226,232,240,0.45)_0,rgba(255,255,255,0)_36%),linear-gradient(180deg,#ffffff_0,#f8fafc_56%,#eef2f7_100%)]" />
      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-2xl border border-slate-200 bg-white p-10 shadow-sm lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white">
              <Icon icon="solar:pen-bold" width={16} />
              AI CONTENT
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-slate-900">
                一处登录，
                <br />
                接管整套 AI 内容工作流
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600">
                登录后即可进入选题、创作、排版、小红书卡图和发布管理。首次安装后，请先显式初始化管理员账号。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { title: "选题挖掘", text: "素材、评分与发布链路统一收口" },
              { title: "多形态创作", text: "文章与小红书卡图共享后台能力" },
              { title: "显式初始化", text: "首次安装时由部署者手动创建管理员" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col items-start gap-3 px-8 pb-0 pt-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <Icon icon="solar:lock-password-bold" width={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">登录后台</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">使用你初始化过的管理员账号进入系统。</p>
            </div>
          </CardHeader>
          <CardBody className="px-8 pb-8 pt-6">
            <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                isRequired
                classNames={inputClassNames}
                label="账号"
                name="username"
                placeholder="请输入账号"
                value={username}
                variant="bordered"
                onValueChange={setUsername}
              />
              <Input
                isRequired
                classNames={inputClassNames}
                endContent={
                  <button type="button" onClick={() => setIsVisible((value) => !value)}>
                    <Icon
                      className="pointer-events-none text-2xl text-slate-600"
                      icon={isVisible ? "solar:eye-closed-linear" : "solar:eye-bold"}
                    />
                  </button>
                }
                label="密码"
                name="password"
                placeholder="请输入账号密码"
                type={isVisible ? "text" : "password"}
                value={password}
                variant="bordered"
                onValueChange={setPassword}
              />

              {!hasUsers ? (
                <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-700">
                  系统当前还没有管理员账号。请先在后端执行
                  <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs">
                    npm run db:bootstrap-admin -- --username admin --password &lt;你的密码&gt; --email admin@example.com --name 管理员
                  </code>
                  ，完成首次显式初始化后再回来登录。
                </div>
              ) : null}

              <Button
                className="mt-2 h-12 w-full bg-slate-950 text-base font-semibold text-white shadow-lg shadow-slate-950/15"
                isDisabled={!hasUsers}
                isLoading={submitting}
                type="submit"
              >
                登录系统
              </Button>
            </Form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
