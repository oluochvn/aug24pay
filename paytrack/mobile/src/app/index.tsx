import { Redirect } from "expo-router";
import { Loading } from "../components/ui";
import { useSession } from "../session";

export default function Index() {
  const { token, ready } = useSession();
  if (!ready) return <Loading />;
  return <Redirect href={token ? "/(tabs)" : "/login"} />;
}
