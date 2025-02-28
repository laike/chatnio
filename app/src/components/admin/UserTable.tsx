import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast.ts";
import { useState } from "react";
import {
  CommonResponse,
  UserData,
  UserForm,
  UserResponse,
} from "@/admin/types.ts";
import {
  getUserList,
  quotaOperation,
  releaseUsageOperation,
  subscriptionLevelOperation,
  subscriptionOperation,
  updateEmail,
  updatePassword,
} from "@/admin/api/chart.ts";
import { useEffectAsync } from "@/utils/hook.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  CloudCog,
  CloudFog,
  KeyRound,
  Loader2,
  Mail,
  MoreHorizontal,
  RotateCw,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import PopupDialog, { popupTypes } from "@/components/PopupDialog.tsx";
import { getNumber, parseNumber } from "@/utils/base.ts";
import { useDeeptrain } from "@/conf/env.ts";
import { useSelector } from "react-redux";
import { selectUsername } from "@/store/auth.ts";

type OperationMenuProps = {
  user: UserData;
  onRefresh?: () => void;
};

function doToast(t: any, toast: any, resp: CommonResponse) {
  if (!resp.status)
    toast({
      title: t("admin.operate-failed"),
      description: t("admin.operate-failed-prompt", {
        reason: resp.message || resp.error,
      }),
    });
  else
    toast({
      title: t("admin.operate-success"),
      description: t("admin.operate-success-prompt"),
    });
}

