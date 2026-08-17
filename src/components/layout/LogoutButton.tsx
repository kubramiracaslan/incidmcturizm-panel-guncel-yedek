import { logoutAction } from "@/lib/auth/actions";
import { Icon } from "@/components/ui/Icon";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
      >
        <Icon name="logout" />
        <span className="text-body-md font-medium">Çıkış Yap</span>
      </button>
    </form>
  );
}