function OperationMenu({ user, onRefresh }: OperationMenuProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const username = useSelector(selectUsername);
  const [passwordOpen, setPasswordOpen] = useState<boolean>(false);
  const [emailOpen, setEmailOpen] = useState<boolean>(false);
  const [quotaOpen, setQuotaOpen] = useState<boolean>(false);
  const [quotaSetOpen, setQuotaSetOpen] = useState<boolean>(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState<boolean>(false);
  const [subscriptionLevelOpen, setSubscriptionLevelOpen] =
    useState<boolean>(false);
  const [releaseOpen, setReleaseOpen] = useState<boolean>(false);

  return (
    <>
      <PopupDialog
        destructive={true}
        type={popupTypes.Text}
        title={t("admin.password-action")}
        name={t("auth.password")}
        description={t("admin.password-action-desc")}
        open={passwordOpen}
        setOpen={setPasswordOpen}
        defaultValue={""}
        onSubmit={async (password) => {
          const resp = await updatePassword(user.id, password);
          doToast(t, toast, resp);

          if (resp.status) {
            username === user.username && location.reload();
            onRefresh?.();
          }

          return resp.status;
        }}
      />
      <PopupDialog
        destructive={true}
        type={popupTypes.Text}
        title={t("admin.email-action")}
        name={t("admin.email")}
        description={t("admin.email-action-desc")}
        open={emailOpen}
        setOpen={setEmailOpen}
        defaultValue={user.email}
        onSubmit={async (email) => {
          const resp = await updateEmail(user.id, email);
          doToast(t, toast, resp);

          if (resp.status) onRefresh?.();
          return resp.status;
        }}
      />
      <PopupDialog
        type={popupTypes.Number}
        title={t("admin.quota-action")}
        name={t("admin.quota")}
        description={t("admin.quota-action-desc")}
        defaultValue={"0"}
        onValueChange={getNumber}
        open={quotaOpen}
        setOpen={setQuotaOpen}
        onSubmit={async (value) => {
          const quota = parseNumber(value);
          const resp = await quotaOperation(user.id, quota);
          doToast(t, toast, resp);

          if (resp.status) onRefresh?.();
          return resp.status;
        }}
      />
      <PopupDialog
        type={popupTypes.Number}
        title={t("admin.quota-set-action")}
        name={t("admin.quota")}
        description={t("admin.quota-set-action-desc")}
        defaultValue={user.quota.toFixed(2)}
        onValueChange={getNumber}
        open={quotaSetOpen}
        setOpen={setQuotaSetOpen}
        onSubmit={async (value) => {
          const quota = parseNumber(value);
          const resp = await quotaOperation(user.id, quota, true);
          doToast(t, toast, resp);

          if (resp.status) onRefresh?.();
          return resp.status;
        }}
      />
      <PopupDialog
        type={popupTypes.Number}
        title={t("admin.subscription-action")}
        name={t("admin.month")}
        description={t("admin.subscription-action-desc")}
        defaultValue={"0"}
        onValueChange={getNumber}
        open={subscriptionOpen}
        setOpen={setSubscriptionOpen}
        onSubmit={async (value) => {
          const month = parseNumber(value);
          const resp = await subscriptionOperation(user.id, month);
          doToast(t, toast, resp);

          if (resp.status) onRefresh?.();
          return resp.status;
        }}
      />
      <PopupDialog
        type={popupTypes.Number}
        title={t("admin.subscription-level")}
        name={t("admin.level")}
        description={t("admin.subscription-level-desc")}
        defaultValue={user.level.toString()}
        onValueChange={getNumber}
        open={subscriptionLevelOpen}
        setOpen={setSubscriptionLevelOpen}
        onSubmit={async (value) => {
          const level = parseNumber(value);
          const resp = await subscriptionLevelOperation(user.id, level);
          doToast(t, toast, resp);

          if (resp.status) onRefresh?.();
          return resp.status;
        }}
      />
      <PopupDialog
        type={popupTypes.Empty}
        title={t("admin.release-subscription-action")}
        name={t("admin.release-subscription")}
        description={t("admin.release-subscription-action-desc")}
        open={releaseOpen}
        setOpen={setReleaseOpen}
        onSubmit={async () => {
          const resp = await releaseUsageOperation(user.id);
          doToast(t, toast, resp);

          if (resp.status) onRefresh?.();
          return resp.status;
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={`outline`} size={`icon`}>
            <MoreHorizontal className={`h-4 w-4`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`min-w-[8.75rem]`}>
          <DropdownMenuItem onClick={() => setPasswordOpen(true)}>
            <KeyRound className={`h-4 w-4 mr-2`} />
            {t("admin.password-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEmailOpen(true)}>
            <Mail className={`h-4 w-4 mr-2`} />
            {t("admin.email-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setQuotaOpen(true)}>
            <CloudFog className={`h-4 w-4 mr-2`} />
            {t("admin.quota-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setQuotaSetOpen(true)}>
            <CloudCog className={`h-4 w-4 mr-2`} />
            {t("admin.quota-set-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSubscriptionOpen(true)}>
            <CalendarClock className={`h-4 w-4 mr-2`} />
            {t("admin.subscription-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setReleaseOpen(true)}>
            <CalendarOff className={`h-4 w-4 mr-2`} />
            {t("admin.release-subscription-action")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSubscriptionLevelOpen(true)}>
            <CalendarCheck2 className={`h-4 w-4 mr-2`} />
            {t("admin.subscription-level")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function UserTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<UserForm>({
    total: 0,
    data: [],
  });
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function update() {
    setLoading(true);
    const resp = await getUserList(page, search);
    setLoading(false);
    if (resp.status) setData(resp as UserResponse);
    else
      toast({
        title: t("admin.error"),
        description: resp.message,
      });
  }
  useEffectAsync(update, [page]);

  return (
    <div className={`user-table`}>
      <div className={`flex flex-row mb-6`}>
        <Input
          className={`search`}
          placeholder={t("admin.search-username")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") await update();
          }}
        />
        <Button size={`icon`} className={`flex-shrink-0 ml-2`} onClick={update}>
          <Search className={`h-4 w-4`} />
        </Button>
      </div>
      {(data.data && data.data.length > 0) || page > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className={`select-none whitespace-nowrap`}>
                <TableHead>ID</TableHead>
                <TableHead>{t("admin.username")}</TableHead>
                <TableHead>{t("admin.email")}</TableHead>
                <TableHead>{t("admin.quota")}</TableHead>
                <TableHead>{t("admin.used-quota")}</TableHead>
                <TableHead>{t("admin.is-subscribed")}</TableHead>
                <TableHead>{t("admin.level")}</TableHead>
                <TableHead>{t("admin.total-month")}</TableHead>
                {useDeeptrain && <TableHead>{t("admin.enterprise")}</TableHead>}
                <TableHead>{t("admin.is-banned")}</TableHead>
                <TableHead>{t("admin.is-admin")}</TableHead>
                <TableHead>{t("admin.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.data || []).map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className={`whitespace-nowrap`}>
                    {user.username}
                  </TableCell>
                  <TableCell className={`whitespace-nowrap`}>
                    {user.email || "-"}
                  </TableCell>
                  <TableCell>{user.quota}</TableCell>
                  <TableCell>{user.used_quota}</TableCell>
                  <TableCell>{t(user.is_subscribed.toString())}</TableCell>
                  <TableCell>{user.level}</TableCell>
                  <TableCell>{user.total_month}</TableCell>
                  {useDeeptrain && (
                    <TableCell>{t(user.enterprise.toString())}</TableCell>
                  )}
                  <TableCell>{t(user.is_banned.toString())}</TableCell>
                  <TableCell>{t(user.is_admin.toString())}</TableCell>
                  <TableCell>
                    <OperationMenu user={user} onRefresh={update} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className={`pagination`}>
            <Button
              variant={`default`}
              size={`icon`}
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className={`h-4 w-4`} />
            </Button>
            <Button variant={`ghost`} size={`icon`}>
              {page + 1}
            </Button>
            <Button
              variant={`default`}
              size={`icon`}
              onClick={() => setPage(page + 1)}
              disabled={page + 1 === data.total}
            >
              <ChevronRight className={`h-4 w-4`} />
            </Button>
          </div>
        </>
      ) : loading ? (
        <div className={`flex flex-col mb-4 mt-12 items-center`}>
          <Loader2 className={`w-6 h-6 inline-block animate-spin`} />
        </div>
      ) : (
        <div className={`empty`}>
          <p>{t("admin.empty")}</p>
        </div>
      )}
      <div className={`user-action`}>
        <div className={`grow`} />
        <Button variant={`outline`} size={`icon`} onClick={update}>
          <RotateCw className={`h-4 w-4`} />
        </Button>
      </div>
    </div>
  );
}

export default UserTable;
